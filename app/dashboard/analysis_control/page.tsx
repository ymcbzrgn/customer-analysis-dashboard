"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Play, Building, Globe, Search, CheckCircle, ArrowRight, Tag } from "lucide-react"
import { toast } from "sonner"

interface Country {
  id: number
  name: string
  code: string
}

interface Industry {
  id: number
  industry: string
}

export default function AnalysisControlPage() {
  const router = useRouter()
  const [countries, setCountries] = useState<Country[]>([])
  const [industries, setIndustries] = useState<Industry[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [showNewAnalysis, setShowNewAnalysis] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newAnalysis, setNewAnalysis] = useState({
    industry: "",
    countryCode: "",
    keyword: "",
  })

  useEffect(() => {
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
 
  const handleStartAnalysis = async () => {
    const selectedCountry = countries.find(c => c.code === newAnalysis.countryCode)
    const selectedIndustry = industries.find(i => i.industry === newAnalysis.industry)
    
    const dorkKeywords = `${selectedCountry?.name} ${selectedIndustry?.industry} ${newAnalysis.keyword}`.trim()

    try {
      // Send webhook POST request with parameters
      const webhookResponse = await fetch('http://localhost:5678/webhook-test/9ee596cc-7809-4b08-b1f3-c8f1817f7f66', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: dorkKeywords,
          country: selectedCountry?.name || '',
          countryCode: newAnalysis.countryCode,
          industry: selectedIndustry?.industry || '',
          keyword: newAnalysis.keyword
        })
      })

      if (webhookResponse.ok) {
        console.log('Webhook request sent successfully')
        setShowSuccess(true)
      } else {
        console.log('Webhook failed with status:', webhookResponse.status)
        toast.error('Failed to send analysis request. Please try again.')
      }
    } catch (error) {
      console.log('Webhook error:', error)
      // Show success even if webhook fails (n8n might not be running)
      toast.error('Failed to send analysis request. Please try again.')
    }

    setShowNewAnalysis(false)
    setNewAnalysis({
      industry: "",
      countryCode: "",
      keyword: "",
    })
  }
 
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analysis Control</h1>
        <p className="mt-1 text-sm text-gray-500">
          Start customer data analysis with custom search parameters.
        </p>
      </div>

      {/* New Analysis Button */}
      {!showSuccess ? (
        <div className="flex justify-center">
          <Button onClick={() => setShowNewAnalysis(true)} className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">
            <Play className="mr-2 h-5 w-5" />
            Start New Analysis
          </Button>
        </div>
      ) : (
        /* Success Message */
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Analysis Request Sent!
            </h3>
            <p className="text-green-700 mb-6">
              Your analysis has been started successfully. You can check the Customer Analysis page to see the results.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/dashboard/customers')} 
                className="bg-green-600 hover:bg-green-700 w-full"
              >
                View Customer Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSuccess(false)}
                className="w-full border-green-300 text-green-700 hover:bg-green-50"
              >
                Start Another Analysis
              </Button>
            </div>
          </div>
        </div>
      )}

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
            
            <div className="space-y-3">
              <Label htmlFor="keyword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Tag className="h-4 w-4 text-green-600" />
                Keyword
              </Label>
              <Input
                id="keyword"
                type="text"
                placeholder="Enter search keywords (optional)..."
                value={newAnalysis.keyword}
                onChange={(e) => setNewAnalysis({ ...newAnalysis, keyword: e.target.value })}
                className="h-12"
              />
            </div>

            {newAnalysis.countryCode && newAnalysis.industry && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Search className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Analysis Preview:</span>
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {newAnalysis.countryCode.toUpperCase()}
                  </Badge>
                  <span className="text-gray-400">×</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 capitalize">
                    {newAnalysis.industry}
                  </Badge>
                  {newAnalysis.keyword && (
                    <>
                      <span className="text-gray-400">×</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {newAnalysis.keyword}
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Will search for "{newAnalysis.industry}" companies in {countries.find(c => c.code === newAnalysis.countryCode)?.name}{newAnalysis.keyword ? ` with keywords "${newAnalysis.keyword}"` : ''}
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