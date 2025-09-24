import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DatabaseError extends Error {
  message: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting user data sync...')

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`)
    }

    console.log(`Fetched ${profiles?.length || 0} profiles`)

    const users = []

    // Process each profile
    for (const profile of profiles || []) {
      console.log(`Processing user: ${profile.full_name} (${profile.user_id})`)

      // Fetch journal entries for this user
      const { data: journalEntries } = await supabaseClient
        .from('journal_entries')
        .select('id, content, mood_rating, created_at')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false })

      // Fetch questionnaire responses
      const { data: questionnaireResponses } = await supabaseClient
        .from('questionnaire_responses')
        .select('id, questionnaire_type, total_score, severity_level, responses, completed_at')
        .eq('user_id', profile.user_id)
        .order('completed_at', { ascending: false })

      // Fetch feedback
      const { data: feedback } = await supabaseClient
        .from('feedback')
        .select('id, category, message, rating, created_at')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false })

      // Fetch user permissions
      const { data: permissions } = await supabaseClient
        .from('user_permissions')
        .select('data_sharing_permission, location_permission, emergency_contact_permission')
        .eq('user_id', profile.user_id)
        .maybeSingle()

      // Fetch emergency alerts
      const { data: emergencyAlerts } = await supabaseClient
        .from('emergency_alerts')
        .select('id, alert_message, severity_level, questionnaire_type, total_score, created_at')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false })

      // If user is a counselor, fetch their patients
      let patients = []
      if (profile.role === 'counselor') {
        const { data: counselorPatients } = await supabaseClient
          .from('counselor_patients')
          .select(`
            patient_id,
            assigned_at,
            profiles!counselor_patients_patient_id_fkey(full_name)
          `)
          .eq('counselor_id', profile.user_id)
          .eq('is_active', true)

        patients = counselorPatients?.map(cp => ({
          patient_id: cp.patient_id,
          patient_name: (cp.profiles as any)?.full_name || 'Unknown',
          assigned_at: cp.assigned_at,
          last_session: new Date().toISOString() // This could be enhanced with actual session data
        })) || []
      }

      // Build user object
      const user = {
        id: profile.user_id,
        profile: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          phone: profile.phone,
          date_of_birth: profile.date_of_birth,
          parent_phone: profile.parent_phone,
          emergency_contact_name: profile.emergency_contact_name
        },
        journalEntries: journalEntries?.map(entry => ({
          id: entry.id,
          content: entry.content,
          mood_rating: entry.mood_rating,
          created_at: entry.created_at
        })) || [],
        questionnaireResponses: questionnaireResponses?.map(response => ({
          id: response.id,
          questionnaire_type: response.questionnaire_type,
          total_score: response.total_score,
          severity_level: response.severity_level,
          responses: response.responses,
          completed_at: response.completed_at
        })) || [],
        feedback: feedback?.map(fb => ({
          id: fb.id,
          category: fb.category,
          message: fb.message,
          rating: fb.rating,
          created_at: fb.created_at
        })) || [],
        permissions: permissions ? {
          data_sharing_permission: permissions.data_sharing_permission,
          location_permission: permissions.location_permission,
          emergency_contact_permission: permissions.emergency_contact_permission
        } : {
          data_sharing_permission: false,
          location_permission: false,
          emergency_contact_permission: false
        },
        emergencyAlerts: emergencyAlerts?.map(alert => ({
          id: alert.id,
          alert_message: alert.alert_message,
          severity_level: alert.severity_level,
          questionnaire_type: alert.questionnaire_type,
          total_score: alert.total_score,
          created_at: alert.created_at
        })) || [],
        ...(profile.role === 'counselor' && { patients })
      }

      users.push(user)
    }

    const responseData = {
      users,
      metadata: {
        total_users: users.length,
        last_updated: new Date().toISOString(),
        version: "1.0",
        description: "Real-time user data for mental health support system chatbot integration"
      }
    }

    console.log(`Successfully processed ${users.length} users`)

    return new Response(JSON.stringify(responseData, null, 2), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    })

  } catch (error) {
    console.error('Error in sync-user-data function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to sync user data', 
        details: errorMessage 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )
  }
})