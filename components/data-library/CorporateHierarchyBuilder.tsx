'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Users, 
  Crown, 
  Eye, 
  Edit, 
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Plus,
  Save,
  X,
  Maximize,
  Network,
  UserPlus,
  Settings,
  Shield
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
  MiniMap,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'

// Employee interface
interface Employee {
  id: string
  name: string
  title: string
  department: string
  level: number
  email?: string
  phone?: string
  location?: string
  permissions: ('admin' | 'manager' | 'editor' | 'viewer')[]
  reportsTo?: string
  directReports?: string[]
  photo?: string
  startDate?: string
  employeeId?: string
}

// Chart builder component props
interface CorporateHierarchyBuilderProps {
  open: boolean
  onClose: () => void
  onSave: (chart: { nodes: Node[], edges: Edge[], employees: Employee[] }) => void
  initialData?: {
    nodes: Node[]
    edges: Edge[]
    employees: Employee[]
  }
}

// Corporate hierarchy node component
const CorporateNode = ({ data, isConnectable, id }: NodeProps) => {
  const employee = data.employee as Employee
  
  const getLevelColor = (level: number) => {
    const colors = [
      'from-red-100 to-red-200 border-red-400 text-red-900', // CEO/C-Level
      'from-blue-100 to-blue-200 border-blue-400 text-blue-900', // VPs/SVPs
      'from-green-100 to-green-200 border-green-400 text-green-900', // Directors
      'from-purple-100 to-purple-200 border-purple-400 text-purple-900', // Managers
      'from-gray-100 to-gray-200 border-gray-400 text-gray-900', // Individual Contributors
    ]
    return colors[Math.min(level, colors.length - 1)] || colors[colors.length - 1]
  }

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'admin': return <Crown className="h-3 w-3 text-yellow-600" />
      case 'manager': return <Users className="h-3 w-3 text-blue-600" />
      case 'editor': return <Edit className="h-3 w-3 text-green-600" />
      case 'viewer': return <Eye className="h-3 w-3 text-gray-600" />
      default: return <User className="h-3 w-3 text-gray-500" />
    }
  }

  return (
    <div 
      className={`bg-gradient-to-br ${getLevelColor(employee.level)} border-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 min-w-[280px] max-w-[320px] cursor-pointer`}
      onDoubleClick={() => data.onEdit?.(employee)}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-gray-500 border-white"
      />
      
      {/* Header */}
      <div className="px-4 py-2 border-b border-white/30">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs bg-white/50">
            <Building2 className="h-3 w-3 mr-1" />
            {employee.department}
          </Badge>
          <div className="flex items-center gap-1">
            {employee.permissions.map((permission, index) => (
              <div key={index} title={permission} className="p-1 bg-white/70 rounded-full">
                {getPermissionIcon(permission)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/50">
              {employee.photo ? (
                <img src={employee.photo} alt={employee.name} className="w-full h-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-gray-600" />
              )}
            </div>
          </div>

          {/* Employee Details */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">
              {employee.name}
            </div>
            <div className="text-xs opacity-80 truncate">
              {employee.title}
            </div>
            {employee.employeeId && (
              <div className="text-xs opacity-70 mt-1">
                ID: {employee.employeeId}
              </div>
            )}
            
            {/* Contact Icons */}
            <div className="flex gap-2 mt-2">
              {employee.email && (
                <div className="p-1 hover:bg-white/20 rounded cursor-pointer" title={employee.email}>
                  <Mail className="h-3 w-3" />
                </div>
              )}
              {employee.phone && (
                <div className="p-1 hover:bg-white/20 rounded cursor-pointer" title={employee.phone}>
                  <Phone className="h-3 w-3" />
                </div>
              )}
              {employee.location && (
                <div className="p-1 hover:bg-white/20 rounded cursor-pointer" title={employee.location}>
                  <MapPin className="h-3 w-3" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reports Info */}
        {employee.directReports && employee.directReports.length > 0 && (
          <div className="mt-3 text-xs opacity-70">
            Direct Reports: {employee.directReports.length}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-gray-500 border-white"
      />
    </div>
  )
}

// Node types
const nodeTypes: NodeTypes = {
  corporate: CorporateNode,
}

export default function CorporateHierarchyBuilder({ 
  open, 
  onClose, 
  onSave, 
  initialData 
}: CorporateHierarchyBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || [])
  const [employees, setEmployees] = useState<Employee[]>(initialData?.employees || [])
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Employee form state
  const [employeeName, setEmployeeName] = useState('')
  const [employeeTitle, setEmployeeTitle] = useState('')
  const [employeeDepartment, setEmployeeDepartment] = useState('')
  const [employeeLevel, setEmployeeLevel] = useState(2)
  const [employeeEmail, setEmployeeEmail] = useState('')
  const [employeePhone, setEmployeePhone] = useState('')
  const [employeeLocation, setEmployeeLocation] = useState('')
  const [employeePermissions, setEmployeePermissions] = useState<string[]>(['viewer'])
  const [employeeId, setEmployeeId] = useState('')

  // Load employee data into form
  const loadEmployeeData = (employee: Employee) => {
    setEmployeeName(employee.name)
    setEmployeeTitle(employee.title)
    setEmployeeDepartment(employee.department)
    setEmployeeLevel(employee.level)
    setEmployeeEmail(employee.email || '')
    setEmployeePhone(employee.phone || '')
    setEmployeeLocation(employee.location || '')
    setEmployeePermissions(employee.permissions)
    setEmployeeId(employee.employeeId || '')
  }

  // Clear employee form
  const clearEmployeeForm = () => {
    setEmployeeName('')
    setEmployeeTitle('')
    setEmployeeDepartment('')
    setEmployeeLevel(2)
    setEmployeeEmail('')
    setEmployeePhone('')
    setEmployeeLocation('')
    setEmployeePermissions(['viewer'])
    setEmployeeId('')
  }

  // Handle editing employee
  const handleEditEmployee = useCallback((employee: Employee) => {
    setEditingEmployee(employee)
    loadEmployeeData(employee)
    setShowEmployeeModal(true)
  }, [])

  // Add employee
  const handleAddEmployee = () => {
    setEditingEmployee(null)
    clearEmployeeForm()
    setShowEmployeeModal(true)
  }

  // Save employee
  const handleSaveEmployee = () => {
    if (!employeeName.trim() || !employeeTitle.trim() || !employeeDepartment.trim()) {
      toast.error('Name, title, and department are required')
      return
    }

    const newEmployee: Employee = {
      id: editingEmployee?.id || `emp_${Date.now()}`,
      name: employeeName,
      title: employeeTitle,
      department: employeeDepartment,
      level: employeeLevel,
      email: employeeEmail || undefined,
      phone: employeePhone || undefined,
      location: employeeLocation || undefined,
      permissions: employeePermissions as ('admin' | 'manager' | 'editor' | 'viewer')[],
      employeeId: employeeId || undefined,
    }

    if (editingEmployee) {
      // Update existing employee
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? newEmployee : emp))
      
      // Update node data
      setNodes(prev => prev.map(node => 
        node.data.employee?.id === editingEmployee.id 
          ? { ...node, data: { ...node.data, employee: newEmployee } }
          : node
      ))
    } else {
      // Add new employee
      setEmployees(prev => [...prev, newEmployee])
      
      // Create new node
      const newNode: Node = {
        id: newEmployee.id,
        type: 'corporate',
        position: { x: Math.random() * 500 + 200, y: Math.random() * 300 + 100 },
        data: { 
          employee: newEmployee,
          onEdit: handleEditEmployee
        },
      }
      
      setNodes(prev => [...prev, newNode])
    }

    setShowEmployeeModal(false)
    setEditingEmployee(null)
    clearEmployeeForm()
    toast.success(editingEmployee ? 'Employee updated' : 'Employee added')
  }

  // Handle connections
  const onConnect = useCallback(
    (params: Connection) => {
      const sourceEmployee = employees.find(emp => emp.id === params.source)
      const targetEmployee = employees.find(emp => emp.id === params.target)
      
      if (sourceEmployee && targetEmployee) {
        // Update reporting relationships
        setEmployees(prev => prev.map(emp => {
          if (emp.id === targetEmployee.id) {
            return { ...emp, reportsTo: sourceEmployee.id }
          }
          if (emp.id === sourceEmployee.id) {
            const directReports = emp.directReports || []
            return { 
              ...emp, 
              directReports: directReports.includes(targetEmployee.id) 
                ? directReports 
                : [...directReports, targetEmployee.id]
            }
          }
          return emp
        }))
        
        setEdges((eds) => addEdge({
          ...params,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 }
        }, eds))
      }
    },
    [employees, setEdges]
  )

  // Handle save
  const handleSaveChart = () => {
    if (employees.length === 0) {
      toast.error('Please add at least one employee')
      return
    }

    onSave({
      nodes,
      edges,
      employees
    })
    
    toast.success('Chart saved successfully')
    onClose()
  }

  // Handle background double-click to add employee
  const onBackgroundDoubleClick = useCallback((event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const x = event.clientX - rect.left - 160 // Center the node
    const y = event.clientY - rect.top - 100
    
    // Create a new employee at this position
    const newEmployee: Employee = {
      id: `emp_${Date.now()}`,
      name: `New Employee ${employees.length + 1}`,
      title: 'Employee',
      department: 'General',
      level: 4,
      permissions: ['viewer'],
    }

    setEmployees(prev => [...prev, newEmployee])
    
    const newNode: Node = {
      id: newEmployee.id,
      type: 'corporate',
      position: { x, y },
      data: { 
        employee: newEmployee,
        onEdit: handleEditEmployee
      },
    }
    
    setNodes(prev => [...prev, newNode])
    toast.success('Employee added - double-click to edit details')
  }, [employees.length, handleEditEmployee, setNodes])

  // Initialize nodes with edit handler
  useMemo(() => {
    setNodes(prev => prev.map(node => ({
      ...node,
      data: {
        ...node.data,
        onEdit: handleEditEmployee
      }
    })))
  }, [handleEditEmployee, setNodes])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-full max-h-full w-full h-full' : 'max-w-7xl max-h-[95vh]'} overflow-hidden`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Chart Builder
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <Button onClick={handleAddEmployee} size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
              <div className="text-sm text-gray-600">
                Employees: {employees.length} | Connections: {edges.length}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveChart}>
                <Save className="h-4 w-4 mr-2" />
                Save Chart
              </Button>
            </div>
          </div>

          {/* ReactFlow Canvas */}
          <div className="flex-1 bg-gray-100">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              onDoubleClick={onBackgroundDoubleClick}
              className="bg-gradient-to-br from-blue-50 to-indigo-100"
            >
              <Background />
              <Controls />
              <MiniMap 
                nodeColor={(node) => {
                  const level = node.data.employee?.level || 0
                  const colors = ['#fca5a5', '#93c5fd', '#86efac', '#c4b5fd', '#d1d5db']
                  return colors[Math.min(level, colors.length - 1)]
                }}
                className="bg-white border border-gray-200"
              />
              <Panel position="bottom-left" className="bg-white p-2 rounded border">
                <div className="text-xs text-gray-600">
                  Double-click empty space to add employee • Drag from node handles to create connections
                </div>
              </Panel>
            </ReactFlow>
          </div>
        </div>

        {/* Employee Modal */}
        <Dialog open={showEmployeeModal} onOpenChange={setShowEmployeeModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emp-name">Name *</Label>
                  <Input
                    id="emp-name"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label htmlFor="emp-id">Employee ID</Label>
                  <Input
                    id="emp-id"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="EMP001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emp-title">Title *</Label>
                  <Input
                    id="emp-title"
                    value={employeeTitle}
                    onChange={(e) => setEmployeeTitle(e.target.value)}
                    placeholder="Job title"
                  />
                </div>
                <div>
                  <Label htmlFor="emp-dept">Department *</Label>
                  <Input
                    id="emp-dept"
                    value={employeeDepartment}
                    onChange={(e) => setEmployeeDepartment(e.target.value)}
                    placeholder="Department"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emp-level">Organizational Level</Label>
                <Select value={employeeLevel.toString()} onValueChange={(value) => setEmployeeLevel(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Level 0 - C-Suite/Executive</SelectItem>
                    <SelectItem value="1">Level 1 - VP/SVP</SelectItem>
                    <SelectItem value="2">Level 2 - Director</SelectItem>
                    <SelectItem value="3">Level 3 - Manager</SelectItem>
                    <SelectItem value="4">Level 4 - Individual Contributor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emp-email">Email</Label>
                  <Input
                    id="emp-email"
                    type="email"
                    value={employeeEmail}
                    onChange={(e) => setEmployeeEmail(e.target.value)}
                    placeholder="email@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="emp-phone">Phone</Label>
                  <Input
                    id="emp-phone"
                    value={employeePhone}
                    onChange={(e) => setEmployeePhone(e.target.value)}
                    placeholder="+1 555 0123"
                  />
                </div>
                <div>
                  <Label htmlFor="emp-location">Location</Label>
                  <Input
                    id="emp-location"
                    value={employeeLocation}
                    onChange={(e) => setEmployeeLocation(e.target.value)}
                    placeholder="City, State"
                  />
                </div>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(['admin', 'manager', 'editor', 'viewer'] as const).map((permission) => (
                    <Badge
                      key={permission}
                      variant={employeePermissions.includes(permission) ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => {
                        setEmployeePermissions(prev => 
                          prev.includes(permission)
                            ? prev.filter(p => p !== permission)
                            : [...prev, permission]
                        )
                      }}
                    >
                      {permission === 'admin' && <Crown className="h-3 w-3 mr-1" />}
                      {permission === 'manager' && <Users className="h-3 w-3 mr-1" />}
                      {permission === 'editor' && <Edit className="h-3 w-3 mr-1" />}
                      {permission === 'viewer' && <Eye className="h-3 w-3 mr-1" />}
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEmployeeModal(false)}>
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