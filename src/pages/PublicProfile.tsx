import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/lib/data';
import { MapPin, Copy, Check, Loader2, UserX } from 'lucide-react';
import { TrendsLogo } from '@/components/TrendsLogo';
import { motion } from 'framer-motion';

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!username) { setNotFound(true); setLoading(false); return; }

    const fetchProfile = async () => {
      try {
        // Search by name (case-insensitive match via lowercase)
        const nameQuery = username.replace(/-/g, ' ').replace(/_/g, ' ');

        // First try exact UID match (TR-XXXX format)
        if (nameQuery.startsWith('TR-') || nameQuery.startsWith('tr-')) {
          const q = query(collection(db, 'users'), where('uid', '==', nameQuery.toUpperCase()), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const d = snap.docs[0].data();
            setProfile({
              id: snap.docs[0].id,
              uid: d.uid || '',
              name: d.name || 'User',
              age: d.dob ? calculateAge(d.dob) : 0,
              gender: d.gender || '',
              bio: d.bio || '',
              interests: d.interests || [],
              avatar: d.profileImage || '',
              location: d.city ? `${d.city}${d.country ? ', ' + d.country : ''}` : '',
              city: d.city || '',
              country: d.country || '',
            });
            setLoading(false);
            return;
          }
        }

        // Search by name
        const q = query(
          collection(db, 'users'),
          where('profileComplete', '==', true),
          limit(100)
        );
        const snap = await getDocs(q);
        const lowerSearch = nameQuery.toLowerCase();
        
        for (const docSnap of snap.docs) {
          const d = docSnap.data();
          const userName = (d.name || '').toLowerCase().replace(/\s+/g, '');
          const searchName = lowerSearch.replace(/\s+/g, '');
          if (userName === searchName) {
            setProfile({
              id: docSnap.id,
              uid: d.uid || '',
              name: d.name || 'User',
              age: d.dob ? calculateAge(d.dob) : 0,
              gender: d.gender || '',
              bio: d.bio || '',
              interests: d.interests || [],
              avatar: d.profileImage || '',
              location: d.city ? `${d.city}${d.country ? ', ' + d.country : ''}` : '',
              city: d.city || '',
              country: d.country || '',
            });
            setLoading(false);
            return;
          }
        }

        setNotFound(true);
      } catch (err) {
        console.error('Failed to fetch public profile:', err);
        setNotFound(true);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [username]);

  const copyUID = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6">
        <UserX className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          The user @{username} doesn't exist or hasn't completed their profile.
        </p>
        <a href="/" className="rounded-xl gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft">
          Go to Trends
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Header */}
      <div className="relative gradient-hero px-4 pb-16 pt-8 sm:px-6">
        <div className="flex items-center justify-between">
          <TrendsLogo size={28} showText textClassName="text-sm text-primary-foreground" />
          <a href="/" className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-primary-foreground backdrop-blur-sm hover:bg-white/30 transition-colors">
            Join Trends
          </a>
        </div>
      </div>

      {/* Profile card */}
      <div className="px-4 -mt-10 sm:px-6">
        <motion.div
          className="mx-auto max-w-lg rounded-3xl bg-card pt-16 pb-6 px-6 shadow-card text-center relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 -top-12">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name}
                className="h-24 w-24 rounded-full object-cover border-4 border-card shadow-elevated" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full gradient-primary text-3xl font-bold text-primary-foreground border-4 border-card shadow-elevated">
                {profile.name[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold text-foreground">
            {profile.name}{profile.age ? `, ${profile.age}` : ''}
          </h2>
          {profile.gender && (
            <span className="inline-block mt-1 rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
              {profile.gender}
            </span>
          )}

          {(profile.city || profile.location) && (
            <p className="mt-2 flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {profile.city || profile.location}{profile.country ? `, ${profile.country}` : ''}
            </p>
          )}

          {profile.uid && (
            <button onClick={copyUID}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-mono text-muted-foreground transition-colors hover:bg-muted/80">
              UID: {profile.uid}
              {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
            </button>
          )}

          {profile.bio && (
            <p className="mt-4 text-sm text-foreground">{profile.bio}</p>
          )}

          {profile.interests.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {profile.interests.map(i => (
                <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {i}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <a href="/"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-soft">
            Connect on Trends
          </a>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-auto py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-semibold text-primary">Trends</span>
        </p>
      </div>
    </div>
  );
}
