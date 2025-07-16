'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { 
  Plus, 
  RefreshCw, 
  Search, 
  Database,
  Table,
  Eye,
  Edit,
  Trash2,
  Download,
  Columns,
  Network,
  Building2,
  Users
} from 'lucide-react'
import CreateTableModal from '@/components/data-library/CreateTableModal'
import CreateChartModal from '@/components/data-library/CreateChartModal'
import ChartEditor from '@/components/data-library/ChartEditor'
import DataGridModal from '@/components/data-library/DataGridModal'
import ChartPermissions from '@/components/data-library/ChartPermissions'
import { ChartViewer } from '@/components/data-library/ChartViewer'

interface TableSchema {
  table_name: string
  columns: Array<{
    column_name: string
    data_type: string
    is_nullable: boolean
    is_primary_key: boolean
    is_foreign_key: boolean
  }>
  constraints: Array<{
    constraint_name: string
    constraint_type: string
    column_names: string[]
  }>
  indexes: Array<{
    index_name: string
    column_names: string[]
    is_unique: boolean
  }>
  row_count: number
  is_system_table: boolean
}

export default function DataLibraryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tables, setTables] = useState<TableSchema[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDataModal, setShowDataModal] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [selectedTableIsSystem, setSelectedTableIsSystem] = useState<boolean>(false)
  const [showChartEditor, setShowChartEditor] = useState(false)
  const [chartEditorMode, setChartEditorMode] = useState<'create' | 'edit'>('create')
  const [activeTab, setActiveTab] = useState<'tables' | 'charts'>('tables')
  const [charts, setCharts] = useState<any[]>([])
  const [loadingCharts, setLoadingCharts] = useState(false)
  const [showChartViewer, setShowChartViewer] = useState(false)
  const [selectedChart, setSelectedChart] = useState<any>(null)
  const [editingChart, setEditingChart] = useState<any>(null)
  const [showPermissions, setShowPermissions] = useState(false)
  const [permissionsChart, setPermissionsChart] = useState<any>(null)

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    if (user.role !== 'admin') {
      router.push('/dashboard')
      toast.error('Access denied. Admin privileges required.')
      return
    }
  }, [user, router])

  // Fetch tables
  const fetchTables = async () => {
    try {
      const response = await fetch('/api/data-library/tables')
      const data = await response.json()
      
      if (data.success) {
        setTables(data.tables)
      } else {
        toast.error(data.message || 'Failed to load tables')
      }
    } catch (error) {
      toast.error('Failed to load tables')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchTables()
      fetchCharts()
    }
  }, [user])

  // Fetch charts
  const fetchCharts = async () => {
    setLoadingCharts(true)
    try {
      const response = await fetch('/api/data-library/charts')
      if (response.ok) {
        const data = await response.json()
        setCharts(data.charts || [])
      } else {
        toast.error('Failed to fetch charts')
      }
    } catch (error) {
      console.error('Error fetching charts:', error)
      toast.error('Failed to fetch charts')
    } finally {
      setLoadingCharts(false)
    }
  }

  // Filter tables based on search
  const filteredTables = tables.filter(table =>
    table.table_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter charts based on search
  const filteredCharts = charts.filter(chart =>
    chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chart.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRefresh = () => {
    setRefreshing(true)
    if (activeTab === 'tables') {
      fetchTables()
    } else {
      fetchCharts()
      setRefreshing(false)
    }
  }

  const handleViewData = (tableName: string, isSystemTable: boolean) => {
    console.log('handleViewData:', { tableName, isSystemTable })
    setSelectedTable(tableName)
    setSelectedTableIsSystem(isSystemTable)
    setShowDataModal(true)
  }

  const handleDeleteTable = async (tableName: string) => {
    if (!confirm(`Are you sure you want to delete the table "${tableName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/data-library/tables/${tableName}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`Table "${tableName}" deleted successfully`)
        await fetchTables()
      } else {
        toast.error(result.message || `Failed to delete table "${tableName}"`)
      }
    } catch (error) {
      toast.error(`Failed to delete table "${tableName}"`)
    }
  }

  // Handle chart save (called from chart editor)
  const handleSaveChart = async (chartData: any) => {
    try {
      if (chartData.id && chartEditorMode === 'edit') {
        // Update existing chart
        const response = await fetch(`/api/data-library/charts/${chartData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: chartData.name,
            description: chartData.description,
            config: chartData.config,
            is_public: chartData.is_public
          })
        })
        
        if (response.ok) {
          const result = await response.json()
          setCharts(prev => prev.map(c => c.id === chartData.id ? result.chart : c))
          toast.success('Chart updated successfully')
        } else {
          const error = await response.json()
          toast.error(error.message || 'Failed to update chart')
        }
      } else {
        // Create new chart
        const response = await fetch('/api/data-library/charts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chartData)
        })
        
        if (response.ok) {
          const result = await response.json()
          setCharts(prev => [...prev, result.chart])
          toast.success('Chart created successfully')
        } else {
          const error = await response.json()
          toast.error(error.message || 'Failed to create chart')
        }
      }
      
      setShowChartEditor(false)
      setEditingChart(null)
    } catch (error) {
      console.error('Error saving chart:', error)
      toast.error('Failed to save chart')
    }
  }

  // Handle chart deletion
  const handleDeleteChart = async (chartId: string) => {
    if (!confirm('Are you sure you want to delete this chart? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/data-library/charts/${chartId}`, { 
        method: 'DELETE' 
      })
      
      if (response.ok) {
        setCharts(prev => prev.filter(c => c.id !== chartId))
        toast.success('Chart deleted successfully')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to delete chart')
      }
    } catch (error) {
      console.error('Error deleting chart:', error)
      toast.error('Failed to delete chart')
    }
  }

  // Handle chart viewing
  const handleViewChart = async (chart: any) => {
    try {
      // Fetch full chart data including config
      const response = await fetch(`/api/data-library/charts/${chart.id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedChart(data.chart)
        setShowChartViewer(true)
      } else {
        toast.error('Failed to load chart details')
      }
    } catch (error) {
      console.error('Error loading chart:', error)
      toast.error('Failed to load chart details')
    }
  }

  // Handle chart editing
  const handleEditChart = async (chart: any) => {
    try {
      // Fetch full chart data including config, just like in handleViewChart
      const response = await fetch(`/api/data-library/charts/${chart.id}`)
      if (response.ok) {
        const data = await response.json()
        setEditingChart(data.chart) // Use the full chart data with config
        setChartEditorMode('edit')
        setShowChartViewer(false) // Close viewer
        setSelectedChart(null)
        setShowChartEditor(true) // Open editor
      } else {
        toast.error('Failed to load chart details for editing')
      }
    } catch (error) {
      console.error('Error loading chart for editing:', error)
      toast.error('Failed to load chart details for editing')
    }
  }

  // Handle chart creation
  const handleCreateChart = () => {
    setEditingChart(null)
    setChartEditorMode('create')
    setShowChartEditor(true)
  }

  // Handle permissions management
  const handleManagePermissions = (chart: any) => {
    setPermissionsChart(chart)
    setShowPermissions(true)
  }

  // Handle permissions save
  const handleSavePermissions = async (permissions: any[]) => {
    if (!permissionsChart) return
    
    try {
      const response = await fetch(`/api/data-library/charts/${permissionsChart.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_public: permissions.includes('public'),
          // Add more permission logic here if needed
        })
      })
      
      if (response.ok) {
        // Update chart in state
        setCharts(prev => prev.map(c => 
          c.id === permissionsChart.id 
            ? { ...c, is_public: permissions.includes('public') }
            : c
        ))
        toast.success('Permissions updated successfully')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update permissions')
      }
    } catch (error) {
      console.error('Error updating permissions:', error)
      toast.error('Failed to update permissions')
    }
    
    setShowPermissions(false)
    setPermissionsChart(null)
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Admin privileges required to access Data Library</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Library</h1>
          <p className="text-gray-600 mt-1">Manage database tables and organizational charts</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {activeTab === 'tables' ? (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Table
            </Button>
          ) : (
            <Button
              onClick={handleCreateChart}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Network className="h-4 w-4" />
              Create Perfect Chart
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tables')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tables'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database Tables
              </div>
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'charts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Charts
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={activeTab === 'tables' ? 'Search tables...' : 'Search charts...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'tables' ? (
        // Tables Grid
        loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTables.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables.map((table) => (
            <Card key={table.table_name} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Table className="h-5 w-5" />
                  <span className="truncate">{table.table_name}</span>
                  {table.is_system_table && (
                    <Badge variant="secondary" className="text-xs">
                      System
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Columns:</span>
                    <span className="font-medium">{table.columns.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rows:</span>
                    <span className="font-medium">{table.row_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Indexes:</span>
                    <span className="font-medium">{table.indexes.length}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewData(table.table_name, table.is_system_table)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Data
                  </Button>
                  {!table.is_system_table && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTable(table.table_name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching tables found' : 'No tables yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `No tables match "${searchTerm}". Try a different search term.`
              : 'Get started by creating your first database table.'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Table
            </Button>
          )}
        </div>
        )
      ) : (
        // Charts Grid
        loadingCharts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCharts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCharts.map((chart) => (
              <Card key={chart.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Network className="h-5 w-5" />
                    <span className="truncate">{chart.name}</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600">{chart.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <Badge variant="secondary" className="text-xs">
                        {chart.chart_type}
                      </Badge>
                    </div>
                    {chart.is_visual_chart ? (
                      <div className="flex justify-between">
                        <span>Nodes:</span>
                        <span className="font-medium">{chart.node_count}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span>Data Source:</span>
                        <span className="font-medium">
                          {chart.source_table_name || 'Custom'}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Public:</span>
                      <span className="font-medium">
                        {chart.is_public ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium">
                        {new Date(chart.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewChart(chart)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditChart(chart)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteChart(chart.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching charts found' : 'No charts yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? `No charts match "${searchTerm}". Try a different search term.`
                : 'Create your first organizational chart to visualize corporate structure.'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={handleCreateChart}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Network className="h-4 w-4 mr-2" />
                Create Chart
              </Button>
            )}
          </div>
        )
      )}

      {/* Modals */}
      <CreateTableModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false)
          fetchTables()
        }}
      />

      <DataGridModal
        open={showDataModal}
        onClose={() => setShowDataModal(false)}
        tableName={selectedTable}
        isSystemTable={selectedTableIsSystem}
        onDataChange={fetchTables}
      />

      <ChartEditor
        open={showChartEditor}
        onClose={() => {
          setShowChartEditor(false)
          setEditingChart(null)
        }}
        onSave={handleSaveChart}
        chart={editingChart}
        mode={chartEditorMode}
      />

      <ChartViewer
        open={showChartViewer}
        onClose={() => {
          setShowChartViewer(false)
          setSelectedChart(null)
        }}
        chart={selectedChart}
        onEdit={handleEditChart}
      />

      {permissionsChart && (
        <ChartPermissions
          open={showPermissions}
          onClose={() => {
            setShowPermissions(false)
            setPermissionsChart(null)
          }}
          chartId={permissionsChart.id}
          chartName={permissionsChart.name}
          currentPermissions={permissionsChart.permissions || []}
          onSave={handleSavePermissions}
        />
      )}
    </div>
  )
}