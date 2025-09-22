import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { Brain, Heart, UserCheck, Stethoscope } from 'lucide-react';

export default function Auth() {
  const { user, signIn, signUp, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'patient' as 'patient' | 'counselor',
    parentPhone: '',
    emergencyContactName: '',
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      await signUp(formData.email, formData.password, formData.fullName, formData.role, formData.parentPhone, formData.emergencyContactName);
    } else {
      await signIn(formData.email, formData.password);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">MindWell</h1>
          </div>
          <p className="text-gray-600">Your mental wellness companion</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Join MindWell to start your wellness journey' 
                : 'Sign in to continue your wellness journey'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={isSignUp ? 'signup' : 'signin'} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="signin" 
                  onClick={() => setIsSignUp(false)}
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  onClick={() => setIsSignUp(true)}
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Heart className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Account Type</Label>
                    <RadioGroup 
                      value={formData.role} 
                      onValueChange={(value) => handleInputChange('role', value)}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="patient" id="patient" />
                        <Label htmlFor="patient" className="flex items-center gap-2 cursor-pointer flex-1">
                          <UserCheck className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="font-medium">Patient</div>
                            <div className="text-sm text-gray-500">Seek mental wellness support</div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="counselor" id="counselor" />
                        <Label htmlFor="counselor" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Stethoscope className="w-4 h-4 text-green-500" />
                          <div>
                            <div className="font-medium">Counselor</div>
                            <div className="text-sm text-gray-500">Provide mental health support</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Emergency Contact Information - Only for patients */}
                  {formData.role === 'patient' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                        <Input
                          id="emergencyContactName"
                          type="text"
                          placeholder="Parent/Guardian name"
                          value={formData.emergencyContactName}
                          onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parentPhone">Emergency Contact Phone</Label>
                        <Input
                          id="parentPhone"
                          type="tel"
                          placeholder="Parent/Guardian phone number"
                          value={formData.parentPhone}
                          onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}

                  <Button type="submit" className="w-full">
                    <Heart className="w-4 h-4 mr-2" />
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}