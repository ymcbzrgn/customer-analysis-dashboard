'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Save, X, Plus, User, Building2, Mail, Phone, MapPin, 
  Palette, Layout, Settings, Trash2, Edit3, Copy,
  Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw,
  Users, Crown, Award, Briefcase, Network, Eye
} from 'lucide-react'
import { toast } from 'sonner'

// ReactFlow imports
import ReactFlow, {
  Node, Edge, addEdge, Connection, useNodesState, useEdgesState,
  Controls, Background, MiniMap, ReactFlowProvider, ConnectionMode,
  Position, NodeChange, EdgeChange
} from 'reactflow'
import 'reactflow/dist/style.css'

// Import custom nodes
import EmployeeNode from './EmployeeNode'

// Node types
const nodeTypes = {
  employee: EmployeeNode,
}

interface ChartEditorProps {
  open: boolean
  onClose: () => void
  onSave: (chartData: any) => void
  chart?: any // For editing existing chart
  mode?: 'create' | 'edit'
}

interface EmployeeFormData {
  id: string
  label: string
  sublabel: string
  department: string
  level: number
  email: string
  phone: string
  employeeId: string
  avatar: string
  reportsTo?: string
}

const DEPARTMENTS = [
  'Executive', 'Technology', 'Engineering', 'Finance', 
  'Marketing', 'Sales', 'HR', 'Operations', 'Legal', 'Design'
]

const LEVELS = [
  { value: 1, label: 'C-Level / Executive' },
  { value: 2, label: 'VP / Director' },
  { value: 3, label: 'Manager / Lead' },
  { value: 4, label: 'Senior Individual Contributor' },
  { value: 5, label: 'Individual Contributor' }
]

