'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
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
  Shield,
  Palette,
  Layout,
  Zap,
  Star,
  Award,
  Briefcase,
  Calendar,
  Clock,
  Globe,
  Linkedin,
  Twitter,
  Github,
  MessageCircle,
  Video,
  Coffee
} from 'lucide-react'

// Import custom nodes
import EmployeeNode from './EmployeeNode'

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
  useReactFlow,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'

// Enhanced Employee interface
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
  skills?: string[]
  linkedin?: string
  twitter?: string
  github?: string
  status?: 'active' | 'away' | 'busy' | 'offline'
  timezone?: string
  workingHours?: string
  bio?: string
  achievements?: string[]
}

// Chart builder component props
interface PerfectChartBuilderProps {
  open: boolean
  onClose: () => void
  onSave: (chart: { nodes: Node[], edges: Edge[], employees: Employee[] }) => void
  initialData?: {
    nodes: Node[]
    edges: Edge[]
    employees: Employee[]
  }
}

// PERFECT Corporate Node Component
const PerfectCorporateNode = ({ data, isConnectable, id, selected }: NodeProps) => {
  const employee = data.employee as Employee
  const [isHovered, setIsHovered] = useState(false)
  
  // Enhanced level colors with professional gradients
  const getLevelStyling = (level: number) => {
    const styles = [
      { // CEO/C-Level
        gradient: 'from-gradient-to-r from-red-500 via-red-600 to-red-700',
        bg: 'bg-gradient-to-br from-red-50 via-white to-red-50',
        border: 'border-red-200 hover:border-red-300',
        text: 'text-red-900',
        shadow: 'shadow-red-100',
        ring: 'ring-red-500/20'
      },
      { // VP/SVP
        gradient: 'from-gradient-to-r from-blue-500 via-blue-600 to-blue-700',
        bg: 'bg-gradient-to-br from-blue-50 via-white to-blue-50',
        border: 'border-blue-200 hover:border-blue-300',
        text: 'text-blue-900',
        shadow: 'shadow-blue-100',
        ring: 'ring-blue-500/20'
      },
      { // Director
        gradient: 'from-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700',
        bg: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50',
        border: 'border-emerald-200 hover:border-emerald-300',
        text: 'text-emerald-900',
        shadow: 'shadow-emerald-100',
        ring: 'ring-emerald-500/20'
      },
      { // Manager
        gradient: 'from-gradient-to-r from-purple-500 via-purple-600 to-purple-700',
        bg: 'bg-gradient-to-br from-purple-50 via-white to-purple-50',
        border: 'border-purple-200 hover:border-purple-300',
        text: 'text-purple-900',
        shadow: 'shadow-purple-100',
        ring: 'ring-purple-500/20'
      },
      { // Individual Contributor
        gradient: 'from-gradient-to-r from-slate-500 via-slate-600 to-slate-700',
        bg: 'bg-gradient-to-br from-slate-50 via-white to-slate-50',
        border: 'border-slate-200 hover:border-slate-300',
        text: 'text-slate-900',
        shadow: 'shadow-slate-100',
        ring: 'ring-slate-500/20'
      }
    ]
    return styles[Math.min(level, styles.length - 1)] || styles[styles.length - 1]
  }

  const styling = getLevelStyling(employee.level)

  // Enhanced permission icons
  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'admin': return <Crown className="h-3.5 w-3.5 text-amber-600" />
      case 'manager': return <Shield className="h-3.5 w-3.5 text-blue-600" />
      case 'editor': return <Edit className="h-3.5 w-3.5 text-emerald-600" />
      case 'viewer': return <Eye className="h-3.5 w-3.5 text-slate-600" />
      default: return <User className="h-3.5 w-3.5 text-slate-500" />
    }
  }

  // Status indicator
  const getStatusIndicator = (status: string) => {
    const colors = {
      active: 'bg-emerald-400',
      away: 'bg-amber-400',
      busy: 'bg-red-400',
      offline: 'bg-slate-400'
    }
    return colors[status as keyof typeof colors] || colors.offline
  }

  return (
    <div 
      className={`
        ${styling.bg} ${styling.border} ${styling.text}
        relative border-2 rounded-2xl transition-all duration-300 ease-out
        min-w-[260px] max-w-[280px] backdrop-blur-sm
        ${isHovered ? `shadow-2xl ${styling.shadow} scale-105 ${styling.ring} ring-4` : 'shadow-lg'}
        ${selected ? `${styling.ring} ring-4 scale-105` : ''}
        cursor-pointer group
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={() => data.onEdit?.(employee)}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-white shadow-lg transition-all duration-200 hover:scale-125"
        style={{ background: styling.gradient }}
      />
      
      {/* Level Indicator Strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${styling.gradient}`} />
      
      {/* Status Indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getStatusIndicator(employee.status || 'active')} ring-2 ring-white shadow-sm`} />
        {employee.level === 0 && <Star className="h-4 w-4 text-amber-500" />}
      </div>

      {/* Header Section */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start gap-4">
          {/* Enhanced Profile Picture */}
          <div className="relative flex-shrink-0">
            <div className={`
              w-14 h-14 rounded-xl overflow-hidden border-3 border-white shadow-lg
              bg-gradient-to-br from-white to-gray-100
              ${isHovered ? 'ring-4 ring-white/50' : ''}
              transition-all duration-300
            `}>
              {employee.photo ? (
                <img src={employee.photo} alt={employee.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${styling.bg}`}>
                  <User className="h-7 w-7 text-gray-600" />
                </div>
              )}
            </div>
            {/* Permission Badges */}
            <div className="absolute -bottom-1 -right-1 flex gap-1">
              {employee.permissions.slice(0, 2).map((permission, index) => (
                <div key={index} className={`
                  p-1 bg-white rounded-lg shadow-md border-2 border-white
                  ${isHovered ? 'scale-110' : ''} transition-transform duration-200
                `} title={permission}>
                  {getPermissionIcon(permission)}
                </div>
              ))}
            </div>
          </div>

          {/* Employee Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm leading-tight truncate">
                  {employee.name}
                </h3>
                <p className="text-xs opacity-75 truncate mt-0.5">
                  {employee.title}
                </p>
                {employee.employeeId && (
                  <p className="text-xs opacity-60 mt-1">
                    ID: {employee.employeeId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Badge */}
      <div className="px-5 pb-3">
        <Badge variant="secondary" className={`
          text-xs px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm border
          ${isHovered ? 'bg-white/90' : ''}
          transition-all duration-200
        `}>
          <Building2 className="h-3 w-3 mr-1.5" />
          {employee.department}
        </Badge>
      </div>

      {/* Contact & Info Section */}
      <div className="px-5 pb-4">
        {/* Contact Icons */}
        <div className="flex items-center gap-2 mb-3">
          {employee.email && (
            <button className={`
              p-2 rounded-lg bg-white/60 hover:bg-white/90 border border-white/80
              transition-all duration-200 hover:scale-110 hover:shadow-md
              group-hover:bg-white/80
            `} title={employee.email}>
              <Mail className="h-3.5 w-3.5 text-gray-700" />
            </button>
          )}
          {employee.phone && (
            <button className={`
              p-2 rounded-lg bg-white/60 hover:bg-white/90 border border-white/80
              transition-all duration-200 hover:scale-110 hover:shadow-md
              group-hover:bg-white/80
            `} title={employee.phone}>
              <Phone className="h-3.5 w-3.5 text-gray-700" />
            </button>
          )}
          {employee.location && (
            <button className={`
              p-2 rounded-lg bg-white/60 hover:bg-white/90 border border-white/80
              transition-all duration-200 hover:scale-110 hover:shadow-md
              group-hover:bg-white/80
            `} title={employee.location}>
              <MapPin className="h-3.5 w-3.5 text-gray-700" />
            </button>
          )}
          {employee.linkedin && (
            <button className={`
              p-2 rounded-lg bg-white/60 hover:bg-white/90 border border-white/80
              transition-all duration-200 hover:scale-110 hover:shadow-md
              group-hover:bg-white/80
            `} title="LinkedIn Profile">
              <Linkedin className="h-3.5 w-3.5 text-blue-600" />
            </button>
          )}
        </div>

        {/* Additional Info */}
        {employee.directReports && employee.directReports.length > 0 && (
          <div className="flex items-center gap-2 text-xs opacity-75">
            <Users className="h-3 w-3" />
            <span>{employee.directReports.length} direct reports</span>
          </div>
        )}

        {/* Skills/Achievements Preview */}
        {employee.skills && employee.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {employee.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className={`
                text-xs px-2 py-0.5 rounded-full bg-white/50 border border-white/60
                ${isHovered ? 'bg-white/70' : ''}
                transition-all duration-200
              `}>
                {skill}
              </span>
            ))}
            {employee.skills.length > 3 && (
              <span className="text-xs opacity-60">+{employee.skills.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      {/* Enhanced hover overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none" />
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-white shadow-lg transition-all duration-200 hover:scale-125"
        style={{ background: styling.gradient }}
      />
    </div>
  )
}

// Enhanced node types
const perfectNodeTypes: NodeTypes = {
  corporate: PerfectCorporateNode,
  employee: EmployeeNode,
}

// Enhanced edge styles
const enhancedEdgeOptions = {
  style: { 
    stroke: '#6366f1', 
    strokeWidth: 3,
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
  },
  type: 'smoothstep',
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#6366f1',
    width: 20,
    height: 20,
  },
}

export default function PerfectChartBuilder({ 
  open, 
  onClose, 
  onSave, 
  initialData 
}: PerfectChartBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || [])
  const [employees, setEmployees] = useState<Employee[]>(initialData?.employees || [])
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState<'design' | 'layout' | 'styles'>('design')

  // Enhanced form state
  const [employeeName, setEmployeeName] = useState('')
  const [employeeTitle, setEmployeeTitle] = useState('')
  const [employeeDepartment, setEmployeeDepartment] = useState('')
  const [employeeLevel, setEmployeeLevel] = useState(2)
  const [employeeEmail, setEmployeeEmail] = useState('')
  const [employeePhone, setEmployeePhone] = useState('')
  const [employeeLocation, setEmployeeLocation] = useState('')
  const [employeePermissions, setEmployeePermissions] = useState<string[]>(['viewer'])
  const [employeeId, setEmployeeId] = useState('')
  const [employeeSkills, setEmployeeSkills] = useState<string[]>([])
  const [employeeLinkedin, setEmployeeLinkedin] = useState('')
  const [employeeStatus, setEmployeeStatus] = useState<'active' | 'away' | 'busy' | 'offline'>('active')
  const [employeeBio, setEmployeeBio] = useState('')

  // Department templates for quick creation
  const departmentTemplates = [
    { name: 'Engineering', skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'] },
    { name: 'Sales', skills: ['CRM', 'Salesforce', 'Lead Generation', 'B2B Sales'] },
    { name: 'Marketing', skills: ['SEO', 'Content Marketing', 'Social Media', 'Analytics'] },
    { name: 'HR', skills: ['Recruitment', 'Employee Relations', 'Training', 'Compliance'] },
    { name: 'Finance', skills: ['Financial Analysis', 'Budgeting', 'Forecasting', 'Excel'] },
    { name: 'Design', skills: ['UI/UX', 'Figma', 'Adobe Creative Suite', 'Prototyping'] }
  ]

  // Auto-layout function for perfect positioning
  const autoLayoutNodes = useCallback(() => {
    if (employees.length === 0) return

    const levelGroups: { [key: number]: Employee[] } = {}
    employees.forEach(emp => {
      if (!levelGroups[emp.level]) levelGroups[emp.level] = []
      levelGroups[emp.level].push(emp)
    })

    const newNodes: Node[] = []
    const levels = Object.keys(levelGroups).map(Number).sort()
    
    levels.forEach((level, levelIndex) => {
      const levelEmployees = levelGroups[level]
      const totalWidth = Math.max(800, levelEmployees.length * 300)
      const startX = -totalWidth / 2
      const y = levelIndex * 200 + 100

      levelEmployees.forEach((employee, empIndex) => {
        const x = startX + (empIndex + 1) * (totalWidth / (levelEmployees.length + 1))
        
        newNodes.push({
          id: employee.id,
          type: 'corporate',
          position: { x, y },
          data: { 
            employee,
            onEdit: handleEditEmployee
          },
        })
      })
    })

    setNodes(newNodes)
    toast.success('Chart auto-layouted perfectly!')
  }, [employees, setNodes])

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
    setEmployeeSkills(employee.skills || [])
    setEmployeeLinkedin(employee.linkedin || '')
    setEmployeeStatus(employee.status || 'active')
    setEmployeeBio(employee.bio || '')
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
    setEmployeeSkills([])
    setEmployeeLinkedin('')
    setEmployeeStatus('active')
    setEmployeeBio('')
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

  // Save employee with enhanced data
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
      skills: employeeSkills,
      linkedin: employeeLinkedin || undefined,
      status: employeeStatus,
      bio: employeeBio || undefined,
    }

    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? newEmployee : emp))
      setNodes(prev => prev.map(node => 
        node.data.employee?.id === editingEmployee.id 
          ? { ...node, data: { ...node.data, employee: newEmployee } }
          : node
      ))
    } else {
      setEmployees(prev => [...prev, newEmployee])
      
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
    toast.success(editingEmployee ? 'Employee updated perfectly!' : 'Employee added successfully!')
  }

  // Enhanced connections with perfect styling
  const onConnect = useCallback(
    (params: Connection) => {
      const sourceEmployee = employees.find(emp => emp.id === params.source)
      const targetEmployee = employees.find(emp => emp.id === params.target)
      
      if (sourceEmployee && targetEmployee) {
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
          ...enhancedEdgeOptions
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
    
    toast.success('Perfect chart saved successfully! 🎉')
    onClose()
  }

  // Background double-click with smart positioning
  const onBackgroundDoubleClick = useCallback((event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const x = event.clientX - rect.left - 140
    const y = event.clientY - rect.top - 100
    
    const newEmployee: Employee = {
      id: `emp_${Date.now()}`,
      name: `New Employee ${employees.length + 1}`,
      title: 'Team Member',
      department: 'General',
      level: 4,
      permissions: ['viewer'],
      status: 'active',
      skills: []
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
    toast.success('Employee added! Double-click to edit details ✨')
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
      <DialogContent className={`${isFullscreen ? 'max-w-full max-h-full w-full h-full' : 'max-w-[95vw] max-h-[95vh] w-full'} overflow-hidden`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Perfect Chart Builder
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="styles">Styles</TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-4">
                <Button onClick={handleAddEmployee} size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
                <Button onClick={autoLayoutNodes} size="sm" variant="outline">
                  <Layout className="h-4 w-4 mr-2" />
                  Auto Layout
                </Button>
                <div className="text-sm text-gray-600 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {employees.length} employees
                  </span>
                  <span className="flex items-center gap-1">
                    <Network className="h-4 w-4" />
                    {edges.length} connections
                  </span>
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
                <Button onClick={handleSaveChart} className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Perfect Chart
                </Button>
              </div>
            </div>

            {/* ReactFlow Canvas */}
            <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={perfectNodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                onDoubleClick={onBackgroundDoubleClick}
                className="perfect-chart-canvas"
                defaultEdgeOptions={enhancedEdgeOptions}
              >
                <Background variant="dots" gap={20} size={1} className="opacity-30" />
                <Controls className="bg-white/90 backdrop-blur border border-white/20 rounded-lg shadow-lg" />
                <MiniMap 
                  nodeColor={(node) => {
                    const level = node.data.employee?.level || 0
                    const colors = ['#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#64748b']
                    return colors[Math.min(level, colors.length - 1)]
                  }}
                  className="bg-white/90 backdrop-blur border border-white/20 rounded-lg shadow-lg"
                />
                <Panel position="bottom-left" className="bg-white/90 backdrop-blur p-3 rounded-lg border border-white/20 shadow-lg">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>✨ Double-click empty space to add employee</div>
                    <div>🔗 Drag from node handles to create connections</div>
                    <div>✏️ Double-click nodes to edit details</div>
                  </div>
                </Panel>
              </ReactFlow>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="flex-1">
            <div className="p-6 text-center">
              <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Layout Options</h3>
              <p className="text-gray-600">Coming soon! Smart auto-layout algorithms and positioning tools.</p>
            </div>
          </TabsContent>

          <TabsContent value="styles" className="flex-1">
            <div className="p-6 text-center">
              <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Style Customization</h3>
              <p className="text-gray-600">Coming soon! Theme options, color schemes, and visual customizations.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Employee Modal */}
        <Dialog open={showEmployeeModal} onOpenChange={setShowEmployeeModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emp-name">Full Name *</Label>
                  <Input
                    id="emp-name"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emp-id">Employee ID</Label>
                  <Input
                    id="emp-id"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="EMP001"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emp-title">Job Title *</Label>
                  <Input
                    id="emp-title"
                    value={employeeTitle}
                    onChange={(e) => setEmployeeTitle(e.target.value)}
                    placeholder="Senior Software Engineer"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emp-dept">Department *</Label>
                  <Select value={employeeDepartment} onValueChange={setEmployeeDepartment}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentTemplates.map((dept) => (
                        <SelectItem key={dept.name} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Level and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emp-level">Organizational Level</Label>
                  <Select value={employeeLevel.toString()} onValueChange={(value) => setEmployeeLevel(parseInt(value))}>
                    <SelectTrigger className="mt-1">
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
                <div>
                  <Label htmlFor="emp-status">Status</Label>
                  <Select value={employeeStatus} onValueChange={(value) => setEmployeeStatus(value as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">🟢 Active</SelectItem>
                      <SelectItem value="away">🟡 Away</SelectItem>
                      <SelectItem value="busy">🔴 Busy</SelectItem>
                      <SelectItem value="offline">⚫ Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emp-email">Email</Label>
                  <Input
                    id="emp-email"
                    type="email"
                    value={employeeEmail}
                    onChange={(e) => setEmployeeEmail(e.target.value)}
                    placeholder="john.doe@company.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emp-phone">Phone</Label>
                  <Input
                    id="emp-phone"
                    value={employeePhone}
                    onChange={(e) => setEmployeePhone(e.target.value)}
                    placeholder="+1 555 0123"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emp-location">Location</Label>
                  <Input
                    id="emp-location"
                    value={employeeLocation}
                    onChange={(e) => setEmployeeLocation(e.target.value)}
                    placeholder="New York, NY"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div>
                <Label htmlFor="emp-linkedin">LinkedIn Profile</Label>
                <Input
                  id="emp-linkedin"
                  value={employeeLinkedin}
                  onChange={(e) => setEmployeeLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/johndoe"
                  className="mt-1"
                />
              </div>

              {/* Skills */}
              <div>
                <Label>Skills & Expertise</Label>
                <div className="mt-2 space-y-2">
                  <Input
                    placeholder="Add skills (comma-separated): JavaScript, React, Leadership..."
                    value={employeeSkills.join(', ')}
                    onChange={(e) => setEmployeeSkills(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  />
                  {employeeDepartment && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-gray-600">Suggested for {employeeDepartment}:</span>
                      {departmentTemplates.find(d => d.name === employeeDepartment)?.skills.map(skill => (
                        <Button
                          key={skill}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!employeeSkills.includes(skill)) {
                              setEmployeeSkills(prev => [...prev, skill])
                            }
                          }}
                          className="h-6 text-xs"
                        >
                          + {skill}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="emp-bio">Bio / Notes</Label>
                <Textarea
                  id="emp-bio"
                  value={employeeBio}
                  onChange={(e) => setEmployeeBio(e.target.value)}
                  placeholder="Brief description about the employee..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Permissions */}
              <div>
                <Label>Permissions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(['admin', 'manager', 'editor', 'viewer'] as const).map((permission) => (
                    <Badge
                      key={permission}
                      variant={employeePermissions.includes(permission) ? 'default' : 'secondary'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => {
                        setEmployeePermissions(prev => 
                          prev.includes(permission)
                            ? prev.filter(p => p !== permission)
                            : [...prev, permission]
                        )
                      }}
                    >
                      {permission === 'admin' && <Crown className="h-3 w-3 mr-1" />}
                      {permission === 'manager' && <Shield className="h-3 w-3 mr-1" />}
                      {permission === 'editor' && <Edit className="h-3 w-3 mr-1" />}
                      {permission === 'viewer' && <Eye className="h-3 w-3 mr-1" />}
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t">
              <Button variant="outline" onClick={() => setShowEmployeeModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEmployee} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
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