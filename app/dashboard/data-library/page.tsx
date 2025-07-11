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
  Filter,
  Shield,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp
} from 'lucide-react'
import CreateTableModal from '@/components/data-library/CreateTableModal'
import CreateChartModal from '@/components/data-library/CreateChartModal'
import DataGridModal from '@/components/data-library/DataGridModal'

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

interface Chart {
  id: string
  name: string
  description?: string
  source_table_name?: string
  chart_type: 'bar' | 'line' | 'pie' | 'area'
  is_public: boolean
  created_at: string
  updated_at: string
  created_by: number
  created_by_name?: string
  node_count: number
  has_custom_data: boolean
}

export default function DataLibraryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tables, setTables] = useState<TableSchema[]>([])
  const [charts, setCharts] = useState<Chart[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateChartModal, setShowCreateChartModal] = useState(false)
  const [showDataModal, setShowDataModal] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [selectedTableIsSystem, setSelectedTableIsSystem] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'tables' | 'charts'>('tables')
  const [editingChart, setEditingChart] = useState<Chart | null>(null)

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
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
        toast.error(data.message || 'Failed to fetch tables')
      }
    } catch (error) {
      toast.error('Failed to fetch tables')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Fetch charts
  const fetchCharts = async () => {
    try {
      const response = await fetch('/api/data-library/charts')
      const data = await response.json()
      
      if (data.success) {
        setCharts(data.charts)
      } else {
        toast.error(data.message || 'Failed to fetch charts')
      }
    } catch (error) {
      toast.error('Failed to fetch charts')
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchTables()
      fetchCharts()
    }
  }, [user])

  // Refresh tables and charts
  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchTables(), fetchCharts()])
  }


  // Export table data
  const handleExport = async (tableName: string) => {
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
        toast.success('Table exported successfully')
      } else {
        toast.error('Failed to export table')
      }
    } catch (error) {
      toast.error('Failed to export table')
    }
  }

  // Delete table
  const handleDelete = async (tableName: string) => {
    if (!confirm(`Are you sure you want to delete the table "${tableName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/data-library/tables/${tableName}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Table deleted successfully')
        await fetchTables()
      } else {
        toast.error(data.message || 'Failed to delete table')
      }
    } catch (error) {
      toast.error('Failed to delete table')
    }
  }

  // Delete chart
  const handleDeleteChart = async (chartId: string, chartName: string) => {
    if (!confirm(`Are you sure you want to delete the chart "${chartName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/data-library/charts/${chartId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Chart deleted successfully')
        await fetchCharts()
      } else {
        toast.error(data.message || 'Failed to delete chart')
      }
    } catch (error) {
      toast.error('Failed to delete chart')
    }
  }

  // Get table type badge
  const getTableTypeBadge = (table: TableSchema) => {
    if (table.is_system_table) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
        <Shield className="h-3 w-3 mr-1" />
        System
      </Badge>
    }
    return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
      <Table className="h-3 w-3 mr-1" />
      Custom
    </Badge>
  }

  // Get chart type icon
  const getChartTypeIcon = (type: string) => {
    switch (type) {
      case 'bar': return BarChart3
      case 'line': return LineChart
      case 'pie': return PieChart
      case 'area': return TrendingUp
      default: return BarChart3
    }
  }

  // Filter tables and charts based on search
  const filteredTables = tables.filter(table =>
    table.table_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCharts = charts.filter(chart =>
    chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chart.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chart.source_table_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle view table data
  const handleViewTable = (tableName: string, isSystemTable: boolean = false) => {
    setSelectedTable(tableName)
    setSelectedTableIsSystem(isSystemTable)
    setShowDataModal(true)
  }

  // Handle create table success
  const handleCreateTableSuccess = () => {
    fetchTables()
  }

  // Show loading state if not admin
  if (loading && user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Admin access required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Database className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Data Library</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Table
          </Button>
          
          <Button size="sm" onClick={() => setShowCreateChartModal(true)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Add Chart
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={activeTab === 'tables' ? "Search tables..." : "Search charts..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'tables' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('tables')}
        >
          <Table className="h-4 w-4 mr-2 inline" />
          Tables ({filteredTables.length})
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'charts' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('charts')}
        >
          <BarChart3 className="h-4 w-4 mr-2 inline" />
          Charts ({filteredCharts.length})
        </button>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : activeTab === 'tables' ? (
        /* Tables Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables.map((table) => (
            <Card key={table.table_name} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Table className="h-5 w-5" />
                    {table.table_name}
                  </CardTitle>
                  {getTableTypeBadge(table)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Columns</p>
                    <p className="font-medium">{table.columns.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rows</p>
                    <p className="font-medium">{table.row_count.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Primary Keys:</p>
                  <div className="flex flex-wrap gap-1">
                    {table.columns
                      .filter(col => col.is_primary_key)
                      .map(col => (
                        <Badge key={col.column_name} variant="outline" className="text-xs">
                          {col.column_name}
                        </Badge>
                      ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleViewTable(table.table_name, table.is_system_table)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  {!table.is_system_table && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewTable(table.table_name, table.is_system_table)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExport(table.table_name)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {!table.is_system_table && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(table.table_name)}
                      className="text-destructive hover:text-destructive"
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
        /* Charts Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCharts.map((chart) => (
            <Card key={chart.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {(() => {
                      const IconComponent = getChartTypeIcon(chart.chart_type)
                      return <IconComponent className="h-5 w-5" />
                    })()}
                    {chart.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {chart.chart_type}
                    </Badge>
                    {chart.is_public && (
                      <Badge variant="secondary" className="text-xs">
                        Public
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {chart.description && (
                  <p className="text-sm text-muted-foreground">{chart.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Source</p>
                    <p className="font-medium text-xs">
                      {chart.source_table_name || 'Custom Data'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Data Points</p>
                    <p className="font-medium">{chart.node_count || 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      router.push('/dashboard/charts')
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setEditingChart(chart)
                      setShowCreateChartModal(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteChart(chart.id, chart.name)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {!loading && activeTab === 'tables' && filteredTables.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tables found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No tables match your search criteria.' : 'Get started by creating your first table.'}
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Table
          </Button>
        </div>
      )}
      
      {!loading && activeTab === 'charts' && filteredCharts.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No charts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No charts match your search criteria.' : 'Get started by creating your first chart.'}
          </p>
          <Button onClick={() => setShowCreateChartModal(true)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Add Chart
          </Button>
        </div>
      )}
      {/* Modals */}
      <CreateTableModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateTableSuccess}
      />
      
      <CreateChartModal
        open={showCreateChartModal}
        onClose={() => {
          setShowCreateChartModal(false)
          setEditingChart(null)
        }}
        onSuccess={() => {
          fetchCharts()
          setShowCreateChartModal(false)
          setEditingChart(null)
        }}
        editChart={editingChart}
      />
      
      <DataGridModal
        open={showDataModal}
        onClose={() => setShowDataModal(false)}
        tableName={selectedTable}
        isSystemTable={selectedTableIsSystem}
      />
    </div>
  )
}