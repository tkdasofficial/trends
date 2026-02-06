import { useState } from 'react';
import { ArrowLeft, Moon, Sun, Globe, Trash2, Download, Info } from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-lg space-y-2">
          {/* Appearance */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Appearance</p>
          <button
            onClick={toggleDark}
            className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 shadow-card text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">Dark Mode</p>
              <p className="text-xs text-muted-foreground">{darkMode ? 'On' : 'Off'}</p>
            </div>
            <div className={`h-6 w-11 rounded-full p-0.5 transition-colors ${darkMode ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* Language */}
          <div className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">Language</p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Spanish</option>
              <option>French</option>
              <option>Arabic</option>
            </select>
          </div>

          {/* Account */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-1">Account</p>
          <button className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 shadow-card text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">Download My Data</p>
              <p className="text-xs text-muted-foreground">Export your account data</p>
            </div>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 shadow-card text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 shrink-0">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-destructive text-sm">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently remove your account</p>
            </div>
          </button>

          {showDeleteConfirm && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
              <p className="text-sm font-semibold text-destructive">Are you sure?</p>
              <p className="text-xs text-muted-foreground">This action cannot be undone. All your data will be permanently deleted.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl bg-muted px-3 py-2 text-sm font-medium text-foreground"
                >
                  Cancel
                </button>
                <button className="flex-1 rounded-xl bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground">
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* About */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-1">About</p>
          <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Trends</p>
              <p className="text-xs text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
