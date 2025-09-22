import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import PHQ9Questionnaire from '@/components/questionnaires/PHQ9Questionnaire';
import GAD7Questionnaire from '@/components/questionnaires/GAD7Questionnaire';
import CounselorBooking from '@/components/CounselorBooking';
import EmergencyToolkit from '@/components/EmergencyToolkit';
import WellnessGames from '@/components/WellnessGames';
import HealthFacts from '@/components/HealthFacts';
import ResourceVideos from '@/components/ResourceVideos';
import ChatSessions from '@/components/ChatSessions';
import FeedbackForm from '@/components/FeedbackForm';
import { 
  Brain, 
  Calendar, 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  BookOpen, 
  Video,
  LogOut,
  Lightbulb,
  Smile,
  Shield,
  Gamepad2,
  Stethoscope
} from 'lucide-react';
import JournalEntries from '@/components/JournalEntries';
import DailyInspiration from '@/components/DailyInspiration';
import { toast } from '@/hooks/use-toast';

interface AssessmentScore {
  questionnaire_type: string;
  total_score: number;
  severity_level: string;
  completed_at: string;
}

export default function PatientDashboard() {
  const { user, profile, signOut } = useAuth();
  const [showPHQ9, setShowPHQ9] = useState(false);
  const [showGAD7, setShowGAD7] = useState(false);
  const [journalEntry, setJournalEntry] = useState('');
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [assessmentScores, setAssessmentScores] = useState<AssessmentScore[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    fetchAssessmentScores();
    checkForInitialAssessment();
  }, [user]);

  const checkForInitialAssessment = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('questionnaire_responses')
      .select('questionnaire_type')
      .eq('user_id', user.id);

    const hasCompletedPHQ9 = data?.some(d => d.questionnaire_type === 'PHQ9');
    const hasCompletedGAD7 = data?.some(d => d.questionnaire_type === 'GAD7');

    if (!hasCompletedPHQ9 || !hasCompletedGAD7) {
      setShowWelcomeModal(true);
    }
  };

  const fetchAssessmentScores = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('questionnaire_responses')
      .select('questionnaire_type, total_score, severity_level, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching assessments:', error);
    } else {
      setAssessmentScores(data || []);
    }
  };

  const saveJournalEntry = async () => {
    if (!journalEntry.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          content: journalEntry,
          mood_rating: moodRating
        });

      if (error) throw error;

      toast({
        title: "Journal entry saved",
        description: "Your thoughts have been recorded.",
      });

      setJournalEntry('');
      setMoodRating(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save journal entry.",
        variant: "destructive",
      });
    }
  };

  const getMoodEmoji = (rating: number) => {
    if (rating <= 2) return '😢';
    if (rating <= 4) return '😔';
    if (rating <= 6) return '😐';
    if (rating <= 8) return '🙂';
    return '😊';
  };

  const getLatestScores = () => {
    const phq9 = assessmentScores.find(s => s.questionnaire_type === 'PHQ9');
    const gad7 = assessmentScores.find(s => s.questionnaire_type === 'GAD7');
    return { phq9, gad7 };
  };

  const { phq9, gad7 } = getLatestScores();

  if (showPHQ9) {
    return (
      <PHQ9Questionnaire
        onComplete={(score, severity) => {
          setShowPHQ9(false);
          fetchAssessmentScores();
        }}
        onClose={() => setShowPHQ9(false)}
      />
    );
  }

  if (showGAD7) {
    return (
      <GAD7Questionnaire
        onComplete={(score, severity) => {
          setShowGAD7(false);
          fetchAssessmentScores();
        }}
        onClose={() => setShowGAD7(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                Welcome to MindWell!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Let's start with a quick assessment to understand your mental wellness better.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => {
                    setShowWelcomeModal(false);
                    setShowPHQ9(true);
                  }}
                  className="w-full"
                >
                  Start PHQ-9 Depression Assessment
                </Button>
                <Button 
                  onClick={() => {
                    setShowWelcomeModal(false);
                    setShowGAD7(true);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Start GAD-7 Anxiety Assessment
                </Button>
              </div>
              <Button 
                onClick={() => setShowWelcomeModal(false)}
                variant="ghost"
                className="w-full text-sm"
              >
                Skip for now
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">MindWell</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {profile?.full_name || user?.email}
              </span>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="counselors">Counselors</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="chat">AI Friend</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Depression Assessment</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {phq9 ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{phq9.total_score}/27</div>
                      <Badge variant={phq9.severity_level === 'Minimal' ? 'default' : 'destructive'}>
                        {phq9.severity_level}
                      </Badge>
                    </div>
                  ) : (
                    <Button onClick={() => setShowPHQ9(true)} size="sm">
                      Take Assessment
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Anxiety Assessment</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {gad7 ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{gad7.total_score}/21</div>
                      <Badge variant={gad7.severity_level === 'Minimal' ? 'default' : 'destructive'}>
                        {gad7.severity_level}
                      </Badge>
                    </div>
                  ) : (
                    <Button onClick={() => setShowGAD7(true)} size="sm">
                      Take Assessment
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Improving</div>
                  <p className="text-xs text-muted-foreground">Based on recent assessments</p>
                </CardContent>
              </Card>
            </div>

            {/* How are you feeling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="w-5 h-5" />
                  How are you feeling today?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <Button
                      key={rating}
                      variant={moodRating === rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMoodRating(rating)}
                      className="w-12 h-12 text-lg"
                    >
                      {getMoodEmoji(rating)}
                    </Button>
                  ))}
                </div>
                {moodRating && (
                  <p className="text-center text-sm text-muted-foreground">
                    You selected: {getMoodEmoji(moodRating)} ({moodRating}/10)
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Journal with Date Selection */}
            <JournalEntries />

            {/* Daily Inspiration */}
            <DailyInspiration />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowPHQ9(true)}>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Heart className="w-8 h-8 text-red-500 mb-2" />
                  <h3 className="font-medium">Retake PHQ-9</h3>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowGAD7(true)}>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Brain className="w-8 h-8 text-blue-500 mb-2" />
                  <h3 className="font-medium">Retake GAD-7</h3>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Shield className="w-8 h-8 text-green-500 mb-2" />
                  <h3 className="font-medium">Coping Tools</h3>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Lightbulb className="w-8 h-8 text-yellow-500 mb-2" />
                  <h3 className="font-medium">Daily Inspiration</h3>
                </CardContent>
              </Card>
            </div>

            {/* Embedded Components */}
            <div className="space-y-6">
              <WellnessGames />
              <HealthFacts />
            </div>
          </TabsContent>

          <TabsContent value="counselors">
            <CounselorBooking />
          </TabsContent>

          <TabsContent value="resources">
            <ResourceVideos />
          </TabsContent>

          <TabsContent value="chat">
            <ChatSessions />
          </TabsContent>

          <TabsContent value="games">
            <WellnessGames />
          </TabsContent>

          <TabsContent value="emergency">
            <EmergencyToolkit />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}