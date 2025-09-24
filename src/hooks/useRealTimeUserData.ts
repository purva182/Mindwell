import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface RealTimeUserData {
  users: Array<{
    id: string;
    profile: {
      id: string;
      email: string;
      full_name: string;
      role: 'patient' | 'counselor' | 'admin';
      phone: string | null;
      date_of_birth: string | null;
      parent_phone: string | null;
      emergency_contact_name: string | null;
    };
    journalEntries: Array<{
      id: string;
      content: string;
      mood_rating: number;
      created_at: string;
    }>;
    questionnaireResponses: Array<{
      id: string;
      questionnaire_type: string;
      total_score: number;
      severity_level: string;
      responses: any;
      completed_at: string;
    }>;
    feedback: Array<{
      id: string;
      category: string;
      message: string;
      rating: number | null;
      created_at: string;
    }>;
    permissions: {
      data_sharing_permission: boolean;
      location_permission: boolean;
      emergency_contact_permission: boolean;
    };
    emergencyAlerts: Array<{
      id: string;
      alert_message: string;
      severity_level: string;
      questionnaire_type: string;
      total_score: number;
      created_at: string;
    }>;
    patients?: Array<{
      patient_id: string;
      patient_name: string;
      assigned_at: string;
      last_session: string;
    }>;
  }>;
  metadata: {
    total_users: number;
    last_updated: string;
    version: string;
    description: string;
  };
}

export const useRealTimeUserData = () => {
  const [userData, setUserData] = useState<RealTimeUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Function to sync data from the edge function
  const syncUserData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Syncing user data...');
      
      const { data, error } = await supabase.functions.invoke('sync-user-data');

      if (error) {
        throw error;
      }

      if (data) {
        setUserData(data);
        setLastSync(new Date());
        
        // Update the public JSON file
        const jsonString = JSON.stringify(data, null, 2);
        
        // Store in localStorage as backup
        localStorage.setItem('chatbot-user-data', jsonString);
        
        console.log(`Successfully synced data for ${data.users?.length || 0} users`);
        
        toast({
          title: "Data Synced",
          description: `Updated data for ${data.users?.length || 0} users`,
        });
      }

    } catch (err: any) {
      console.error('Error syncing user data:', err);
      setError(err.message || 'Failed to sync user data');
      
      toast({
        title: "Sync Failed",
        description: err.message || 'Failed to sync user data',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up real-time listeners
  useEffect(() => {
    console.log('Setting up real-time listeners...');

    // Create channels for different tables
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profiles changed:', payload);
          syncUserData(); // Trigger sync when profiles change
        }
      )
      .subscribe();

    const journalChannel = supabase
      .channel('journal-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries'
        },
        (payload) => {
          console.log('Journal entries changed:', payload);
          syncUserData();
        }
      )
      .subscribe();

    const questionnaireChannel = supabase
      .channel('questionnaire-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questionnaire_responses'
        },
        (payload) => {
          console.log('Questionnaire responses changed:', payload);
          syncUserData();
        }
      )
      .subscribe();

    const feedbackChannel = supabase
      .channel('feedback-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback'
        },
        (payload) => {
          console.log('Feedback changed:', payload);
          syncUserData();
        }
      )
      .subscribe();

    const permissionsChannel = supabase
      .channel('permissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_permissions'
        },
        (payload) => {
          console.log('User permissions changed:', payload);
          syncUserData();
        }
      )
      .subscribe();

    const alertsChannel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_alerts'
        },
        (payload) => {
          console.log('Emergency alerts changed:', payload);
          syncUserData();
        }
      )
      .subscribe();

    // Initial sync
    syncUserData();

    // Cleanup function
    return () => {
      console.log('Cleaning up real-time listeners...');
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(journalChannel);
      supabase.removeChannel(questionnaireChannel);
      supabase.removeChannel(feedbackChannel);
      supabase.removeChannel(permissionsChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [syncUserData]);

  // Function to get user data for a specific user ID
  const getUserById = useCallback((userId: string) => {
    return userData?.users.find(user => user.id === userId) || null;
  }, [userData]);

  // Function to get formatted chatbot context for a user
  const getChatbotContext = useCallback((userId: string) => {
    const user = getUserById(userId);
    if (!user) return null;

    const latestMoodRating = user.journalEntries[0]?.mood_rating;
    const latestQuestionnaire = user.questionnaireResponses[0];
    const recentEntries = user.journalEntries.slice(0, 3);

    return `User Profile:
- Name: ${user.profile.full_name || 'Not provided'}
- Role: ${user.profile.role}
- Age: ${user.profile.date_of_birth ? 
  new Date().getFullYear() - new Date(user.profile.date_of_birth).getFullYear() : 'Not provided'}

Current Mental Health Status:
- Latest mood rating: ${latestMoodRating ? `${latestMoodRating}/10` : 'Not recorded'}
- Latest questionnaire: ${latestQuestionnaire?.questionnaire_type || 'None'} (Score: ${latestQuestionnaire?.total_score || 'N/A'})
- Severity level: ${latestQuestionnaire?.severity_level || 'Not assessed'}
- Total journal entries: ${user.journalEntries.length}
- Emergency alerts: ${user.emergencyAlerts.length}

Recent Journal Entries:
${recentEntries.map(entry => 
  `- [${entry.created_at.split('T')[0]}] Mood: ${entry.mood_rating}/10\n  "${entry.content.substring(0, 150)}..."`
).join('\n')}

Permissions:
- Data sharing: ${user.permissions.data_sharing_permission ? 'Allowed' : 'Denied'}
- Location: ${user.permissions.location_permission ? 'Allowed' : 'Denied'}
- Emergency contact: ${user.permissions.emergency_contact_permission ? 'Allowed' : 'Denied'}`;
  }, [getUserById]);

  return {
    userData,
    loading,
    error,
    lastSync,
    syncUserData,
    getUserById,
    getChatbotContext
  };
};