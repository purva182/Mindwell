import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EmergencyAlertSystemProps {
  score: number;
  severity: string;
  questionnaireType: string;
}

export default function EmergencyAlertSystem({ score, severity, questionnaireType }: EmergencyAlertSystemProps) {
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user || !profile) return;
    
    // Check if score indicates high risk (Moderately Severe or Severe)
    const isHighRisk = severity === 'Moderately Severe' || severity === 'Severe';
    
    if (isHighRisk) {
      handleEmergencyAlert();
    }
  }, [score, severity, questionnaireType, user, profile]);

  const handleEmergencyAlert = async () => {
    if (!user || !profile) return;

    try {
      // Get user permissions
      const { data: permissions } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get user location if permission granted
      let userLocation = '';
      if (permissions?.location_permission) {
        const encryptedLocation = localStorage.getItem('userLocation');
        const expiry = localStorage.getItem('userLocationExpiry');
        
        if (encryptedLocation && expiry && Date.now() < parseInt(expiry)) {
          try {
            // Decrypt the location data
            const decrypted = atob(encryptedLocation);
            const [location] = decrypted.split('|');
            userLocation = location;
          } catch (error) {
            console.error('Error decrypting location data');
            // Clean up corrupted data
            localStorage.removeItem('userLocation');
            localStorage.removeItem('userLocationExpiry');
          }
        } else {
          // Clean up expired data
          localStorage.removeItem('userLocation');
          localStorage.removeItem('userLocationExpiry');
        }
      }

      // Get counselor information
      const { data: counselorRelation } = await supabase
        .from('counselor_patients')
        .select('counselor_id')
        .eq('patient_id', user.id)
        .eq('is_active', true)
        .single();

      let counselorEmail = '';
      let counselorName = '';
      
      if (counselorRelation?.counselor_id) {
        const { data: counselorProfile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('user_id', counselorRelation.counselor_id)
          .single();
        
        counselorEmail = counselorProfile?.email || '';
        counselorName = counselorProfile?.full_name || '';
      }

      // Create alert message
      const alertMessage = `URGENT: ${profile.full_name || user.email} has scored ${score} (${severity}) on ${questionnaireType}. ${userLocation ? `Location: ${userLocation}` : 'Location not available.'} Please provide immediate support.`;

      // Save emergency alert to database
      const { error: alertError } = await supabase
        .from('emergency_alerts')
        .insert({
          user_id: user.id,
          questionnaire_type: questionnaireType,
          total_score: score,
          severity_level: severity,
          counselor_email: counselorEmail,
          parent_phone: profile.parent_phone,
          user_location: userLocation,
          alert_message: alertMessage
        });

      if (alertError) {
        console.error('Error saving emergency alert:', alertError);
        return;
      }

      // Send alert via edge function
      const { error: sendError } = await supabase.functions.invoke('send-emergency-alert', {
        body: {
          counselorEmail,
          counselorName,
          parentPhone: profile.parent_phone,
          emergencyContactName: profile.emergency_contact_name,
          patientName: profile.full_name || user.email,
          score,
          severity,
          questionnaireType,
          location: userLocation,
          message: alertMessage,
          hasLocationPermission: permissions?.location_permission || false,
          hasEmergencyContactPermission: permissions?.emergency_contact_permission || false
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (sendError) {
        console.error('Error sending emergency alert:', sendError);
      }

    } catch (error) {
      console.error('Error in emergency alert system:', error);
    }
  };

  return null; // This component doesn't render anything
}