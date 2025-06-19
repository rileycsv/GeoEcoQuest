import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../state/gameStore';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

// Mock leaderboard data for demonstration
const mockLeaderboardData = [
  { id: '1', name: 'Eco Warrior', points: 2450, level: 5, streak: 12, avatar: '🌟' },
  { id: '2', name: 'Nature Lover', points: 2200, level: 5, streak: 8, avatar: '🌲' },
  { id: '3', name: 'Green Guardian', points: 1980, level: 4, streak: 15, avatar: '🌿' },
  { id: '4', name: 'Earth Protector', points: 1750, level: 4, streak: 6, avatar: '🌍' },
  { id: '5', name: 'Eco Explorer', points: 1650, level: 4, streak: 9, avatar: '🦋' },
  { id: 'current', name: 'You', points: 0, level: 1, streak: 0, avatar: '🌱' },
];

type LeaderboardType = 'global' | 'friends' | 'georgia';

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const { userStats } = useGameStore();
  const [activeTab, setActiveTab] = useState<LeaderboardType>('global');

  // Update current user data
  const currentUser = {
    ...mockLeaderboardData.find(u => u.id === 'current')!,
    points: userStats.totalPoints,
    level: userStats.level,
    streak: userStats.streak
  };

  // Merge and sort leaderboard
  const leaderboardData = [
    ...mockLeaderboardData.filter(u => u.id !== 'current'),
    currentUser
  ].sort((a, b) => b.points - a.points);

  const currentUserRank = leaderboardData.findIndex(u => u.id === 'current') + 1;

  const tabs = [
    { key: 'global' as LeaderboardType, label: 'Global', emoji: '🌍' },
    { key: 'friends' as LeaderboardType, label: 'Friends', emoji: '👥' },
    { key: 'georgia' as LeaderboardType, label: 'Georgia', emoji: '🍑' },
  ];

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-green-50 border-green-200';
    if (rank <= 3) return 'bg-yellow-50 border-yellow-200';
    return 'bg-white border-gray-100';
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.delay(100)} 
        className="bg-purple-600 px-6 py-6 rounded-b-3xl"
      >
        <Text className="text-white text-3xl font-bold">
          Leaderboard 🏆
        </Text>
        <Text className="text-white/90 text-base mt-2">
          See how you rank among other eco warriors
        </Text>
        
        {/* Current User Rank */}
        <View className="mt-4 bg-white/20 rounded-2xl p-4">
          <View className="flex-row items-center">
            <Text className="text-white text-2xl mr-3">{currentUser.avatar}</Text>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">Your Rank: #{currentUserRank}</Text>
              <Text className="text-white/90 text-sm">
                {userStats.totalPoints} points • Level {userStats.level}
              </Text>
            </View>
            <Text className="text-white text-2xl font-bold">
              {getRankEmoji(currentUserRank)}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Tab Navigation */}
      <Animated.View entering={FadeInDown.delay(200)}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-6 py-4"
        >
          {tabs.map((tab, index) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`mr-3 px-4 py-2 rounded-full flex-row items-center ${
                activeTab === tab.key 
                  ? 'bg-purple-600' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <Text className="mr-2">{tab.emoji}</Text>
              <Text className={`font-semibold ${
                activeTab === tab.key ? 'text-white' : 'text-gray-700'
              }`}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Leaderboard List */}
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
      >
        {leaderboardData.map((user, index) => {
          const rank = index + 1;
          const isCurrentUser = user.id === 'current';
          
          return (
            <Animated.View
              key={user.id}
              entering={FadeInDown.delay(300 + index * 100)}
              className={`mb-3 rounded-2xl p-4 border-2 ${getRankColor(rank, isCurrentUser)}`}
            >
              <View className="flex-row items-center">
                {/* Rank */}
                <View className="w-12 items-center">
                  <Text className="text-2xl font-bold">
                    {typeof getRankEmoji(rank) === 'string' && getRankEmoji(rank).includes('#') ? 
                      getRankEmoji(rank) : 
                      <Text className="text-2xl">{getRankEmoji(rank)}</Text>
                    }
                  </Text>
                </View>

                {/* Avatar */}
                <View className="mx-3">
                  <Text className="text-3xl">{user.avatar}</Text>
                </View>

                {/* User Info */}
                <View className="flex-1">
                  <Text className={`font-bold text-lg ${
                    isCurrentUser ? 'text-green-800' : 'text-gray-900'
                  }`}>
                    {user.name}
                  </Text>
                  <Text className={`text-sm ${
                    isCurrentUser ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    Level {user.level} • {user.streak} day streak
                  </Text>
                </View>

                {/* Points */}
                <View className="items-end">
                  <Text className={`font-bold text-xl ${
                    isCurrentUser ? 'text-green-800' : 'text-gray-900'
                  }`}>
                    {user.points.toLocaleString()}
                  </Text>
                  <Text className={`text-xs ${
                    isCurrentUser ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    points
                  </Text>
                </View>
              </View>
            </Animated.View>
          );
        })}

        {/* Coming Soon Message */}
        <Animated.View 
          entering={FadeInDown.delay(800)}
          className="bg-blue-50 rounded-2xl p-6 mt-4 border border-blue-200"
        >
          <Text className="text-blue-800 font-bold text-lg mb-2 text-center">
            🚀 More Features Coming Soon!
          </Text>
          <Text className="text-blue-700 text-center">
            • Weekly tournaments{'\n'}
            • Regional competitions{'\n'}
            • Team challenges{'\n'}
            • Monthly rewards
          </Text>
        </Animated.View>
        
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}