"use client"

import { useState } from "react"
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
import { Plus, Edit, Trash2, Building, Globe, Search } from "lucide-react"

interface Industry {
  id: string
  name: string
  description?: string
  createdDate: string
  customerCount: number
}

interface CountryCode {
  id: string
  code: string
  name: string
  region: string
  createdDate: string
  customerCount: number
}

const mockIndustries: Industry[] = [
  {
    id: "1",
    name: "Technology",
    description: "Software, hardware, and IT services companies",
    createdDate: "2024-01-01",
    customerCount: 145,
  },
  {
    id: "2",
    name: "Finance",
    description: "Banking, insurance, and financial services",
    createdDate: "2024-01-01",
    customerCount: 89,
  },
  {
    id: "3",
    name: "Healthcare",
    description: "Medical, pharmaceutical, and health services",
    createdDate: "2024-01-01",
    customerCount: 67,
  },
  {
    id: "4",
    name: "Retail",
    description: "E-commerce, retail stores, and consumer goods",
    createdDate: "2024-01-01",
    customerCount: 123,
  },
  {
    id: "5",
    name: "Manufacturing",
    description: "Industrial production and manufacturing companies",
    createdDate: "2024-01-05",
    customerCount: 45,
  },
]

const mockCountryCodes: CountryCode[] = [
  {
    id: "1",
    code: "US",
    name: "United States",
    region: "North America",
    createdDate: "2024-01-01",
    customerCount: 234,
  },
  {
    id: "2",
    code: "CA",
    name: "Canada",
    region: "North America",
    createdDate: "2024-01-01",
    customerCount: 89,
  },
  {
    id: "3",
    code: "UK",
    name: "United Kingdom",
    region: "Europe",
    createdDate: "2024-01-01",
    customerCount: 156,
  },
  {
    id: "4",
    code: "DE",
    name: "Germany",
    region: "Europe",
    createdDate: "2024-01-01",
    customerCount: 78,
  },
  {
    id: "5",
    code: "FR",
    name: "France",
    region: "Europe",
    createdDate: "2024-01-02",
    customerCount: 92,
  },
  {
    id: "6",
    code: "JP",
    name: "Japan",
    region: "Asia",
    createdDate: "2024-01-03",
    customerCount: 67,
  },
  {
    id: "7",
    code: "AU",
    name: "Australia",
    region: "Oceania",
    createdDate: "2024-01-04",
    customerCount: 43,
  },
  {
    id: "8",
    code: "MX",
    name: "Mexico",
    region: "North America",
    createdDate: "2024-01-05",
    customerCount: 29,
  },
]

