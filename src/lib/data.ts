export interface UserProfile {
  id: string;
  uid: string;
  name: string;
  age: number;
  gender: string;
  bio: string;
  interests: string[];
  avatar: string;
  location?: string;
  country?: string;
  city?: string;
  distance?: string;
}

export function generateUID(): string {
  return 'TR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  censored?: boolean;
}

export interface ChatThread {
  id: string;
  user: UserProfile;
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
}

export const SAFE_WORDS = ['kiss', 'sexy', 'hot', 'fun', 'cute', 'beautiful', 'handsome', 'attractive'];

export const UNSAFE_PATTERNS = [
  /f+[\s.*_-]*u+[\s.*_-]*c+[\s.*_-]*k/gi,
  /p+[\s.*_-]*o+[\s.*_-]*r+[\s.*_-]*n/gi,
  /s+[\s.*_-]*h+[\s.*_-]*i+[\s.*_-]*t/gi,
  /d+[\s.*_-]*i+[\s.*_-]*c+[\s.*_-]*k/gi,
  /a+[\s.*_-]*s+[\s.*_-]*s+[\s.*_-]*h+[\s.*_-]*o+[\s.*_-]*l+[\s.*_-]*e/gi,
];

export function censorMessage(text: string): { censored: string; hasViolation: boolean } {
  let result = text;
  let hasViolation = false;
  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(result)) {
      hasViolation = true;
      result = result.replace(pattern, '***');
    }
    pattern.lastIndex = 0;
  }
  return { censored: result, hasViolation };
}

// No mock/bot data - profiles come from real users only
export const MOCK_PROFILES: UserProfile[] = [];
export const MOCK_CHATS: ChatThread[] = [];
