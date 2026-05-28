export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Concept {
  id: string;
  name: string;
}

export interface SubTopic {
  id: string;
  name: string;
  concepts: Concept[];
}

export interface Domain {
  id: string;
  name: string;
  subTopics: SubTopic[];
}

export interface ResponseOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
  isCorrect: boolean;
  metadata?: string; // Optional metadata like probability (e.g. '33.33%') or rationale
}

export interface Question {
  id: string;
  trackingId?: string;
  questionBinaryId?: string;
  questionInternalUuid?: string;
  questionHashSeed?: number;
  domainUuid?: string;
  subTopicUuid?: string;
  conceptUuid?: string;
  domainId: string;
  subTopicId: string;
  conceptId: string;
  difficulty: Difficulty;
  companyTags: string[];
  shuffleOptions: boolean;
  questionStem: string;
  hintText: string;
  options: ResponseOption[];
  videoUrl: string;
  videoTitle?: string;
  videoDuration?: string;
  videoThumbnail?: string;
  status?: 'Published' | 'Draft';
  createdAt?: string;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  href?: string;
}

export interface UserRole {
  role: 'admin' | 'editor';
  name: string;
  avatar: string;
  email: string;
}
