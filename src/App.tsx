import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import PatientDashboard from "./pages/PatientDashboard";
import CounselorDashboard from "./pages/CounselorDashboard";
import NotFound from "./pages/NotFound";
import PermissionModal from "./components/PermissionModal";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function DashboardRouter() {
  const { profile, loading, user } = useAuth();
  const [showPermissions, setShowPermissions] = useState(false);
  const [hasCheckedPermissions, setHasCheckedPermissions] = useState(false);
  
  // Check if user has set permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (!user || hasCheckedPermissions) return;
      
      const { data } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!data && profile?.role === 'patient') {
        setShowPermissions(true);
      }
      setHasCheckedPermissions(true);
    };

    checkPermissions();
  }, [user, profile, hasCheckedPermissions]);
  
  if (loading || !hasCheckedPermissions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showPermissions) {
    return <PermissionModal onComplete={() => setShowPermissions(false)} />;
  }
  
  if (profile?.role === 'counselor' || profile?.role === 'admin') {
    return <CounselorDashboard />;
  }
  
  return <PatientDashboard />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
