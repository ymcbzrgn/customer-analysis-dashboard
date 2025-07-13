'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Share2, Settings, BarChart3, Network, Eye, EyeOff, Maximize2, Edit, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { ChartConfig } from '@/lib/database-postgres'

// Traditional chart components would go here
// For now, we'll create placeholders
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// Import ReactFlow for visual charts
import ReactFlow, { 
  Node, Edge, Controls, Background, MiniMap, ReactFlowProvider,
  useNodesState, useEdgesState, ConnectionMode
} from 'reactflow'
import 'reactflow/dist/style.css'

// Import custom nodes
import EmployeeNode from './EmployeeNode'

// Define node types for ReactFlow
const nodeTypes = {
  employee: EmployeeNode,
}

interface ChartViewerProps {
  open: boolean
  onClose: () => void
  chart: any
  onEdit?: (chart: any) => void
}

// Colors for charts
const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', 
  '#ff0000', '#00ffff', '#ff00ff', '#ffff00', '#000080'
]

// Traditional chart component
const TraditionalChart = ({ chart, data }: { chart: any, data: any[] }) => {
  const config = chart.config as ChartConfig
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available for this chart
      </div>
    )
  }

  const renderChart = () => {
    switch (config.type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.display?.xAxis || 'name'} />
            <YAxis />
            <Tooltip />
            {config.display?.showLegend && <Legend />}
            <Bar dataKey="value" fill={config.display?.color || '#8884d8'} />
          </BarChart>
        )
      
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.display?.xAxis || 'name'} />
            <YAxis />
            <Tooltip />
            {config.display?.showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={config.display?.color || '#8884d8'} 
              strokeWidth={2}
            />
          </LineChart>
        )
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            {config.display?.showLegend && <Legend />}
          </PieChart>
        )
      
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.display?.xAxis || 'name'} />
            <YAxis />
            <Tooltip />
            {config.display?.showLegend && <Legend />}
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={config.display?.color || '#8884d8'} 
              fill={config.display?.color || '#8884d8'} 
              fillOpacity={0.3}
            />
          </AreaChart>
        )
      
      case 'scatter':
        return (
          <ScatterChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis dataKey="y" />
            <Tooltip />
            {config.display?.showLegend && <Legend />}
            <Scatter dataKey="value" fill={config.display?.color || '#8884d8'} />
          </ScatterChart>
        )
      
      default:
        return <div>Unsupported chart type: {config.type}</div>
    }
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      {renderChart()}
    </ResponsiveContainer>
  )
}

// Visual flow chart component
const VisualChart = ({ chart, fullscreen }: { chart: any, fullscreen?: boolean }) => {
  const config = chart.config as ChartConfig
  
  // Handle different config structures - check if nodes exist at root level or nested
  let chartNodes = []
  let chartEdges = []
  
  if (config?.nodes) {
    chartNodes = config.nodes
    chartEdges = config.edges || []
  } else if (config && typeof config === 'object') {
    // Check if config has the data we need in a different structure
    console.log('Chart config structure:', config)
    chartNodes = []
    chartEdges = []
  }

  // Ensure nodes have proper ReactFlow structure
  const processedNodes = chartNodes.map(node => ({
    ...node,
    position: node.position || { x: 0, y: 0 }
  }))
  
  const [nodes, setNodes, onNodesChange] = useNodesState(processedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(chartEdges)

  if (!chartNodes || chartNodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No visual data available</div>
          <div className="text-sm">This chart may need to be recreated with visual node data</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg bg-gray-50 ${fullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        nodesDraggable={false} // Read-only in viewer mode
        nodesConnectable={false}
        elementsSelectable={true}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background color="#94a3b8" gap={20} size={1} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'employee') {
              const dept = node.data?.department || 'default'
              const colors = {
                'Executive': '#9333ea',
                'Technology': '#3b82f6', 
                'Engineering': '#10b981',
                'Finance': '#f59e0b'
              }
              return colors[dept as keyof typeof colors] || '#6b7280'
            }
            return '#6b7280'
          }}
          className="bg-white rounded border shadow-sm"
        />
      </ReactFlow>
    </div>
  )
}

export function ChartViewer({ open, onClose, chart, onEdit }: ChartViewerProps) {
  const [loading, setLoading] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])
  const [showConfig, setShowConfig] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (open && chart && !chart.is_visual_chart) {
      fetchChartData()
    }
  }, [open, chart])

  const fetchChartData = async () => {
    if (!chart.id) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/data-library/charts/${chart.id}/data`)
      if (response.ok) {
        const data = await response.json()
        setChartData(data.data || [])
      } else {
        toast.error('Failed to fetch chart data')
      }
    } catch (error) {
      console.error('Error fetching chart data:', error)
      toast.error('Failed to fetch chart data')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    // Implementation for downloading chart as image/PDF
    toast.info('Download feature coming soon')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: chart.name,
          text: chart.description,
          url: window.location.href
        })
      } catch (error) {
        // Fallback to copying URL
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Chart URL copied to clipboard')
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Chart URL copied to clipboard')
    }
  }

  if (!chart) return null

  const isVisualChart = chart.is_visual_chart || ['flow', 'organizational'].includes(chart.chart_type)
  
  // Debug log for chart structure
  console.log('Chart data:', chart)
  console.log('Chart config:', chart.config)
  console.log('Is visual chart:', isVisualChart)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${fullscreen ? 'max-w-full max-h-full w-screen h-screen' : 'max-w-6xl max-h-[90vh]'} overflow-y-auto`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isVisualChart ? (
                <Network className="h-6 w-6 text-blue-600" />
              ) : (
                <BarChart3 className="h-6 w-6 text-green-600" />
              )}
              <div>
                <DialogTitle className="text-xl">{chart.name}</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">{chart.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={chart.is_public ? "default" : "secondary"}>
                {chart.is_public ? 'Public' : 'Private'}
              </Badge>
              <Badge variant="outline">{chart.chart_type}</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFullscreen(!fullscreen)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(chart)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            <div className="flex justify-end gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : isVisualChart ? (
              <ReactFlowProvider>
                <VisualChart chart={chart} fullscreen={fullscreen} />
              </ReactFlowProvider>
            ) : (
              <TraditionalChart chart={chart} data={chartData} />
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chart Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <Badge variant="secondary">{chart.chart_type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Created:</span>
                    <span>{new Date(chart.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Updated:</span>
                    <span>{new Date(chart.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Visibility:</span>
                    <span>{chart.is_public ? 'Public' : 'Private'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isVisualChart ? (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium">Nodes:</span>
                        <span>{chart.node_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Connections:</span>
                        <span>{chart.edge_count || 0}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium">Data Source:</span>
                        <span>{chart.source_table_name || 'Custom Data'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Records:</span>
                        <span>{chartData.length}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Configuration</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfig(!showConfig)}
              >
                {showConfig ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showConfig ? 'Hide' : 'Show'} Config
              </Button>
            </div>

            {showConfig && (
              <Card>
                <CardContent className="pt-6">
                  <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-64">
                    {JSON.stringify(chart.config, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            <div className="text-sm text-gray-600">
              Chart configuration contains all the settings and data used to render this chart.
              {isVisualChart 
                ? ' For visual charts, this includes node positions, connections, and styling.'
                : ' For data charts, this includes data sources, aggregations, and display settings.'
              }
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}