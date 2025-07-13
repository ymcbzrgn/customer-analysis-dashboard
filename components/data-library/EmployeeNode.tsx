'use client'

import React from 'react'
import { Handle, Position } from 'reactflow'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, User } from 'lucide-react'

interface EmployeeNodeData {
  label: string
  sublabel: string
  department: string
  level: number
  email?: string
  phone?: string
  employeeId?: string
  avatar?: string
  reportsTo?: string
}

interface EmployeeNodeProps {
  data: EmployeeNodeData
  selected?: boolean
}

const getDepartmentColor = (department: string) => {
  const colors = {
    'Executive': 'bg-purple-500',
    'Technology': 'bg-blue-500',
    'Engineering': 'bg-green-500',
    'Finance': 'bg-yellow-500',
    'Marketing': 'bg-pink-500',
    'Sales': 'bg-red-500',
    'HR': 'bg-indigo-500',
    'Operations': 'bg-gray-500'
  }
  return colors[department as keyof typeof colors] || 'bg-gray-500'
}

const getLevelBorder = (level: number) => {
  const borders = {
    1: 'border-purple-400 border-4', // CEO
    2: 'border-blue-400 border-3',   // C-level
    3: 'border-green-400 border-2',  // Managers
    4: 'border-gray-400 border-1',   // Individual contributors
  }
  return borders[level as keyof typeof borders] || 'border-gray-400 border-1'
}

export function EmployeeNode({ data, selected }: EmployeeNodeProps) {
  const departmentColor = getDepartmentColor(data.department)
  const levelBorder = getLevelBorder(data.level)

  return (
    <div className="employee-node">
      {/* Input handle (for connections from above) */}
      {data.reportsTo && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: '#3b82f6',
            border: '2px solid #1e40af',
            width: 12,
            height: 12
          }}
        />
      )}

      <Card className={`w-64 ${levelBorder} ${selected ? 'ring-2 ring-blue-400' : ''} shadow-lg hover:shadow-xl transition-shadow`}>
        <CardContent className="p-4">
          {/* Header with Avatar and Basic Info */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="w-12 h-12 border-2 border-white shadow-md">
              <AvatarFallback className={`${departmentColor} text-white font-semibold`}>
                {data.avatar || data.label.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 truncate">
                {data.label}
              </h3>
              <p className="text-xs text-gray-600 truncate">
                {data.sublabel}
              </p>
              <Badge 
                variant="secondary" 
                className={`text-xs mt-1 ${departmentColor} text-white`}
              >
                {data.department}
              </Badge>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-1">
            {data.email && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Mail className="w-3 h-3" />
                <span className="truncate">{data.email}</span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Phone className="w-3 h-3" />
                <span>{data.phone}</span>
              </div>
            )}
            {data.employeeId && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <User className="w-3 h-3" />
                <span>ID: {data.employeeId}</span>
              </div>
            )}
          </div>

          {/* Level indicator */}
          <div className="mt-3 flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Level {data.level}
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < data.level ? departmentColor : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Output handle (for connections to subordinates) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#3b82f6',
          border: '2px solid #1e40af',
          width: 12,
          height: 12
        }}
      />
    </div>
  )
}

// Default export for ReactFlow
export default EmployeeNode