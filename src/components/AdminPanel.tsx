import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Shield, Ban, Trash2, Search, AlertTriangle, Settings, BarChart3, Eye, EyeOff } from 'lucide-react';
import { TrendsLogo } from './TrendsLogo';

const ADMIN_EMAIL = 'avzio@outlook.com';

interface AdminUser {
  uid: string;
  email: string;
  name: string;
  status: 'active' | 'warned' | 'blocked' | 'banned';
  violations: number;
  verified: boolean;
  joinedAt: string;
}

interface AdminPanelProps {
  onBack: () => void;
  adminEmail: string;
}

export function AdminPanel({ onBack, adminEmail }: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'users' | 'reports' | 'settings'>('dashboard');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Load users from localStorage (simulated user registry)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('trends_admin_users');
      if (stored) setUsers(JSON.parse(stored));
    } catch {}
  }, []);

  const saveUsers = (updated: AdminUser[]) => {
    setUsers(updated);
    localStorage.setItem('trends_admin_users', JSON.stringify(updated));
  };

  const updateUserStatus = (uid: string, status: AdminUser['status']) => {
    const updated = users.map(u => u.uid === uid ? { ...u, status } : u);
    saveUsers(updated);
    if (selectedUser?.uid === uid) setSelectedUser({ ...selectedUser, status });
  };

  const deleteUser = (uid: string) => {
    const updated = users.filter(u => u.uid !== uid);
    saveUsers(updated);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.uid.toLowerCase().includes(q);
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    warned: users.filter(u => u.status === 'warned').length,
    blocked: users.filter(u => u.status === 'blocked').length,
    banned: users.filter(u => u.status === 'banned').length,
    verified: users.filter(u => u.verified).length,
  };

  if (!isAdmin(adminEmail)) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6">
        <Shield className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-center mb-6">You don't have admin privileges.</p>
        <button onClick={onBack} className="rounded-xl gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <TrendsLogo size={24} showText textClassName="text-sm" />
        <span className="ml-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">ADMIN</span>
      </div>

      {/* Nav tabs */}
      <div className="flex border-b border-border bg-card overflow-x-auto">
        {[
          { id: 'dashboard' as const, icon: BarChart3, label: 'Dashboard' },
          { id: 'users' as const, icon: Users, label: 'Users' },
          { id: 'reports' as const, icon: AlertTriangle, label: 'Reports' },
          { id: 'settings' as const, icon: Settings, label: 'Settings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSection === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl">
          {/* Dashboard */}
          {activeSection === 'dashboard' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">Overview</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard label="Total Users" value={stats.total} />
                <StatCard label="Active" value={stats.active} color="text-green-500" />
                <StatCard label="Warned" value={stats.warned} color="text-yellow-500" />
                <StatCard label="Blocked" value={stats.blocked} color="text-orange-500" />
                <StatCard label="Banned" value={stats.banned} color="text-destructive" />
                <StatCard label="Verified" value={stats.verified} color="text-primary" />
              </div>

              <div className="rounded-2xl bg-card p-4 shadow-card">
                <h3 className="text-sm font-semibold text-foreground mb-2">Admin Info</h3>
                <p className="text-xs text-muted-foreground">Logged in as: <span className="font-mono text-foreground">{adminEmail}</span></p>
                <p className="text-xs text-muted-foreground mt-1">Role: <span className="text-primary font-semibold">Super Admin</span></p>
              </div>
            </div>
          )}

          {/* Users */}
          {activeSection === 'users' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">Manage Users</h2>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or UID..."
                  className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {users.length === 0 ? 'No registered users yet' : 'No users match your search'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map(user => (
                    <motion.button
                      key={user.uid}
                      onClick={() => setSelectedUser(user)}
                      className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 shadow-card text-left hover:bg-muted/50 transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                        {user.name[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <StatusBadge status={user.status} />
                    </motion.button>
                  ))}
                </div>
              )}

              {/* User detail modal */}
              {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setSelectedUser(null)}>
                  <motion.div
                    className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-elevated"
                    onClick={e => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="text-center mb-4">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-primary-foreground">
                        {selectedUser.name[0]?.toUpperCase() || '?'}
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{selectedUser.name}</h3>
                      <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                      <p className="text-xs font-mono text-muted-foreground mt-1">{selectedUser.uid}</p>
                      <div className="mt-2">
                        <StatusBadge status={selectedUser.status} />
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Violations</span>
                        <span className="text-foreground font-semibold">{selectedUser.violations}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Verified</span>
                        <span className={selectedUser.verified ? 'text-green-500 font-semibold' : 'text-muted-foreground'}>{selectedUser.verified ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Joined</span>
                        <span className="text-foreground">{selectedUser.joinedAt}</span>
                      </div>
                    </div>

                    {/* Admin actions */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground">Actions</h4>
                      {selectedUser.status !== 'active' && (
                        <button onClick={() => updateUserStatus(selectedUser.uid, 'active')} className="w-full rounded-xl bg-green-500/10 px-4 py-2.5 text-xs font-semibold text-green-600 hover:bg-green-500/20 transition-colors">
                          ✓ Reactivate Account
                        </button>
                      )}
                      {selectedUser.status !== 'warned' && (
                        <button onClick={() => updateUserStatus(selectedUser.uid, 'warned')} className="w-full rounded-xl bg-yellow-500/10 px-4 py-2.5 text-xs font-semibold text-yellow-600 hover:bg-yellow-500/20 transition-colors">
                          ⚠ Issue Warning
                        </button>
                      )}
                      {selectedUser.status !== 'blocked' && (
                        <button onClick={() => updateUserStatus(selectedUser.uid, 'blocked')} className="w-full rounded-xl bg-orange-500/10 px-4 py-2.5 text-xs font-semibold text-orange-600 hover:bg-orange-500/20 transition-colors flex items-center justify-center gap-1.5">
                          <Ban className="h-3.5 w-3.5" /> Block (7 days)
                        </button>
                      )}
                      {selectedUser.status !== 'banned' && (
                        <button onClick={() => updateUserStatus(selectedUser.uid, 'banned')} className="w-full rounded-xl bg-destructive/10 px-4 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center gap-1.5">
                          <Ban className="h-3.5 w-3.5" /> Permanent Ban
                        </button>
                      )}
                      <button onClick={() => deleteUser(selectedUser.uid)} className="w-full rounded-xl border border-destructive/30 px-4 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/5 transition-colors flex items-center justify-center gap-1.5">
                        <Trash2 className="h-3.5 w-3.5" /> Delete Account
                      </button>
                    </div>

                    <button onClick={() => setSelectedUser(null)} className="mt-4 w-full rounded-xl bg-muted px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                      Close
                    </button>
                  </motion.div>
                </div>
              )}
            </div>
          )}

          {/* Reports */}
          {activeSection === 'reports' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">Reports</h2>
              <div className="py-12 text-center">
                <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No pending reports</p>
                <p className="text-xs text-muted-foreground mt-1">Reports from users will appear here</p>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeSection === 'settings' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">App Settings</h2>
              
              <div className="space-y-3">
                <SettingToggle label="Require age verification" description="Users must be 18+ to sign up" defaultOn />
                <SettingToggle label="Content moderation" description="Auto-censor inappropriate messages" defaultOn />
                <SettingToggle label="File transfer" description="Allow D2D file sharing (max 5MB)" defaultOn />
                <SettingToggle label="Audio calls" description="Enable user-to-user audio calling" defaultOn />
                <SettingToggle label="Maintenance mode" description="Disable app for all non-admin users" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function isAdmin(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card text-center">
      <p className={`text-2xl font-bold ${color || 'text-foreground'}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminUser['status'] }) {
  const styles = {
    active: 'bg-green-500/10 text-green-600',
    warned: 'bg-yellow-500/10 text-yellow-600',
    blocked: 'bg-orange-500/10 text-orange-600',
    banned: 'bg-destructive/10 text-destructive',
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${styles[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}

function SettingToggle({ label, description, defaultOn }: { label: string; description: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn ?? false);
  return (
    <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`h-6 w-11 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-border'}`}
      >
        <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}
