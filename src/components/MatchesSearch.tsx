import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X, SlidersHorizontal, MapPin } from 'lucide-react';
import { UserProfile, MOCK_PROFILES } from '@/lib/data';

interface MatchesSearchProps {
  matches: UserProfile[];
}

const GENDER_OPTIONS = ['All', 'Male', 'Female', 'Non-binary'];

export function MatchesSearch({ matches }: MatchesSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterGender, setFilterGender] = useState('All');
  const [filterMinAge, setFilterMinAge] = useState('');
  const [filterMaxAge, setFilterMaxAge] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && filterGender === 'All' && !filterMinAge && !filterMaxAge) return null;

    let pool = MOCK_PROFILES;

    // Apply filters
    if (filterGender !== 'All') {
      pool = pool.filter(p => p.gender.toLowerCase() === filterGender.toLowerCase());
    }
    if (filterMinAge) {
      pool = pool.filter(p => p.age >= parseInt(filterMinAge));
    }
    if (filterMaxAge) {
      pool = pool.filter(p => p.age <= parseInt(filterMaxAge));
    }

    // Apply text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      pool = pool.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.uid.toLowerCase().includes(q) ||
        p.gender.toLowerCase().includes(q) ||
        (p.country && p.country.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        p.age.toString() === q ||
        p.interests.some(i => i.toLowerCase().includes(q))
      );
    }

    return pool;
  }, [searchQuery, filterGender, filterMinAge, filterMaxAge]);

  const clearAll = () => {
    setSearchQuery('');
    setFilterGender('All');
    setFilterMinAge('');
    setFilterMaxAge('');
  };

  const hasActiveFilters = filterGender !== 'All' || filterMinAge || filterMaxAge;

  return (
    <div>
      <h2 className="mb-3 text-lg font-bold text-foreground sm:mb-4">Find People</h2>

      {/* Search bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search name, UID, city, age, interest..."
          className="w-full rounded-xl border border-border bg-card pl-9 pr-20 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {(searchQuery || hasActiveFilters) && (
            <button onClick={clearAll} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-lg transition-colors ${
              hasActiveFilters ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          className="mb-4 rounded-xl border border-border bg-card p-3 sm:p-4 space-y-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          {/* Gender */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Gender</label>
            <div className="flex flex-wrap gap-1.5">
              {GENDER_OPTIONS.map(g => (
                <button
                  key={g}
                  onClick={() => setFilterGender(g)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    filterGender === g
                      ? 'gradient-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Age range */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Age Range</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filterMinAge}
                onChange={(e) => setFilterMinAge(e.target.value)}
                className="w-20 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                min={18}
                max={99}
              />
              <span className="text-muted-foreground text-xs">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filterMaxAge}
                onChange={(e) => setFilterMaxAge(e.target.value)}
                className="w-20 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                min={18}
                max={99}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {searchResults !== null ? (
        searchResults.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Search className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No users found</p>
            <p className="text-muted-foreground text-xs mt-1">Try a different search or adjust filters</p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-muted-foreground mb-3">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {searchResults.map(m => (
                <ProfileGridCard key={m.id} profile={m} />
              ))}
            </div>
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
                <ProfileGridCard key={m.id} profile={m} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProfileGridCard({ profile }: { profile: UserProfile }) {
  return (
    <motion.div
      className="overflow-hidden rounded-2xl bg-card shadow-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex h-28 items-center justify-center gradient-primary sm:h-32">
        <span className="text-3xl font-bold text-primary-foreground/30 sm:text-4xl">{profile.name[0]}</span>
      </div>
      <div className="p-2.5 sm:p-3">
        <p className="font-semibold text-foreground text-xs sm:text-sm">{profile.name}, {profile.age}</p>
        <p className="text-[10px] text-muted-foreground sm:text-xs flex items-center gap-0.5">
          <MapPin className="h-2.5 w-2.5" />
          {profile.city || profile.distance}
        </p>
        <p className="mt-0.5 text-[9px] font-mono text-muted-foreground">{profile.uid}</p>
      </div>
    </motion.div>
  );
}
