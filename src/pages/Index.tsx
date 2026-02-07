import { useState, useEffect } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { ChatThread, UserProfile } from '@/lib/data';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { Heart, ShieldCheck, Loader2, MailWarning, RefreshCw } from 'lucide-react';

type Tab = 'discover' | 'matches' | 'chat' | 'profile';
type SubPage = null | 'edit' | 'notifications' | 'privacy' | 'settings' | 'upgrade' | 'admin';

const Index = () => {
  const { firebaseUser, loading: authLoading, isNewUser, profileComplete, emailVerified, logout, markProfileComplete, refreshEmailVerification } = useAuth();
  const { user, updateUser, clearUser, loaded: userLoaded } = useUserStore();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const { currentProfile, like, skip, matches, hasMore } = useDiscovery();
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [profileSubPage, setProfileSubPage] = useState<SubPage>(null);
  const [callingUser, setCallingUser] = useState<UserProfile | null>(null);
  const [chats] = useState<ChatThread[]>([]);

  const unreadCount = chats.reduce((sum, c) => sum + c.unread, 0);

  // Pre-fill user data from Firebase Auth when authenticated
  useEffect(() => {
    if (firebaseUser && !user.email) {
      updateUser({
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
      });
    }
  }, [firebaseUser]);

  // Show loading spinner while auth state is resolving
  if (authLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in: show Welcome or Auth
  if (!firebaseUser) {
    if (showAuth) {
      return (
        <AuthPage
          onAuthSuccess={(authUser) => {
            updateUser({
              name: authUser.name,
              email: authUser.email,
              phone: authUser.phone || '',
              dob: authUser.dob || '',
            });
          }}
          isSignup={(isNew) => {
            // isNew is true for signups — they need profile setup
          }}
        />
      );
    }
    return <WelcomeScreen onGetStarted={() => setShowAuth(true)} />;
  }

  // Logged in but new user: show profile setup
  if (isNewUser && !profileComplete) {
    return (
      <ProfileSetup
        profile={{
          name: user.name || firebaseUser.displayName || '',
          gender: user.gender,
          bio: user.bio,
          interests: user.interests,
        }}
        onUpdate={(p) => {
          updateUser({
            name: p.name || user.name,
            gender: p.gender || '',
            bio: p.bio || '',
            interests: p.interests || [],
          });
        }}
        onComplete={async () => {
          // Mark profile as complete in Firestore
          try {
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              profileComplete: true,
            }, { merge: true });
            localStorage.setItem(`trends_profile_complete_${firebaseUser.uid}`, 'true');
          } catch (err) {
            console.error('Failed to mark profile complete:', err);
            localStorage.setItem(`trends_profile_complete_${firebaseUser.uid}`, 'true');
          }
          updateUser({ profileComplete: true });
          markProfileComplete();
        }}
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
      {/* Email verification banner */}
      {firebaseUser && !emailVerified && (
        <div className="mx-4 mt-2 flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-3 text-sm">
          <MailWarning className="h-4 w-4 shrink-0 text-amber-600" />
          <span className="flex-1 text-amber-700 dark:text-amber-400">Verify your email to unlock the verification badge.</span>
          <button onClick={async () => {
            if (firebaseUser) {
              try { await sendEmailVerification(firebaseUser); } catch {}
            }
          }} className="text-xs font-semibold text-amber-600 hover:underline whitespace-nowrap">Resend</button>
          <button onClick={refreshEmailVerification} className="text-amber-600 hover:text-amber-700">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

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
                onLogout={async () => {
                  await logout();
                  clearUser();
                }}
                userData={user}
                emailVerified={emailVerified}
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
