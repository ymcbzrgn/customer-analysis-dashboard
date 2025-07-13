'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'
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
  X,
  Maximize,
  Minimize,
  Network,
  Download,
  Share,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Shield,
  Award,
  Calendar,
  Clock,
  Globe,
  Linkedin,
  Twitter,
  MessageCircle,
  Video,
  Star,
  Briefcase,
  Target,
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react'

// ReactFlow imports
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  NodeTypes,
  Handle,
  Position,
  NodeProps,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowProvider,
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

// Chart interface
interface Chart {
  id: string
  name: string
  description?: string
  nodes: Node[]
  edges: Edge[]
  employees: Employee[]
  createdAt?: string
  lastModified?: string
  employeeCount?: number
  departmentCount?: number
}

// Chart viewer component props
interface PerfectChartViewerProps {
  open: boolean
  onClose: () => void
  onEdit?: (chart: Chart) => void
  onManagePermissions?: (chart: Chart) => void
  chart: Chart | null
  readonly?: boolean
}

// PERFECT Corporate Node Component for Viewing
const PerfectViewerNode = ({ data, isConnectable, id, selected }: NodeProps) => {
  const employee = data.employee as Employee
  const [isHovered, setIsHovered] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  
  // Enhanced level colors with professional gradients
  const getLevelStyling = (level: number) => {
    const styles = [
      { // CEO/C-Level
        gradient: 'from-red-500 via-red-600 to-red-700',
        bg: 'bg-gradient-to-br from-red-50 via-white to-red-50',
        border: 'border-red-200 hover:border-red-300',
        text: 'text-red-900',
        shadow: 'shadow-red-200/50',
        ring: 'ring-red-500/30',
        accent: 'bg-red-500'
      },
      { // VP/SVP
        gradient: 'from-blue-500 via-blue-600 to-blue-700',
        bg: 'bg-gradient-to-br from-blue-50 via-white to-blue-50',
        border: 'border-blue-200 hover:border-blue-300',
        text: 'text-blue-900',
        shadow: 'shadow-blue-200/50',
        ring: 'ring-blue-500/30',
        accent: 'bg-blue-500'
      },
      { // Director
        gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
        bg: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50',
        border: 'border-emerald-200 hover:border-emerald-300',
        text: 'text-emerald-900',
        shadow: 'shadow-emerald-200/50',
        ring: 'ring-emerald-500/30',
        accent: 'bg-emerald-500'
      },
      { // Manager
        gradient: 'from-purple-500 via-purple-600 to-purple-700',
        bg: 'bg-gradient-to-br from-purple-50 via-white to-purple-50',
        border: 'border-purple-200 hover:border-purple-300',
        text: 'text-purple-900',
        shadow: 'shadow-purple-200/50',
        ring: 'ring-purple-500/30',
        accent: 'bg-purple-500'
      },
      { // Individual Contributor
        gradient: 'from-slate-500 via-slate-600 to-slate-700',
        bg: 'bg-gradient-to-br from-slate-50 via-white to-slate-50',
        border: 'border-slate-200 hover:border-slate-300',
        text: 'text-slate-900',
        shadow: 'shadow-slate-200/50',
        ring: 'ring-slate-500/30',
        accent: 'bg-slate-500'
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
    const indicators = {
      active: { color: 'bg-emerald-400', label: 'Active', pulse: 'animate-pulse' },
      away: { color: 'bg-amber-400', label: 'Away', pulse: '' },
      busy: { color: 'bg-red-400', label: 'Busy', pulse: 'animate-pulse' },
      offline: { color: 'bg-slate-400', label: 'Offline', pulse: '' }
    }
    return indicators[status as keyof typeof indicators] || indicators.offline
  }

  const statusInfo = getStatusIndicator(employee.status || 'active')

  // Handle contact clicks
  const handleContactClick = (type: 'email' | 'phone' | 'linkedin', value: string) => {
    if (type === 'email') {
      window.open(`mailto:${value}`, '_blank')
      toast.success('Opening email client...')
    } else if (type === 'phone') {
      window.open(`tel:${value}`, '_blank')
      toast.success('Opening phone dialer...')
    } else if (type === 'linkedin') {
      window.open(value, '_blank')
      toast.success('Opening LinkedIn profile...')
    }
  }

  return (
    <>
      <div 
        className={`
          ${styling.bg} ${styling.border} ${styling.text}
          relative border-2 rounded-2xl transition-all duration-500 ease-out
          min-w-[260px] max-w-[280px] backdrop-blur-sm
          ${isHovered ? `shadow-2xl ${styling.shadow} scale-110 ${styling.ring} ring-4 z-50` : 'shadow-lg'}
          ${selected ? `${styling.ring} ring-4 scale-105 z-40` : ''}
          cursor-pointer group overflow-hidden
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowDetails(true)}
      >
        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={false}
          className="w-3 h-3 border-2 border-white shadow-lg transition-all duration-300"
          style={{ background: `linear-gradient(to right, ${styling.gradient})` }}
        />
        
        {/* Level Indicator Strip with Animation */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${styling.gradient} rounded-t-2xl`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </div>
        
        {/* Status & Level Indicators */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusInfo.color} ring-2 ring-white shadow-sm ${statusInfo.pulse}`} 
               title={statusInfo.label} />
          {employee.level === 0 && (
            <div className="relative">
              <Star className="h-4 w-4 text-amber-500 animate-pulse" />
              <div className="absolute inset-0 h-4 w-4 text-amber-300 animate-ping">
                <Star className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>

        {/* Header Section */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-start gap-4">
            {/* Enhanced Profile Picture */}
            <div className="relative flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <div className={`
                w-16 h-16 rounded-xl overflow-hidden border-3 border-white shadow-xl
                bg-gradient-to-br from-white to-gray-100
                ${isHovered ? 'ring-4 ring-white/60 shadow-2xl' : ''}
                transition-all duration-300
              `}>
                {employee.photo ? (
                  <img src={employee.photo} alt={employee.name} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${styling.bg}`}>
                    <User className="h-8 w-8 text-gray-600" />
                  </div>
                )}
              </div>
              
              {/* Floating Permission Badges */}
              <div className="absolute -bottom-2 -right-2 flex flex-col gap-1">
                {employee.permissions.slice(0, 2).map((permission, index) => (
                  <div key={index} className={`
                    p-1.5 bg-white rounded-xl shadow-lg border-2 border-white
                    ${isHovered ? 'scale-125 rotate-12' : ''} 
                    transition-all duration-300 delay-${index * 100}
                    hover:scale-150 hover:rotate-0
                  `} title={permission}>
                    {getPermissionIcon(permission)}
                  </div>
                ))}
              </div>
            </div>

            {/* Employee Info */}
            <div className="flex-1 min-w-0">
              <div className="space-y-1">
                <h3 className="font-bold text-base leading-tight">
                  {employee.name}
                </h3>
                <p className="text-sm opacity-80 font-medium">
                  {employee.title}
                </p>
                {employee.employeeId && (
                  <p className="text-xs opacity-60 font-mono bg-white/50 px-2 py-0.5 rounded-full inline-block">
                    #{employee.employeeId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Department & Stats */}
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={`
              text-xs px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border-2 border-white/60
              ${isHovered ? 'bg-white/95 scale-105' : ''}
              transition-all duration-300 shadow-sm
            `}>
              <Building2 className="h-3 w-3 mr-1.5" />
              {employee.department}
            </Badge>
            
            {employee.directReports && employee.directReports.length > 0 && (
              <div className="flex items-center gap-1 text-xs opacity-75 bg-white/60 px-2 py-1 rounded-full">
                <Users className="h-3 w-3" />
                <span>{employee.directReports.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Bar */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-1">
            {employee.email && (
              <button 
                className={`
                  p-2 rounded-xl bg-white/70 hover:bg-white/95 border-2 border-white/60
                  transition-all duration-300 hover:scale-125 hover:rotate-6 hover:shadow-lg
                  ${isHovered ? 'bg-white/90' : ''}
                `} 
                title={employee.email}
                onClick={(e) => {
                  e.stopPropagation()
                  handleContactClick('email', employee.email!)
                }}
              >
                <Mail className="h-3.5 w-3.5 text-blue-600" />
              </button>
            )}
            {employee.phone && (
              <button 
                className={`
                  p-2 rounded-xl bg-white/70 hover:bg-white/95 border-2 border-white/60
                  transition-all duration-300 hover:scale-125 hover:rotate-6 hover:shadow-lg
                  ${isHovered ? 'bg-white/90' : ''}
                `} 
                title={employee.phone}
                onClick={(e) => {
                  e.stopPropagation()
                  handleContactClick('phone', employee.phone!)
                }}
              >
                <Phone className="h-3.5 w-3.5 text-green-600" />
              </button>
            )}
            {employee.location && (
              <button className={`
                p-2 rounded-xl bg-white/70 hover:bg-white/95 border-2 border-white/60
                transition-all duration-300 hover:scale-125 hover:shadow-lg
                ${isHovered ? 'bg-white/90' : ''}
              `} title={employee.location}>
                <MapPin className="h-3.5 w-3.5 text-red-600" />
              </button>
            )}
            {employee.linkedin && (
              <button 
                className={`
                  p-2 rounded-xl bg-white/70 hover:bg-white/95 border-2 border-white/60
                  transition-all duration-300 hover:scale-125 hover:rotate-6 hover:shadow-lg
                  ${isHovered ? 'bg-white/90' : ''}
                `} 
                title="LinkedIn Profile"
                onClick={(e) => {
                  e.stopPropagation()
                  handleContactClick('linkedin', employee.linkedin!)
                }}
              >
                <Linkedin className="h-3.5 w-3.5 text-blue-700" />
              </button>
            )}
          </div>
        </div>

        {/* Skills Preview */}
        {employee.skills && employee.skills.length > 0 && (
          <div className="px-5 pb-4">
            <div className="flex flex-wrap gap-1">
              {employee.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className={`
                  text-xs px-2 py-1 rounded-full bg-white/60 border border-white/70
                  ${isHovered ? 'bg-white/80 scale-105' : ''}
                  transition-all duration-300 delay-${index * 50}
                `}>
                  {skill}
                </span>
              ))}
              {employee.skills.length > 3 && (
                <span className="text-xs opacity-60 px-2 py-1">
                  +{employee.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Animated hover overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 rounded-2xl pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse rounded-2xl" />
          </div>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={false}
          className="w-3 h-3 border-2 border-white shadow-lg transition-all duration-300"
          style={{ background: `linear-gradient(to right, ${styling.gradient})` }}
        />
      </div>

      {/* Employee Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                {employee.photo ? (
                  <img src={employee.photo} alt={employee.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{employee.name}</h2>
                <p className="text-gray-600">{employee.title}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Building2 className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                <div className="text-sm font-medium">{employee.department}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Award className="h-6 w-6 mx-auto text-green-600 mb-1" />
                <div className="text-sm font-medium">Level {employee.level}</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Users className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                <div className="text-sm font-medium">{employee.directReports?.length || 0} Reports</div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {employee.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <button 
                        className="text-blue-600 hover:underline"
                        onClick={() => handleContactClick('email', employee.email!)}
                      >
                        {employee.email}
                      </button>
                    </div>
                  </div>
                )}
                
                {employee.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <button 
                        className="text-green-600 hover:underline"
                        onClick={() => handleContactClick('phone', employee.phone!)}
                      >
                        {employee.phone}
                      </button>
                    </div>
                  </div>
                )}
                
                {employee.location && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="text-sm text-gray-600">Location</div>
                      <div>{employee.location}</div>
                    </div>
                  </div>
                )}
                
                {employee.linkedin && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Linkedin className="h-5 w-5 text-blue-700" />
                    <div>
                      <div className="text-sm text-gray-600">LinkedIn</div>
                      <button 
                        className="text-blue-700 hover:underline"
                        onClick={() => handleContactClick('linkedin', employee.linkedin!)}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Skills & Expertise */}
            {employee.skills && employee.skills.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {employee.bio && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  About
                </h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{employee.bio}</p>
              </div>
            )}

            {/* Permissions */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions
              </h3>
              <div className="flex flex-wrap gap-2">
                {employee.permissions.map((permission, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1 flex items-center gap-1">
                    {getPermissionIcon(permission)}
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Enhanced node types
const perfectViewerNodeTypes: NodeTypes = {
  corporate: PerfectViewerNode,
}

// Enhanced edge styles with animations
const enhancedViewerEdgeOptions = {
  style: { 
    stroke: '#6366f1', 
    strokeWidth: 3,
    filter: 'drop-shadow(0 4px 8px rgba(99, 102, 241, 0.2))'
  },
  type: 'smoothstep',
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#6366f1',
    width: 24,
    height: 24,
  },
}

// Chart viewer content component
function PerfectChartViewerContent({ chart, onClose, onEdit, onManagePermissions, readonly }: { 
  chart: Chart, 
  onClose: () => void, 
  onEdit?: (chart: Chart) => void,
  onManagePermissions?: (chart: Chart) => void,
  readonly?: boolean 
}) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeView, setActiveView] = useState<'chart' | 'analytics' | 'directory'>('chart')
  const { fitView, zoomIn, zoomOut } = useReactFlow()

  // Enhanced export functionality
  const handleExport = async (format: 'json' | 'png' | 'pdf') => {
    try {
      if (format === 'json') {
        const dataStr = JSON.stringify(chart, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${chart.name.replace(/\s+/g, '_')}_chart.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('✅ Chart exported as JSON')
      } else if (format === 'png') {
        const reactFlowElement = document.querySelector('.react-flow')
        if (reactFlowElement) {
          toast.info('🎨 Generating high-quality export...')
          const canvas = await html2canvas(reactFlowElement as HTMLElement, {
            backgroundColor: 'transparent',
            scale: 3,
            useCORS: true,
            allowTaint: true,
            width: reactFlowElement.clientWidth,
            height: reactFlowElement.clientHeight
          })
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = `${chart.name.replace(/\s+/g, '_')}_chart.png`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(url)
              toast.success('✅ Perfect PNG exported!')
            }
          }, 'image/png')
        }
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error(`❌ Failed to export chart as ${format.toUpperCase()}`)
    }
  }

  // Enhanced share functionality
  const handleShare = async () => {
    try {
      const shareData = {
        title: `${chart.name} - Organizational Chart`,
        text: chart.description || 'Check out this organizational chart',
        url: window.location.href
      }
      
      if (navigator.share) {
        await navigator.share(shareData)
        toast.success('✅ Chart shared successfully!')
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('🔗 Chart link copied to clipboard!')
      }
    } catch (error) {
      toast.error('❌ Failed to share chart')
    }
  }

  // Reset view with animation
  const handleResetView = useCallback(() => {
    fitView({ padding: 0.2, duration: 800 })
    toast.success('🎯 View reset to perfect position!')
  }, [fitView])

  // Department statistics
  const departmentStats = useMemo(() => {
    const deptCounts: { [key: string]: number } = {}
    chart.employees.forEach(emp => {
      deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1
    })
    return deptCounts
  }, [chart.employees])

  // Level distribution
  const levelStats = useMemo(() => {
    const levelCounts: { [key: number]: number } = {}
    chart.employees.forEach(emp => {
      levelCounts[emp.level] = (levelCounts[emp.level] || 0) + 1
    })
    return levelCounts
  }, [chart.employees])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-full max-h-full w-full h-full' : 'max-w-[95vw] max-h-[95vh] w-full'} overflow-hidden`}>
        <DialogHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-6 -m-6 mb-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
              <Network className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{chart.name}</h1>
              {chart.description && (
                <p className="text-gray-600 mt-1">{chart.description}</p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-gray-50 to-gray-100">
            <TabsTrigger value="chart" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Organization Chart
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="directory" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employee Directory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="flex-1 flex flex-col">
            {/* Enhanced Toolbar */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-slate-50 to-gray-50">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">{chart.employeeCount || chart.employees.length}</span>
                    <span className="text-blue-700">employees</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium text-emerald-900">{chart.departmentCount || Object.keys(departmentStats).length}</span>
                    <span className="text-emerald-700">departments</span>
                  </div>
                </div>
                {chart.lastModified && (
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Last updated: {new Date(chart.lastModified).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Enhanced Zoom Controls */}
                <div className="flex items-center gap-1 bg-white border rounded-lg shadow-sm">
                  <Button variant="ghost" size="sm" onClick={() => zoomOut()} className="hover:bg-gray-100">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => zoomIn()} className="hover:bg-gray-100">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleResetView} className="hover:bg-gray-100">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Export/Share Controls */}
                <div className="flex items-center gap-1 bg-white border rounded-lg shadow-sm">
                  <Button variant="ghost" size="sm" onClick={() => handleExport('json')} className="hover:bg-blue-50">
                    <Download className="h-4 w-4 mr-1" />
                    JSON
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleExport('png')} className="hover:bg-green-50">
                    <Download className="h-4 w-4 mr-1" />
                    PNG
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleShare} className="hover:bg-purple-50">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-1">
                  {!readonly && onManagePermissions && (
                    <Button variant="outline" size="sm" onClick={() => onManagePermissions(chart)} className="hover:bg-amber-50">
                      <Shield className="h-4 w-4 mr-1" />
                      Permissions
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="hover:bg-gray-50"
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  
                  {!readonly && onEdit && (
                    <Button size="sm" onClick={() => onEdit(chart)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm" onClick={onClose} className="hover:bg-red-50">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Perfect ReactFlow Canvas */}
            <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
              <ReactFlow
                nodes={chart.nodes}
                edges={chart.edges.map(edge => ({ ...edge, ...enhancedViewerEdgeOptions }))}
                nodeTypes={perfectViewerNodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                className="perfect-chart-viewer"
              >
                <Background variant="dots" gap={20} size={2} className="opacity-30" />
                <Controls 
                  className="bg-white/95 backdrop-blur border border-white/40 rounded-xl shadow-xl"
                  showInteractive={false}
                />
                <MiniMap 
                  nodeColor={(node) => {
                    const level = node.data.employee?.level || 0
                    const colors = ['#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#64748b']
                    return colors[Math.min(level, colors.length - 1)]
                  }}
                  className="bg-white/95 backdrop-blur border border-white/40 rounded-xl shadow-xl"
                />
                <Panel position="bottom-left" className="bg-white/95 backdrop-blur p-4 rounded-xl border border-white/40 shadow-xl">
                  <div className="text-xs text-gray-700 space-y-2">
                    <div className="flex items-center gap-2 font-medium">
                      <Star className="h-4 w-4 text-amber-500" />
                      Perfect Organizational Chart
                    </div>
                    <div>💼 Click on employees to view details</div>
                    <div>📞 Use contact buttons to reach out</div>
                    <div>🔍 Zoom and navigate freely</div>
                  </div>
                </Panel>
              </ReactFlow>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Department Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(departmentStats).map(([dept, count]) => (
                      <div key={dept} className="flex items-center justify-between">
                        <span className="font-medium">{dept}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(count / chart.employees.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Level Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Organizational Levels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(levelStats).map(([level, count]) => {
                      const levelNames = ['C-Suite', 'VP/SVP', 'Director', 'Manager', 'Individual Contributor']
                      return (
                        <div key={level} className="flex items-center justify-between">
                          <span className="font-medium">{levelNames[parseInt(level)] || `Level ${level}`}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${(count / chart.employees.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="directory" className="flex-1 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Employee Directory</h3>
                <div className="text-sm text-gray-600">{chart.employees.length} employees</div>
              </div>
              
              <div className="grid gap-4">
                {chart.employees.map((employee) => (
                  <Card key={employee.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          {employee.photo ? (
                            <img src={employee.photo} alt={employee.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-full h-full p-3 text-gray-600" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{employee.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {employee.department}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm">{employee.title}</p>
                          <div className="flex items-center gap-4 mt-2">
                            {employee.email && (
                              <button 
                                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                onClick={() => window.open(`mailto:${employee.email}`, '_blank')}
                              >
                                <Mail className="h-3 w-3" />
                                Email
                              </button>
                            )}
                            {employee.phone && (
                              <button 
                                className="text-green-600 hover:underline text-sm flex items-center gap-1"
                                onClick={() => window.open(`tel:${employee.phone}`, '_blank')}
                              >
                                <Phone className="h-3 w-3" />
                                Call
                              </button>
                            )}
                            {employee.linkedin && (
                              <button 
                                className="text-blue-700 hover:underline text-sm flex items-center gap-1"
                                onClick={() => window.open(employee.linkedin, '_blank')}
                              >
                                <Linkedin className="h-3 w-3" />
                                LinkedIn
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            {employee.permissions.map((permission, index) => (
                              <div key={index} className="p-1 bg-gray-100 rounded">
                                {permission === 'admin' && <Crown className="h-3 w-3 text-amber-600" />}
                                {permission === 'manager' && <Shield className="h-3 w-3 text-blue-600" />}
                                {permission === 'editor' && <Edit className="h-3 w-3 text-green-600" />}
                                {permission === 'viewer' && <Eye className="h-3 w-3 text-gray-600" />}
                              </div>
                            ))}
                          </div>
                          {employee.directReports && employee.directReports.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {employee.directReports.length} direct reports
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default function PerfectChartViewer({ 
  open, 
  onClose, 
  onEdit, 
  onManagePermissions, 
  chart, 
  readonly = false 
}: PerfectChartViewerProps) {
  if (!open || !chart) return null

  return (
    <ReactFlowProvider>
      <PerfectChartViewerContent 
        chart={chart} 
        onClose={onClose} 
        onEdit={onEdit}
        onManagePermissions={onManagePermissions}
        readonly={readonly}
      />
    </ReactFlowProvider>
  )
}