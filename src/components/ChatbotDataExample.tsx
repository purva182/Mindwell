import React from 'react';
import { useUserData } from '@/hooks/useUserData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const ChatbotDataExample = () => {
  const { userData, loading, error, getUserSummary, getRecentActivity } = useUserData();

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading user data...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <p className="text-destructive">Error loading user data: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const userSummary = getUserSummary();
  const recentActivity = getRecentActivity(7); // Last 7 days

  // Example of how to format data for chatbot context
  const formatForChatbot = () => {
    if (!userSummary) return "No user data available";

    let context = `User Profile:
- Name: ${userSummary.name || 'Not provided'}
- Role: ${userSummary.role}
- Age: ${userSummary.age || 'Not provided'}

Mental Health Status:
- Latest mood rating: ${userSummary.latestMoodRating ? `${userSummary.latestMoodRating}/10` : 'Not recorded'}
- Latest questionnaire score: ${userSummary.latestQuestionnaireScore || 'None completed'}
- Severity level: ${userSummary.latestQuestionnaireSeverity || 'Not assessed'}
- Total journal entries: ${userSummary.totalJournalEntries}
- Has emergency alerts: ${userSummary.hasRecentEmergencyAlerts ? 'Yes' : 'No'}

Recent Activity (Last 7 days):
- Journal entries: ${recentActivity.recentJournalEntries.length}
- Questionnaires completed: ${recentActivity.recentQuestionnaires.length}
- Feedback submitted: ${recentActivity.recentFeedback.length}

Permissions:
- Data sharing: ${userSummary.permissions?.data_sharing_permission ? 'Allowed' : 'Denied'}
- Location access: ${userSummary.permissions?.location_permission ? 'Allowed' : 'Denied'}
- Emergency contact: ${userSummary.permissions?.emergency_contact_permission ? 'Allowed' : 'Denied'}`;

    return context;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Data for Chatbot Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">User Summary:</h3>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(userSummary, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Formatted for Chatbot Context:</h3>
            <pre className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">
              {formatForChatbot()}
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Journal Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{userData.journalEntries.length}</p>
                <p className="text-sm text-muted-foreground">Total entries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Questionnaires</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{userData.questionnaireResponses.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Emergency Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{userData.emergencyAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Total alerts</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">How to use in your chatbot:</h3>
            <div className="bg-muted p-3 rounded text-sm">
              <code>{`
// Import the hook
import { useUserData } from '@/hooks/useUserData';

// In your chatbot component
const { userData, getUserSummary, getRecentActivity } = useUserData();

// Get formatted context for AI
const userContext = getUserSummary();
const recentData = getRecentActivity(7);

// Send to your AI service
const chatbotResponse = await sendToAI({
  userContext,
  recentData,
  message: userMessage
});
              `}</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};