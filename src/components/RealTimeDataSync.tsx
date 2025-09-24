import React from 'react';
import { useRealTimeUserData } from '@/hooks/useRealTimeUserData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Users, Activity, AlertTriangle, FileText } from 'lucide-react';
import { format } from 'date-fns';

export const RealTimeDataSync = () => {
  const { 
    userData, 
    loading, 
    error, 
    lastSync, 
    syncUserData, 
    getChatbotContext 
  } = useRealTimeUserData();

  const downloadJsonData = () => {
    if (!userData) return;
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chatbot-training-data-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Real-Time Chatbot Training Data</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={loading ? "secondary" : "default"}>
              {loading ? "Syncing..." : "Live"}
            </Badge>
            <Button 
              onClick={syncUserData} 
              disabled={loading}
              size="sm"
              variant="outline"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Now
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-4">
              <p className="text-destructive font-medium">Error: {error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-2xl font-bold">{userData?.users.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <FileText className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {userData?.users.reduce((sum, user) => sum + user.journalEntries.length, 0) || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Journal Entries</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <Activity className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {userData?.users.reduce((sum, user) => sum + user.questionnaireResponses.length, 0) || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Questionnaires</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <AlertTriangle className="h-8 w-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {userData?.users.reduce((sum, user) => sum + user.emergencyAlerts.length, 0) || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Alerts</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Last synced: {lastSync ? format(lastSync, 'PPpp') : 'Never'}
              </p>
              <p className="text-sm text-muted-foreground">
                Auto-sync: Active (updates on database changes)
              </p>
            </div>
            <Button onClick={downloadJsonData} disabled={!userData}>
              Download JSON
            </Button>
          </div>

          {userData && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Users Overview</h3>
              <div className="grid gap-4">
                {userData.users.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{user.profile.full_name || 'Unknown User'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {user.profile.role} • {user.journalEntries.length} entries • 
                          {user.questionnaireResponses.length} assessments
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const context = getChatbotContext(user.id);
                            if (context) copyToClipboard(context);
                          }}
                        >
                          Copy Context
                        </Button>
                        <Badge variant={user.emergencyAlerts.length > 0 ? "destructive" : "secondary"}>
                          {user.emergencyAlerts.length > 0 ? 'Has Alerts' : 'No Alerts'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Integration Instructions:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Use the <code>useRealTimeUserData</code> hook in your chatbot component</p>
              <p>• Call <code>getChatbotContext(userId)</code> to get formatted user context</p>
              <p>• Data automatically updates when users add journal entries, complete questionnaires, etc.</p>
              <p>• Download the JSON file for offline training or backup</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};