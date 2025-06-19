import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useGameStore } from '../state/gameStore';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type FilterType = 'all' | 'trivia' | 'cleanup' | 'real-world' | 'tracking';

export default function ChallengesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { challenges, userStats } = useGameStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filters = [
    { key: 'all' as FilterType, label: 'All', emoji: '📋' },
    { key: 'trivia' as FilterType, label: 'Trivia', emoji: '🧠' },
    { key: 'cleanup' as FilterType, label: 'Cleanup', emoji: '🧹' },
    { key: 'real-world' as FilterType, label: 'Real World', emoji: '📍' },
    { key: 'tracking' as FilterType, label: 'Tracking', emoji: '📊' },
  ];

  const filteredChallenges = challenges.filter(challenge => 
    activeFilter === 'all' || challenge.type === activeFilter
  );

  const completedCount = challenges.filter(c => c.completed).length;
  const totalCount = challenges.length;

  const getChallengeIcon = (type: string, completed: boolean) => {
    const icons = {
      trivia: '🧠',
      cleanup: '🧹',
      'real-world': '📍',
      tracking: '📊'
    };
    return completed ? '✅' : icons[type as keyof typeof icons] || '🎯';
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.delay(100)} 
        className="bg-green-600 px-6 py-6 rounded-b-3xl"
      >
        <Text className="text-white text-3xl font-bold">
          Challenges 🎯
        </Text>
        <Text className="text-white/90 text-base mt-2">
          Complete challenges to earn points and badges
        </Text>
        
        {/* Progress */}
        <View className="mt-4 bg-white/20 rounded-2xl p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white font-semibold">Progress</Text>
            <Text className="text-white font-bold">{completedCount}/{totalCount}</Text>
          </View>
          <View className="bg-white/30 rounded-full h-3">
            <View 
              className="bg-white rounded-full h-3"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </View>
        </View>
      </Animated.View>

      {/* Filter Tabs */}
      <Animated.View entering={FadeInDown.delay(200)}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-6 py-4"
        >
          {filters.map((filter, index) => (
            <AnimatedPressable
              key={filter.key}
              entering={FadeInRight.delay(300 + index * 50)}
              onPress={() => setActiveFilter(filter.key)}
              className={`mr-3 px-4 py-2 rounded-full flex-row items-center ${
                activeFilter === filter.key 
                  ? 'bg-green-600' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <Text className="mr-2">{filter.emoji}</Text>
              <Text className={`font-semibold ${
                activeFilter === filter.key ? 'text-white' : 'text-gray-700'
              }`}>
                {filter.label}
              </Text>
            </AnimatedPressable>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Challenges List */}
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
      >
        {filteredChallenges.map((challenge, index) => (
          <AnimatedPressable
            key={challenge.id}
            entering={FadeInDown.delay(400 + index * 100)}
            onPress={() => navigation.navigate('ChallengeDetail' as never, { 
              challengeId: challenge.id 
            })}
            className={`mb-4 rounded-2xl p-4 border ${
              challenge.completed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-gray-100'
            }`}
          >
            <View className="flex-row items-start">
              <View className={`rounded-full w-12 h-12 items-center justify-center mr-4 ${
                challenge.completed ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Text className="text-xl">
                  {getChallengeIcon(challenge.type, challenge.completed)}
                </Text>
              </View>
              
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className={`font-bold text-lg ${
                    challenge.completed ? 'text-green-800' : 'text-gray-900'
                  }`}>
                    {challenge.title}
                  </Text>
                  {challenge.completed && (
                    <View className="bg-green-600 rounded-full px-2 py-1">
                      <Text className="text-white text-xs font-bold">DONE</Text>
                    </View>
                  )}
                </View>
                
                <Text className={`text-sm mb-2 ${
                  challenge.completed ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {challenge.description}
                </Text>
                
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    {challenge.location && (
                      <View className="flex-row items-center mr-4">
                        <Text className="text-gray-500 text-xs">📍 {challenge.location}</Text>
                      </View>
                    )}
                    {challenge.timeLimit && (
                      <View className="flex-row items-center">
                        <Text className="text-gray-500 text-xs">⏱️ Time limited</Text>
                      </View>
                    )}
                  </View>
                  
                  <View className={`rounded-full px-3 py-1 ${
                    challenge.completed ? 'bg-green-200' : 'bg-blue-100'
                  }`}>
                    <Text className={`text-xs font-bold ${
                      challenge.completed ? 'text-green-800' : 'text-blue-800'
                    }`}>
                      {challenge.completed ? `+${challenge.points} earned` : `+${challenge.points} pts`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </AnimatedPressable>
        ))}
        
        {filteredChallenges.length === 0 && (
          <Animated.View 
            entering={FadeInDown.delay(400)}
            className="bg-white rounded-2xl p-8 items-center mt-8"
          >
            <Text className="text-6xl mb-4">🎯</Text>
            <Text className="text-xl font-bold text-gray-900 mb-2">
              No challenges found
            </Text>
            <Text className="text-gray-600 text-center">
              Try switching to a different filter to see more challenges
            </Text>
          </Animated.View>
        )}
        
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}