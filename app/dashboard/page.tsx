import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, TrendingUp, FileText, Plus, Upload, BarChart3, Activity } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Leads",
      value: "2,847",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: Users,
      description: "Total customer leads collected",
    },
    {
      title: "Analyzed Leads",
      value: "1,923",
      change: "+8.2%",
      changeType: "positive" as const,
      icon: BarChart3,
      description: "Leads processed through analysis",
    },
    {
      title: "Approval Rate",
      value: "67.4%",
      change: "+2.1%",
      changeType: "positive" as const,
      icon: UserCheck,
      description: "Percentage of approved customers",
    },
    {
      title: "Avg. Score",
      value: "74.2",
      change: "-1.3%",
      changeType: "negative" as const,
      icon: TrendingUp,
      description: "Average customer analysis score",
    },
  ]

  const recentActivity = [
    { action: "New lead analyzed", customer: "Sarah Johnson", score: 89, time: "2 minutes ago" },
    { action: "Customer approved", customer: "Michael Chen", score: 92, time: "15 minutes ago" },
    { action: "Bulk import completed", customer: "150 new leads", score: null, time: "1 hour ago" },
    { action: "Customer rejected", customer: "Alex Rodriguez", score: 34, time: "2 hours ago" },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening with your customer analysis.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant={stat.changeType === "positive" ? "default" : "destructive"}
                  className={stat.changeType === "positive" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                >
                  {stat.change}
                </Badge>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
            <CardDescription>Start analyzing customers or import new data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Start New Analysis
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Upload className="mr-2 h-4 w-4" />
              Import Customer Data
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
            <CardDescription>Latest customer analysis updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                  <div className="flex-shrink-0">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-sm text-gray-500">{activity.customer}</p>
                      {activity.score && (
                        <Badge variant="outline" className="text-xs">
                          Score: {activity.score}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