export default function DataManagementPage() {
  const [industries, setIndustries] = useState<Industry[]>(mockIndustries)
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>(mockCountryCodes)

  const [showAddIndustry, setShowAddIndustry] = useState(false)
  const [showAddCountry, setShowAddCountry] = useState(false)
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null)
  const [editingCountry, setEditingCountry] = useState<CountryCode | null>(null)

  const [industrySearch, setIndustrySearch] = useState("")
  const [countrySearch, setCountrySearch] = useState("")

  const [newIndustry, setNewIndustry] = useState({
    name: "",
    description: "",
  })

  const [newCountry, setNewCountry] = useState({
    code: "",
    name: "",
    region: "",
  })

  // Industry Functions
  const handleAddIndustry = () => {
    const industry: Industry = {
      id: Date.now().toString(),
      name: newIndustry.name,
      description: newIndustry.description,
      createdDate: new Date().toISOString().split("T")[0],
      customerCount: 0,
    }

    setIndustries([...industries, industry])
    setNewIndustry({ name: "", description: "" })
    setShowAddIndustry(false)
  }

  const handleEditIndustry = (industry: Industry) => {
    setEditingIndustry(industry)
    setNewIndustry({
      name: industry.name,
      description: industry.description || "",
    })
  }

  const handleUpdateIndustry = () => {
    if (!editingIndustry) return

    setIndustries(
      industries.map((industry) =>
        industry.id === editingIndustry.id
          ? { ...industry, name: newIndustry.name, description: newIndustry.description }
          : industry,
      ),
    )

    setEditingIndustry(null)
    setNewIndustry({ name: "", description: "" })
  }

  const handleDeleteIndustry = (industryId: string) => {
    if (confirm("Are you sure you want to delete this industry?")) {
      setIndustries(industries.filter((industry) => industry.id !== industryId))
    }
  }

  // Country Functions
  const handleAddCountry = () => {
    const country: CountryCode = {
      id: Date.now().toString(),
      code: newCountry.code.toUpperCase(),
      name: newCountry.name,
      region: newCountry.region,
      createdDate: new Date().toISOString().split("T")[0],
      customerCount: 0,
    }

    setCountryCodes([...countryCodes, country])
    setNewCountry({ code: "", name: "", region: "" })
    setShowAddCountry(false)
  }

  const handleEditCountry = (country: CountryCode) => {
    setEditingCountry(country)
    setNewCountry({
      code: country.code,
      name: country.name,
      region: country.region,
    })
  }

  const handleUpdateCountry = () => {
    if (!editingCountry) return

    setCountryCodes(
      countryCodes.map((country) =>
        country.id === editingCountry.id
          ? { ...country, code: newCountry.code.toUpperCase(), name: newCountry.name, region: newCountry.region }
          : country,
      ),
    )

    setEditingCountry(null)
    setNewCountry({ code: "", name: "", region: "" })
  }

  const handleDeleteCountry = (countryId: string) => {
    if (confirm("Are you sure you want to delete this country?")) {
      setCountryCodes(countryCodes.filter((country) => country.id !== countryId))
    }
  }

  // Filter Functions
  const filteredIndustries = industries.filter((industry) =>
    industry.name.toLowerCase().includes(industrySearch.toLowerCase()),
  )

  const filteredCountries = countryCodes.filter(
    (country) =>
      country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.code.toLowerCase().includes(countrySearch.toLowerCase()),
  )

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
        <p className="mt-1 text-sm text-gray-500">Manage industries and country codes used throughout the system.</p>
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
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Countries</p>
                <p className="text-2xl font-bold text-gray-900">{countryCodes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                          <div>
                            <div className="font-medium text-gray-900">{industry.name}</div>
                            {industry.description && (
                              <div className="text-sm text-gray-500">{industry.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{industry.customerCount}</Badge>
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteIndustry(industry.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                            >
                              <Trash2 className="h-3 w-3" />
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

        {/* Country Codes Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-green-600" />
                  Country Codes
                </CardTitle>
                <CardDescription>Manage country codes for customer location tracking</CardDescription>
              </div>
              <Button onClick={() => setShowAddCountry(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Country
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Countries Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Customers</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCountries.map((country) => (
                      <TableRow key={country.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {country.code}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{country.name}</div>
                            <div className="text-sm text-gray-500">{country.region}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{country.customerCount}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCountry(country)}
                              className="bg-transparent"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteCountry(country.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                            >
                              <Trash2 className="h-3 w-3" />
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
          setNewIndustry({ name: "", description: "" })
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
            <div className="space-y-2">
              <Label htmlFor="industryDescription">Description (Optional)</Label>
              <Input
                id="industryDescription"
                placeholder="Brief description of the industry"
                value={newIndustry.description}
                onChange={(e) => setNewIndustry({ ...newIndustry, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddIndustry(false)
                setEditingIndustry(null)
                setNewIndustry({ name: "", description: "" })
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

      {/* Add/Edit Country Dialog */}
      <Dialog
        open={showAddCountry || !!editingCountry}
        onOpenChange={() => {
          setShowAddCountry(false)
          setEditingCountry(null)
          setNewCountry({ code: "", name: "", region: "" })
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCountry ? "Edit Country" : "Add New Country"}</DialogTitle>
            <DialogDescription>
              {editingCountry ? "Update country information." : "Add a new country code to the system."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="countryCode">Country Code</Label>
              <Input
                id="countryCode"
                placeholder="e.g., US"
                value={newCountry.code}
                onChange={(e) => setNewCountry({ ...newCountry, code: e.target.value.toUpperCase() })}
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="countryName">Country Name</Label>
              <Input
                id="countryName"
                placeholder="e.g., United States"
                value={newCountry.name}
                onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="countryRegion">Region</Label>
              <Input
                id="countryRegion"
                placeholder="e.g., North America"
                value={newCountry.region}
                onChange={(e) => setNewCountry({ ...newCountry, region: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddCountry(false)
                setEditingCountry(null)
                setNewCountry({ code: "", name: "", region: "" })
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingCountry ? handleUpdateCountry : handleAddCountry}
              className="bg-green-600 hover:bg-green-700"
              disabled={!newCountry.code || !newCountry.name || !newCountry.region}
            >
              {editingCountry ? "Update" : "Add"} Country
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
