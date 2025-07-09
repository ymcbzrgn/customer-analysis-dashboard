"use client"

import { useState } from "react"
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
  description?: string
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    countryCode: "US",
    industry: "Technology",
    score: 89,
    socialMedia: {
      linkedin: "https://linkedin.com/in/sarahjohnson",
      twitter: "https://twitter.com/sarahj",
      facebook: "https://facebook.com/sarah.johnson",
    },
    website: "https://techcorp.com",
    createdDate: "2024-01-15",
    status: "pending",
    notes: "High potential lead from tech conference",
    description:
      "Senior Software Engineer with 8+ years of experience in full-stack development. Specializes in React, Node.js, and cloud technologies. Active in tech communities and open source projects.",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@financeplus.com",
    countryCode: "CA",
    industry: "Finance",
    score: 92,
    socialMedia: {
      linkedin: "https://linkedin.com/in/michaelchen",
      twitter: "https://twitter.com/mchen_finance",
    },
    website: "https://financeplus.com",
    createdDate: "2024-01-14",
    status: "approved",
    notes: "Excellent financial background",
    description:
      "Financial Analyst with expertise in investment strategies and risk management. CFA certified with strong analytical skills and proven track record in portfolio management.",
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    email: "emma.r@healthsolutions.com",
    countryCode: "MX",
    industry: "Healthcare",
    score: 76,
    socialMedia: {
      linkedin: "https://linkedin.com/in/emmarodriguez",
      instagram: "https://instagram.com/emma_health",
    },
    website: "https://healthsolutions.com",
    createdDate: "2024-01-13",
    status: "pending",
    notes: "Healthcare industry expertise",
    description:
      "Healthcare Technology Specialist focused on digital health solutions and patient care optimization. Experience in telemedicine platforms and healthcare data analytics.",
  },
  {
    id: "4",
    name: "Alex Thompson",
    email: "alex@retailworld.com",
    countryCode: "UK",
    industry: "Retail",
    score: 34,
    socialMedia: {
      facebook: "https://facebook.com/alex.thompson.retail",
    },
    website: "https://retailworld.com",
    createdDate: "2024-01-12",
    status: "rejected",
    notes: "Low engagement score",
    description:
      "Retail Operations Manager with focus on supply chain optimization and customer experience. Working on digital transformation initiatives in traditional retail.",
  },
]

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [searchTerm, setSearchTerm] = useState("")
  const [industryFilter, setIndustryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [scoreRange, setScoreRange] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [comment, setComment] = useState("")
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<Customer | null>(null)

  const filteredCustomers = customers.filter((customer) => {
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

  const handleStatusChange = (customerId: string, newStatus: "approved" | "rejected") => {
    setCustomers((prev) =>
      prev.map((customer) => (customer.id === customerId ? { ...customer, status: newStatus } : customer)),
    )
  }

  const handleAddComment = (customerId: string, newComment: string) => {
    setCustomers((prev) =>
      prev.map((customer) => (customer.id === customerId ? { ...customer, notes: newComment } : customer)),
    )
    setComment("")
    setSelectedCustomer(null)
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
            <Button variant="outline" className="w-full bg-transparent">
              <Filter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Customer List ({filteredCustomers.length})</CardTitle>
          <CardDescription>Detailed view of all customer leads and their analysis results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
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
                          onClick={() => handleStatusChange(customer.id, "approved")}
                          disabled={customer.status === "approved"}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                          onClick={() => handleStatusChange(customer.id, "rejected")}
                          disabled={customer.status === "rejected"}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                              onClick={() => {
                                setSelectedCustomer(customer)
                                setComment(customer.notes)
                              }}
                            >
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Comment</DialogTitle>
                              <DialogDescription>Add or update notes for {customer.name}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Enter your comments..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => selectedCustomer && handleAddComment(selectedCustomer.id, comment)}
                              >
                                Save Comment
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomerDetail} onOpenChange={() => setSelectedCustomerDetail(null)}>
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

              {/* Notes */}
              {selectedCustomerDetail.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedCustomerDetail.notes}</p>
                  </div>
                </div>
              )}

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
                }
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => {
                if (selectedCustomerDetail) {
                  setSelectedCustomer(selectedCustomerDetail)
                  setComment(selectedCustomerDetail.notes)
                  setSelectedCustomerDetail(null)
                }
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
