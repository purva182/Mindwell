// Utility functions to fetch user data from JSON file

export interface JsonUserData {
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
    responses: Record<string, number>;
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
}

export interface UsersJsonData {
  users: JsonUserData[];
  metadata: {
    total_users: number;
    last_updated: string;
    version: string;
    description: string;
  };
}

// Fetch all users from JSON file
export const fetchAllUsersFromJson = async (): Promise<UsersJsonData> => {
  try {
    const response = await fetch('/data/users.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: UsersJsonData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching users from JSON:', error);
    throw error;
  }
};

// Fetch specific user by ID
export const fetchUserByIdFromJson = async (userId: string): Promise<JsonUserData | null> => {
  try {
    const data = await fetchAllUsersFromJson();
    const user = data.users.find(u => u.id === userId);
    return user || null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

// Fetch users by role
export const fetchUsersByRoleFromJson = async (role: 'patient' | 'counselor' | 'admin'): Promise<JsonUserData[]> => {
  try {
    const data = await fetchAllUsersFromJson();
    return data.users.filter(user => user.profile.role === role);
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error;
  }
};

// Get user summary for chatbot (from JSON data)
export const getUserSummaryFromJson = (user: JsonUserData) => {
  const latestMoodRating = user.journalEntries[0]?.mood_rating;
  const latestQuestionnaire = user.questionnaireResponses[0];
  const journalCount = user.journalEntries.length;
  const hasEmergencyAlerts = user.emergencyAlerts.length > 0;

  return {
    id: user.id,
    name: user.profile.full_name,
    email: user.profile.email,
    role: user.profile.role,
    age: user.profile.date_of_birth ? 
      new Date().getFullYear() - new Date(user.profile.date_of_birth).getFullYear() : null,
    latestMoodRating,
    latestQuestionnaireScore: latestQuestionnaire?.total_score,
    latestQuestionnaireSeverity: latestQuestionnaire?.severity_level,
    totalJournalEntries: journalCount,
    hasRecentEmergencyAlerts: hasEmergencyAlerts,
    permissions: user.permissions
  };
};

// Get recent activity from JSON data
export const getRecentActivityFromJson = (user: JsonUserData, days: number = 7) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return {
    recentJournalEntries: user.journalEntries.filter(
      entry => new Date(entry.created_at) > cutoffDate
    ),
    recentQuestionnaires: user.questionnaireResponses.filter(
      response => new Date(response.completed_at) > cutoffDate
    ),
    recentFeedback: user.feedback.filter(
      feedback => new Date(feedback.created_at) > cutoffDate
    ),
    recentEmergencyAlerts: user.emergencyAlerts.filter(
      alert => new Date(alert.created_at) > cutoffDate
    )
  };
};

// Format user data for chatbot context
export const formatUserForChatbot = (user: JsonUserData) => {
  const userSummary = getUserSummaryFromJson(user);
  const recentActivity = getRecentActivityFromJson(user, 7);

  return `User Profile:
- ID: ${userSummary.id}
- Name: ${userSummary.name || 'Not provided'}
- Email: ${userSummary.email}
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
- Emergency alerts: ${recentActivity.recentEmergencyAlerts.length}

Permissions:
- Data sharing: ${userSummary.permissions?.data_sharing_permission ? 'Allowed' : 'Denied'}
- Location access: ${userSummary.permissions?.location_permission ? 'Allowed' : 'Denied'}
- Emergency contact: ${userSummary.permissions?.emergency_contact_permission ? 'Allowed' : 'Denied'}

Recent Journal Entries:
${recentActivity.recentJournalEntries.slice(0, 3).map(entry => 
  `- [${entry.created_at.split('T')[0]}] Mood: ${entry.mood_rating}/10 - "${entry.content.substring(0, 100)}..."`
).join('\n')}`;
};