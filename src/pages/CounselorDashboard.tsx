import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import FeedbackForm from '@/components/FeedbackForm';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Calendar,
  LogOut,
  Brain,
  Heart,
  MessageCircle,
  FileText,
  BarChart3
} from 'lucide-react';

interface PatientData {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  latest_phq9?: number;
  latest_gad7?: number;
  latest_phq9_severity?: string;
  latest_gad7_severity?: string;
  last_assessment?: string;
  journal_entries_count?: number;
}

interface WeeklyStats {
  total_patients: number;
  high_risk_patients: number;
  assessments_completed: number;
  average_phq9: number;
  average_gad7: number;
}

export default function CounselorDashboard() {
  const { user, profile, signOut } = useAuth();
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPatients();
      fetchWeeklyStats();
    }
  }, [user]);

  const fetchPatients = async () => {
    if (!user) return;

    try {
      // Get patients assigned to this counselor
      const { data: relationships } = await supabase
        .from('counselor_patients')
        .select('patient_id')
        .eq('counselor_id', user.id)
        .eq('is_active', true);

      if (!relationships?.length) {
        setPatients([]);
        setLoading(false);
        return;
      }

      const patientIds = relationships.map(r => r.patient_id);

      // Get patient profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', patientIds);

      // Get latest assessment scores for each patient
      const patientsWithData: PatientData[] = [];

      for (const profile of profiles || []) {
        // Get latest PHQ-9 score
        const { data: phq9Data } = await supabase
          .from('questionnaire_responses')
          .select('total_score, severity_level, completed_at')
          .eq('user_id', profile.user_id)
          .eq('questionnaire_type', 'PHQ9')
          .order('completed_at', { ascending: false })
          .limit(1);

        // Get latest GAD-7 score
        const { data: gad7Data } = await supabase
          .from('questionnaire_responses')
          .select('total_score, severity_level, completed_at')
          .eq('user_id', profile.user_id)
          .eq('questionnaire_type', 'GAD7')
          .order('completed_at', { ascending: false })
          .limit(1);

        // Get journal entries count
        const { count: journalCount } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.user_id);

        patientsWithData.push({
          id: profile.user_id,
          email: profile.email,
          full_name: profile.full_name || 'Unknown',
          created_at: profile.created_at,
          latest_phq9: phq9Data?.[0]?.total_score,
          latest_gad7: gad7Data?.[0]?.total_score,
          latest_phq9_severity: phq9Data?.[0]?.severity_level,
          latest_gad7_severity: gad7Data?.[0]?.severity_level,
          last_assessment: phq9Data?.[0]?.completed_at || gad7Data?.[0]?.completed_at,
          journal_entries_count: journalCount || 0
        });
      }

      setPatients(patientsWithData);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyStats = async () => {
    if (!user) return;

    try {
      // Get all patients for this counselor
      const { data: relationships } = await supabase
        .from('counselor_patients')
        .select('patient_id')
        .eq('counselor_id', user.id)
        .eq('is_active', true);

      if (!relationships?.length) {
        setWeeklyStats({
          total_patients: 0,
          high_risk_patients: 0,
          assessments_completed: 0,
          average_phq9: 0,
          average_gad7: 0
        });
        return;
      }

      const patientIds = relationships.map(r => r.patient_id);

      // Get assessments from the last week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: recentAssessments, count: assessmentCount } = await supabase
        .from('questionnaire_responses')
        .select('total_score, questionnaire_type, severity_level', { count: 'exact' })
        .in('user_id', patientIds)
        .gte('completed_at', oneWeekAgo.toISOString());

      const phq9Scores = recentAssessments?.filter(a => a.questionnaire_type === 'PHQ9') || [];
      const gad7Scores = recentAssessments?.filter(a => a.questionnaire_type === 'GAD7') || [];

      const avgPhq9 = phq9Scores.length > 0 
        ? phq9Scores.reduce((sum, a) => sum + a.total_score, 0) / phq9Scores.length 
        : 0;

      const avgGad7 = gad7Scores.length > 0 
        ? gad7Scores.reduce((sum, a) => sum + a.total_score, 0) / gad7Scores.length 
        : 0;

      const highRiskCount = recentAssessments?.filter(a => 
        a.severity_level === 'Severe' || a.severity_level === 'Moderately Severe'
      ).length || 0;

      setWeeklyStats({
        total_patients: patientIds.length,
        high_risk_patients: highRiskCount,
        assessments_completed: assessmentCount || 0,
        average_phq9: Math.round(avgPhq9 * 10) / 10,
        average_gad7: Math.round(avgGad7 * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Minimal': return 'bg-green-100 text-green-800';
      case 'Mild': return 'bg-yellow-100 text-yellow-800';
      case 'Moderate': return 'bg-orange-100 text-orange-800';
      case 'Moderately Severe': return 'bg-red-100 text-red-800';
      case 'Severe': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">MindWell - Counselor Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Dr. {profile?.full_name || user?.email}
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Weekly Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{weeklyStats?.total_patients || 0}</div>
                  <p className="text-xs text-muted-foreground">Active patients</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{weeklyStats?.high_risk_patients || 0}</div>
                  <p className="text-xs text-muted-foreground">Severe/Mod. Severe cases</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weekly Assessments</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{weeklyStats?.assessments_completed || 0}</div>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Scores</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <div>PHQ-9: {weeklyStats?.average_phq9 || 0}</div>
                    <div>GAD-7: {weeklyStats?.average_gad7 || 0}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Patients Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Patient Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patients.slice(0, 5).map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{patient.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{patient.full_name}</p>
                          <p className="text-sm text-muted-foreground">{patient.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {patient.latest_phq9_severity && (
                          <Badge className={getSeverityColor(patient.latest_phq9_severity)}>
                            PHQ-9: {patient.latest_phq9_severity}
                          </Badge>
                        )}
                        {patient.latest_gad7_severity && (
                          <Badge className={getSeverityColor(patient.latest_gad7_severity)}>
                            GAD-7: {patient.latest_gad7_severity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Patient Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <Card key={patient.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="text-lg">
                              {patient.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{patient.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{patient.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Patient since: {new Date(patient.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            {patient.latest_phq9 !== undefined && (
                              <Badge className={getSeverityColor(patient.latest_phq9_severity || '')}>
                                PHQ-9: {patient.latest_phq9}/27 ({patient.latest_phq9_severity})
                              </Badge>
                            )}
                            {patient.latest_gad7 !== undefined && (
                              <Badge className={getSeverityColor(patient.latest_gad7_severity || '')}>
                                GAD-7: {patient.latest_gad7}/21 ({patient.latest_gad7_severity})
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              Journal entries: {patient.journal_entries_count}
                            </div>
                            {patient.last_assessment && (
                              <div>
                                Last assessment: {new Date(patient.last_assessment).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {patients.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No patients assigned yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Weekly Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Assessment Distribution</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Minimal Risk</span>
                        <span className="font-medium">
                          {patients.filter(p => 
                            p.latest_phq9_severity === 'Minimal' || p.latest_gad7_severity === 'Minimal'
                          ).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mild Risk</span>
                        <span className="font-medium">
                          {patients.filter(p => 
                            p.latest_phq9_severity === 'Mild' || p.latest_gad7_severity === 'Mild'
                          ).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Moderate Risk</span>
                        <span className="font-medium">
                          {patients.filter(p => 
                            p.latest_phq9_severity === 'Moderate' || p.latest_gad7_severity === 'Moderate'
                          ).length}
                        </span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>High Risk</span>
                        <span className="font-medium">
                          {patients.filter(p => 
                            p.latest_phq9_severity === 'Severe' || 
                            p.latest_phq9_severity === 'Moderately Severe' ||
                            p.latest_gad7_severity === 'Severe'
                          ).length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Engagement Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Active Journalists</span>
                        <span className="font-medium">
                          {patients.filter(p => (p.journal_entries_count || 0) > 0).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recent Assessments</span>
                        <span className="font-medium">
                          {patients.filter(p => {
                            if (!p.last_assessment) return false;
                            const lastWeek = new Date();
                            lastWeek.setDate(lastWeek.getDate() - 7);
                            return new Date(p.last_assessment) > lastWeek;
                          }).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}