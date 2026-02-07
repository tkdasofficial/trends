import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { AuthPage } from '@/components/AuthPage';
import { ProfileSetup } from '@/components/ProfileSetup';
import { ProfileCard } from '@/components/ProfileCard';
import { BottomNav } from '@/components/BottomNav';
import { ChatList } from '@/components/ChatList';
import { ChatView } from '@/components/ChatView';
import { ChatProfilePage } from '@/components/ChatProfilePage';
import { ProfilePage } from '@/components/ProfilePage';
import { MatchesSearch } from '@/components/MatchesSearch';
import { EditProfilePage } from '@/components/EditProfilePage';
import { NotificationsPage } from '@/components/NotificationsPage';
import { PrivacySafetyPage } from '@/components/PrivacySafetyPage';
import { SettingsPage } from '@/components/SettingsPage';
import { AudioCallPage } from '@/components/AudioCallPage';
import { UpgradePage } from '@/components/UpgradePage';
import { AdminPanel, isAdmin } from '@/components/AdminPanel';
import { TrendsLogo } from '@/components/TrendsLogo';
import { useDiscovery } from '@/hooks/use-app';
import { useUserStore } from '@/hooks/useUserStore';
import { ChatThread, UserProfile } from '@/lib/data';
import { Heart, ShieldCheck } from 'lucide-react';

type AppStep = 'welcome' | 'auth' | 'profile-setup' | 'done';
type Tab = 'discover' | 'matches' | 'chat' | 'profile';
type SubPage = null | 'edit' | 'notifications' | 'privacy' | 'settings' | 'upgrade' | 'admin';

const Index = () => {
  const [step, setStep] = useState<AppStep>('welcome');
  const { user, updateUser, clearUser } = useUserStore();
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    gender: '',
    bio: '',
    interests: [],
  });

  const { currentProfile, like, skip, matches, hasMore } = useDiscovery();
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [profileSubPage, setProfileSubPage] = useState<SubPage>(null);
  const [callingUser, setCallingUser] = useState<UserProfile | null>(null);
  const [chats] = useState<ChatThread[]>([]);

  const unreadCount = chats.reduce((sum, c) => sum + c.unread, 0);

  // Onboarding flow
  if (step === 'welcome') return <WelcomeScreen onGetStarted={() => setStep('auth')} />;
  if (step === 'auth') {
    return (
      <AuthPage
        onAuthSuccess={(authUser) => {
          updateUser({
            name: authUser.name,
            email: authUser.email,
            phone: authUser.phone || '',
            dob: authUser.dob || '',
          });
          setProfile(prev => ({ ...prev, name: authUser.name }));
          setStep('profile-setup');
        }}
      />
    );
  }
  if (step === 'profile-setup') {
    return (
      <ProfileSetup
        profile={profile}
        onUpdate={(p) => {
          setProfile(p);
          updateUser({
            name: p.name || user.name,
            gender: p.gender || '',
            bio: p.bio || '',
            interests: p.interests || [],
          });
        }}
        onComplete={() => setStep('done')}
      />
    );
  }

  // Profile sub-pages
  if (profileSubPage === 'edit') {
    return (
      <EditProfilePage
        onBack={() => setProfileSubPage(null)}
        userData={user}
        onSave={(data) => updateUser(data)}
      />
    );
  }
  if (profileSubPage === 'notifications') return <NotificationsPage onBack={() => setProfileSubPage(null)} />;
  if (profileSubPage === 'privacy') return <PrivacySafetyPage onBack={() => setProfileSubPage(null)} />;
  if (profileSubPage === 'settings') return <SettingsPage onBack={() => setProfileSubPage(null)} />;
  if (profileSubPage === 'upgrade') return <UpgradePage onBack={() => setProfileSubPage(null)} />;
  if (profileSubPage === 'admin') {
    return <AdminPanel onBack={() => setProfileSubPage(null)} adminEmail={user.email} />;
  }

  // Audio call page
  if (callingUser) {
    return (
      <AudioCallPage
        user={callingUser}
        direction="outgoing"
        onEnd={() => setCallingUser(null)}
      />
    );
  }

  // Profile view
  if (viewingProfile) {
    return (
      <ChatProfilePage
        user={viewingProfile}
        onBack={() => setViewingProfile(null)}
        onMessage={() => {
          setViewingProfile(null);
          setActiveTab('chat');
        }}
        onCall={() => {
          setViewingProfile(null);
          setCallingUser(viewingProfile);
        }}
      />
    );
  }

  // Chat view
  if (activeChat) {
    return (
      <ChatView
        chat={activeChat}
        onBack={() => setActiveChat(null)}
        onViewProfile={() => setViewingProfile(activeChat.user)}
      />
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Top header */}
      <header className="flex items-center justify-between px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
        <TrendsLogo size={32} showText textClassName="text-lg" />
        <div className="flex items-center gap-2">
          {isAdmin(user.email) && (
            <button
              onClick={() => setProfileSubPage('admin')}
              className="flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive transition-all hover:bg-destructive/20 active:scale-95"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </button>
          )}
          <button
            onClick={() => setProfileSubPage('upgrade')}
            className="rounded-full gradient-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-soft transition-all hover:opacity-90 active:scale-95"
          >
            Upgrade
          </button>
        </div>
      </header>

      {/* Tab content */}
      <main className="flex-1 overflow-y-auto pb-20 sm:pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'discover' && (
            <motion.div
              key="discover"
              className="px-4 sm:px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {hasMore && currentProfile ? (
                <ProfileCard
                  profile={currentProfile}
                  onLike={like}
                  onSkip={skip}
                  onTap={() => setViewingProfile(currentProfile)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">No profiles available</p>
                  <p className="text-sm text-muted-foreground mt-1">New users will appear here as they join</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'matches' && (
            <motion.div
              key="matches"
              className="px-4 sm:px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MatchesSearch
                matches={matches}
                onViewProfile={(p) => setViewingProfile(p)}
              />
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              className="flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="px-4 pb-2 sm:px-6">
                <h2 className="text-lg font-bold text-foreground">Messages</h2>
              </div>
              <ChatList
                chats={chats}
                onSelect={setActiveChat}
                onViewProfile={(chat) => setViewingProfile(chat.user)}
              />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProfilePage
                onNavigate={setProfileSubPage}
                onLogout={() => {
                  clearUser();
                  setStep('welcome');
                }}
                userData={user}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} unreadCount={unreadCount} />
    </div>
  );
};

export default Index;
