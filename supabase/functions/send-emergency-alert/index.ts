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

    console.log('Emergency alert triggered for:', patientName, 'Score:', score, 'Severity:', severity);

    const responses: any[] = [];

    // Send email to counselor if available and permissions allow
    if (counselorEmail && hasLocationPermission) {
      try {
        // Here you would integrate with an email service like Resend
        // For now, we'll just log and store the alert
        console.log(`Would send email to counselor: ${counselorEmail}`);
        console.log(`Subject: URGENT - Mental Health Emergency Alert for ${patientName}`);
        console.log(`Message: ${message}`);
        
        responses.push({
          type: 'counselor_email',
          status: 'logged',
          recipient: counselorEmail,
          message: 'Email logged (email service integration needed)'
        });
      } catch (error) {
        console.error('Error sending counselor email:', error);
        responses.push({
          type: 'counselor_email',
          status: 'failed',
          error: error.message
        });
      }
    }

    // Send SMS to parent/emergency contact if available and permissions allow
    if (parentPhone && hasEmergencyContactPermission) {
      try {
        // Here you would integrate with an SMS service like Twilio
        // For now, we'll just log the alert
        console.log(`Would send SMS to parent: ${parentPhone}`);
        console.log(`SMS Message: URGENT: Your child ${patientName} needs immediate mental health support. Score: ${score} (${severity}). Please contact them immediately.`);
        
        responses.push({
          type: 'parent_sms',
          status: 'logged',
          recipient: parentPhone,
          message: 'SMS logged (SMS service integration needed)'
        });
      } catch (error) {
        console.error('Error sending parent SMS:', error);
        responses.push({
          type: 'parent_sms',
          status: 'failed',
          error: error.message
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
      .eq('user_id', req.headers.get('user-id'))
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