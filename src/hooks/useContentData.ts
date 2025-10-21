import { useState, useEffect } from 'react';
import contentData from '../data/training-content.json';

interface Module {
  id: string;
  title: string;
  estimatedTime: string;
  objectives: string[];
  explanation: string;
  procedureSteps: string[];
  edgeCases: string[];
  miniCheck: MiniCheck[];
  example?: {
    label: string;
    scenario: string;
    application: string;
  };
  takeaways: string[];
  nextActions: string[];
  source: Array<{ page: number }>;
}

interface MiniCheck {
  id: string;
  prompt: string;
  type: 'single' | 'multi';
  options: Array<{
    id: string;
    label: string;
    feedback: string;
    correct?: boolean;
  }>;
  source: Array<{ page: number }>;
}

interface QuizOption {
  id: string;
  label: string;
  feedback: string;
  correct?: boolean;
}

interface QuizItem {
  id: string;
  prompt: string;
  type: 'single' | 'multi' | 'ordering' | 'scenario';
  options: QuizOption[];
  source?: Array<{ page: number }>;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  items: QuizItem[];
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  source: Array<{ page: number }>;
}

interface CheatSheet {
  scenarios: Array<{
    title: string;
    summary: string;
    reference: string;
  }>;
  decisionTrees: Array<{
    title: string;
    steps: string[];
  }>;
  thresholds: string[];
}

interface Taxonomy {
  id: string;
  name: string;
  summary: string;
  relatedModules: string[];
  heroProcedureId: string | null;
  source: Array<{ page: number }>;
}

interface Procedure {
  id: string;
  title: string;
  category: string;
  hero?: boolean;
  purpose?: string;
  prereqs?: string[];
  duration_estimate?: string;
  assumptions?: string[];
  summary?: string;
  steps: Array<{
    id: string;
    title?: string;
    action?: string;
    agentSpeak?: string;
    detail?: string;
    capture?: string[];
    validations?: string[];
    next?: any;
    source?: Array<{ page: number }>;
  }>;
  source?: Array<{ page: number }>;
}

interface ContentData {
  taxonomy: Taxonomy[];
  procedures: Procedure[];
  modules: Module[];
  quizzes: Quiz[];
  flashcards: Flashcard[];
  cheatSheet: CheatSheet;
}

// Cast the imported JSON to our ContentData type
const typedContentData = contentData as ContentData;

export function useContentData() {
  const [data, setData] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      try {
        setData(typedContentData);
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return { data, isLoading, error };
}
