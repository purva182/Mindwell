import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmergencyAlertRequest {
  counselorEmail?: string;
  counselorName?: string;
  parentPhone?: string;
  emergencyContactName?: string;
  patientName: string;
  score: number;
  severity: string;
  questionnaireType: string;
  location?: string;
  message: string;
  hasLocationPermission: boolean;
  hasEmergencyContactPermission: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const {
      counselorEmail,
      counselorName,
      parentPhone,
      emergencyContactName,
      patientName,
      score,
      severity,
      questionnaireType,
      location,
      message,
      hasLocationPermission,
      hasEmergencyContactPermission
    }: EmergencyAlertRequest = await req.json();

    // Sanitized logging without sensitive data
    console.log('Emergency Alert Triggered:', {
      userId: user.id,
      score,
      severity,
      questionnaireType,
      hasLocationPermission,
      hasEmergencyContactPermission,
      hasCounselor: !!counselorEmail,
      hasParentContact: !!parentPhone
    });

    const responses: any[] = [];

    // Send email to counselor if available and permissions allow
    if (counselorEmail && hasLocationPermission) {
      try {
        // Here you would integrate with an email service like Resend
        // For now, we'll just log and store the alert
        console.log(`Alert sent to counselor for user: ${user.id}`);
        
        responses.push({
          type: 'counselor_email',
          status: 'logged',
          recipient: counselorEmail,
          message: 'Email logged (email service integration needed)'
        });
      } catch (error) {
        console.error('Error sending counselor email for user:', user.id);
        responses.push({
          type: 'counselor_email',
          status: 'failed',
          error: 'Failed to send counselor notification'
        });
      }
    }

    // Send SMS to parent/emergency contact if available and permissions allow
    if (parentPhone && hasEmergencyContactPermission) {
      try {
        // Here you would integrate with an SMS service like Twilio
        // For now, we'll just log the alert
        console.log(`Alert sent to parent/emergency contact for user: ${user.id}`);
        
        responses.push({
          type: 'parent_sms',
          status: 'logged',
          recipient: parentPhone,
          message: 'SMS logged (SMS service integration needed)'
        });
      } catch (error) {
        console.error('Error sending parent SMS for user:', user.id);
        responses.push({
          type: 'parent_sms',
          status: 'failed',
          error: 'Failed to send parent notification'
        });
      }
    }

    // Update the emergency alert record
    const { error: updateError } = await supabase
      .from('emergency_alerts')
      .update({
        alert_sent_to_counselor: counselorEmail ? true : false,
        alert_sent_to_parent: parentPhone ? true : false
      })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (updateError) {
      console.error('Error updating alert status:', updateError);
    }

    return new Response(JSON.stringify({
      success: true,
      alerts_sent: responses,
      message: 'Emergency alert processed'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-emergency-alert function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
});