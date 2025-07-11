'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Plus, Trash2, Eye, Code } from 'lucide-react'

interface Column {
  column_name: string
  data_type: string
  is_nullable: boolean
  column_default: string
  is_primary_key: boolean
}

interface Constraint {
  constraint_type: 'FOREIGN KEY' | 'UNIQUE' | 'CHECK'
  column_names: string[]
  foreign_table?: string
  foreign_columns?: string[]
  check_clause?: string
}

interface CreateTableModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const DATA_TYPES = [
  'VARCHAR(255)',
  'TEXT',
  'INTEGER',
  'BIGINT',
  'DECIMAL(10,2)',
  'BOOLEAN',
  'TIMESTAMP',
  'DATE',
  'TIME',
  'JSONB',
  'UUID',
  'SERIAL',
  'BIGSERIAL'
]

export default function CreateTableModal({ open, onClose, onSuccess }: CreateTableModalProps) {
  const [tableName, setTableName] = useState('')
  const [columns, setColumns] = useState<Column[]>([
    {
      column_name: 'id',
      data_type: 'SERIAL',
      is_nullable: false,
      column_default: '',
      is_primary_key: true
    }
  ])
  const [constraints, setConstraints] = useState<Constraint[]>([])
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Reset form
  const resetForm = () => {
    setTableName('')
    setColumns([
      {
        column_name: 'id',
        data_type: 'SERIAL',
        is_nullable: false,
        column_default: '',
        is_primary_key: true
      }
    ])
    setConstraints([])
    setErrors({})
    setShowPreview(false)
  }

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Validate table name
    if (!tableName.trim()) {
      newErrors.tableName = 'Table name is required'
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      newErrors.tableName = 'Table name must contain only letters, numbers, and underscores'
    }

    // Validate columns
    columns.forEach((col, index) => {
      if (!col.column_name.trim()) {
        newErrors[`column_${index}_name`] = 'Column name is required'
      } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col.column_name)) {
        newErrors[`column_${index}_name`] = 'Invalid column name'
      }

      if (!col.data_type) {
        newErrors[`column_${index}_type`] = 'Data type is required'
      }
    })

    // Check for duplicate column names
    const columnNames = columns.map(col => col.column_name.toLowerCase())
    const duplicates = columnNames.filter((name, index) => columnNames.indexOf(name) !== index)
    if (duplicates.length > 0) {
      newErrors.duplicateColumns = `Duplicate column names: ${duplicates.join(', ')}`
    }

    // Check for at least one primary key
    const hasPrimaryKey = columns.some(col => col.is_primary_key)
    if (!hasPrimaryKey) {
      newErrors.primaryKey = 'At least one column must be marked as primary key'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Add new column
  const addColumn = () => {
    setColumns([...columns, {
      column_name: '',
      data_type: 'VARCHAR(255)',
      is_nullable: true,
      column_default: '',
      is_primary_key: false
    }])
  }

  // Remove column
  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index))
  }

  // Update column
  const updateColumn = (index: number, field: keyof Column, value: any) => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    setColumns(newColumns)
  }

  // Generate SQL preview
  const generateSQL = () => {
    const columnDefs = columns.map(col => {
      let def = `  ${col.column_name} ${col.data_type}`
      if (!col.is_nullable) def += ' NOT NULL'
      if (col.column_default) def += ` DEFAULT ${col.column_default}`
      if (col.is_primary_key) def += ' PRIMARY KEY'
      return def
    })

    const constraintDefs = constraints.map(constraint => {
      switch (constraint.constraint_type) {
        case 'FOREIGN KEY':
          return `  FOREIGN KEY (${constraint.column_names.join(', ')}) REFERENCES ${constraint.foreign_table}(${constraint.foreign_columns?.join(', ')})`
        case 'UNIQUE':
          return `  UNIQUE (${constraint.column_names.join(', ')})`
        case 'CHECK':
          return `  CHECK (${constraint.check_clause})`
        default:
          return ''
      }
    }).filter(Boolean)

    const allDefs = [...columnDefs, ...constraintDefs]
    
    return `CREATE TABLE ${tableName} (
${allDefs.join(',\n')}
);`
  }

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await fetch('/api/data-library/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table_name: tableName,
          columns: columns.map(col => ({
            column_name: col.column_name,
            data_type: col.data_type,
            is_nullable: col.is_nullable,
            column_default: col.column_default || null,
            is_primary_key: col.is_primary_key
          })),
          constraints
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Table created successfully!')
        resetForm()
        onSuccess()
        onClose()
      } else {
        toast.error(data.message || 'Failed to create table')
      }
    } catch (error) {
      toast.error('Failed to create table')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Table
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Form Section */}
          <div className="space-y-6">
            <ScrollArea className="h-[60vh]">
              <div className="pr-4 space-y-6">
                {/* Table Name */}
                <div className="space-y-2">
                  <Label htmlFor="tableName">Table Name</Label>
                  <Input
                    id="tableName"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="Enter table name"
                    className={errors.tableName ? 'border-destructive' : ''}
                  />
                  {errors.tableName && (
                    <p className="text-sm text-destructive">{errors.tableName}</p>
                  )}
                </div>

                {/* Columns */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Columns</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addColumn}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Column
                    </Button>
                  </div>

                  {columns.map((column, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">Column {index + 1}</Badge>
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeColumn(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Column Name</Label>
                            <Input
                              value={column.column_name}
                              onChange={(e) => updateColumn(index, 'column_name', e.target.value)}
                              placeholder="column_name"
                              className={errors[`column_${index}_name`] ? 'border-destructive' : ''}
                            />
                            {errors[`column_${index}_name`] && (
                              <p className="text-xs text-destructive mt-1">{errors[`column_${index}_name`]}</p>
                            )}
                          </div>

                          <div>
                            <Label>Data Type</Label>
                            <Select
                              value={column.data_type}
                              onValueChange={(value) => updateColumn(index, 'data_type', value)}
                            >
                              <SelectTrigger className={errors[`column_${index}_type`] ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {DATA_TYPES.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors[`column_${index}_type`] && (
                              <p className="text-xs text-destructive mt-1">{errors[`column_${index}_type`]}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label>Default Value (Optional)</Label>
                          <Input
                            value={column.column_default}
                            onChange={(e) => updateColumn(index, 'column_default', e.target.value)}
                            placeholder="Default value"
                          />
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`nullable-${index}`}
                              checked={column.is_nullable}
                              onCheckedChange={(checked) => updateColumn(index, 'is_nullable', checked)}
                            />
                            <Label htmlFor={`nullable-${index}`} className="text-sm">
                              Nullable
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`primary-${index}`}
                              checked={column.is_primary_key}
                              onCheckedChange={(checked) => updateColumn(index, 'is_primary_key', checked)}
                            />
                            <Label htmlFor={`primary-${index}`} className="text-sm">
                              Primary Key
                            </Label>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Error Messages */}
                {errors.duplicateColumns && (
                  <p className="text-sm text-destructive">{errors.duplicateColumns}</p>
                )}
                {errors.primaryKey && (
                  <p className="text-sm text-destructive">{errors.primaryKey}</p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">SQL Preview</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <Eye className="h-4 w-4 mr-2" /> : <Code className="h-4 w-4 mr-2" />}
                {showPreview ? 'Hide' : 'Show'} SQL
              </Button>
            </div>

            {showPreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Generated SQL</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[50vh]">
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                      {generateSQL()}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Table Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Table Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Table Name:</span>
                  <span className="font-medium">{tableName || 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Columns:</span>
                  <span className="font-medium">{columns.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Primary Keys:</span>
                  <span className="font-medium">{columns.filter(col => col.is_primary_key).length}</span>
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Column List:</p>
                  <div className="space-y-1">
                    {columns.map((col, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span>{col.column_name || `Column ${index + 1}`}</span>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {col.data_type}
                          </Badge>
                          {col.is_primary_key && (
                            <Badge variant="default" className="text-xs">PK</Badge>
                          )}
                          {!col.is_nullable && (
                            <Badge variant="outline" className="text-xs">NOT NULL</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Table'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}