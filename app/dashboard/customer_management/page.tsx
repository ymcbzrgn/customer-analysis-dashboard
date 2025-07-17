"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Edit, Building, Search } from "lucide-react"

interface Industry {
  id: string
  name: string
  customer_count: number
}


export default function DataManagementPage() {
  const [industries, setIndustries] = useState<Industry[]>([])
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [loading, setLoading] = useState(true)

  const [showAddIndustry, setShowAddIndustry] = useState(false)
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null)

  const [industrySearch, setIndustrySearch] = useState("")

  const [newIndustry, setNewIndustry] = useState({
    name: "",
  })

  // Fetch industries from database
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await fetch('/api/industries')
        const data = await response.json()
        if (data.success) {
          setIndustries(data.industries)
          setTotalCustomers(data.totalCustomers || 0)
        }
      } catch (error) {
        console.error('Failed to fetch industries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIndustries()
  }, [])

  // Industry Functions
  const handleAddIndustry = async () => {
    try {
      const response = await fetch('/api/industries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newIndustry.name })
      })
      
      const data = await response.json()
      if (data.success) {
        setIndustries([...industries, data.industry])
        setNewIndustry({ name: "" })
        setShowAddIndustry(false)
      } else {
        alert('Failed to add industry: ' + data.message)
      }
    } catch (error) {
      console.error('Error adding industry:', error)
      alert('Failed to add industry')
    }
  }

  const handleEditIndustry = (industry: Industry) => {
    setEditingIndustry(industry)
    setNewIndustry({
      name: industry.name,
    })
  }

  const handleUpdateIndustry = async () => {
    if (!editingIndustry) return

    try {
      const response = await fetch('/api/industries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingIndustry.id, name: newIndustry.name })
      })
      
      const data = await response.json()
      if (data.success) {
        setIndustries(
          industries.map((industry) =>
            industry.id === editingIndustry.id
              ? { ...industry, name: newIndustry.name }
              : industry,
          ),
        )
        setEditingIndustry(null)
        setNewIndustry({ name: "" })
      } else {
        alert('Failed to update industry: ' + data.message)
      }
    } catch (error) {
      console.error('Error updating industry:', error)
      alert('Failed to update industry')
    }
  }


  // Filter Functions
  const filteredIndustries = industries.filter((industry) =>
    industry.name.toLowerCase().includes(industrySearch.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 flex justify-center items-center min-h-64">
        <div className="text-lg">Loading industries...</div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Industry Management</h1>
        <p className="mt-1 text-sm text-gray-500">Manage industry categories used for customer classification throughout the system.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Industries</p>
                <p className="text-2xl font-bold text-gray-900">{industries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full">
        {/* Industries Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5 text-blue-600" />
                  Industries
                </CardTitle>
                <CardDescription>Manage industry categories for customer classification</CardDescription>
              </div>
              <Button onClick={() => setShowAddIndustry(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Industry
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search industries..."
                  value={industrySearch}
                  onChange={(e) => setIndustrySearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Industries Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Customers</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIndustries.map((industry) => (
                      <TableRow key={industry.id}>
                        <TableCell>
                          <div className="font-medium text-gray-900">{industry.name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{industry.customer_count}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditIndustry(industry)}
                              className="bg-transparent"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Industry Dialog */}
      <Dialog
        open={showAddIndustry || !!editingIndustry}
        onOpenChange={() => {
          setShowAddIndustry(false)
          setEditingIndustry(null)
          setNewIndustry({ name: "" })
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIndustry ? "Edit Industry" : "Add New Industry"}</DialogTitle>
            <DialogDescription>
              {editingIndustry ? "Update industry information." : "Add a new industry category to the system."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="industryName">Industry Name</Label>
              <Input
                id="industryName"
                placeholder="e.g., Technology"
                value={newIndustry.name}
                onChange={(e) => setNewIndustry({ ...newIndustry, name: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddIndustry(false)
                setEditingIndustry(null)
                setNewIndustry({ name: "" })
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingIndustry ? handleUpdateIndustry : handleAddIndustry}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!newIndustry.name}
            >
              {editingIndustry ? "Update" : "Add"} Industry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}