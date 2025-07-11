'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { 
  RefreshCw, 
  Search, 
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

// ReactFlow imports for chart viewing
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
} from 'reactflow'
import 'reactflow/dist/style.css'

interface Chart {
  id: string
  name: string
  description?: string
  config: {
    nodes: Node[]
    edges: Edge[]
    metadata?: any
  }
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

export default function ChartsPage() {
  const { user } = useAuth()
  const [charts, setCharts] = useState<Chart[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedChart, setSelectedChart] = useState<Chart | null>(null)
  const [showViewer, setShowViewer] = useState(false)

  // Fetch charts
  const fetchCharts = async () => {
    try {
      const response = await fetch('/api/data-library/charts')
      const data = await response.json()
      
      if (data.success) {
        // Filter charts based on user role
        const userCharts = user?.role === 'admin' 
          ? data.charts 
          : data.charts.filter((chart: Chart) => chart.is_public)
        setCharts(userCharts)
      } else {
        toast.error(data.message || 'Failed to fetch charts')
      }
    } catch (error) {
      toast.error('Failed to fetch charts')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCharts()
    }
  }, [user])

  // Refresh charts
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchCharts()
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

  // Handle chart view
  const handleViewChart = (chart: Chart) => {
    setSelectedChart(chart)
    setShowViewer(true)
  }

  // Filter charts based on search
  const filteredCharts = charts.filter(chart =>
    chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chart.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chart.source_table_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Charts</h1>
          <Badge variant="secondary">{filteredCharts.length} charts</Badge>
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
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search charts..."
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

      {/* Charts Grid */}
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
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
                    onClick={() => handleViewChart(chart)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Chart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {!loading && filteredCharts.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No charts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No charts match your search criteria.' : 'No charts available to view.'}
          </p>
        </div>
      )}

      {/* Chart Viewer Modal */}
      {showViewer && selectedChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {(() => {
                    const IconComponent = getChartTypeIcon(selectedChart.chart_type)
                    return <IconComponent className="h-5 w-5" />
                  })()}
                  {selectedChart.name}
                </h2>
                {selectedChart.description && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedChart.description}</p>
                )}
              </div>
              <Button variant="outline" onClick={() => setShowViewer(false)}>
                Close
              </Button>
            </div>
            
            <div className="h-96 p-6">
              {selectedChart.config?.nodes ? (
                <ReactFlow
                  nodes={selectedChart.config.nodes}
                  edges={selectedChart.config.edges || []}
                  fitView
                  fitViewOptions={{ padding: 0.2 }}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                >
                  <Background />
                  <Controls showInteractive={false} />
                </ReactFlow>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Chart data not available</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedChart.chart_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data Source</p>
                  <p className="font-medium">{selectedChart.source_table_name || 'Custom'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nodes</p>
                  <p className="font-medium">{selectedChart.node_count || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(selectedChart.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}