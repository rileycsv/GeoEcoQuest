import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'trivia' | 'cleanup' | 'real-world' | 'tracking';
  points: number;
  completed: boolean;
  location?: string;
  timeLimit?: number;
  completedAt?: Date;
}

export interface UserStats {
  totalPoints: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  challengesCompleted: number;
  parksVisited: number;
  plantsIdentified: number;
  waterSaved: number;
  energySaved: number;
}

interface GameState {
  userStats: UserStats;
  badges: Badge[];
  challenges: Challenge[];
  completedChallenges: string[];
  
  // Actions
  addPoints: (points: number) => void;
  completeChallenge: (challengeId: string) => void;
  earnBadge: (badgeId: string) => void;
  updateStreak: () => void;
  resetStreak: () => void;
  updateTrackingData: (type: 'water' | 'energy', amount: number) => void;
  visitPark: () => void;
  identifyPlant: () => void;
}

const initialBadges: Badge[] = [
  {
    id: 'first-challenge',
    name: 'Getting Started',
    description: 'Complete your first challenge',
    icon: '🌱',
    earned: false,
  },
  {
    id: 'georgia-explorer',
    name: 'Georgia Explorer',
    description: 'Visit 3 Georgia state parks',
    icon: '🏞️',
    earned: false,
  },
  {
    id: 'plant-expert',
    name: 'Plant Expert',
    description: 'Identify 10 native Georgia plants',
    icon: '🌿',
    earned: false,
  },
  {
    id: 'eco-warrior',
    name: 'Eco Warrior',
    description: 'Complete 50 challenges',
    icon: '🌍',
    earned: false,
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    earned: false,
  },
  {
    id: 'water-saver',
    name: 'Water Guardian',
    description: 'Track 100 gallons of water saved',
    icon: '💧',
    earned: false,
  }
];

