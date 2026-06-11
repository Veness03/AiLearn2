export type Difficulty = "Easy" | "Medium" | "Hard";

export interface KeyConcept {
  concept: string;
  description: string;
}

export interface Flashcard {
  term: string;
  definition: string;
}

export interface MCQ {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TrueFalse {
  question: string;
  correctAnswer: boolean;
  explanation: string;
}

export interface TopicData {
  title: string;
  summary: string;
  keyConcepts: KeyConcept[];
  flashcards: Flashcard[];
  mcq: MCQ[];
  trueFalse: TrueFalse[];
}

export interface TopicRecord extends TopicData {
  id: string;
  createdAt: number;
  difficulty: Difficulty;
  score: number;
  maxScore: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

import { create } from "zustand";
import { persist } from "zustand/middleware";


interface UserState {
  learningHistory: TopicRecord[];
  streaks: number;
  lastActive: number;
  achievements: Achievement[];
  addTopic: (topic: TopicRecord) => void;
  updateTopicRating: (id: string, score: number, maxScore: number) => void;
  checkStreaks: () => void;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "first_quiz", title: "First Steps", description: "Completed your first quiz.", icon: "Trophy" },
  { id: "perfect_score", title: "Flawless!", description: "Achieved a perfect score in a quiz.", icon: "Star" },
  { id: "streak_3", title: "On Fire", description: "Maintained a 3-day learning streak.", icon: "Flame" },
];

export const useStore = create<UserState>()(
  persist(
    (set, get) => ({
      learningHistory: [],
      streaks: 0,
      lastActive: Date.now(),
      achievements: DEFAULT_ACHIEVEMENTS,
      addTopic: (topic) => 
        set((state) => ({ 
          learningHistory: [topic, ...state.learningHistory],
          lastActive: Date.now()
        })),
      updateTopicRating: (id, score, maxScore) => {
        set((state) => {
          const updatedHistory = state.learningHistory.map((t) => 
            t.id === id ? { ...t, score, maxScore, completed: true } : t
          );
          
          let updatedAchievements = [...state.achievements];
          
          // Check for perfect score achievement
          if (score === maxScore) {
            const perfectIdx = updatedAchievements.findIndex(a => a.id === "perfect_score");
            if (perfectIdx !== -1 && !updatedAchievements[perfectIdx].unlockedAt) {
              updatedAchievements[perfectIdx].unlockedAt = Date.now();
            }
          }

          // Check for first quiz achievement
          const firstIdx = updatedAchievements.findIndex(a => a.id === "first_quiz");
          if (firstIdx !== -1 && !updatedAchievements[firstIdx].unlockedAt) {
            updatedAchievements[firstIdx].unlockedAt = Date.now();
          }

          return { learningHistory: updatedHistory, achievements: updatedAchievements, lastActive: Date.now() };
        });
      },
      checkStreaks: () => {
        set((state) => {
          const now = Date.now();
          const oneDay = 24 * 60 * 60 * 1000;
          const diff = now - state.lastActive;
          
          let newStreaks = state.streaks;
          if (diff > oneDay * 2) {
            newStreaks = 0; // Lost streak
          } else if (diff > oneDay) {
            newStreaks += 1;
          }

          let updatedAchievements = [...state.achievements];
          if (newStreaks >= 3) {
            const streakIdx = updatedAchievements.findIndex(a => a.id === "streak_3");
            if (streakIdx !== -1 && !updatedAchievements[streakIdx].unlockedAt) {
              updatedAchievements[streakIdx].unlockedAt = Date.now();
            }
          }

          return { streaks: newStreaks, lastActive: now, achievements: updatedAchievements };
        });
      }
    }),
    {
      name: "ai-learning-storage",
    }
  )
);
