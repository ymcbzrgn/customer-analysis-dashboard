"use client"
 
import { useState } from "react"
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

const countries = [
  { code: "tr", name: "Turkey", flag: "🇹🇷" },
  { code: "de", name: "Germany", flag: "🇩🇪" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "us", name: "United States", flag: "🇺🇸" },
  { code: "uk", name: "United Kingdom", flag: "🇬🇧" },
  { code: "it", name: "Italy", flag: "🇮🇹" },
  { code: "es", name: "Spain", flag: "🇪🇸" },
  { code: "nl", name: "Netherlands", flag: "🇳🇱" },
  { code: "ca", name: "Canada", flag: "🇨🇦" },
  { code: "au", name: "Australia", flag: "🇦🇺" },
  { code: "jp", name: "Japan", flag: "🇯🇵" },
  { code: "br", name: "Brazil", flag: "🇧🇷" },
  { code: "mx", name: "Mexico", flag: "🇲🇽" },
  { code: "in", name: "India", flag: "🇮🇳" },
  { code: "cn", name: "China", flag: "🇨🇳" },
]

const industries = [
  "cosmetics", "packaging", "food", "automotive", "technology", "healthcare", 
  "fashion", "electronics", "construction", "agriculture", "finance", "education"
]
 
const mockJobs: AnalysisJob[] = [
  {
    id: "1",
    industry: "cosmetics",
    countryCode: "tr",
    dork: "site:.tr intitle:\"cosmetics\"",
    status: "completed",
    progress: 100,
    startTime: "2024-01-15T10:30:00Z",
    endTime: "2024-01-15T11:45:00Z",
    resultsCount: 42,
    foundedDorks: ["beauty", "skincare", "makeup", "cosmetic", "parfum"]
  },
  {
    id: "2",
    industry: "packaging",
    countryCode: "de",
    dork: "site:.de intitle:\"packaging\"",
    status: "running",
    progress: 65,
    startTime: "2024-01-15T14:20:00Z",
    resultsCount: 28,
    foundedDorks: ["verpackung", "packaging", "karton", "box"]
  },
  {
    id: "3",
    industry: "food",
    countryCode: "fr",
    dork: "site:.fr intitle:\"food\"",
    status: "failed",
    progress: 25,
    startTime: "2024-01-15T09:15:00Z",
    resultsCount: 7,
    errorMessage: "Connection timeout",
    foundedDorks: ["alimentation", "food"]
  },
]
 
export default function AnalysisControlPage() {
  const [jobs, setJobs] = useState<AnalysisJob[]>(mockJobs)
  const [showNewAnalysis, setShowNewAnalysis] = useState(false)
  const [newAnalysis, setNewAnalysis] = useState({
    industry: "",
    countryCode: "",
  })
 
  const handleStartAnalysis = () => {
    const dork = `site:.${newAnalysis.countryCode} intitle:"${newAnalysis.industry}"`

    const newJob: AnalysisJob = {
      id: Date.now().toString(),
      industry: newAnalysis.industry,
      countryCode: newAnalysis.countryCode,
      dork: dork,
      status: "running",
      progress: 0,
      startTime: new Date().toISOString(),
      resultsCount: 0,
      foundedDorks: [],
    }

    setJobs([newJob, ...jobs])
    setShowNewAnalysis(false)
    setNewAnalysis({
      industry: "",
      countryCode: "",
    })

    // Simulate progress
    const interval = setInterval(() => {
      setJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (job.id === newJob.id && job.status === "running") {
            const newProgress = Math.min(job.progress + Math.random() * 15, 100)
            const maxResults = Math.floor(Math.random() * 50) + 20 // Random between 20-70
            const newResultsCount = Math.floor((newProgress / 100) * maxResults)

            // Generate random founded dorks based on industry
            const generateRandomDorks = (industry: string) => {
              const dorkOptions = {
                cosmetics: ["beauty", "skincare", "makeup", "cosmetic", "parfum", "lipstick", "foundation", "mascara"],
                packaging: ["verpackung", "packaging", "karton", "box", "container", "wrapper"],
                food: ["alimentation", "food", "cuisine", "restaurant", "recipe", "nutrition"],
                automotive: ["car", "auto", "vehicle", "motor", "garage", "mechanic"],
                technology: ["tech", "software", "digital", "IT", "computer", "app"],
                healthcare: ["health", "medical", "clinic", "hospital", "doctor", "medicine"],
                fashion: ["fashion", "clothing", "style", "wear", "dress", "outfit"],
                electronics: ["electronic", "gadget", "device", "circuit", "component"],
                construction: ["construction", "building", "architecture", "engineer"],
                agriculture: ["agriculture", "farming", "crop", "harvest", "organic"],
                finance: ["finance", "bank", "investment", "money", "loan"],
                education: ["education", "school", "learning", "course", "training"]
              }
              
              const availableDorks = dorkOptions[industry] || [industry]
              const numberOfDorks = Math.floor((newProgress / 100) * availableDorks.length)
              return availableDorks.slice(0, Math.max(1, numberOfDorks))
            }

            if (newProgress >= 100) {
              clearInterval(interval)
              return {
                ...job,
                progress: 100,
                status: "completed" as const,
                endTime: new Date().toISOString(),
                resultsCount: newResultsCount,
                foundedDorks: generateRandomDorks(job.industry),
              }
            }

            return {
              ...job,
              progress: newProgress,
              resultsCount: newResultsCount,
              foundedDorks: generateRandomDorks(job.industry),
            }
          }
          return job
        }),
      )
    }, 1000)
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
 
  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60)
    return `${duration} min`
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
            {jobs.map((job) => (
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
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Stop button removed - users can only view analysis */}
                  </div>
                </div>
 
                <div className="flex items-center mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 text-green-600" />
                    <span className="font-medium">{job.resultsCount} customer{job.resultsCount !== 1 ? 's' : ''} found</span>
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
                  <span>Started: {new Date(job.startTime).toLocaleString()}</span>
                </div>
 
                {job.errorMessage && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">Error: {job.errorMessage}</p>
                  </div>
                )}
              </div>
            ))}
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
                  <SelectValue placeholder="Choose a country..." />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{country.flag}</span>
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
                  <SelectValue placeholder="Select an industry..." />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      <span className="capitalize font-medium">{industry}</span>
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