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
import { SupportPage } from '@/components/SupportPage';
import { TermsPage } from '@/components/TermsPage';
import { TrendsLogo } from '@/components/TrendsLogo';
import { useDiscovery } from '@/hooks/use-app';
import { useUserStore } from '@/hooks/useUserStore';
import { useAuth } from '@/hooks/useAuth';
import { useFirebaseChat } from '@/hooks/useFirebaseChat';
import { ChatThread, UserProfile } from '@/lib/data';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { Heart, ShieldCheck, Loader2, MailWarning, RefreshCw, Search, X } from 'lucide-react';

type Tab = 'discover' | 'matches' | 'chat' | 'profile';
type SubPage = null | 'edit' | 'notifications' | 'privacy' | 'settings' | 'upgrade' | 'admin' | 'support' | 'terms' | 'privacy-policy';

const Index = () => {
  const { firebaseUser, loading: authLoading, isNewUser, profileComplete, emailVerified, logout, markProfileComplete, refreshEmailVerification } = useAuth();
  const { user, updateUser, clearUser, loaded: userLoaded } = useUserStore();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const { currentProfile, like, skip, matches, hasMore, loading: discoverLoading, refresh: refreshDiscover, searchByUID, searchResult, searchLoading, searchError, clearSearch } = useDiscovery(user.genderPreference);
  const { chats, startChat } = useFirebaseChat();
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [profileSubPage, setProfileSubPage] = useState<SubPage>(null);
  const [callingUser, setCallingUser] = useState<UserProfile | null>(null);
  const [uidSearch, setUidSearch] = useState('');

  const unreadCount = chats.reduce((sum, c) => sum + c.unread, 0);

  // Pre-fill user data from Firebase Auth
  useEffect(() => {
    if (firebaseUser && !user.email) {
      updateUser({
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
      });
    }
  }, [firebaseUser]);

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

  // Not logged in
  if (!firebaseUser) {
    if (showAuth) {
      return (
        <AuthPage
          onAuthSuccess={(authUser) => {
            updateUser({ name: authUser.name, email: authUser.email, phone: authUser.phone || '', dob: authUser.dob || '' });
          }}
          isSignup={() => {}}
        />
      );
    }
    return <WelcomeScreen onGetStarted={() => setShowAuth(true)} />;
  }

  // New user → profile setup
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
        onGenderPreference={(pref) => {
          updateUser({ genderPreference: pref });
        }}
        onComplete={async () => {
          try {
            await setDoc(doc(db, 'users', firebaseUser.uid), { profileComplete: true }, { merge: true });
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

  // Sub-pages
  if (profileSubPage === 'edit') {
    return (
      <EditProfilePage onBack={() => setProfileSubPage(null)} userData={user}
        onSave={(data) => { updateUser(data); refreshDiscover(); }} />
    );
  }
  if (profileSubPage === 'notifications') return <NotificationsPage onBack={() => setProfileSubPage(null)} />;
  if (profileSubPage === 'privacy') return <PrivacySafetyPage onBack={() => setProfileSubPage(null)} />;
  if (profileSubPage === 'settings') return <SettingsPage onBack={() => setProfileSubPage(null)} />;
  if (profileSubPage === 'upgrade') return <UpgradePage onBack={() => setProfileSubPage(null)} />;
  if (profileSubPage === 'support') return <SupportPage onBack={() => setProfileSubPage(null)} />;
  if (profileSubPage === 'terms') return <TermsPage onBack={() => setProfileSubPage(null)} page="terms" />;
  if (profileSubPage === 'privacy-policy') return <TermsPage onBack={() => setProfileSubPage(null)} page="privacy-policy" />;
  if (profileSubPage === 'admin') {
    return <AdminPanel onBack={() => setProfileSubPage(null)} adminEmail={user.email} />;
  }

  // Audio call
  if (callingUser) {
    return (
      <AudioCallPage user={callingUser} direction="outgoing" onEnd={() => setCallingUser(null)} />
    );
  }

  // Profile view
  if (viewingProfile) {
    return (
      <ChatProfilePage
        user={viewingProfile}
        onBack={() => setViewingProfile(null)}
        onMessage={async () => {
          const chatId = await startChat(viewingProfile.id);
          if (chatId) {
            const thread: ChatThread = {
              id: chatId,
              user: viewingProfile,
              lastMessage: '',
              lastMessageTime: new Date(),
              unread: 0,
            };
            setActiveChat(thread);
            setViewingProfile(null);
            setActiveTab('chat');
          }
        }}
        onCall={() => {
          setCallingUser(viewingProfile);
          setViewingProfile(null);
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
        onCall={() => {
          setCallingUser(activeChat.user);
          setActiveChat(null);
        }}
      />
    );
  }

  const handleUIDSearch = () => {
    if (uidSearch.trim()) {
      searchByUID(uidSearch.trim());
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Email verification banner */}
      {firebaseUser && !emailVerified && (
        <div className="mx-4 mt-2 flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-3 text-sm">
          <MailWarning className="h-4 w-4 shrink-0 text-amber-600" />
          <span className="flex-1 text-amber-700 dark:text-amber-400">Verify your email to unlock the verification badge.</span>
          <button onClick={async () => {
            if (firebaseUser) { try { await sendEmailVerification(firebaseUser); } catch {} }
          }} className="text-xs font-semibold text-amber-600 hover:underline whitespace-nowrap">Resend</button>
          <button onClick={refreshEmailVerification} className="text-amber-600 hover:text-amber-700">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
        <TrendsLogo size={32} showText textClassName="text-lg" />
        <div className="flex items-center gap-2">
          {isAdmin(user.email) && (
            <button onClick={() => setProfileSubPage('admin')}
              className="flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive transition-all hover:bg-destructive/20 active:scale-95">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </button>
          )}
          <button onClick={() => setProfileSubPage('upgrade')}
            className="rounded-full gradient-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-soft transition-all hover:opacity-90 active:scale-95">
            Upgrade
          </button>
        </div>
      </header>

      {/* Tab content */}
      <main className="flex-1 overflow-y-auto pb-20 sm:pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'discover' && (
            <motion.div key="discover" className="px-4 sm:px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* UID Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={uidSearch}
                  onChange={(e) => setUidSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUIDSearch()}
                  placeholder="Search by UID (e.g. TR-A1B2C3D4E5F6)"
                  className="w-full rounded-xl border border-border bg-card pl-9 pr-20 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {(uidSearch || searchResult || searchError) && (
                    <button onClick={() => { setUidSearch(''); clearSearch(); }} className="p-1 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={handleUIDSearch} disabled={searchLoading || !uidSearch.trim()}
                    className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50">
                    {searchLoading ? '...' : 'Search'}
                  </button>
                </div>
              </div>

              {/* Search result */}
              {searchError && (
                <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive text-center">
                  {searchError}
                </div>
              )}
              {searchResult && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Search Result</p>
                  <button onClick={() => setViewingProfile(searchResult)}
                    className="w-full flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card text-left">
                    {searchResult.avatar ? (
                      <img src={searchResult.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-lg font-bold text-primary-foreground">
                        {searchResult.name[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{searchResult.name}{searchResult.age ? `, ${searchResult.age}` : ''}</p>
                      <p className="text-xs text-muted-foreground font-mono">{searchResult.uid}</p>
                    </div>
                  </button>
                </div>
              )}

              {discoverLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground">Finding people...</p>
                </div>
              ) : hasMore && currentProfile ? (
                <ProfileCard profile={currentProfile} onLike={like} onSkip={skip} onTap={() => setViewingProfile(currentProfile)} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">No profiles available</p>
                  <p className="text-sm text-muted-foreground mt-1">New users will appear here as they join</p>
                  <button onClick={refreshDiscover}
                    className="mt-4 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                    Refresh
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'matches' && (
            <motion.div key="matches" className="px-4 sm:px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MatchesSearch matches={matches} onViewProfile={(p) => setViewingProfile(p)} />
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div key="chat" className="flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="px-4 pb-2 sm:px-6">
                <h2 className="text-lg font-bold text-foreground">Messages</h2>
              </div>
              <ChatList chats={chats} onSelect={setActiveChat} onViewProfile={(chat) => setViewingProfile(chat.user)} />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProfilePage
                onNavigate={setProfileSubPage}
                onLogout={async () => { await logout(); clearUser(); }}
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
