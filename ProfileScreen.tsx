import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../state/gameStore';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userStats, badges } = useGameStore();
  
  const earnedBadges = badges.filter(badge => badge.earned);
  const unearnedBadges = badges.filter(badge => !badge.earned);
  
  const nextLevelPoints = (userStats.level * 500) - userStats.totalPoints;
  const progressToNextLevel = ((userStats.totalPoints % 500) / 500) * 100;

  const stats = [
    { label: 'Parks Visited', value: userStats.parksVisited, emoji: '🏞️' },
    { label: 'Plants Identified', value: userStats.plantsIdentified, emoji: '🌿' },
    { label: 'Water Saved (gal)', value: userStats.waterSaved, emoji: '💧' },
    { label: 'Energy Saved (kWh)', value: userStats.energySaved, emoji: '⚡' },
  ];

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      style={{ paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.delay(100)} 
        className="bg-purple-600 px-6 py-8 rounded-b-3xl"
      >
        <View className="items-center">
          <View className="bg-white/20 rounded-full w-20 h-20 items-center justify-center mb-4">
            <Text className="text-4xl">🌱</Text>
          </View>
          <Text className="text-white text-2xl font-bold">Eco Explorer</Text>
          <Text className="text-white/90 text-base mt-1">Level {userStats.level}</Text>
        </View>
        
        {/* Level Progress */}
        <View className="mt-6 bg-white/20 rounded-2xl p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white font-semibold">Progress to Level {userStats.level + 1}</Text>
            <Text className="text-white font-bold">{nextLevelPoints} pts to go</Text>
          </View>
          <View className="bg-white/30 rounded-full h-3">
            <View 
              className="bg-white rounded-full h-3"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </View>
        </View>
      </Animated.View>

      {/* Stats Grid */}
      <Animated.View 
        entering={FadeInDown.delay(200)} 
        className="px-6 mt-6"
      >
        <Text className="text-xl font-bold text-gray-900 mb-4">Your Stats</Text>
        <View className="flex-row flex-wrap">
          {/* Main Stats */}
          <View className="w-1/2 pr-2 mb-4">
            <View className="bg-green-500 rounded-2xl p-4">
              <Text className="text-white text-2xl font-bold">{userStats.totalPoints}</Text>
              <Text className="text-white/90 text-sm">Total Points</Text>
            </View>
          </View>
          
          <View className="w-1/2 pl-2 mb-4">
            <View className="bg-orange-500 rounded-2xl p-4">
              <Text className="text-white text-2xl font-bold">{userStats.streak} 🔥</Text>
              <Text className="text-white/90 text-sm">Day Streak</Text>
            </View>
          </View>

          <View className="w-1/2 pr-2 mb-4">
            <View className="bg-blue-500 rounded-2xl p-4">
              <Text className="text-white text-2xl font-bold">{userStats.challengesCompleted}</Text>
              <Text className="text-white/90 text-sm">Challenges Done</Text>
            </View>
          </View>

          <View className="w-1/2 pl-2 mb-4">
            <View className="bg-cyan-500 rounded-2xl p-4">
              <Text className="text-white text-2xl font-bold">{earnedBadges.length}</Text>
              <Text className="text-white/90 text-sm">Badges Earned</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Environmental Impact Stats */}
      <Animated.View 
        entering={FadeInDown.delay(300)} 
        className="px-6 mt-6"
      >
        <Text className="text-xl font-bold text-gray-900 mb-4">Environmental Impact</Text>
        {stats.map((stat, index) => (
          <Animated.View
            key={stat.label}
            entering={FadeInRight.delay(400 + index * 100)}
            className="bg-white rounded-2xl p-4 mb-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">{stat.emoji}</Text>
              <Text className="text-gray-900 font-semibold">{stat.label}</Text>
            </View>
            <Text className="text-green-600 font-bold text-lg">{stat.value}</Text>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <Animated.View 
          entering={FadeInDown.delay(500)} 
          className="px-6 mt-6"
        >
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Earned Badges ({earnedBadges.length})
          </Text>
          <View className="flex-row flex-wrap">
            {earnedBadges.map((badge, index) => (
              <Animated.View
                key={badge.id}
                entering={FadeInRight.delay(600 + index * 100)}
                className="w-1/3 p-1 mb-4"
              >
                <View className="bg-yellow-50 rounded-2xl p-4 items-center border-2 border-yellow-200">
                  <Text className="text-3xl mb-2">{badge.icon}</Text>
                  <Text className="text-yellow-800 font-bold text-xs text-center">
                    {badge.name}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Locked Badges */}
      {unearnedBadges.length > 0 && (
        <Animated.View 
          entering={FadeInDown.delay(600)} 
          className="px-6 mt-6 mb-8"
        >
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Badges To Earn ({unearnedBadges.length})
          </Text>
          <View className="flex-row flex-wrap">
            {unearnedBadges.map((badge, index) => (
              <Animated.View
                key={badge.id}
                entering={FadeInRight.delay(700 + index * 100)}
                className="w-1/3 p-1 mb-4"
              >
                <View className="bg-gray-100 rounded-2xl p-4 items-center border-2 border-gray-200">
                  <Text className="text-3xl mb-2 opacity-40">{badge.icon}</Text>
                  <Text className="text-gray-500 font-bold text-xs text-center">
                    {badge.name}
                  </Text>
                  <Text className="text-gray-400 text-xs text-center mt-1">
                    {badge.description}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      )}

      <View style={{ height: insets.bottom + 20 }} />
    </ScrollView>
  );
}