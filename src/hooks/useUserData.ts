import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserData {
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    role: 'patient' | 'counselor' | 'admin';
    phone: string | null;
    date_of_birth: string | null;
    parent_phone: string | null;
    emergency_contact_name: string | null;
  } | null;
  journalEntries: Array<{
    id: string;
    content: string;
    mood_rating: number | null;
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
  } | null;
  emergencyAlerts: Array<{
    id: string;
    alert_message: string | null;
    severity_level: string;
    questionnaire_type: string;
    total_score: number;
    created_at: string;
  }>;
}

export const useUserData = () => {
  const { user, profile } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    profile: null,
    journalEntries: [],
    questionnaireResponses: [],
    feedback: [],
    permissions: null,
    emergencyAlerts: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllUserData = async () => {
    if (!user || !profile) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all user data in parallel
      const [
        journalEntriesResult,
        questionnaireResponsesResult,
        feedbackResult,
        permissionsResult,
        emergencyAlertsResult
      ] = await Promise.all([
        // Journal entries
        supabase
          .from('journal_entries')
          .select('id, content, mood_rating, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        
        // Questionnaire responses
        supabase
          .from('questionnaire_responses')
          .select('id, questionnaire_type, total_score, severity_level, responses, completed_at')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false }),
        
        // Feedback
        supabase
          .from('feedback')
          .select('id, category, message, rating, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        
        // User permissions
        supabase
          .from('user_permissions')
          .select('data_sharing_permission, location_permission, emergency_contact_permission')
          .eq('user_id', user.id)
          .maybeSingle(),
        
        // Emergency alerts
        supabase
          .from('emergency_alerts')
          .select('id, alert_message, severity_level, questionnaire_type, total_score, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      // Check for errors
      if (journalEntriesResult.error) throw journalEntriesResult.error;
      if (questionnaireResponsesResult.error) throw questionnaireResponsesResult.error;
      if (feedbackResult.error) throw feedbackResult.error;
      if (permissionsResult.error) throw permissionsResult.error;
      if (emergencyAlertsResult.error) throw emergencyAlertsResult.error;

      setUserData({
        profile: profile,
        journalEntries: journalEntriesResult.data || [],
        questionnaireResponses: questionnaireResponsesResult.data || [],
        feedback: feedbackResult.data || [],
        permissions: permissionsResult.data,
        emergencyAlerts: emergencyAlertsResult.data || []
      });

    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile) {
      fetchAllUserData();
    }
  }, [user, profile]);

  // Helper function to get user summary for chatbot
  const getUserSummary = () => {
    if (!userData.profile) return null;

    const latestMoodRating = userData.journalEntries[0]?.mood_rating;
    const latestQuestionnaire = userData.questionnaireResponses[0];
    const journalCount = userData.journalEntries.length;
    const hasEmergencyAlerts = userData.emergencyAlerts.length > 0;

    return {
      name: userData.profile.full_name,
      role: userData.profile.role,
      latestMoodRating,
      latestQuestionnaireScore: latestQuestionnaire?.total_score,
      latestQuestionnaireSeverity: latestQuestionnaire?.severity_level,
      totalJournalEntries: journalCount,
      hasRecentEmergencyAlerts: hasEmergencyAlerts,
      permissions: userData.permissions,
      age: userData.profile.date_of_birth ? 
        new Date().getFullYear() - new Date(userData.profile.date_of_birth).getFullYear() : null
    };
  };

  // Helper function to get recent activity for context
  const getRecentActivity = (days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return {
      recentJournalEntries: userData.journalEntries.filter(
        entry => new Date(entry.created_at) > cutoffDate
      ),
      recentQuestionnaires: userData.questionnaireResponses.filter(
        response => new Date(response.completed_at) > cutoffDate
      ),
      recentFeedback: userData.feedback.filter(
        feedback => new Date(feedback.created_at) > cutoffDate
      )
    };
  };

  return {
    userData,
    loading,
    error,
    refetch: fetchAllUserData,
    getUserSummary,
    getRecentActivity
  };
};