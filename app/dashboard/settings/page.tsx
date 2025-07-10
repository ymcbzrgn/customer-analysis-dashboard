"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { UserIcon, Bell, Shield, Database, Save, Upload, Eye, EyeOff, Plus, Edit, Trash2, Users, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { userApi, User } from "@/lib/user-api"

// Remove mock users - we'll use real data from PostgreSQL

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    company: "Analytics Corp",
    role: "Data Analyst",
    bio: "Experienced data analyst specializing in customer insights and automation.",
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    weeklyReports: true,
    systemUpdates: true,
  })

  const [preferences, setPreferences] = useState({
    timezone: "UTC-5",
    language: "en",
    theme: "light",
    autoAnalysis: true,
  })

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Viewer",
  })

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin'

  // Load current user and users from PostgreSQL
  useEffect(() => {
    loadCurrentUser()
    loadUsers()
  }, [])

  const loadCurrentUser = async () => {
    try {
      // First try to get current user from auth API
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setCurrentUser(data.user)
          // Update profile state with actual user data
          setProfile({
            name: data.user.name,
            email: data.user.email,
            company: "Analytics Corp", // Could be added to user profile later
            role: data.user.role,
            bio: "Experienced data analyst specializing in customer insights and automation.",
          })
          return
        }
      }
      
      // If /api/auth/me fails, simulate admin user for now
      // In production, this should properly handle authentication
      console.log('Auth me endpoint failed, using fallback admin user')
      const fallbackUser = { 
        id: '1', 
        name: 'Admin User', 
        email: 'admin@example.com', 
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setCurrentUser(fallbackUser)
      setProfile({
        name: fallbackUser.name,
        email: fallbackUser.email,
        company: "Analytics Corp",
        role: fallbackUser.role,
        bio: "Experienced data analyst specializing in customer insights and automation.",
      })
    } catch (error) {
      console.error('Failed to load current user:', error)
      // Use fallback instead of redirecting
      const fallbackUser = { 
        id: '1', 
        name: 'Admin User', 
        email: 'admin@example.com', 
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setCurrentUser(fallbackUser)
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      console.log('Loading users from API...')
      const response = await userApi.getUsers()
      console.log('Users API response:', response)
      
      if (response.success && response.data) {
        setUsers(response.data)
        console.log('Users loaded successfully:', response.data.length, 'users')
      } else {
        console.error('Failed to load users:', response.message)
        toast.error(response.message || 'Failed to load users')
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!currentUser) return
    
    try {
      setActionLoading(true)
      const response = await userApi.updateUser(currentUser.id, {
        name: profile.name,
        email: profile.email,
        // Note: role changes should be handled by admin only
        role: currentUser.role,
      })

      if (response.success) {
        toast.success("Profile updated successfully")
        // Reload current user to get updated data
        await loadCurrentUser()
      } else {
        toast.error(response.message || "Failed to update profile")
      }
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveNotifications = () => {
    // Save notifications logic here
    console.log("Notifications saved:", notifications)
  }

  const handleSavePreferences = () => {
    // Save preferences logic here
    console.log("Preferences saved:", preferences)
  }

  const handleAddUser = async () => {
    if (!isAdmin) {
      toast.error("Only administrators can add users")
      return
    }

    if (newUser.password !== newUser.confirmPassword) {
      toast.error("Passwords do not match!")
      return
    }

    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setActionLoading(true)
      console.log('Creating user with email:', newUser.email)
      
      const response = await userApi.createUser({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      })

      console.log('Create user response:', response)

      if (response.success) {
        toast.success("User created successfully")
        setNewUser({ name: "", email: "", password: "", confirmPassword: "", role: "Viewer" })
        setShowAddUser(false)
        await loadUsers() // Reload users
      } else {
        console.error('Failed to create user:', response.message)
        toast.error(response.message || "Failed to create user")
      }
    } catch (error) {
      console.error('Create user error:', error)
      toast.error("Failed to create user: " + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    // Users can only edit their own profile unless they're admin
    if (!isAdmin && currentUser?.id !== user.id) {
      toast.error("You can only edit your own profile")
      return
    }

    setShowAddUser(false) // Ensure add user dialog is closed
    setEditingUser(user)
    setNewUser({
      name: user.name || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
      role: user.role || "Viewer",
    })
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    if (newUser.password && newUser.password !== newUser.confirmPassword) {
      toast.error("Passwords do not match!")
      return
    }

    try {
      setActionLoading(true)
      
      // Update user details
      const response = await userApi.updateUser(editingUser.id, {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      })

      if (response.success) {
        // If password is provided, change it
        if (newUser.password) {
          const passwordResponse = await userApi.changePassword(editingUser.id, {
            newPassword: newUser.password,
          })
          
          if (!passwordResponse.success) {
            toast.error(passwordResponse.message || "Failed to change password")
            return
          }
        }

        toast.success("User updated successfully")
        setEditingUser(null)
        setNewUser({ name: "", email: "", password: "", confirmPassword: "", role: "Viewer" })
        await loadUsers() // Reload users
      } else {
        toast.error(response.message || "Failed to update user")
      }
    } catch (error) {
      toast.error("Failed to update user")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = (user: User) => {
    if (!isAdmin) {
      toast.error("Only administrators can delete users")
      return
    }

    if (currentUser?.id === user.id) {
      toast.error("You cannot delete your own account")
      return
    }

    setUserToDelete(user)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    try {
      setActionLoading(true)
      console.log('Deleting user:', userToDelete.email, 'ID:', userToDelete.id)
      
      const response = await userApi.deleteUser(userToDelete.id)
      console.log('Delete user response:', response)

      if (response.success) {
        toast.success("User deleted successfully")
        setUserToDelete(null)
        await loadUsers() // Reload users
        console.log('User deleted and list reloaded')
      } else {
        console.error('Failed to delete user:', response.message)
        toast.error(response.message || "Failed to delete user")
      }
    } catch (error) {
      console.error('Delete user error:', error)
      toast.error("Failed to delete user: " + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account settings and platform preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="mr-2 h-5 w-5 text-blue-600" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">JD</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name || ""}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email || ""}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profile.company || ""}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={profile.role || ""}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={profile.bio || ""}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleSaveProfile} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-blue-600" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to be notified about updates and activities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Alerts</Label>
                    <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
                  </div>
                  <Switch
                    checked={notifications.emailAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Get push notifications in your browser</p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Weekly Reports</Label>
                    <p className="text-sm text-gray-500">Receive weekly summary reports via email</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">System Updates</Label>
                    <p className="text-sm text-gray-500">Get notified about system maintenance and updates</p>
                  </div>
                  <Switch
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, systemUpdates: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications} className="bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" />
                Save Notifications
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Platform Preferences */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5 text-blue-600" />
                Platform Preferences
              </CardTitle>
              <CardDescription>Customize your platform experience and analysis settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={preferences.timezone || "UTC-5"}
                  onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                    <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                    <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="UTC+0">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={preferences.language || "en"}
                  onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={preferences.theme || "light"}
                  onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Auto Analysis</Label>
                  <p className="text-xs text-gray-500">Automatically analyze new leads</p>
                </div>
                <Switch
                  checked={preferences.autoAnalysis}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, autoAnalysis: checked })}
                />
              </div>

              <Button onClick={handleSavePreferences} className="w-full bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-blue-600" />
                Security
              </CardTitle>
              <CardDescription>Manage your account security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full bg-transparent">
                Change Password
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                Enable Two-Factor Auth
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                Download Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-600" />
                User Management
              </CardTitle>
              <CardDescription>
                {isAdmin ? "Manage system users and their permissions." : "View system users (limited access)."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add User Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">System Users</h3>
                {isAdmin && (
                  <Button onClick={() => setShowAddUser(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New User
                  </Button>
                )}
              </div>

              {/* Users Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Loading users...</p>
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-sm text-gray-500">No users found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                user.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }
                            >
                              {user.is_active ? "active" : "inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {user.last_login 
                              ? new Date(user.last_login).toLocaleDateString()
                              : "Never"
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditUser(user)}
                                disabled={actionLoading || (!isAdmin && currentUser?.id !== user.id)}
                                className="bg-transparent"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              {isAdmin && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteUser(user)}
                                  disabled={actionLoading}
                                  className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit User Dialog */}
        <Dialog
          open={showAddUser || !!editingUser}
          onOpenChange={() => {
            setShowAddUser(false)
            setEditingUser(null)
            setNewUser({ name: "", email: "", password: "", confirmPassword: "", role: "Viewer" })
            setShowPassword(false)
            setShowConfirmPassword(false)
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Update user information and permissions."
                  : "Create a new user account with access to the system."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Full Name</Label>
                <Input
                  id="userName"
                  value={newUser.name || ""}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userEmail">Email Address</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={newUser.email || ""}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userRole">Role</Label>
                <Select 
                  value={newUser.role || "Viewer"} 
                  onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                  disabled={!isAdmin && editingUser && currentUser?.id === editingUser.id}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Analyst">Analyst</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                {!isAdmin && editingUser && currentUser?.id === editingUser.id && (
                  <p className="text-xs text-gray-500">You cannot change your own role</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="userPassword">
                  {editingUser ? "New Password (leave empty to keep current)" : "Password"}
                </Label>
                <div className="relative">
                  <Input
                    id="userPassword"
                    type={showPassword ? "text" : "password"}
                    value={newUser.password || ""}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder={editingUser ? "Enter new password" : "Enter password"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={newUser.confirmPassword || ""}
                    onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddUser(false)
                  setEditingUser(null)
                  setNewUser({ name: "", email: "", password: "", confirmPassword: "", role: "Viewer" })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!newUser.name || !newUser.email || (!editingUser && !newUser.password) || actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingUser ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  editingUser ? "Update User" : "Add User"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Confirmation Modal */}
        <Dialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      This will permanently delete:
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>User account: {userToDelete?.email}</li>
                        <li>All associated permissions</li>
                        <li>Access to the system</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUserToDelete(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteUser}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete User"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
