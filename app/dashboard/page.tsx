"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, TrendingUp, BarChart3 } from "lucide-react"
import { useState, useEffect } from "react"

interface DashboardMetrics {
  totalLeads: number
  analyzedLeads: number
  approvalRate: string
  avgScore: number
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard/metrics')
      const data = await response.json()
      
      if (data.success) {
        setMetrics(data.metrics)
      } else {
        setError(data.message || 'Failed to load metrics')
      }
    } catch (err) {
      console.error('Error loading metrics:', err)
      setError('Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      title: "Total Leads",
      value: loading ? "..." : (metrics?.totalLeads?.toLocaleString() || "0"),
      icon: Users,
    },
    {
      title: "Analyzed Leads",
      value: loading ? "..." : (metrics?.analyzedLeads?.toLocaleString() || "0"),
      icon: BarChart3,
    },
    {
      title: "Approval Rate",
      value: loading ? "..." : (metrics?.approvalRate || "0%"),
      icon: UserCheck,
    },
    {
      title: "Avg. Score",
      value: loading ? "..." : (metrics?.avgScore?.toString() || "0"),
      icon: TrendingUp,
    },
  ]


  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening with your customer analysis.</p>
      </div>

      {/* Stats Grid */}
      {error ? (
        <Card className="mb-8 border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-600 mb-2">{error}</div>
              <Button onClick={loadMetrics} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
