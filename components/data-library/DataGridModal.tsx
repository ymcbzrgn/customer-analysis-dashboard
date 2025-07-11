'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  Search, 
  Filter,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react'

interface DataGridModalProps {
  open: boolean
  onClose: () => void
  tableName: string
  isSystemTable?: boolean
}

interface TableData {
  [key: string]: any
}

interface TableSchema {
  table_name: string
  columns: Array<{
    column_name: string
    data_type: string
    is_nullable: boolean
    is_primary_key: boolean
    is_foreign_key: boolean
  }>
  row_count: number
}

export default function DataGridModal({ open, onClose, tableName, isSystemTable = false }: DataGridModalProps) {
  const [schema, setSchema] = useState<TableSchema | null>(null)
  const [data, setData] = useState<TableData[]>([])
  const [loading, setLoading] = useState(false)
  const [editingRow, setEditingRow] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<TableData>({})
  const [newRowData, setNewRowData] = useState<TableData>({})
  const [showAddRow, setShowAddRow] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRows, setTotalRows] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const pageSize = 50

  // Fetch table schema
  const fetchSchema = async () => {
    try {
      const response = await fetch(`/api/data-library/tables/${tableName}`)
      const result = await response.json()
      
      if (result.success) {
        setSchema(result.schema)
      } else {
        toast.error('Failed to fetch table schema')
      }
    } catch (error) {
      toast.error('Failed to fetch table schema')
    }
  }

  // Fetch table data
  const fetchData = async (page: number = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/data-library/tables/${tableName}/rows?page=${page}&limit=${pageSize}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        setTotalPages(result.totalPages)
        setTotalRows(result.total)
        setCurrentPage(result.page)
      } else {
        toast.error('Failed to fetch table data')
      }
    } catch (error) {
      toast.error('Failed to fetch table data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initialize data
  useEffect(() => {
    if (open && tableName) {
      fetchSchema()
      fetchData()
    }
  }, [open, tableName])

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData(currentPage)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page)
  }

  // Start editing row
  const startEditing = (row: TableData) => {
    setEditingRow(row.id)
    setEditingData({ ...row })
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingRow(null)
    setEditingData({})
  }

  // Save edited row
  const saveRow = async () => {
    if (!editingRow) return

    try {
      const response = await fetch(`/api/data-library/tables/${tableName}/rows/${editingRow}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingData)
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('Row updated successfully')
        setEditingRow(null)
        setEditingData({})
        await fetchData(currentPage)
      } else {
        toast.error('Failed to update row')
      }
    } catch (error) {
      toast.error('Failed to update row')
    }
  }

  // Delete row
  const deleteRow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this row?')) return

    try {
      const response = await fetch(`/api/data-library/tables/${tableName}/rows/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('Row deleted successfully')
        await fetchData(currentPage)
      } else {
        toast.error('Failed to delete row')
      }
    } catch (error) {
      toast.error('Failed to delete row')
    }
  }

  // Add new row
  const addNewRow = async () => {
    try {
      const response = await fetch(`/api/data-library/tables/${tableName}/rows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRowData)
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('Row added successfully')
        setShowAddRow(false)
        setNewRowData({})
        await fetchData(currentPage)
      } else {
        toast.error('Failed to add row')
      }
    } catch (error) {
      toast.error('Failed to add row')
    }
  }

  // Export data
  const exportData = async () => {
    try {
      const response = await fetch(`/api/data-library/tables/${tableName}/export`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${tableName}_export.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Data exported successfully')
      } else {
        toast.error('Failed to export data')
      }
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  // Render cell value
  const renderCellValue = (row: TableData, column: any) => {
    if (!isSystemTable && editingRow === row.id) {
      // Editing mode (only for non-system tables)
      return (
        <Input
          value={editingData[column.column_name] || ''}
          onChange={(e) => setEditingData({
            ...editingData,
            [column.column_name]: e.target.value
          })}
          className="h-8 text-xs"
        />
      )
    }

    // Display mode
    const value = row[column.column_name]
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">NULL</span>
    }

    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'default' : 'secondary'}>{value.toString()}</Badge>
    }

    if (typeof value === 'object') {
      return <span className="text-xs">{JSON.stringify(value)}</span>
    }

    return <span className="text-xs">{value.toString()}</span>
  }

  // Filter data based on search
  const filteredData = data.filter(row => {
    if (!searchTerm) return true
    return Object.values(row).some(value => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (!schema) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {tableName} Data
            <Badge variant="secondary">{totalRows} rows</Badge>
            {isSystemTable && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                System Table (View Only)
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b">
          <div className="flex items-center gap-2">
            {!isSystemTable && (
              <Button
                size="sm"
                onClick={() => setShowAddRow(true)}
                disabled={showAddRow}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={exportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-8 w-64"
              />
            </div>
            
            <Button size="sm" variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Add Row Form */}
        {!isSystemTable && showAddRow && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Add New Row</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {schema.columns.map((column) => (
                  <div key={column.column_name} className="space-y-2">
                    <Label className="text-xs">
                      {column.column_name}
                      {column.is_primary_key && <Badge variant="default" className="ml-1 text-xs">PK</Badge>}
                      {!column.is_nullable && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                      value={newRowData[column.column_name] || ''}
                      onChange={(e) => setNewRowData({
                        ...newRowData,
                        [column.column_name]: e.target.value
                      })}
                      placeholder={column.data_type}
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <Button size="sm" onClick={addNewRow}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Row
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddRow(false)
                    setNewRowData({})
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[60vh] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  {schema.columns.map((column) => (
                    <TableHead key={column.column_name} className="min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{column.column_name}</span>
                        <div className="flex items-center gap-1">
                          {column.is_primary_key && <Badge variant="default" className="text-xs">PK</Badge>}
                          {column.is_foreign_key && <Badge variant="secondary" className="text-xs">FK</Badge>}
                          {!column.is_nullable && <Badge variant="outline" className="text-xs">NOT NULL</Badge>}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {column.data_type}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      {schema.columns.map((column) => (
                        <TableCell key={column.column_name}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredData.map((row) => (
                    <TableRow key={row.id}>
                      {schema.columns.map((column) => (
                        <TableCell key={column.column_name}>
                          {renderCellValue(row, column)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {!isSystemTable ? (
                            // Actions for custom tables
                            editingRow === row.id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={saveRow}
                                  className="h-6 w-6 p-0"
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={cancelEditing}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditing(row)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteRow(row.id)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )
                          ) : (
                            // View-only for system tables
                            <span className="text-xs text-muted-foreground px-2">
                              View Only
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRows)} of {totalRows} rows
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2)
                return (
                  <Button
                    key={page}
                    size="sm"
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}