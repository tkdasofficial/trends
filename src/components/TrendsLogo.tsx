import { cn } from '@/lib/utils';

interface TrendsLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export function TrendsLogo({ size = 40, className, showText = false, textClassName }: TrendsLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="trends-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(350, 80%, 60%)" />
            <stop offset="50%" stopColor="hsl(25, 90%, 65%)" />
            <stop offset="100%" stopColor="hsl(280, 60%, 65%)" />
          </linearGradient>
        </defs>
        <rect rx="16" width="64" height="64" fill="url(#trends-logo-grad)" />
        <path
          d="M32 50C31.2 50 30.4 49.7 29.8 49.1C28.6 48 16 36.4 16 27.6C16 22.2 20.2 18 25.4 18C27.8 18 30 19 31.6 20.6L32 21L32.4 20.6C34 19 36.2 18 38.6 18C43.8 18 48 22.2 48 27.6C48 36.4 35.4 48 34.2 49.1C33.6 49.7 32.8 50 32 50Z"
          fill="white"
        />
      </svg>
      {showText && (
        <span className={cn('text-xl font-extrabold text-gradient', textClassName)}>
          Trends
        </span>
      )}
    </span>
  );
}
