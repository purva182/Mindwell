import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Heart, Brain, Moon, Sun, Activity, BookOpen, Users, Calendar, Target, Smile } from "lucide-react";

// Import new components
import CounselorBooking from "@/components/CounselorBooking";
import EmergencyToolkit from "@/components/EmergencyToolkit";
import WellnessGames from "@/components/WellnessGames";
import HealthFacts from "@/components/HealthFacts";
import ResourceVideos from "@/components/ResourceVideos";
import FeedbackForm from "@/components/FeedbackForm";
import WeeklyReportAdmin from "@/components/WeeklyReportAdmin";
import ChatSessions from "@/components/ChatSessions";

const Dashboard = () => {
  const [journalEntry, setJournalEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("");

  const moodOptions = [
    { emoji: "😊", label: "Great", color: "bg-success text-white", value: "great" },
    { emoji: "😌", label: "Good", color: "bg-info text-white", value: "good" },
    { emoji: "😐", label: "Okay", color: "bg-warning text-white", value: "okay" },
    { emoji: "😔", label: "Low", color: "bg-muted text-muted-foreground", value: "low" },
    { emoji: "😢", label: "Difficult", color: "bg-destructive text-destructive-foreground", value: "difficult" }
  ];

  const stats = [
    { icon: Heart, label: "Days Active", value: "12", color: "text-primary" },
    { icon: Activity, label: "Mood Score", value: "7.2", color: "text-secondary" },
    { icon: Target, label: "Goals Met", value: "3/5", color: "text-accent" },
    { icon: Moon, label: "Sleep Avg", value: "7.5h", color: "text-info" }
  ];

  const resources = [
    { icon: Brain, title: "Mindfulness", description: "Guided meditation sessions", color: "primary" },
    { icon: BookOpen, title: "Learn", description: "Mental health resources", color: "secondary" },
    { icon: Users, title: "Community", description: "Connect with others", color: "accent" },
    { icon: Calendar, title: "Schedule", description: "Therapy appointments", color: "info" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-white p-6 shadow-soft">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="fade-in">
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Smile className="h-8 w-8 floating-animation" />
                MindWell Dashboard
              </h1>
              <p className="text-white/90">Welcome back! How are you feeling today?</p>
            </div>
            <nav className="flex space-x-4">
              <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                Profile
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Resources
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Help
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 fade-in">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="card-hover shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mood Tracker */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-colorful fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Heart className="h-6 w-6 text-primary" />
                  How are you feeling?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-3 mb-6">
                  {moodOptions.map((mood) => (
                    <Button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`mood-button h-20 flex-col ${
                        selectedMood === mood.value 
                          ? `${mood.color} success-pulse` 
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <span className="text-2xl mb-1">{mood.emoji}</span>
                      <span className="text-sm">{mood.label}</span>
                    </Button>
                  ))}
                </div>
                {selectedMood && (
                  <div className="fade-in">
                    <Badge className="bg-primary text-primary-foreground">
                      Feeling {moodOptions.find(m => m.value === selectedMood)?.label} today
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Journal Section */}
            <Card className="shadow-soft fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-secondary" />
                  Daily Journal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Today's Date</label>
                      <Input 
                        type="date" 
                        className="mt-1"
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Energy Level</label>
                      <select className="w-full mt-1 p-2 rounded-md border border-border bg-card text-card-foreground">
                        <option>High Energy</option>
                        <option>Moderate Energy</option>
                        <option>Low Energy</option>
                        <option>Very Low Energy</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">What's on your mind?</label>
                    <Textarea
                      value={journalEntry}
                      onChange={(e) => setJournalEntry(e.target.value)}
                      className="mt-1 h-32"
                      placeholder="Share your thoughts, feelings, or experiences from today..."
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Save Entry
                    </Button>
                    <Button variant="outline">
                      View Past Entries
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="shadow-soft fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Mood Tracking</span>
                      <span>5/7 days</span>
                    </div>
                    <Progress value={71} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Journal Entries</span>
                      <span>3/7 days</span>
                    </div>
                    <Progress value={43} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Mindfulness</span>
                      <span>4/7 days</span>
                    </div>
                    <Progress value={57} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Quote */}
            <Card className="gradient-card shadow-soft fade-in">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-lg mb-3 text-gradient">Daily Inspiration</h3>
                <p className="text-muted-foreground italic mb-3">
                  "Progress, not perfection, is the goal."
                </p>
                <Badge variant="secondary">Mental Health Tip</Badge>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-soft fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Start Meditation
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Check-in
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Connect with Peer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* New Sections */}
        <div className="space-y-8 fade-in">
          {/* Counselor Booking */}
          <CounselorBooking />

          {/* Emergency Toolkit */}
          <EmergencyToolkit />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Wellness Games */}
            <WellnessGames />
            
            {/* Health Facts */}
            <HealthFacts />
          </div>

          {/* Resource Videos */}
          <ResourceVideos />

          {/* Chat Sessions */}
          <ChatSessions />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feedback Form */}
            <FeedbackForm />
            
            {/* Weekly Report for Admin */}
            <WeeklyReportAdmin />
          </div>
        </div>

        <Separator className="my-8" />

        {/* Resources Section */}
        <div className="fade-in">
          <h2 className="text-2xl font-bold mb-6 text-center">Support Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource) => (
              <Card key={resource.title} className="card-hover shadow-soft text-center">
                <CardContent className="p-6">
                  <resource.icon className={`h-12 w-12 mx-auto mb-4 text-${resource.color}`} />
                  <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                  <Button size="sm" className="w-full">
                    Explore
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-muted/30 p-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground mb-4">
            © 2024 MindWell - Supporting your mental health journey with care and professionalism
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            <a href="#" className="text-primary hover:underline">Crisis Support: 988</a>
            <a href="#" className="text-primary hover:underline">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;