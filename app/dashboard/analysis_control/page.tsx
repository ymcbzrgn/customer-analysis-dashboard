"use client"
 
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Play, Pause, Square, Building, Globe, Search, Clock, CheckCircle, XCircle, AlertCircle, Users } from "lucide-react"
 
interface AnalysisJob {
  id: string
  industry: string
  countryCode: string
  dork: string
  status: "running" | "completed" | "failed" | "paused"
  progress: number
  startTime: string
  endTime?: string
  resultsCount: number
  foundedDorks?: string[]
  errorMessage?: string
}

interface Country {
  id: number
  name: string
  code: string
}

interface Industry {
  id: number
  industry: string
}
 
// Mock jobs removed - using real data from API
 
export default function AnalysisControlPage() {
  const [jobs, setJobs] = useState<AnalysisJob[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [industries, setIndustries] = useState<Industry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [showNewAnalysis, setShowNewAnalysis] = useState(false)
  const [newAnalysis, setNewAnalysis] = useState({
    industry: "",
    countryCode: "",
  })

  useEffect(() => {
    fetchAnalysisJobs()
    fetchCountriesAndIndustries()
  }, [])

  const fetchCountriesAndIndustries = async () => {
    setLoadingData(true)
    try {
      const [countriesResponse, industriesResponse] = await Promise.all([
        fetch('/api/countries'),
        fetch('/api/industries')
      ])

      if (countriesResponse.ok) {
        const countriesData = await countriesResponse.json()
        setCountries(countriesData)
      }

      if (industriesResponse.ok) {
        const industriesData = await industriesResponse.json()
        if (industriesData.success && industriesData.industries) {
          // Map the structure to match our interface
          const mappedIndustries = industriesData.industries.map((item: any) => ({
            id: item.id,
            industry: item.name || item.industry
          }))
          setIndustries(mappedIndustries)
        }
      }
    } catch (error) {
      console.error('Error fetching countries and industries:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchAnalysisJobs = async () => {
    try {
      const response = await fetch('/api/analysis-jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error('Error fetching analysis jobs:', error)
    } finally {
      setLoading(false)
    }
  }
 
  const handleStartAnalysis = async () => {
    const selectedCountry = countries.find(c => c.code === newAnalysis.countryCode)
    const selectedIndustry = industries.find(i => i.industry === newAnalysis.industry)
    
    const dorkKeywords = `${selectedCountry?.name} ${selectedIndustry?.industry}`

    try {
      // Send webhook GET request with parameters
      const webhookUrl = new URL('http://localhost:5678/webhook-test/a0799c27-2d96-4c19-9de1-98132570e86e')
      webhookUrl.searchParams.append('keywords', dorkKeywords)
      webhookUrl.searchParams.append('country', selectedCountry?.name || '')
      webhookUrl.searchParams.append('countryCode', newAnalysis.countryCode)
      webhookUrl.searchParams.append('industry', selectedIndustry?.industry || '')

      const webhookResponse = await fetch(webhookUrl.toString(), {
        method: 'GET',
      })

      if (webhookResponse.ok) {
        const result = await webhookResponse.json()
        console.log('Webhook request sent successfully:', result)
      } else {
        console.error('Failed to send webhook request')
      }
    } catch (error) {
      console.error('Error sending webhook request:', error)
    }

    setShowNewAnalysis(false)
    setNewAnalysis({
      industry: "",
      countryCode: "",
    })

    // Start real analysis job - no simulation
    try {
      const response = await fetch('/api/analysis-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industry: newAnalysis.industry,
          countryCode: newAnalysis.countryCode,
          dork: `site:.${newAnalysis.countryCode} intitle:"${newAnalysis.industry}"`,
        }),
      })

      if (response.ok) {
        const createdJob = await response.json()
        setJobs([createdJob, ...jobs])
        console.log('Analysis job created successfully:', createdJob)
      } else {
        const errorData = await response.json()
        console.error('Failed to create analysis job:', errorData)
        alert(`Failed to create analysis job: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error creating analysis job:', error)
      alert('Error creating analysis job. Please try again.')
    }

    // Refresh the jobs list to get updated data
    fetchAnalysisJobs()
  }
 
  const handleJobAction = (jobId: string, action: "pause" | "resume" | "stop") => {
    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job.id === jobId) {
          switch (action) {
            case "pause":
              return { ...job, status: "paused" as const }
            case "resume":
              return { ...job, status: "running" as const }
            case "stop":
              return { ...job, status: "failed" as const, endTime: new Date().toISOString() }
            default:
              return job
          }
        }
        return job
      }),
    )
  }
 
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
 
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Play className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      case "paused":
        return <Pause className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }
 
  const getStatusText = (status: string) => {
    switch (status) {
      case "running":
        return "Running"
      case "completed":
        return "Completed"
      case "failed":
        return "Failed"
      default:
        return status
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
 
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analysis Control</h1>
        <p className="mt-1 text-sm text-gray-500">
          Start and manage customer data analysis jobs with custom search parameters.
        </p>
      </div>
 
      {/* New Analysis Button */}
      <div className="mb-6">
        <Button onClick={() => setShowNewAnalysis(true)} className="bg-blue-600 hover:bg-blue-700">
          <Play className="mr-2 h-4 w-4" />
          Start New Analysis
        </Button>
      </div>
 
      {/* Analysis Jobs */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Analysis Jobs</CardTitle>
          <CardDescription>Monitor and manage your running and completed analysis jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading analysis jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No analysis jobs found</p>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">{job.industry}</h3>
                        <p className="text-sm text-gray-500">{job.countryCode.toUpperCase()} Analysis</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(job.status)}>
                      {getStatusText(job.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Stop button removed - users can only view analysis */}
                  </div>
                </div>
 
                <div className="flex items-center mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 text-green-600" />
                    <span className="font-medium">{job.customerCount} customer{job.customerCount !== 1 ? 's' : ''} found</span>
                  </div>
                </div>
 
                <div className="mb-3">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span>Founded Dorks:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {job.foundedDorks && job.foundedDorks.length > 0 ? (
                      job.foundedDorks.map((dork, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                          {dork}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary" className="bg-gray-50 text-gray-500 border-gray-200">
                        No dorks found yet
                      </Badge>
                    )}
                  </div>
                </div>
 
                <div className="text-xs text-gray-500 text-right">
                  <span>Started: {formatDateTime(job.startedAt)}</span>
                </div>
 
              </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
 
      {/* New Analysis Dialog */}
      <Dialog open={showNewAnalysis} onOpenChange={setShowNewAnalysis}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Start New Analysis
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Select your target market and industry to begin customer analysis
            </DialogDescription>
          </DialogHeader>
 
          <div className="space-y-8 py-6">
            <div className="space-y-3">
              <Label htmlFor="countryCode" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                Target Country
              </Label>
              <Select
                value={newAnalysis.countryCode}
                onValueChange={(value) => setNewAnalysis({ ...newAnalysis, countryCode: value })}
              >
                <SelectTrigger className="h-12 text-left">
                  <SelectValue placeholder={loadingData ? "Loading countries..." : "Choose a country..."} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{country.name}</span>
                        <span className="text-gray-500 text-sm">({country.code.toUpperCase()})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="industry" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Building className="h-4 w-4 text-purple-600" />
                Industry Sector
              </Label>
              <Select
                value={newAnalysis.industry}
                onValueChange={(value) => setNewAnalysis({ ...newAnalysis, industry: value })}
              >
                <SelectTrigger className="h-12 text-left">
                  <SelectValue placeholder={loadingData ? "Loading industries..." : "Select an industry..."} />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry.id} value={industry.industry}>
                      <span className="capitalize font-medium">{industry.industry}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newAnalysis.countryCode && newAnalysis.industry && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Search className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Analysis Preview:</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {newAnalysis.countryCode.toUpperCase()}
                  </Badge>
                  <span className="text-gray-400">×</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 capitalize">
                    {newAnalysis.industry}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Will search for "{newAnalysis.industry}" companies in {countries.find(c => c.code === newAnalysis.countryCode)?.name}
                </p>
              </div>
            )}
          </div>
 
          <DialogFooter className="gap-3 pt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowNewAnalysis(false)} 
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartAnalysis}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-1 h-11 text-white font-medium"
              disabled={!newAnalysis.countryCode || !newAnalysis.industry}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Analysis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}