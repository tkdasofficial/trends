import { motion } from 'framer-motion';
import { ArrowLeft, Check, Crown, Zap, Star } from 'lucide-react';

interface UpgradePageProps {
  onBack: () => void;
}

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    icon: Star,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    features: ['Basic matching', 'Up to 10 likes/day', 'Standard chat', 'Profile verification'],
    current: true,
    badge: 'Free for now',
  },
  {
    name: 'Pro',
    price: '$5',
    period: '/month',
    icon: Zap,
    color: 'text-primary',
    bg: 'bg-primary/10',
    features: ['Unlimited likes', 'See who liked you', 'Priority matching', 'Read receipts', 'Advanced filters'],
    current: false,
    badge: 'Free for now',
  },
  {
    name: 'Premium',
    price: '$12',
    period: '/month',
    icon: Crown,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    features: ['Everything in Pro', 'Profile boost', 'Incognito mode', 'Travel mode', 'Premium badge', 'Priority support'],
    current: false,
    badge: 'Free for now',
  },
];

export function UpgradePage({ onBack }: UpgradePageProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Upgrade Plan</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-lg space-y-4">
          <p className="text-center text-sm text-muted-foreground mb-6">Choose the plan that works for you</p>

          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                className="rounded-2xl border border-border bg-card p-5 shadow-card"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${plan.bg}`}>
                    <Icon className={`h-5 w-5 ${plan.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-xs text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {plan.badge}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                    plan.current
                      ? 'bg-muted text-muted-foreground cursor-default'
                      : 'gradient-primary text-primary-foreground shadow-soft'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Upgrade'}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
