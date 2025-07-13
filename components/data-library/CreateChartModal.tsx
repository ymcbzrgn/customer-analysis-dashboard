'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, BarChart3, Network, Database, Palette, Settings, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { ChartConfig } from '@/lib/database-postgres'

interface CreateChartModalProps {
  onChartCreated?: (chart: any) => void
  trigger?: React.ReactNode
}

interface TableData {
  table_name: string
  columns: Array<{
    column_name: string
    data_type: string
    is_nullable: boolean
  }>
  row_count: number
}

export default function CreateChartModal({ onChartCreated, trigger }: CreateChartModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tables, setTables] = useState<TableData[]>([])
  const [chartMode, setChartMode] = useState<'data' | 'visual'>('data')
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false
  })

  // Data chart state
  const [dataChart, setDataChart] = useState({
    type: 'bar' as const,
    sourceTable: '',
    groupBy: '',
    valueColumn: '',
    aggregation: 'count' as const,
    title: '',
    xAxis: '',
    yAxis: '',
    color: '#3b82f6'
  })

  // Visual chart state
  const [visualChart, setVisualChart] = useState({
    type: 'flow' as const,
    direction: 'horizontal' as const,
    autoLayout: true,
    spacing: { x: 200, y: 100 },
    nodes: [] as any[],
    edges: [] as any[]
  })

  // Load tables on mount
  useEffect(() => {
    const loadTables = async () => {
      try {
        const response = await fetch('/api/data-library/tables')
        if (response.ok) {
          const data = await response.json()
          setTables(data.tables || [])
        }
      } catch (error) {
        console.error('Failed to load tables:', error)
      }
    }
    
    if (open) {
      loadTables()
    }
  }, [open])

  // Get columns for selected table
  const getTableColumns = (tableName: string) => {
    const table = tables.find(t => t.table_name === tableName)
    return table?.columns || []
  }

  // Reset form
  const resetForm = () => {
    setFormData({ name: '', description: '', isPublic: false })
    setDataChart({
      type: 'bar',
      sourceTable: '',
      groupBy: '',
      valueColumn: '',
      aggregation: 'count',
      title: '',
      xAxis: '',
      yAxis: '',
      color: '#3b82f6'
    })
    setVisualChart({
      type: 'flow',
      direction: 'horizontal',
      autoLayout: true,
      spacing: { x: 200, y: 100 },
      nodes: [],
      edges: []
    })
  }

  // Add sample nodes for visual chart
  const addSampleNodes = () => {
    const sampleNodes = [
      {
        id: 'ceo',
        type: 'employee',
        data: {
          label: 'John Smith',
          sublabel: 'Chief Executive Officer',
          department: 'Executive',
          level: 1,
          email: 'john.smith@company.com',
          employeeId: 'EMP001',
          avatar: 'JS'
        },
        position: { x: 300, y: 50 }
      },
      {
        id: 'cto',
        type: 'employee',
        data: {
          label: 'Jane Doe',
          sublabel: 'Chief Technology Officer',
          department: 'Technology',
          level: 2,
          email: 'jane.doe@company.com',
          employeeId: 'EMP002',
          avatar: 'JD',
          reportsTo: 'ceo'
        },
        position: { x: 150, y: 250 }
      },
      {
        id: 'dev_lead',
        type: 'employee',
        data: {
          label: 'Mike Johnson',
          sublabel: 'Development Lead',
          department: 'Engineering',
          level: 3,
          email: 'mike.johnson@company.com',
          employeeId: 'EMP003',
          avatar: 'MJ',
          reportsTo: 'cto'
        },
        position: { x: 150, y: 450 }
      }
    ]
    
    const sampleEdges = [
      { 
        id: 'ceo-cto', 
        source: 'ceo', 
        target: 'cto', 
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 }
      },
      { 
        id: 'cto-dev_lead', 
        source: 'cto', 
        target: 'dev_lead', 
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
      }
    ]

    setVisualChart(prev => ({
      ...prev,
      nodes: sampleNodes,
      edges: sampleEdges
    }))
  }

  // Create chart
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a chart name')
      return
    }

    setLoading(true)
    try {
      let config: ChartConfig
      let chartType: string

      if (chartMode === 'data') {
        if (!dataChart.sourceTable) {
          toast.error('Please select a data source table')
          return
        }

        chartType = dataChart.type
        config = {
          type: dataChart.type,
          data: {
            source: dataChart.sourceTable,
            groupBy: dataChart.groupBy || undefined,
            valueColumn: dataChart.valueColumn || undefined,
            aggregation: dataChart.aggregation
          },
          display: {
            title: dataChart.title || formData.name,
            xAxis: dataChart.xAxis,
            yAxis: dataChart.yAxis,
            color: dataChart.color,
            showLegend: true,
            showGrid: true
          }
        }
      } else {
        chartType = visualChart.type
        config = {
          type: visualChart.type,
          nodes: visualChart.nodes,
          edges: visualChart.edges,
          flowSettings: {
            direction: visualChart.direction,
            spacing: visualChart.spacing,
            autoLayout: visualChart.autoLayout
          },
          display: {
            title: formData.name
          }
        }
      }

      const response = await fetch('/api/data-library/charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          config,
          chart_type: chartType,
          is_public: formData.isPublic,
          source_table_name: chartMode === 'data' ? dataChart.sourceTable : null
        })
      })

      if (response.ok) {
        const newChart = await response.json()
        toast.success('Chart created successfully!')
        onChartCreated?.(newChart)
        setOpen(false)
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to create chart')
      }
    } catch (error) {
      console.error('Error creating chart:', error)
      toast.error('Failed to create chart')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Chart
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Chart</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Chart Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter chart name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter chart description"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: !!checked }))}
            />
            <Label htmlFor="isPublic">Make this chart public</Label>
          </div>

          {/* Chart Mode Selection */}
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${chartMode === 'data' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setChartMode('data')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <CardTitle className="text-lg">Data Visualization</CardTitle>
                </div>
                <CardDescription>
                  Create charts from database tables with aggregations and filters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">Bar</Badge>
                  <Badge variant="secondary">Line</Badge>
                  <Badge variant="secondary">Pie</Badge>
                  <Badge variant="secondary">Area</Badge>
                  <Badge variant="secondary">Scatter</Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${chartMode === 'visual' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setChartMode('visual')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Network className="h-5 w-5" />
                  <CardTitle className="text-lg">Visual Flow Builder</CardTitle>
                </div>
                <CardDescription>
                  Create organizational charts and process flows with drag-and-drop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">Flowcharts</Badge>
                  <Badge variant="secondary">Org Charts</Badge>
                  <Badge variant="secondary">Process Maps</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Configuration */}
          {chartMode === 'data' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Data Configuration
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chart Type</Label>
                  <Select 
                    value={dataChart.type} 
                    onValueChange={(value: any) => setDataChart(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                      <SelectItem value="scatter">Scatter Plot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data Source Table</Label>
                  <Select 
                    value={dataChart.sourceTable} 
                    onValueChange={(value) => setDataChart(prev => ({ ...prev, sourceTable: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map(table => (
                        <SelectItem key={table.table_name} value={table.table_name}>
                          {table.table_name} ({table.row_count} rows)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {dataChart.sourceTable && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Group By Column</Label>
                    <Select 
                      value={dataChart.groupBy} 
                      onValueChange={(value) => setDataChart(prev => ({ ...prev, groupBy: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {getTableColumns(dataChart.sourceTable).map(col => (
                          <SelectItem key={col.column_name} value={col.column_name}>
                            {col.column_name} ({col.data_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Value Column</Label>
                    <Select 
                      value={dataChart.valueColumn} 
                      onValueChange={(value) => setDataChart(prev => ({ ...prev, valueColumn: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {getTableColumns(dataChart.sourceTable)
                          .filter(col => ['integer', 'bigint', 'numeric', 'real', 'double precision'].includes(col.data_type))
                          .map(col => (
                            <SelectItem key={col.column_name} value={col.column_name}>
                              {col.column_name} ({col.data_type})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Aggregation</Label>
                    <Select 
                      value={dataChart.aggregation} 
                      onValueChange={(value: any) => setDataChart(prev => ({ ...prev, aggregation: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="sum">Sum</SelectItem>
                        <SelectItem value="avg">Average</SelectItem>
                        <SelectItem value="min">Minimum</SelectItem>
                        <SelectItem value="max">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>X-Axis Label</Label>
                  <Input
                    value={dataChart.xAxis}
                    onChange={(e) => setDataChart(prev => ({ ...prev, xAxis: e.target.value }))}
                    placeholder="X-axis label"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Y-Axis Label</Label>
                  <Input
                    value={dataChart.yAxis}
                    onChange={(e) => setDataChart(prev => ({ ...prev, yAxis: e.target.value }))}
                    placeholder="Y-axis label"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input
                    type="color"
                    value={dataChart.color}
                    onChange={(e) => setDataChart(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <Network className="h-5 w-5 mr-2" />
                  Visual Flow Configuration
                </h3>
                <Button onClick={addSampleNodes} variant="outline" size="sm">
                  Add Sample Nodes
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Chart Type</Label>
                  <Select 
                    value={visualChart.type} 
                    onValueChange={(value: any) => setVisualChart(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flow">Flow Chart</SelectItem>
                      <SelectItem value="organizational">Organizational Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Direction</Label>
                  <Select 
                    value={visualChart.direction} 
                    onValueChange={(value: any) => setVisualChart(prev => ({ ...prev, direction: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="autoLayout"
                    checked={visualChart.autoLayout}
                    onCheckedChange={(checked) => setVisualChart(prev => ({ ...prev, autoLayout: !!checked }))}
                  />
                  <Label htmlFor="autoLayout">Auto Layout</Label>
                </div>
              </div>

              {visualChart.nodes.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    {visualChart.nodes.length} nodes, {visualChart.edges.length} connections
                  </p>
                  <div className="text-xs text-muted-foreground">
                    You can customize this chart after creation using the visual editor
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? 'Creating...' : 'Create Chart'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}