const initialChallenges: Challenge[] = [
  {
    id: 'okefenokee-trivia',
    title: 'Okefenokee Swamp Quiz',
    description: 'Test your knowledge about Georgia\'s famous wetland ecosystem',
    type: 'trivia',
    points: 50,
    completed: false,
    location: 'Okefenokee National Wildlife Refuge'
  },
  {
    id: 'river-cleanup',
    title: 'Chattahoochee River Cleanup',
    description: 'Remove virtual pollutants from Georgia\'s longest river',
    type: 'cleanup',
    points: 75,
    completed: false,
    location: 'Chattahoochee River'
  },
  {
    id: 'tree-planting',
    title: 'Urban Forest Challenge',
    description: 'Plant virtual trees in Atlanta\'s urban areas',
    type: 'cleanup',
    points: 60,
    completed: false,
    location: 'Atlanta'
  },
  {
    id: 'park-visit',
    title: 'Visit Stone Mountain',
    description: 'Check in at Stone Mountain State Park',
    type: 'real-world',
    points: 100,
    completed: false,
    location: 'Stone Mountain State Park'
  },
  {
    id: 'water-tracking',
    title: 'Daily Water Conservation',
    description: 'Track your water usage for today',
    type: 'tracking',
    points: 25,
    completed: false,
    timeLimit: 24 * 60 * 60 * 1000 // 24 hours
  }
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      userStats: {
        totalPoints: 0,
        level: 1,
        streak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        challengesCompleted: 0,
        parksVisited: 0,
        plantsIdentified: 0,
        waterSaved: 0,
        energySaved: 0,
      },
      badges: initialBadges,
      challenges: initialChallenges,
      completedChallenges: [],

      addPoints: (points: number) => {
        set((state) => {
          const newTotalPoints = state.userStats.totalPoints + points;
          const newLevel = Math.floor(newTotalPoints / 500) + 1; // Level up every 500 points
          
          return {
            userStats: {
              ...state.userStats,
              totalPoints: newTotalPoints,
              level: newLevel,
            }
          };
        });
      },

      completeChallenge: (challengeId: string) => {
        set((state) => {
          const challenge = state.challenges.find(c => c.id === challengeId);
          if (!challenge || state.completedChallenges.includes(challengeId)) {
            return state;
          }

          const updatedChallenges = state.challenges.map(c =>
            c.id === challengeId 
              ? { ...c, completed: true, completedAt: new Date() }
              : c
          );

          const newCompletedCount = state.userStats.challengesCompleted + 1;
          const newTotalPoints = state.userStats.totalPoints + challenge.points;
          const newLevel = Math.floor(newTotalPoints / 500) + 1;

          // Check for badge unlocks
          const updatedBadges = state.badges.map(badge => {
            if (badge.id === 'first-challenge' && newCompletedCount === 1) {
              return { ...badge, earned: true, earnedAt: new Date() };
            }
            if (badge.id === 'eco-warrior' && newCompletedCount === 50) {
              return { ...badge, earned: true, earnedAt: new Date() };
            }
            return badge;
          });

          return {
            challenges: updatedChallenges,
            completedChallenges: [...state.completedChallenges, challengeId],
            userStats: {
              ...state.userStats,
              totalPoints: newTotalPoints,
              level: newLevel,
              challengesCompleted: newCompletedCount,
            },
            badges: updatedBadges,
          };
        });
      },

      earnBadge: (badgeId: string) => {
        set((state) => ({
          badges: state.badges.map(badge =>
            badge.id === badgeId 
              ? { ...badge, earned: true, earnedAt: new Date() }
              : badge
          )
        }));
      },

      updateStreak: () => {
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          
          let newStreak = state.userStats.streak;
          
          if (state.userStats.lastActiveDate === yesterday) {
            newStreak += 1;
          } else if (state.userStats.lastActiveDate !== today) {
            newStreak = 1;
          }

          // Check for streak badge
          const updatedBadges = state.badges.map(badge => {
            if (badge.id === 'streak-master' && newStreak === 7) {
              return { ...badge, earned: true, earnedAt: new Date() };
            }
            return badge;
          });

          return {
            userStats: {
              ...state.userStats,
              streak: newStreak,
              lastActiveDate: today,
            },
            badges: updatedBadges,
          };
        });
      },

      resetStreak: () => {
        set((state) => ({
          userStats: {
            ...state.userStats,
            streak: 0,
          }
        }));
      },

      updateTrackingData: (type: 'water' | 'energy', amount: number) => {
        set((state) => {
          const updatedStats = { ...state.userStats };
          
          if (type === 'water') {
            updatedStats.waterSaved += amount;
          } else {
            updatedStats.energySaved += amount;
          }

          // Check for water saver badge
          const updatedBadges = state.badges.map(badge => {
            if (badge.id === 'water-saver' && updatedStats.waterSaved >= 100) {
              return { ...badge, earned: true, earnedAt: new Date() };
            }
            return badge;
          });

          return {
            userStats: updatedStats,
            badges: updatedBadges,
          };
        });
      },

      visitPark: () => {
        set((state) => {
          const newParksVisited = state.userStats.parksVisited + 1;
          
          // Check for Georgia explorer badge
          const updatedBadges = state.badges.map(badge => {
            if (badge.id === 'georgia-explorer' && newParksVisited === 3) {
              return { ...badge, earned: true, earnedAt: new Date() };
            }
            return badge;
          });

          return {
            userStats: {
              ...state.userStats,
              parksVisited: newParksVisited,
            },
            badges: updatedBadges,
          };
        });
      },

      identifyPlant: () => {
        set((state) => {
          const newPlantsIdentified = state.userStats.plantsIdentified + 1;
          
          // Check for plant expert badge
          const updatedBadges = state.badges.map(badge => {
            if (badge.id === 'plant-expert' && newPlantsIdentified === 10) {
              return { ...badge, earned: true, earnedAt: new Date() };
            }
            return badge;
          });

          return {
            userStats: {
              ...state.userStats,
              plantsIdentified: newPlantsIdentified,
            },
            badges: updatedBadges,
          };
        });
      },
    }),
    {
      name: 'ecoquest-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userStats: state.userStats,
        badges: state.badges,
        completedChallenges: state.completedChallenges,
      }),
    }
  )
);