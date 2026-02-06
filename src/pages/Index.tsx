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
import { useOnboarding, useDiscovery } from '@/hooks/use-app';
import { MOCK_CHATS, ChatThread } from '@/lib/data';
import { Heart, Sparkles } from 'lucide-react';

type Tab = 'discover' | 'matches' | 'chat' | 'profile';

const Index = () => {
  const { step, setStep, dob, setDob, profile, setProfile, ageError, verifyAge, completeProfile } = useOnboarding();
  const { currentProfile, like, skip, matches, hasMore } = useDiscovery();
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const [viewingProfile, setViewingProfile] = useState<ChatThread | null>(null);

  const unreadCount = MOCK_CHATS.reduce((sum, c) => sum + c.unread, 0);

  // Onboarding flow
  if (step === 'welcome') return <WelcomeScreen onGetStarted={() => setStep('age')} />;
  if (step === 'age') return <AgeVerification dob={dob} onDobChange={setDob} onVerify={verifyAge} error={ageError} />;
  if (step === 'profile') return <ProfileSetup profile={profile} onUpdate={setProfile} onComplete={completeProfile} />;

  // Chat profile view
  if (viewingProfile) {
    return <ChatProfilePage user={viewingProfile.user} onBack={() => setViewingProfile(null)} />;
  }

  // Chat view
  if (activeChat) {
    return (
      <ChatView
        chat={activeChat}
        onBack={() => setActiveChat(null)}
        onViewProfile={() => setViewingProfile(activeChat)}
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
              <MatchesSearch matches={matches} />
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
                onViewProfile={(chat) => setViewingProfile(chat)}
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
              <ProfilePage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} unreadCount={unreadCount} />
    </div>
  );
};

export default Index;