export default function ChartEditor({ open, onClose, onSave, chart, mode = 'create' }: ChartEditorProps) {
  // Chart metadata
  const [chartName, setChartName] = useState(chart?.name || '')
  const [chartDescription, setChartDescription] = useState(chart?.description || '')
  const [isPublic, setIsPublic] = useState(chart?.is_public || false)
  
  // Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(chart?.config?.nodes || [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(chart?.config?.edges || [])
  
  // UI state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Employee form state
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormData>({
    id: '',
    label: '',
    sublabel: '',
    department: 'Engineering',
    level: 4,
    email: '',
    phone: '',
    employeeId: '',
    avatar: ''
  })

  // Load chart data for editing
  useEffect(() => {
    if (mode === 'edit' && chart) {
      setChartName(chart.name || '')
      setChartDescription(chart.description || '')
      setIsPublic(chart.is_public || false)
      
      // Update nodes and edges when chart data changes
      if (chart.config?.nodes) {
        setNodes(chart.config.nodes)
      }
      if (chart.config?.edges) {
        setEdges(chart.config.edges)
      }
    } else if (mode === 'create') {
      // Reset for create mode
      setChartName('')
      setChartDescription('')
      setIsPublic(false)
      setNodes([])
      setEdges([])
    }
  }, [chart, mode, setNodes, setEdges])

  // Handle node connection
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: `${connection.source}-${connection.target}`,
        type: 'smoothstep',
        animated: true,
        style: { 
          stroke: getConnectionColor(connection.source || '', connection.target || ''),
          strokeWidth: 2 
        }
      }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges, nodes]
  )

  // Get connection color based on department
  const getConnectionColor = (sourceId: string, targetId: string) => {
    const sourceNode = nodes.find(n => n.id === sourceId)
    const dept = sourceNode?.data?.department
    const colors = {
      'Executive': '#9333ea',
      'Technology': '#3b82f6',
      'Engineering': '#10b981',
      'Finance': '#f59e0b',
      'Marketing': '#ec4899',
      'Sales': '#ef4444',
      'HR': '#8b5cf6',
      'Operations': '#6b7280'
    }
    return colors[dept as keyof typeof colors] || '#6b7280'
  }

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  // Add new employee
  const handleAddEmployee = () => {
    setEmployeeForm({
      id: `emp_${Date.now()}`,
      label: '',
      sublabel: '',
      department: 'Engineering',
      level: 4,
      email: '',
      phone: '',
      employeeId: '',
      avatar: ''
    })
    setShowEmployeeForm(true)
  }

  // Edit existing employee
  const handleEditEmployee = (node: Node) => {
    setEmployeeForm({
      id: node.id,
      label: node.data.label || '',
      sublabel: node.data.sublabel || '',
      department: node.data.department || 'Engineering',
      level: node.data.level || 4,
      email: node.data.email || '',
      phone: node.data.phone || '',
      employeeId: node.data.employeeId || '',
      avatar: node.data.avatar || '',
      reportsTo: node.data.reportsTo
    })
    setShowEmployeeForm(true)
  }

  // Save employee
  const handleSaveEmployee = () => {
    if (!employeeForm.label.trim()) {
      toast.error('Employee name is required')
      return
    }

    const newNodeData = {
      label: employeeForm.label,
      sublabel: employeeForm.sublabel,
      department: employeeForm.department,
      level: employeeForm.level,
      email: employeeForm.email,
      phone: employeeForm.phone,
      employeeId: employeeForm.employeeId,
      avatar: employeeForm.avatar || employeeForm.label.split(' ').map(n => n[0]).join(''),
      reportsTo: employeeForm.reportsTo
    }

    const existingNodeIndex = nodes.findIndex(n => n.id === employeeForm.id)
    
    if (existingNodeIndex >= 0) {
      // Update existing node
      const updatedNodes = [...nodes]
      updatedNodes[existingNodeIndex] = {
        ...updatedNodes[existingNodeIndex],
        data: newNodeData
      }
      setNodes(updatedNodes)
    } else {
      // Add new node
      const newNode: Node = {
        id: employeeForm.id,
        type: 'employee',
        position: { 
          x: Math.random() * 400 + 100, 
          y: Math.random() * 300 + 100 
        },
        data: newNodeData
      }
      setNodes((nds) => [...nds, newNode])
    }

    setShowEmployeeForm(false)
    toast.success('Employee saved successfully')
  }

  // Delete employee
  const handleDeleteEmployee = (nodeId: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      setNodes((nds) => nds.filter(n => n.id !== nodeId))
      setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId))
      setSelectedNode(null)
      toast.success('Employee deleted')
    }
  }

  // Auto layout
  const handleAutoLayout = () => {
    const layoutNodes = [...nodes]
    let currentLevel = 1
    let xOffset = 0
    const levelHeight = 200
    const nodeWidth = 280

    // Group nodes by level
    const nodesByLevel = layoutNodes.reduce((acc, node) => {
      const level = node.data.level || 4
      if (!acc[level]) acc[level] = []
      acc[level].push(node)
      return acc
    }, {} as Record<number, Node[]>)

    // Position nodes by level
    Object.keys(nodesByLevel).sort().forEach(levelStr => {
      const level = parseInt(levelStr)
      const levelNodes = nodesByLevel[level]
      const totalWidth = levelNodes.length * nodeWidth
      const startX = (800 - totalWidth) / 2

      levelNodes.forEach((node, index) => {
        node.position = {
          x: startX + (index * nodeWidth),
          y: level * levelHeight
        }
      })
    })

    setNodes(layoutNodes)
    toast.success('Auto layout applied')
  }

  // Save chart
  const handleSave = async () => {
    if (!chartName.trim()) {
      toast.error('Chart name is required')
      return
    }

    if (nodes.length === 0) {
      toast.error('Please add at least one employee to the chart')
      return
    }

    setLoading(true)
    try {
      const chartData = {
        id: chart?.id,
        name: chartName,
        description: chartDescription,
        chart_type: 'organizational',
        is_public: isPublic,
        config: {
          type: 'organizational',
          nodes,
          edges,
          display: {
            title: chartName
          },
          flowSettings: {
            direction: 'vertical',
            spacing: { x: 280, y: 200 },
            autoLayout: true
          }
        }
      }

      await onSave(chartData)
      onClose()
      toast.success(`Chart ${mode === 'create' ? 'created' : 'updated'} successfully!`)
    } catch (error) {
      console.error('Error saving chart:', error)
      toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} chart`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${fullscreen ? 'max-w-full max-h-full w-screen h-screen' : 'max-w-7xl max-h-[95vh]'} p-0 overflow-hidden`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {mode === 'create' ? 'Create' : 'Edit'} Organizational Chart
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Build and manage your company's organizational structure
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFullscreen(!fullscreen)}
                >
                  {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r bg-gray-50 overflow-y-auto">
              <div className="p-4 space-y-6">
                {/* Chart Settings */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Chart Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="chartName">Chart Name *</Label>
                      <Input
                        id="chartName"
                        value={chartName}
                        onChange={(e) => setChartName(e.target.value)}
                        placeholder="e.g., Engineering Team Structure"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="chartDescription">Description</Label>
                      <Textarea
                        id="chartDescription"
                        value={chartDescription}
                        onChange={(e) => setChartDescription(e.target.value)}
                        placeholder="Brief description of the organizational chart"
                        className="mt-1 h-20"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isPublic">Public Chart</Label>
                      <Switch
                        id="isPublic"
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={handleAddEmployee} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Employee
                    </Button>
                    <Button variant="outline" onClick={handleAutoLayout} className="w-full">
                      <Layout className="h-4 w-4 mr-2" />
                      Auto Layout
                    </Button>
                    {selectedNode && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Selected: {selectedNode.data.label}</p>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditEmployee(selectedNode)}
                              className="flex-1"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDeleteEmployee(selectedNode.id)}
                              className="flex-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Chart Stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Network className="h-5 w-5" />
                      Chart Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{nodes.length}</div>
                        <div className="text-xs text-gray-600">Employees</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{edges.length}</div>
                        <div className="text-xs text-gray-600">Connections</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 relative">
              <ReactFlowProvider>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  connectionMode={ConnectionMode.Loose}
                  fitView
                  fitViewOptions={{ padding: 0.2 }}
                  className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
                  defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
                  minZoom={0.2}
                  maxZoom={2}
                >
                  <Background color="#94a3b8" gap={20} size={1} />
                  <Controls className="bg-white/90 backdrop-blur border border-white/20 rounded-lg shadow-lg" />
                  <MiniMap 
                    nodeColor={(node) => {
                      const dept = node.data?.department || 'default'
                      const colors = {
                        'Executive': '#9333ea',
                        'Technology': '#3b82f6', 
                        'Engineering': '#10b981',
                        'Finance': '#f59e0b',
                        'Marketing': '#ec4899',
                        'Sales': '#ef4444',
                        'HR': '#8b5cf6',
                        'Operations': '#6b7280'
                      }
                      return colors[dept as keyof typeof colors] || '#6b7280'
                    }}
                    className="bg-white/90 backdrop-blur border border-white/20 rounded-lg shadow-lg"
                  />
                </ReactFlow>
              </ReactFlowProvider>

              {/* Floating Actions */}
              <div className="absolute bottom-6 right-6 flex gap-3">
                <Button onClick={onClose} variant="outline" size="lg">
                  Cancel
                </Button>
                <Button onClick={handleSave} size="lg" disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {mode === 'create' ? 'Create Chart' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Form Modal */}
        <Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {employeeForm.id.includes('emp_') && nodes.find(n => n.id === employeeForm.id) 
                  ? 'Edit Employee' 
                  : 'Add New Employee'
                }
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="empName">Full Name *</Label>
                  <Input
                    id="empName"
                    value={employeeForm.label}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="empTitle">Job Title *</Label>
                  <Input
                    id="empTitle"
                    value={employeeForm.sublabel}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, sublabel: e.target.value }))}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="empDept">Department</Label>
                  <Select value={employeeForm.department} onValueChange={(value) => setEmployeeForm(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="empLevel">Level</Label>
                  <Select value={employeeForm.level.toString()} onValueChange={(value) => setEmployeeForm(prev => ({ ...prev, level: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value.toString()}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="empEmail">Email</Label>
                  <Input
                    id="empEmail"
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john.smith@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="empPhone">Phone</Label>
                  <Input
                    id="empPhone"
                    value={employeeForm.phone}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 555 0123"
                  />
                </div>
                <div>
                  <Label htmlFor="empId">Employee ID</Label>
                  <Input
                    id="empId"
                    value={employeeForm.employeeId}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, employeeId: e.target.value }))}
                    placeholder="EMP001"
                  />
                </div>

                {/* Preview */}
                <div className="mt-6">
                  <Label>Preview</Label>
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-600 text-white">
                          {employeeForm.avatar || employeeForm.label.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employeeForm.label || 'Employee Name'}</p>
                        <p className="text-sm text-gray-600">{employeeForm.sublabel || 'Job Title'}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {employeeForm.department}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowEmployeeForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEmployee}>
                <Save className="h-4 w-4 mr-2" />
                Save Employee
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}