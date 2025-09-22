import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, Users, BarChart3, Send, CheckCircle, AlertCircle } from "lucide-react";

const weeklyStats = {
  totalUsers: 1247,
  activeUsers: 892,
  newUsers: 156,
  moodEntries: 2341,
  journalEntries: 1876,
  gamesPlayed: 567,
  crisisContacts: 23,
  averageMoodScore: 6.8,
  completionRate: 73,
  satisfactionScore: 4.2
};

const criticalAlerts = [
  {
    id: 1,
    type: "crisis",
    message: "23 users contacted crisis support this week (↑15%)",
    severity: "high"
  },
  {
    id: 2,
    type: "engagement",
    message: "Daily active users dropped by 8% from last week",
    severity: "medium"
  },
  {
    id: 3,
    type: "feedback",
    message: "12 new feedback submissions require review",
    severity: "low"
  }
];

const reportSections = [
  { name: "User Engagement", included: true, description: "Daily/weekly active users, session duration" },
  { name: "Mental Health Metrics", included: true, description: "Mood tracking, crisis interventions" },
  { name: "Feature Usage", included: true, description: "Games, journal, counselor bookings" },
  { name: "User Feedback", included: true, description: "Ratings, comments, suggestions" },
  { name: "Technical Performance", included: false, description: "App performance, errors, uptime" },
  { name: "Detailed Analytics", included: false, description: "Advanced metrics and trends" }
];

const WeeklyReportAdmin = () => {
  const [reportGenerated, setReportGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
      setTimeout(() => setReportGenerated(false), 3000);
    }, 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-white";
      case "low": return "bg-info text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (reportGenerated) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-xl font-semibold">Weekly Report Sent!</h3>
          <p className="text-muted-foreground">
            The comprehensive weekly report has been sent to all administrators.
          </p>
          <Badge className="bg-success text-white">
            Report Generated & Distributed
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Weekly Report for Administrators
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats Overview */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            This Week's Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{weeklyStats.totalUsers}</div>
              <div className="text-xs text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center p-3 bg-secondary/5 rounded-lg">
              <div className="text-2xl font-bold text-secondary">{weeklyStats.activeUsers}</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center p-3 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-accent">{weeklyStats.newUsers}</div>
              <div className="text-xs text-muted-foreground">New Users</div>
            </div>
            <div className="text-center p-3 bg-success/5 rounded-lg">
              <div className="text-2xl font-bold text-success">{weeklyStats.averageMoodScore}</div>
              <div className="text-xs text-muted-foreground">Avg Mood</div>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Critical Alerts
          </h3>
          <div className="space-y-3">
            {criticalAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                  <Badge className={`mt-1 text-xs ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()} PRIORITY
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Metrics */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-info" />
            Key Metrics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>User Engagement Rate</span>
                <span>{weeklyStats.completionRate}%</span>
              </div>
              <Progress value={weeklyStats.completionRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>User Satisfaction (5-point scale)</span>
                <span>{weeklyStats.satisfactionScore}/5.0</span>
              </div>
              <Progress value={(weeklyStats.satisfactionScore / 5) * 100} className="h-2" />
            </div>
          </div>
        </div>

        {/* Report Sections */}
        <div>
          <h3 className="font-semibold mb-4">Report Sections to Include</h3>
          <div className="space-y-2">
            {reportSections.map((section, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <div className="font-medium text-sm">{section.name}</div>
                  <div className="text-xs text-muted-foreground">{section.description}</div>
                </div>
                <Badge variant={section.included ? "default" : "secondary"}>
                  {section.included ? "Included" : "Optional"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex items-start gap-3 mb-4">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Automated Weekly Report</h4>
              <p className="text-sm text-muted-foreground">
                This report will be automatically sent to all administrators every Monday at 9:00 AM. 
                It includes user metrics, engagement data, crisis interventions, and system performance.
              </p>
            </div>
          </div>
          
          <Button 
            onClick={generateReport}
            disabled={isGenerating}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating Report..." : "Generate & Send Weekly Report"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyReportAdmin;