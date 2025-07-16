'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  Database,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Copy,
  Clipboard,
  Undo,
  Redo
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
  console.log('DataGridModal render:', { tableName, isSystemTable })
  const [schema, setSchema] = useState<TableSchema | null>(null)
  const [data, setData] = useState<TableData[]>([])
  const [loading, setLoading] = useState(false)
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnName: string } | null>(null)
  const [editingData, setEditingData] = useState<TableData>({})
  const [newRowData, setNewRowData] = useState<TableData>({})
  const [showAddRow, setShowAddRow] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRows, setTotalRows] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ rowId: string; columnName: string } | null>(null)
  const [clipboardData, setClipboardData] = useState<string>('')
  const [undoStack, setUndoStack] = useState<TableData[][]>([])
  const [redoStack, setRedoStack] = useState<TableData[][]>([])
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  
  const editInputRef = useRef<HTMLInputElement>(null)
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
      setSelectedCell(null)
      setEditingCell(null)
      setSearchTerm('')
      setCurrentPage(1)
    }
  }, [open, tableName])

  // Save state for undo/redo
  const saveState = useCallback(() => {
    setUndoStack(prev => [...prev, [...data]])
    setRedoStack([]) // Clear redo stack on new action
  }, [data])

  // Keyboard event handlers for Excel-like navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open || !schema || data.length === 0) return
      
      // Track Ctrl key state
      if (e.key === 'Control') {
        setIsCtrlPressed(true)
        return
      }
      
      // Handle Excel-like shortcuts
      if (e.ctrlKey || isCtrlPressed) {
        switch (e.key) {
          case 'c':
            e.preventDefault()
            handleCopy()
            break
          case 'v':
            e.preventDefault()
            handlePaste()
            break
          case 'z':
            e.preventDefault()
            handleUndo()
            break
          case 'y':
            e.preventDefault()
            handleRedo()
            break
        }
        return
      }
      
      // Handle cell navigation
      if (selectedCell && !editingCell) {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault()
            navigateCell('up')
            break
          case 'ArrowDown':
            e.preventDefault()
            navigateCell('down')
            break
          case 'ArrowLeft':
            e.preventDefault()
            navigateCell('left')
            break
          case 'ArrowRight':
            e.preventDefault()
            navigateCell('right')
            break
          case 'Tab':
            e.preventDefault()
            navigateCell(e.shiftKey ? 'left' : 'right')
            break
          case 'Enter':
            e.preventDefault()
            if (!isSystemTable) {
              startCellEditing()
            }
            break
          case 'F2':
            e.preventDefault()
            if (!isSystemTable) {
              startCellEditing()
            }
            break
          case 'Delete':
            e.preventDefault()
            if (!isSystemTable) {
              clearCellValue()
            }
            break
          case 'Escape':
            e.preventDefault()
            setSelectedCell(null)
            break
        }
      }
      
      // Handle editing mode
      if (editingCell) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault()
            saveCellEdit()
            break
          case 'Escape':
            e.preventDefault()
            cancelCellEdit()
            break
          case 'Tab':
            e.preventDefault()
            saveCellEdit()
            navigateCell(e.shiftKey ? 'left' : 'right')
            break
        }
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        setIsCtrlPressed(false)
      }
    }
    
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('keyup', handleKeyUp)
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [open, schema, data, selectedCell, editingCell, isCtrlPressed])

  // Excel-like functions
  const navigateCell = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!selectedCell || !schema || data.length === 0) return
    
    const currentRowIndex = data.findIndex(row => row.id === selectedCell.rowId)
    const currentColIndex = schema.columns.findIndex(col => col.column_name === selectedCell.columnName)
    
    if (currentRowIndex === -1 || currentColIndex === -1) return
    
    let newRowIndex = currentRowIndex
    let newColIndex = currentColIndex
    
    switch (direction) {
      case 'up':
        newRowIndex = Math.max(0, currentRowIndex - 1)
        break
      case 'down':
        newRowIndex = Math.min(data.length - 1, currentRowIndex + 1)
        break
      case 'left':
        newColIndex = Math.max(0, currentColIndex - 1)
        break
      case 'right':
        newColIndex = Math.min(schema.columns.length - 1, currentColIndex + 1)
        break
    }
    
    const newRow = data[newRowIndex]
    const newColumn = schema.columns[newColIndex]
    
    if (newRow && newColumn) {
      setSelectedCell({ rowId: newRow.id, columnName: newColumn.column_name })
    }
  }
  
  const startCellEditing = () => {
    if (!selectedCell || isSystemTable) return
    
    const row = data.find(r => r.id === selectedCell.rowId)
    if (!row) return
    
    setEditingCell(selectedCell)
    setEditingData({ [selectedCell.columnName]: row[selectedCell.columnName] || '' })
    
    // Focus input after state update
    setTimeout(() => {
      editInputRef.current?.focus()
      editInputRef.current?.select()
    }, 0)
  }
  
  const saveCellEdit = async () => {
    if (!editingCell || !schema || isSystemTable) return
    
    const row = data.find(r => r.id === editingCell.rowId)
    if (!row) return
    
    const newValue = editingData[editingCell.columnName]
    const oldValue = row[editingCell.columnName]
    
    if (newValue === oldValue) {
      setEditingCell(null)
      return
    }
    
    try {
      saveState() // Save for undo
      
      const response = await fetch(`/api/data-library/tables/${tableName}/rows/${editingCell.rowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [editingCell.columnName]: newValue })
      })

      const result = await response.json()
      
      if (result.success) {
        // Update local data
        setData(prevData => 
          prevData.map(r => 
            r.id === editingCell.rowId 
              ? { ...r, [editingCell.columnName]: newValue }
              : r
          )
        )
        toast.success('Cell updated successfully')
      } else {
        toast.error(result.message || 'Failed to update cell')
      }
    } catch (error) {
      toast.error('Failed to update cell')
    }
    
    setEditingCell(null)
    setEditingData({})
  }
  
  const cancelCellEdit = () => {
    setEditingCell(null)
    setEditingData({})
  }
  
  const clearCellValue = async () => {
    if (!selectedCell || isSystemTable) return
    
    const row = data.find(r => r.id === selectedCell.rowId)
    if (!row) return
    
    const column = schema?.columns.find(col => col.column_name === selectedCell.columnName)
    if (!column || !column.is_nullable) {
      toast.error('Cannot clear non-nullable column')
      return
    }
    
    try {
      saveState() // Save for undo
      
      const response = await fetch(`/api/data-library/tables/${tableName}/rows/${selectedCell.rowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [selectedCell.columnName]: null })
      })

      const result = await response.json()
      
      if (result.success) {
        // Update local data
        setData(prevData => 
          prevData.map(r => 
            r.id === selectedCell.rowId 
              ? { ...r, [selectedCell.columnName]: null }
              : r
          )
        )
        toast.success('Cell cleared successfully')
      } else {
        toast.error(result.message || 'Failed to clear cell')
      }
    } catch (error) {
      toast.error('Failed to clear cell')
    }
  }
  
  const handleCopy = () => {
    if (!selectedCell) return
    
    const row = data.find(r => r.id === selectedCell.rowId)
    if (!row) return
    
    const value = row[selectedCell.columnName]
    const textValue = value === null || value === undefined ? '' : String(value)
    
    setClipboardData(textValue)
    navigator.clipboard.writeText(textValue).then(() => {
      toast.success('Copied to clipboard')
    }).catch(() => {
      toast.error('Failed to copy')
    })
  }
  
  const handlePaste = async () => {
    if (!selectedCell || isSystemTable) return
    
    try {
      const text = await navigator.clipboard.readText()
      
      saveState() // Save for undo
      
      const response = await fetch(`/api/data-library/tables/${tableName}/rows/${selectedCell.rowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [selectedCell.columnName]: text })
      })

      const result = await response.json()
      
      if (result.success) {
        // Update local data
        setData(prevData => 
          prevData.map(r => 
            r.id === selectedCell.rowId 
              ? { ...r, [selectedCell.columnName]: text }
              : r
          )
        )
        toast.success('Pasted successfully')
      } else {
        toast.error(result.message || 'Failed to paste')
      }
    } catch (error) {
      toast.error('Failed to paste')
    }
  }
  
  const handleUndo = () => {
    if (undoStack.length === 0) return
    
    const prevState = undoStack[undoStack.length - 1]
    setRedoStack(prev => [...prev, [...data]])
    setUndoStack(prev => prev.slice(0, -1))
    setData(prevState)
    toast.success('Undone')
  }
  
  const handleRedo = () => {
    if (redoStack.length === 0) return
    
    const nextState = redoStack[redoStack.length - 1]
    setUndoStack(prev => [...prev, [...data]])
    setRedoStack(prev => prev.slice(0, -1))
    setData(nextState)
    toast.success('Redone')
  }

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData(currentPage)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page)
    setSelectedCell(null)
    setEditingCell(null)
  }
  
  // Handle cell selection
  const handleCellClick = (rowId: string, columnName: string) => {
    if (editingCell) {
      saveCellEdit()
    }
    setSelectedCell({ rowId, columnName })
  }
  
  // Handle cell double-click
  const handleCellDoubleClick = (rowId: string, columnName: string) => {
    if (isSystemTable) return
    
    setSelectedCell({ rowId, columnName })
    setTimeout(() => {
      startCellEditing()
    }, 0)
  }

  // Handle row editing (kept for backward compatibility)
  const startEditing = (row: TableData) => {
    if (isSystemTable) return
    // For Excel-like editing, we now use cell-based editing
    setSelectedCell({ rowId: row.id, columnName: schema?.columns[0]?.column_name || '' })
  }

  // Delete row
  const deleteRow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this row?')) return

    try {
      saveState() // Save for undo
      
      const response = await fetch(`/api/data-library/tables/${tableName}/rows/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('Row deleted successfully')
        await fetchData(currentPage)
        setSelectedCell(null)
      } else {
        toast.error(result.message || 'Failed to delete row')
      }
    } catch (error) {
      toast.error('Failed to delete row')
    }
  }

  // Add new row
  const addNewRow = async () => {
    try {
      saveState() // Save for undo
      
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
        
        // Select the new row's first cell
        if (result.row && schema?.columns.length > 0) {
          setSelectedCell({ rowId: result.row.id, columnName: schema.columns[0].column_name })
        }
      } else {
        toast.error(result.message || 'Failed to add row')
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
    const isEditing = editingCell?.rowId === row.id && editingCell?.columnName === column.column_name
    const isSelected = selectedCell?.rowId === row.id && selectedCell?.columnName === column.column_name
    
    if (!isSystemTable && isEditing) {
      // Editing mode (only for non-system tables)
      return (
        <Input
          ref={editInputRef}
          value={editingData[column.column_name] || ''}
          onChange={(e) => setEditingData({
            ...editingData,
            [column.column_name]: e.target.value
          })}
          className="h-8 text-xs bg-blue-50 border-2 border-blue-500"
          onBlur={saveCellEdit}
        />
      )
    }

    // Display mode
    const value = row[column.column_name]
    const cellContent = (() => {
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
    })()
    
    return (
      <div 
        className={`min-h-[32px] w-full p-2 border-2 transition-all cursor-cell ${
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-transparent hover:border-gray-300 hover:bg-gray-50'
        }`}
        onClick={() => handleCellClick(row.id, column.column_name)}
        onDoubleClick={() => handleCellDoubleClick(row.id, column.column_name)}
      >
        {cellContent}
      </div>
    )
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
            <DialogTitle>Loading {tableName}...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Loading table schema...</p>
            </div>
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
            {selectedCell && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                Selected: {selectedCell.rowId}/{selectedCell.columnName}
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
            
            {/* Excel-like controls */}
            {!isSystemTable && (
              <div className="flex items-center gap-1 ml-4 border-l pl-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  disabled={!selectedCell}
                  title="Copy (Ctrl+C)"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePaste}
                  disabled={!selectedCell}
                  title="Paste (Ctrl+V)"
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>
            )}
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
        
        {/* Excel-like status bar */}
        <div className="text-xs text-muted-foreground pb-2">
          {selectedCell && (
            <span className="mr-4">
              Selected: {selectedCell.rowId}/{selectedCell.columnName}
            </span>
          )}
          {editingCell && (
            <span className="mr-4 text-blue-600">
              Editing: {editingCell.rowId}/{editingCell.columnName} (Press Enter to save, Esc to cancel)
            </span>
          )}
          <span className="mr-4">
            Navigation: Arrow keys, Tab, Enter to edit, F2 to edit, Del to clear
          </span>
          <span>
            Shortcuts: Ctrl+C/V (copy/paste), Ctrl+Z/Y (undo/redo)
          </span>
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
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  {schema.columns.map((column) => (
                    <TableHead key={column.column_name} className="min-w-[150px] p-2">
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
                        <TableCell key={column.column_name} className="p-2">
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                      <TableCell className="p-2">
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={schema.columns.length + 1} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm ? 'No data matches your search' : 'No data available'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((row) => (
                    <TableRow key={row.id} className="hover:bg-gray-50">
                      {schema.columns.map((column) => (
                        <TableCell key={column.column_name} className="p-0">
                          {renderCellValue(row, column)}
                        </TableCell>
                      ))}
                      <TableCell className="p-2">
                        <div className="flex items-center gap-1">
                          {!isSystemTable ? (
                            // Actions for custom tables
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteRow(row.id)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                title="Delete row"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
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
              Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalRows)} of {totalRows} rows
            </span>
            {searchTerm && (
              <span className="text-blue-600">
                (filtered from {totalRows} total rows)
              </span>
            )}
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
                if (page <= totalPages) {
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
                }
                return null
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