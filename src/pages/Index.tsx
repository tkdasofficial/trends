import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { AgeVerification } from '@/components/AgeVerification';
import { ProfileSetup } from '@/components/ProfileSetup';
import { ProfileCard } from '@/components/ProfileCard';
import { BottomNav } from '@/components/BottomNav';
import { ChatList, ChatView } from '@/components/ChatComponents';
import { ProfilePage } from '@/components/ProfilePage';
import { useOnboarding, useDiscovery } from '@/hooks/use-app';
import { MOCK_CHATS, ChatThread } from '@/lib/data';
import { Heart, Sparkles } from 'lucide-react';

type Tab = 'discover' | 'matches' | 'chat' | 'profile';

const Index = () => {
  const { step, setStep, dob, setDob, profile, setProfile, ageError, verifyAge, completeProfile } = useOnboarding();
  const { currentProfile, like, skip, matches, hasMore } = useDiscovery();
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);

  // Onboarding flow
  if (step === 'welcome') return <WelcomeScreen onGetStarted={() => setStep('age')} />;
  if (step === 'age') return <AgeVerification dob={dob} onDobChange={setDob} onVerify={verifyAge} error={ageError} />;
  if (step === 'profile') return <ProfileSetup profile={profile} onUpdate={setProfile} onComplete={completeProfile} />;

  // Chat view
  if (activeChat) {
    return <ChatView chat={activeChat} onBack={() => setActiveChat(null)} />;
  }

  const unreadCount = MOCK_CHATS.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top header */}
      <header className="flex items-center justify-between px-6 pt-6 pb-4">
        <h1 className="text-2xl font-extrabold text-gradient">Trends</h1>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      </header>

      {/* Tab content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'discover' && (
            <motion.div
              key="discover"
              className="px-6"
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
              className="px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="mb-4 text-lg font-bold text-foreground">Your Matches</h2>
              {matches.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <p className="text-muted-foreground">No matches yet. Keep swiping!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {matches.map(m => (
                    <motion.div
                      key={m.id}
                      className="overflow-hidden rounded-2xl bg-card shadow-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex h-32 items-center justify-center gradient-primary">
                        <span className="text-4xl font-bold text-primary-foreground/30">{m.name[0]}</span>
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-foreground text-sm">{m.name}, {m.age}</p>
                        <p className="text-xs text-muted-foreground">{m.distance}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
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
              <div className="px-6 pb-2">
                <h2 className="text-lg font-bold text-foreground">Messages</h2>
              </div>
              <ChatList chats={MOCK_CHATS} onSelect={setActiveChat} />
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
