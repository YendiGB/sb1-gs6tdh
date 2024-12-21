export interface LocalizedContent {
  en: string;
  es: string;
  [key: string]: string; // Support for additional languages
}

export interface Task {
  id: string;
  name: LocalizedContent;
  description: LocalizedContent;
  type: 'reading' | 'reflection' | 'exercise' | 'meditation' | 'other';
  duration?: number; // in minutes
  required: boolean;
}

export interface DayPlan {
  id: string;
  dayNumber: number;
  tasks: Task[];
  reflection?: LocalizedContent;
  quote?: LocalizedContent;
}

export interface Challenge {
  id: string;
  title: LocalizedContent | string;
  description: LocalizedContent | string;
  category: 'mindfulness' | 'health' | 'education' | 'lifestyle';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // total days
  thumbnail?: string;
  price: number;
  membershipAccess: ('free' | 'premium' | 'unlimited')[];
  dayPlans: DayPlan[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
  progress?: {
    currentDay: number;
    completedTasks: string[];
    status: 'active' | 'completed' | 'abandoned';
  };
}