import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MapPin, Shield, Phone, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface PermissionModalProps {
  onComplete: () => void;
}

export default function PermissionModal({ onComplete }: PermissionModalProps) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState({
    location: false,
    dataSharing: false,
    emergencyContact: false
  });
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user's location if permission is granted
  const requestLocation = () => {
    if (navigator.geolocation && permissions.location) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation(`${latitude},${longitude}`);
        },
        (error) => {
          console.error('Error getting location');
          toast({
            title: "Location Error",
            description: "Could not get your current location.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handlePermissionChange = (type: string, value: boolean) => {
    setPermissions(prev => ({ ...prev, [type]: value }));
    
    if (type === 'location' && value) {
      requestLocation();
    }
  };

  const savePermissions = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: user.id,
          location_permission: permissions.location,
          data_sharing_permission: permissions.dataSharing,
          emergency_contact_permission: permissions.emergencyContact
        });

      if (error) throw error;

      // Store encrypted location in localStorage if permission granted
      if (permissions.location && currentLocation) {
        // Simple encryption using btoa (base64) - in production, use proper encryption
        const encryptedLocation = btoa(currentLocation + '|' + Date.now());
        localStorage.setItem('userLocation', encryptedLocation);
        
        // Set expiration (24 hours)
        localStorage.setItem('userLocationExpiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
      } else {
        // Clean up location data if permission not granted
        localStorage.removeItem('userLocation');
        localStorage.removeItem('userLocationExpiry');
      }

      toast({
        title: "Permissions saved",
        description: "Your privacy preferences have been updated.",
      });

      onComplete();
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      toast({
        title: "Error",
        description: "Failed to save permissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Privacy & Permissions
          </CardTitle>
          <p className="text-muted-foreground">
            To provide you with the best care, we'd like your permission for the following:
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location Permission */}
          <Card className="p-4">
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-blue-500 mt-1" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="location" className="text-base font-medium">
                    Location Access
                  </Label>
                  <Switch
                    id="location"
                    checked={permissions.location}
                    onCheckedChange={(checked) => handlePermissionChange('location', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Allow access to your location for emergency situations when you need immediate help.
                </p>
                {permissions.location && (
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <AlertTriangle className="w-3 h-3" />
                    Your location will only be shared in case of emergency (severe assessment scores)
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Data Sharing Permission */}
          <Card className="p-4">
            <div className="flex items-start gap-4">
              <Shield className="w-5 h-5 text-green-500 mt-1" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dataSharing" className="text-base font-medium">
                    Data Sharing with Counselors
                  </Label>
                  <Switch
                    id="dataSharing"
                    checked={permissions.dataSharing}
                    onCheckedChange={(checked) => handlePermissionChange('dataSharing', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Allow your assessment results and journal entries to be shared with assigned counselors for better care.
                </p>
              </div>
            </div>
          </Card>

          {/* Emergency Contact Permission */}
          <Card className="p-4">
            <div className="flex items-start gap-4">
              <Phone className="w-5 h-5 text-red-500 mt-1" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emergencyContact" className="text-base font-medium">
                    Emergency Contact Alerts
                  </Label>
                  <Switch
                    id="emergencyContact"
                    checked={permissions.emergencyContact}
                    onCheckedChange={(checked) => handlePermissionChange('emergencyContact', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Allow us to contact your emergency contact (parent/guardian) if your assessment indicates severe risk.
                </p>
                {permissions.emergencyContact && (
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <AlertTriangle className="w-3 h-3" />
                    Emergency contacts will be notified only in critical situations
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Important:</strong> These permissions help us provide better mental health support. 
                You can change these settings anytime in your profile. Emergency alerts are only sent when 
                assessment scores indicate severe or moderately severe symptoms.
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={onComplete}
              className="flex-1"
            >
              Skip for now
            </Button>
            <Button 
              onClick={savePermissions}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}