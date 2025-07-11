'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Database,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp
} from 'lucide-react'

// ReactFlow imports
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  NodeTypes,
  Handle,
  Position,
  NodeProps,
  EdgeProps,
} from 'reactflow'
import 'reactflow/dist/style.css'

interface CreateChartModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editChart?: Chart | null
}

interface Chart {
  id?: string
  name: string
  description?: string
  config: ChartConfig
  source_table_name?: string
  chart_type: 'bar' | 'line' | 'pie' | 'area'
  is_public: boolean
  created_at?: string
  updated_at?: string
  created_by?: number
  created_by_name?: string
  node_count?: number
  has_custom_data?: boolean
}

interface ChartConfig {
  nodes: Node[]
  edges: Edge[]
  metadata?: {
    layout?: string
    theme?: string
    [key: string]: any
  }
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
}

// Custom node component
const CustomNode = ({ data, isConnectable }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div className="flex items-center gap-2">
        {data.icon && <data.icon className="h-4 w-4" />}
        <div>
          <div className="text-sm font-medium">{data.label}</div>
          {data.sublabel && <div className="text-xs text-gray-500">{data.sublabel}</div>}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  )
}

// Custom edge component
const CustomEdge = ({ sourceX, sourceY, targetX, targetY, data }: EdgeProps) => {
  const edgePath = `M ${sourceX} ${sourceY} C ${sourceX} ${sourceY + 50} ${targetX} ${targetY - 50} ${targetX} ${targetY}`
  
  return (
    <path
      d={edgePath}
      stroke={data?.color || '#b1b1b7'}
      strokeWidth={2}
      fill="none"
      className="react-flow__edge-path"
    />
  )
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Start Node',
      sublabel: 'Chart beginning',
      icon: BarChart3
    },
  },
]

const initialEdges: Edge[] = []

export default function CreateChartModal({ open, onClose, onSuccess, editChart }: CreateChartModalProps) {
  const [loading, setLoading] = useState(false)
  const [tables, setTables] = useState<TableSchema[]>([])
  const [activeTab, setActiveTab] = useState<'basic' | 'editor'>('basic')
  
  // Chart form state
  const [chartName, setChartName] = useState('')
  const [chartDescription, setChartDescription] = useState('')
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area'>('bar')
  const [sourceTable, setSourceTable] = useState<string>('')
  const [isPublic, setIsPublic] = useState(false)
  
  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [nodeIdCounter, setNodeIdCounter] = useState(2)

  // Load tables for data source selection
  const fetchTables = async () => {
    try {
      const response = await fetch('/api/data-library/tables')
      const data = await response.json()
      
      if (data.success) {
        setTables(data.tables.filter((table: TableSchema) => !table.is_system_table))
      }
    } catch (error) {
      toast.error('Failed to load tables')
    }
  }

  useEffect(() => {
    if (open) {
      fetchTables()
      
      // Reset form for new chart
      if (!editChart) {
        setChartName('')
        setChartDescription('')
        setChartType('bar')
        setSourceTable('')
        setIsPublic(false)
        setNodes(initialNodes)
        setEdges(initialEdges)
        setNodeIdCounter(2)
        setActiveTab('basic')
      } else {
        // Load existing chart data
        setChartName(editChart.name)
        setChartDescription(editChart.description || '')
        setChartType(editChart.chart_type)
        setSourceTable(editChart.source_table_name || '')
        setIsPublic(editChart.is_public)
        
        if (editChart.config.nodes && editChart.config.edges) {
          setNodes(editChart.config.nodes)
          setEdges(editChart.config.edges)
        }
      }
    }
  }, [open, editChart])

  // ReactFlow event handlers
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: nodeIdCounter.toString(),
      type: 'custom',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: `Node ${nodeIdCounter}`,
        sublabel: 'Data point',
        icon: Database
      },
    }
    setNodes((nds) => [...nds, newNode])
    setNodeIdCounter(nodeIdCounter + 1)
  }, [nodeIdCounter, setNodes])

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
  }, [setNodes, setEdges])

  const getChartTypeIcon = (type: string) => {
    switch (type) {
      case 'bar': return BarChart3
      case 'line': return LineChart
      case 'pie': return PieChart
      case 'area': return TrendingUp
      default: return BarChart3
    }
  }

  const handleSave = async () => {
    // Validation
    if (!chartName.trim()) {
      toast.error('Chart name is required')
      return
    }

    if (nodes.length === 0) {
      toast.error('Chart must have at least one node')
      return
    }

    setLoading(true)

    try {
      const chartData = {
        name: chartName,
        description: chartDescription,
        config: {
          nodes,
          edges,
          metadata: {
            layout: 'hierarchical',
            theme: 'default',
            created_at: new Date().toISOString(),
            node_count: nodes.length,
            edge_count: edges.length
          }
        },
        source_table_name: sourceTable === 'none' ? null : sourceTable || null,
        chart_type: chartType,
        is_public: isPublic
      }

      const url = editChart ? `/api/data-library/charts/${editChart.id}` : '/api/data-library/charts'
      const method = editChart ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chartData)
      })

      const result = await response.json()

      if (result.success) {
        toast.success(editChart ? 'Chart updated successfully' : 'Chart created successfully')
        onSuccess()
        onClose()
      } else {
        toast.error(result.message || 'Failed to save chart')
      }
    } catch (error) {
      toast.error('Failed to save chart')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {(() => {
              const IconComponent = getChartTypeIcon(chartType)
              return <IconComponent className="h-5 w-5" />
            })()}
            {editChart ? 'Edit Chart' : 'Create New Chart'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'basic' | 'editor')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="editor">Chart Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chart-name">Chart Name *</Label>
                <Input
                  id="chart-name"
                  value={chartName}
                  onChange={(e) => setChartName(e.target.value)}
                  placeholder="Enter chart name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chart-type">Chart Type</Label>
                <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Bar Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="line">
                      <div className="flex items-center gap-2">
                        <LineChart className="h-4 w-4" />
                        Line Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="pie">
                      <div className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Pie Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="area">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Area Chart
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="chart-description">Description</Label>
                <Textarea
                  id="chart-description"
                  value={chartDescription}
                  onChange={(e) => setChartDescription(e.target.value)}
                  placeholder="Enter chart description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source-table">Data Source (Optional)</Label>
                <Select value={sourceTable} onValueChange={setSourceTable}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a table" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Custom Data (No Table)</SelectItem>
                    {tables.map((table) => (
                      <SelectItem key={table.table_name} value={table.table_name}>
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          {table.table_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-public"
                    checked={isPublic}
                    onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                  />
                  <Label htmlFor="is-public">Make chart public</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Public charts can be viewed by all users
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={addNode}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Node
                </Button>
                <span className="text-sm text-muted-foreground">
                  Nodes: {nodes.length} | Edges: {edges.length}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Drag nodes to move • Click and drag from handles to create connections
              </div>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Chart Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 border rounded-lg bg-gray-50">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                  >
                    <Background />
                    <Controls />
                  </ReactFlow>
                </div>
              </CardContent>
            </Card>

            {/* Node management */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Node Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {nodes.map((node) => (
                    <div key={node.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span className="text-sm font-medium">{node.data.label}</span>
                        <span className="text-xs text-muted-foreground">{node.data.sublabel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            // TODO: Add node edit functionality
                            toast.info('Node editing coming soon!')
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNode(node.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : editChart ? 'Update Chart' : 'Create Chart'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}