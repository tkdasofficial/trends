import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { AgeVerification } from '@/components/AgeVerification';
import { ProfileSetup } from '@/components/ProfileSetup';
import { ProfileCard } from '@/components/ProfileCard';
import { BottomNav } from '@/components/BottomNav';
import { ChatList, ChatView } from '@/components/ChatComponents';
import { ChatProfilePage } from '@/components/ChatProfilePage';
import { ProfilePage } from '@/components/ProfilePage';
import { useOnboarding, useDiscovery } from '@/hooks/use-app';
import { MOCK_CHATS, MOCK_PROFILES, ChatThread } from '@/lib/data';
import { Heart, Sparkles, Search, X } from 'lucide-react';

type Tab = 'discover' | 'matches' | 'chat' | 'profile';

const Index = () => {
  const { step, setStep, dob, setDob, profile, setProfile, ageError, verifyAge, completeProfile } = useOnboarding();
  const { currentProfile, like, skip, matches, hasMore } = useDiscovery();
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const [viewingProfile, setViewingProfile] = useState<ChatThread | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = MOCK_CHATS.reduce((sum, c) => sum + c.unread, 0);

  // Search/filter logic for matches
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    return MOCK_PROFILES.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.uid.toLowerCase().includes(q) ||
      p.gender.toLowerCase().includes(q) ||
      (p.country && p.country.toLowerCase().includes(q)) ||
      (p.city && p.city.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q)) ||
      p.age.toString() === q ||
      p.interests.some(i => i.toLowerCase().includes(q))
    );
  }, [searchQuery]);

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
    <div className="flex min-h-screen flex-col bg-background">
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
              <h2 className="mb-3 text-lg font-bold text-foreground sm:mb-4">Find People</h2>

              {/* Search bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, UID, gender, city, age, interest..."
                  className="w-full rounded-xl border border-border bg-card pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Search results */}
              {searchResults !== null ? (
                searchResults.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Search className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">No users found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {searchResults.map(m => (
                      <motion.div
                        key={m.id}
                        className="overflow-hidden rounded-2xl bg-card shadow-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="flex h-28 items-center justify-center gradient-primary sm:h-32">
                          <span className="text-3xl font-bold text-primary-foreground/30 sm:text-4xl">{m.name[0]}</span>
                        </div>
                        <div className="p-2.5 sm:p-3">
                          <p className="font-semibold text-foreground text-xs sm:text-sm">{m.name}, {m.age}</p>
                          <p className="text-[10px] text-muted-foreground sm:text-xs">{m.city || m.distance}</p>
                          <p className="mt-0.5 text-[9px] font-mono text-muted-foreground">{m.uid}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              ) : (
                <>
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Your Matches</h3>
                  {matches.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <p className="text-muted-foreground">No matches yet. Keep swiping!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {matches.map(m => (
                        <motion.div
                          key={m.id}
                          className="overflow-hidden rounded-2xl bg-card shadow-card"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="flex h-28 items-center justify-center gradient-primary sm:h-32">
                            <span className="text-3xl font-bold text-primary-foreground/30 sm:text-4xl">{m.name[0]}</span>
                          </div>
                          <div className="p-2.5 sm:p-3">
                            <p className="font-semibold text-foreground text-xs sm:text-sm">{m.name}, {m.age}</p>
                            <p className="text-[10px] text-muted-foreground sm:text-xs">{m.distance}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
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
