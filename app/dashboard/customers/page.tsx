"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Search,
  Filter,
  Check,
  X,
  MessageSquare,
  Calendar,
  MapPin,
  Building,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  countryCode: string
  industry: string
  score: number
  socialMedia: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
  website?: string
  createdDate: string
  status: "pending" | "approved" | "rejected"
  notes: string
  comment?: string
  description?: string
}

export default function CustomersPage() {
  const { token } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [industryFilter, setIndustryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [scoreRange, setScoreRange] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [comment, setComment] = useState("")
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<Customer | null>(null)
  const [detailModalComment, setDetailModalComment] = useState("")
  const [isEditingComment, setIsEditingComment] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(10)
  
  // Sorting states
  const [sortColumn, setSortColumn] = useState<keyof Customer | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedCustomerForAction, setSelectedCustomerForAction] = useState<Customer | null>(null)
  const [approveComment, setApproveComment] = useState("")
  const [rejectComment, setRejectComment] = useState("")
  const [rejectCommentError, setRejectCommentError] = useState("")

  // Load customers from API on component mount
  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Using admin user ID for now - in production this should come from auth context
      const response = await fetch('/api/customers?userId=1')
      const data = await response.json()
      
      if (data.success) {
        // Transform PostgreSQL data to match UI interface
        const transformedCustomers = data.customers.map((customer: any) => ({
          id: customer.id.toString(),
          name: customer.name,
          email: customer.contact_email || 'No email provided',
          countryCode: customer.country_code || 'N/A',
          industry: customer.industry || 'Unknown',
          score: customer.compatibility_score || 0,
          socialMedia: {
            linkedin: customer.linkedin,
            twitter: customer.twitter,
            facebook: customer.facebook,
            instagram: customer.instagram,
          },
          website: customer.website,
          createdDate: customer.created_at || customer.updated_at || new Date().toISOString(),
          status: customer.status || "pending" as const,
          notes: customer.notes || '',
          comment: customer.comment || '',
          description: customer.description || '',
        }))
        setCustomers(transformedCustomers)
      } else {
        setError(data.message || 'Failed to load customers')
      }
    } catch (err) {
      console.error('Error loading customers:', err)
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (column: keyof Customer) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (column: keyof Customer) => {
    if (sortColumn !== column) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-gray-600" /> : 
      <ChevronDown className="h-4 w-4 text-gray-600" />
  }

  const sortedAndFilteredCustomers = customers
    .filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesIndustry = industryFilter === "all" || customer.industry === industryFilter
      const matchesStatus = statusFilter === "all" || customer.status === statusFilter
      const matchesScore =
        scoreRange === "all" ||
        (scoreRange === "high" && customer.score >= 80) ||
        (scoreRange === "medium" && customer.score >= 50 && customer.score < 80) ||
        (scoreRange === "low" && customer.score < 50)

      return matchesSearch && matchesIndustry && matchesStatus && matchesScore
    })
    .sort((a, b) => {
      if (!sortColumn) return 0
      
      let aValue = a[sortColumn]
      let bValue = b[sortColumn]
      
      // Handle different data types for sorting
      if (sortColumn === 'score') {
        // Numeric sorting
        aValue = Number(aValue)
        bValue = Number(bValue)
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      } else if (sortColumn === 'createdDate') {
        // Date sorting
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      } else {
        // String sorting (alphabetical)
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      }
    })

  // Pagination calculations
  const totalRecords = sortedAndFilteredCustomers.length
  const totalPages = Math.ceil(totalRecords / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage
  const endIndex = startIndex + recordsPerPage
  const currentCustomers = sortedAndFilteredCustomers.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, industryFilter, statusFilter, scoreRange])

  const handleStatusChange = async (customerId: string, newStatus: "approved" | "rejected", comment?: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: newStatus,
          comment: comment || `Status changed to ${newStatus} by user`
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setCustomers((prev) =>
          prev.map((customer) => (customer.id === customerId ? { ...customer, status: newStatus } : customer)),
        )
      } else {
        console.error('Failed to update customer status:', data.message)
        setError(data.message || 'Failed to update customer status')
      }
    } catch (err) {
      console.error('Error updating customer status:', err)
      setError('Failed to update customer status')
    }
  }

  const handleApprove = async () => {
    if (!selectedCustomerForAction) return
    
    await handleStatusChange(selectedCustomerForAction.id, "approved", approveComment)
    setApproveModalOpen(false)
    setSelectedCustomerForAction(null)
    setApproveComment("")
  }

  const handleReject = async () => {
    if (!selectedCustomerForAction) return
    
    // Validate required comment
    if (!rejectComment.trim()) {
      setRejectCommentError("Comment is required for rejection")
      return
    }
    
    setRejectCommentError("")
    await handleStatusChange(selectedCustomerForAction.id, "rejected", rejectComment)
    setRejectModalOpen(false)
    setSelectedCustomerForAction(null)
    setRejectComment("")
  }

  const handleAddComment = async (customerId: string, newComment: string) => {
    try {
      // Get current customer to preserve status
      const currentCustomer = customers.find(c => c.id === customerId)
      const currentStatus = currentCustomer?.status || 'pending'
      
      const response = await fetch(`/api/customers/${customerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: currentStatus,
          comment: newComment
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setCustomers((prev) =>
          prev.map((customer) => (customer.id === customerId ? { ...customer, notes: newComment } : customer)),
        )
        setComment("")
        setSelectedCustomer(null)
      } else {
        console.error('Failed to update customer notes:', data.message)
        setError(data.message || 'Failed to update customer notes')
      }
    } catch (err) {
      console.error('Error updating customer notes:', err)
      setError('Failed to update customer notes')
    }
  }

  const handleDetailModalCommentUpdate = async (customerId: string, newComment: string) => {
    try {
      // Get current customer to preserve status
      const currentCustomer = customers.find(c => c.id === customerId)
      const currentStatus = currentCustomer?.status || 'pending'
      
      const response = await fetch(`/api/customers/${customerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: currentStatus,
          comment: newComment
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setCustomers((prev) =>
          prev.map((customer) => (customer.id === customerId ? { ...customer, notes: newComment } : customer)),
        )
        
        // Update the detail modal state
        if (selectedCustomerDetail && selectedCustomerDetail.id === customerId) {
          setSelectedCustomerDetail({ ...selectedCustomerDetail, notes: newComment })
        }
        
        setIsEditingComment(false)
        setDetailModalComment("")
      } else {
        console.error('Failed to update customer notes:', data.message)
        setError(data.message || 'Failed to update customer notes')
      }
    } catch (err) {
      console.error('Error updating customer notes:', err)
      setError('Failed to update customer notes')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800"
    if (score >= 50) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const renderSocialMediaIcons = (socialMedia: Customer["socialMedia"]) => {
    return (
      <div className="flex items-center space-x-2">
        {socialMedia.linkedin && (
          <a
            href={socialMedia.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        )}
        {socialMedia.twitter && (
          <a
            href={socialMedia.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-600 transition-colors"
          >
            <Twitter className="h-4 w-4" />
          </a>
        )}
        {socialMedia.facebook && (
          <a
            href={socialMedia.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:text-blue-900 transition-colors"
          >
            <Facebook className="h-4 w-4" />
          </a>
        )}
        {socialMedia.instagram && (
          <a
            href={socialMedia.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 hover:text-pink-800 transition-colors"
          >
            <Instagram className="h-4 w-4" />
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Customer Analysis</h1>
        <p className="mt-1 text-sm text-gray-500">Manage and analyze your customer leads with detailed insights.</p>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={scoreRange} onValueChange={setScoreRange}>
              <SelectTrigger>
                <SelectValue placeholder="Score Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">High (80-100)</SelectItem>
                <SelectItem value="medium">Medium (50-79)</SelectItem>
                <SelectItem value="low">Low (0-49)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => {
              setSearchTerm("")
              setIndustryFilter("all")
              setStatusFilter("all")
              setScoreRange("all")
            }}>
              <Filter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Customer List 
          </CardTitle>
          <CardDescription>Detailed view of all customer leads and their analysis results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Customer</span>
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('industry')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Industry</span>
                      {getSortIcon('industry')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('countryCode')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Location</span>
                      {getSortIcon('countryCode')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('score')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Score</span>
                      {getSortIcon('score')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('createdDate')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Created</span>
                      {getSortIcon('createdDate')}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading customers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-red-600">{error}</div>
                      <Button onClick={loadCustomers} className="mt-2">
                        Try Again
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : sortedAndFilteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-gray-500">No customers found</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setSelectedCustomerDetail(customer)}>
                            <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {customer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="cursor-pointer" onClick={() => setSelectedCustomerDetail(customer)}>
                            <div className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                            <div className="flex items-center space-x-3 mt-2">
                              {renderSocialMediaIcons(customer.socialMedia)}
                              {customer.website && (
                                <a
                                  href={customer.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-600 hover:text-gray-800 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Globe className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-gray-400 mr-2" />
                          {customer.industry}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          {customer.countryCode}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getScoreColor(customer.score)}>{customer.score}/100</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(customer.status)}>
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(customer.createdDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                            onClick={() => {
                              setSelectedCustomerForAction(customer)
                              setApproveModalOpen(true)
                            }}
                            disabled={customer.status === "approved"}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                            onClick={() => {
                              setSelectedCustomerForAction(customer)
                              setRejectModalOpen(true)
                            }}
                            disabled={customer.status === "rejected"}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalRecords > recordsPerPage && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, totalRecords)}</span> of <span className="font-medium">{totalRecords}</span> entries
              </div>
              <div className="flex items-center space-x-1">
                {/* First page button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                
                {/* Previous page button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page numbers - show only first 5 pages */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[36px] px-3 py-1.5 text-sm"
                    >
                      {page}
                    </Button>
                  ))}
                  
                  {/* Show ellipsis if there are more than 5 pages */}
                  {totalPages > 5 && (
                    <span className="px-2 py-1.5 text-sm text-gray-500">...</span>
                  )}
                  
                  {/* Show last page number if it's not already shown */}
                  {totalPages > 5 && (
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="min-w-[36px] px-3 py-1.5 text-sm"
                    >
                      {totalPages}
                    </Button>
                  )}
                </div>
                
                {/* Next page button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                {/* Last page button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Approve Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {selectedCustomerForAction?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approve-comment">Comment (Optional)</Label>
              <Textarea
                id="approve-comment"
                placeholder="Add an optional comment..."
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setApproveModalOpen(false)
              setSelectedCustomerForAction(null)
              setApproveComment("")
            }}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject {selectedCustomerForAction?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-comment">Comment (Required) <span className="text-red-500">*</span></Label>
              <Textarea
                id="reject-comment"
                placeholder="Please provide a reason for rejection..."
                value={rejectComment}
                onChange={(e) => {
                  setRejectComment(e.target.value)
                  if (rejectCommentError) setRejectCommentError("")
                }}
                rows={3}
                className={rejectCommentError ? "border-red-500" : ""}
              />
              {rejectCommentError && (
                <p className="text-red-500 text-sm mt-1">{rejectCommentError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectModalOpen(false)
              setSelectedCustomerForAction(null)
              setRejectComment("")
              setRejectCommentError("")
            }}>
              Cancel
            </Button>
            <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700">
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomerDetail} onOpenChange={() => {
        setSelectedCustomerDetail(null)
        setIsEditingComment(false)
        setDetailModalComment("")
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`/placeholder.svg?height=48&width=48`} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                  {selectedCustomerDetail?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{selectedCustomerDetail?.name}</h3>
                <p className="text-sm text-gray-500">{selectedCustomerDetail?.email}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedCustomerDetail && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Industry</Label>
                  <div className="flex items-center mt-1">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm">{selectedCustomerDetail.industry}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Location</Label>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm">{selectedCustomerDetail.countryCode}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Score</Label>
                  <div className="mt-1">
                    <Badge className={getScoreColor(selectedCustomerDetail.score)}>
                      {selectedCustomerDetail.score}/100
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedCustomerDetail.status)}>
                      {selectedCustomerDetail.status.charAt(0).toUpperCase() + selectedCustomerDetail.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedCustomerDetail.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Description</Label>
                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">{selectedCustomerDetail.description}</p>
                </div>
              )}

              {/* Social Media & Website */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Online Presence</Label>
                <div className="mt-2 flex items-center space-x-4">
                  {selectedCustomerDetail.socialMedia.linkedin && (
                    <a
                      href={selectedCustomerDetail.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span className="text-sm">LinkedIn</span>
                    </a>
                  )}
                  {selectedCustomerDetail.socialMedia.twitter && (
                    <a
                      href={selectedCustomerDetail.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-400 hover:text-blue-600 transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                      <span className="text-sm">Twitter</span>
                    </a>
                  )}
                  {selectedCustomerDetail.socialMedia.facebook && (
                    <a
                      href={selectedCustomerDetail.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-700 hover:text-blue-900 transition-colors"
                    >
                      <Facebook className="h-5 w-5" />
                      <span className="text-sm">Facebook</span>
                    </a>
                  )}
                  {selectedCustomerDetail.socialMedia.instagram && (
                    <a
                      href={selectedCustomerDetail.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-pink-600 hover:text-pink-800 transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                      <span className="text-sm">Instagram</span>
                    </a>
                  )}
                  {selectedCustomerDetail.website && (
                    <a
                      href={selectedCustomerDetail.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Globe className="h-5 w-5" />
                      <span className="text-sm">Website</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Comment</Label>
                {selectedCustomerDetail.comment ? (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedCustomerDetail.comment}</p>
                  </div>
                ) : (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 italic">No comment available</p>
                  </div>
                )}
              </div>

              {/* Mail */}
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-600">Mail</Label>
                  {!isEditingComment && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingComment(true)
                        setDetailModalComment('')
                      }}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Add Mail
                    </Button>
                  )}
                </div>
                
                {isEditingComment ? (
                  <div className="mt-2 space-y-3">
                    <Textarea
                      placeholder="Enter mail information..."
                      value={detailModalComment || ""}
                      onChange={(e) => setDetailModalComment(e.target.value)}
                      rows={4}
                      className="w-full"
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (selectedCustomerDetail) {
                            handleDetailModalCommentUpdate(selectedCustomerDetail.id, detailModalComment)
                          }
                        }}
                      >
                        Save Mail
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingComment(false)
                          setDetailModalComment("")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 italic">No mail information added yet</p>
                  </div>
                )}
              </div>

              {/* Created Date */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Created Date</Label>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">{new Date(selectedCustomerDetail.createdDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
              onClick={() => {
                if (selectedCustomerDetail) {
                  handleStatusChange(selectedCustomerDetail.id, "approved")
                  setSelectedCustomerDetail(null)
                  setIsEditingComment(false)
                  setDetailModalComment("")
                }
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              onClick={() => {
                if (selectedCustomerDetail) {
                  handleStatusChange(selectedCustomerDetail.id, "rejected")
                  setSelectedCustomerDetail(null)
                  setIsEditingComment(false)
                  setDetailModalComment("")
                }
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}