'use client'

import { useState } from 'react'
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
  Shield,
  Plus,
  X,
  Search,
  UserPlus
} from 'lucide-react'

// Permission levels
type PermissionLevel = 'owner' | 'admin' | 'editor' | 'viewer'

// User permission interface
interface UserPermission {
  userId: string
  userEmail: string
  userName: string
  permission: PermissionLevel
  grantedBy: string
  grantedAt: string
}

// Chart permissions interface
interface ChartPermissionsProps {
  open: boolean
  onClose: () => void
  chartId: string
  chartName: string
  currentPermissions: UserPermission[]
  onSave: (permissions: UserPermission[]) => void
}

export default function ChartPermissions({ 
  open, 
  onClose, 
  chartId, 
  chartName, 
  currentPermissions, 
  onSave 
}: ChartPermissionsProps) {
  const [permissions, setPermissions] = useState<UserPermission[]>(currentPermissions)
  const [searchEmail, setSearchEmail] = useState('')
  const [selectedPermission, setSelectedPermission] = useState<PermissionLevel>('viewer')
  const [loading, setLoading] = useState(false)

  // Mock users data - in real app this would come from API
  const availableUsers = [
    { id: '1', email: 'john.doe@company.com', name: 'John Doe' },
    { id: '2', email: 'jane.smith@company.com', name: 'Jane Smith' },
    { id: '3', email: 'mike.johnson@company.com', name: 'Mike Johnson' },
    { id: '4', email: 'sarah.wilson@company.com', name: 'Sarah Wilson' },
    { id: '5', email: 'david.brown@company.com', name: 'David Brown' }
  ]

  const getPermissionIcon = (permission: PermissionLevel) => {
    switch (permission) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-600" />
      case 'admin': return <Shield className="h-4 w-4 text-red-600" />
      case 'editor': return <Edit className="h-4 w-4 text-green-600" />
      case 'viewer': return <Eye className="h-4 w-4 text-gray-600" />
    }
  }

  const getPermissionColor = (permission: PermissionLevel) => {
    switch (permission) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'admin': return 'bg-red-100 text-red-800 border-red-300'
      case 'editor': return 'bg-green-100 text-green-800 border-green-300'
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPermissionDescription = (permission: PermissionLevel) => {
    switch (permission) {
      case 'owner': return 'Full control including deletion and permission management'
      case 'admin': return 'Can edit chart and manage user permissions'
      case 'editor': return 'Can view and edit chart content'
      case 'viewer': return 'Can only view the chart'
    }
  }

  // Add user permission
  const handleAddPermission = () => {
    if (!searchEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    // Check if user already has permission
    const existingPermission = permissions.find(p => p.userEmail === searchEmail)
    if (existingPermission) {
      toast.error('User already has permission for this chart')
      return
    }

    // Find user in available users
    const user = availableUsers.find(u => u.email.toLowerCase() === searchEmail.toLowerCase())
    if (!user) {
      toast.error('User not found in the system')
      return
    }

    const newPermission: UserPermission = {
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      permission: selectedPermission,
      grantedBy: 'current-user', // In real app, this would be the current user ID
      grantedAt: new Date().toISOString()
    }

    setPermissions(prev => [...prev, newPermission])
    setSearchEmail('')
    toast.success(`Added ${selectedPermission} permission for ${user.name}`)
  }

  // Update permission level
  const handleUpdatePermission = (userId: string, newPermission: PermissionLevel) => {
    setPermissions(prev => prev.map(p => 
      p.userId === userId ? { ...p, permission: newPermission } : p
    ))
    toast.success('Permission updated')
  }

  // Remove permission
  const handleRemovePermission = (userId: string) => {
    const permission = permissions.find(p => p.userId === userId)
    if (permission?.permission === 'owner') {
      toast.error('Cannot remove owner permission')
      return
    }

    setPermissions(prev => prev.filter(p => p.userId !== userId))
    toast.success('Permission removed')
  }

  // Save permissions
  const handleSave = async () => {
    setLoading(true)
    try {
      // Validate that there's at least one owner
      const owners = permissions.filter(p => p.permission === 'owner')
      if (owners.length === 0) {
        toast.error('Chart must have at least one owner')
        return
      }

      onSave(permissions)
      toast.success('Permissions updated successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to update permissions')
    } finally {
      setLoading(false)
    }
  }

  // Filter available users for search
  const filteredUsers = availableUsers.filter(user =>
    user.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
    user.name.toLowerCase().includes(searchEmail.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Chart Permissions - {chartName}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Manage who can view and edit this organizational chart
          </p>
        </DialogHeader>

        <div className="flex flex-col h-full space-y-6">
          {/* Add New Permission */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add User Permission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="email-search">User Email</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email-search"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      placeholder="Enter email address..."
                      className="pl-10"
                      list="users-datalist"
                    />
                    <datalist id="users-datalist">
                      {filteredUsers.map(user => (
                        <option key={user.id} value={user.email}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>
                
                <div className="w-40">
                  <Label htmlFor="permission-level">Permission Level</Label>
                  <Select value={selectedPermission} onValueChange={(value) => setSelectedPermission(value as PermissionLevel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-600" />
                          Viewer
                        </div>
                      </SelectItem>
                      <SelectItem value="editor">
                        <div className="flex items-center gap-2">
                          <Edit className="h-4 w-4 text-green-600" />
                          Editor
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-red-600" />
                          Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button onClick={handleAddPermission}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
              
              {selectedPermission && (
                <p className="text-sm text-gray-600 mt-2">
                  {getPermissionDescription(selectedPermission)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Current Permissions */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Current Permissions ({permissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {permissions.map((permission) => (
                  <div key={permission.userId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{permission.userName}</div>
                        <div className="text-sm text-gray-600">{permission.userEmail}</div>
                        <div className="text-xs text-gray-500">
                          Added {new Date(permission.grantedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select 
                        value={permission.permission} 
                        onValueChange={(value) => handleUpdatePermission(permission.userId, value as PermissionLevel)}
                        disabled={permission.permission === 'owner'}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Badge className={`${getPermissionColor(permission.permission)} border`}>
                        <div className="flex items-center gap-1">
                          {getPermissionIcon(permission.permission)}
                          {permission.permission}
                        </div>
                      </Badge>
                      
                      {permission.permission !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePermission(permission.userId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {permissions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No permissions set</p>
                    <p className="text-sm">Add users to share this chart</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Permissions'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}