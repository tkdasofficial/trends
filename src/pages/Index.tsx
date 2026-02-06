import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { AgeVerification } from '@/components/AgeVerification';
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
import { useOnboarding, useDiscovery } from '@/hooks/use-app';
import { MOCK_CHATS, ChatThread, UserProfile } from '@/lib/data';
import { Heart, Sparkles } from 'lucide-react';

type Tab = 'discover' | 'matches' | 'chat' | 'profile';
type SubPage = null | 'edit' | 'notifications' | 'privacy' | 'settings';

const Index = () => {
  const { step, setStep, dob, setDob, profile, setProfile, ageError, verifyAge, completeProfile } = useOnboarding();
  const { currentProfile, like, skip, matches, hasMore } = useDiscovery();
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [profileSubPage, setProfileSubPage] = useState<SubPage>(null);
  const [callingUser, setCallingUser] = useState<UserProfile | null>(null);

  const unreadCount = MOCK_CHATS.reduce((sum, c) => sum + c.unread, 0);

  // Onboarding flow
  if (step === 'welcome') return <WelcomeScreen onGetStarted={() => setStep('age')} />;
  if (step === 'age') return <AgeVerification dob={dob} onDobChange={setDob} onVerify={verifyAge} error={ageError} />;
  if (step === 'profile') return <ProfileSetup profile={profile} onUpdate={setProfile} onComplete={completeProfile} />;

  // Profile sub-pages
  if (profileSubPage === 'edit') return <EditProfilePage onBack={() => setProfileSubPage(null)} />;
  if (profileSubPage === 'notifications') return <NotificationsPage onBack={() => setProfileSubPage(null)} />;
  if (profileSubPage === 'privacy') return <PrivacySafetyPage onBack={() => setProfileSubPage(null)} />;
  if (profileSubPage === 'settings') return <SettingsPage onBack={() => setProfileSubPage(null)} />;

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

  // Profile view (from search, matches, or chat)
  if (viewingProfile) {
    return (
      <ChatProfilePage
        user={viewingProfile}
        onBack={() => setViewingProfile(null)}
        onMessage={() => {
          // Find existing chat or go back
          const existingChat = MOCK_CHATS.find(c => c.user.id === viewingProfile.id);
          setViewingProfile(null);
          if (existingChat) {
            setActiveChat(existingChat);
          } else {
            setActiveTab('chat');
          }
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
        <h1 className="text-xl font-extrabold text-gradient sm:text-2xl">Trends</h1>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 sm:h-9 sm:w-9">
          <Sparkles className="h-4 w-4 text-primary" />
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
                <ProfileCard profile={currentProfile} onLike={like} onSkip={skip} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">No more profiles</p>
                  <p className="text-sm text-muted-foreground">Check back later for new people!</p>
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
                chats={MOCK_CHATS}
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
                onLogout={() => setStep('welcome')}
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
