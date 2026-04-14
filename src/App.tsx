import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './screens/Login';
import Register from './screens/Register';
import AthleteDashboard from './screens/athlete/Dashboard';
import DailyTraining from './screens/athlete/DailyTraining';
import DailyCheckIn from './screens/athlete/DailyCheckIn';
import PerformanceAnalytics from './screens/athlete/PerformanceAnalytics';
import AthleteProfile from './screens/athlete/Profile';
import PhysioDashboard from './screens/physio/Dashboard';
import AthletesList from './screens/physio/AthletesList';
import PhysioAthleteProfile from './screens/physio/AthleteProfile';
import ProgramBuilder from './screens/physio/ProgramBuilder';
import AnamnesisReport from './screens/physio/reports/AnamnesisReport';
import AnamnesisWizard from './screens/athlete/anamnesis/AnamnesisWizard';
import PhysioOnboarding from './screens/physio/PhysioOnboarding';
import EditProfile from './screens/athlete/EditProfile';
import ClubsList from './screens/physio/ClubsList';
import ClubDetail from './screens/physio/ClubDetail';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'athlete' | 'physio' | null>(null);
  const SCREENS_NO_PERSIST = ['onboarding', 'physio-onboarding'];

  const [currentScreen, setCurrentScreen] = useState(() => {
    const saved = sessionStorage.getItem('currentScreen');
    return saved && !SCREENS_NO_PERSIST.includes(saved) ? saved : 'athlete-dashboard';
  });
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | undefined>(
    () => sessionStorage.getItem('selectedAthleteId') || undefined
  );
  const [selectedClubId, setSelectedClubId] = useState<string | undefined>(
    () => sessionStorage.getItem('selectedClubId') || undefined
  );
  const [loading, setLoading] = useState(true);

  const navigate = (screen: string, id?: string) => {
    if (id) {
      if (screen === 'club-detail') {
        setSelectedClubId(id);
        sessionStorage.setItem('selectedClubId', id);
      } else {
        setSelectedAthleteId(id);
        sessionStorage.setItem('selectedAthleteId', id);
      }
    }
    setCurrentScreen(screen);
    if (!SCREENS_NO_PERSIST.includes(screen)) {
      sessionStorage.setItem('currentScreen', screen);
    }
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    // Listen for auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setRole(null);
        sessionStorage.removeItem('currentScreen');
        sessionStorage.removeItem('selectedAthleteId');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, forcedRole?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Profile fetch error:", error);
      const fallbackRole = forcedRole || (user?.user_metadata?.role as 'athlete' | 'physio') || 'athlete';
      setRole(fallbackRole);

      if (fallbackRole === 'physio') {
        setCurrentScreen('physio-onboarding');
      } else {
        setCurrentScreen('athlete-dashboard');
      }
    } else {
      let effectiveRole = (forcedRole || data.role) as 'athlete' | 'physio';

      // Override if auth metadata has a different role and we didn't force one
      if (!forcedRole && user?.user_metadata?.role && user.user_metadata.role !== data.role) {
        effectiveRole = user.user_metadata.role as 'athlete' | 'physio';
      }

      // Sync the true role to the DB if there is a mismatch
      if (effectiveRole !== data.role) {
        supabase.from('profiles').update({ role: effectiveRole }).eq('id', userId).then();
      }

      setRole(effectiveRole);

      // Check if profile is incomplete (assuming athletes need age/weight, physios need specialty)
      if (effectiveRole === 'athlete' && (!data.age || !data.weight)) {
        setCurrentScreen('onboarding');
      } else if (effectiveRole === 'physio' && !data.specialty) {
        setCurrentScreen('physio-onboarding');
      } else {
        setCurrentScreen(effectiveRole === 'physio' ? 'physio-dashboard' : 'athlete-dashboard');
      }
    }
    setLoading(false);
  };

  const handleLogin = (user: any, userRole?: string) => {
    setSession({ user });
    if (user.id.startsWith('mock-')) {
      setRole(userRole as 'athlete' | 'physio');
      if (userRole === 'athlete') {
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen('physio-onboarding'); // Mock test physio onboarding
      }
    } else {
      fetchProfile(user.id, userRole);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    if (authScreen === 'register') {
      return <Register onNavigateToLogin={() => setAuthScreen('login')} onRegisterSuccess={handleLogin} />;
    }
    return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthScreen('register')} />;
  }

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 font-display selection:bg-primary/30 antialiased overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {currentScreen === 'onboarding' && <AnamnesisWizard userId={session?.user?.id} onComplete={() => fetchProfile(session.user.id)} />}
        {currentScreen === 'physio-onboarding' && <PhysioOnboarding userId={session?.user?.id} onComplete={() => fetchProfile(session.user.id)} />}
        {currentScreen === 'edit-profile' && <EditProfile navigate={navigate} />}
        {currentScreen === 'athlete-dashboard' && <AthleteDashboard navigate={navigate} />}
        {currentScreen === 'daily-training' && <DailyTraining navigate={navigate} />}
        {currentScreen === 'daily-checkin' && <DailyCheckIn navigate={navigate} />}
        {currentScreen === 'performance-analytics' && <PerformanceAnalytics navigate={navigate} />}
        {currentScreen === 'athlete-profile' && <AthleteProfile navigate={navigate} />}

        {currentScreen === 'physio-dashboard' && <PhysioDashboard navigate={navigate} />}
        {currentScreen === 'athletes-list' && <AthletesList navigate={navigate} />}
        {currentScreen === 'physio-athlete-profile' && <PhysioAthleteProfile navigate={navigate} athleteId={selectedAthleteId} />}
        {currentScreen === 'program-builder' && <ProgramBuilder navigate={navigate} />}
        {currentScreen === 'anamnesis-report' && <AnamnesisReport navigate={navigate} athleteId={selectedAthleteId} />}
        {currentScreen === 'clubs-list' && <ClubsList navigate={navigate} />}
        {currentScreen === 'club-detail' && selectedClubId && <ClubDetail navigate={navigate} clubId={selectedClubId} />}
      </div>
    </div>
  );
}
