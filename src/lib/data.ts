export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  bio: string;
  interests: string[];
  avatar: string;
  location?: string;
  distance?: string;
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

export const MOCK_PROFILES: UserProfile[] = [
  { id: '1', name: 'Sophia', age: 24, gender: 'Female', bio: 'Coffee lover ☕ Adventure seeker 🌍', interests: ['Travel', 'Photography', 'Yoga'], avatar: '', location: 'New York', distance: '3 mi' },
  { id: '2', name: 'Marcus', age: 27, gender: 'Male', bio: 'Music producer & dog dad 🎵🐕', interests: ['Music', 'Cooking', 'Fitness'], avatar: '', location: 'Brooklyn', distance: '5 mi' },
  { id: '3', name: 'Aria', age: 22, gender: 'Female', bio: 'Art student living her best life 🎨', interests: ['Art', 'Reading', 'Hiking'], avatar: '', location: 'Manhattan', distance: '2 mi' },
  { id: '4', name: 'Jordan', age: 26, gender: 'Non-binary', bio: 'Tech nerd meets plant parent 🌿💻', interests: ['Gaming', 'Plants', 'Coding'], avatar: '', location: 'Queens', distance: '7 mi' },
  { id: '5', name: 'Luna', age: 25, gender: 'Female', bio: 'Sunset chaser & bookworm 📚', interests: ['Books', 'Beach', 'Dancing'], avatar: '', location: 'Jersey City', distance: '8 mi' },
];

export const MOCK_CHATS: ChatThread[] = [
  { id: 'c1', user: MOCK_PROFILES[0], lastMessage: 'Hey! How are you? 😊', lastMessageTime: new Date(Date.now() - 300000), unread: 2 },
  { id: 'c2', user: MOCK_PROFILES[1], lastMessage: 'That sounds fun!', lastMessageTime: new Date(Date.now() - 3600000), unread: 0 },
  { id: 'c3', user: MOCK_PROFILES[2], lastMessage: 'See you there!', lastMessageTime: new Date(Date.now() - 86400000), unread: 1 },
];
