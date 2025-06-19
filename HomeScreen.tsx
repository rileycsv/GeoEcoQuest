import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useGameStore } from '../state/gameStore';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { userStats, challenges, updateStreak } = useGameStore();
  
  const activeChallenges = challenges.filter(c => !c.completed).slice(0, 3);
  const badges = useGameStore(state => state.badges);
  const recentBadges = badges.filter(b => b.earned).slice(-2);

  useEffect(() => {
    updateStreak();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      style={{ paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.delay(100)} 
        className="bg-green-600 px-6 py-8 rounded-b-3xl"
      >
        <Text className="text-white text-lg font-medium opacity-90">
          {getGreeting()}, Explorer!
        </Text>
        <Text className="text-white text-3xl font-bold mt-1">
          Welcome to EcoQuest GA 🌲
        </Text>
        
        {/* Stats Row */}
        <View className="flex-row justify-between mt-6">
          <View className="bg-white/20 rounded-2xl px-4 py-3 flex-1 mr-2">
            <Text className="text-white/80 text-sm">Level</Text>
            <Text className="text-white text-2xl font-bold">{userStats.level}</Text>
          </View>
          <View className="bg-white/20 rounded-2xl px-4 py-3 flex-1 mx-1">
            <Text className="text-white/80 text-sm">Points</Text>
            <Text className="text-white text-2xl font-bold">{userStats.totalPoints}</Text>
          </View>
          <View className="bg-white/20 rounded-2xl px-4 py-3 flex-1 ml-2">
            <Text className="text-white/80 text-sm">Streak</Text>
            <Text className="text-white text-2xl font-bold">{userStats.streak} 🔥</Text>
          </View>
        </View>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View 
        entering={FadeInDown.delay(200)} 
        className="px-6 mt-6"
      >
        <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>
        <View className="flex-row flex-wrap">
          <AnimatedPressable
            entering={FadeInRight.delay(300)}
            onPress={() => navigation.navigate('Challenges' as never)}
            className="bg-blue-500 rounded-2xl p-4 mr-3 mb-3 flex-1 min-w-[140px]"
          >
            <Text className="text-3xl mb-2">🎯</Text>
            <Text className="text-white font-semibold">View Challenges</Text>
          </AnimatedPressable>
          
          <AnimatedPressable
            entering={FadeInRight.delay(400)}
            onPress={() => navigation.navigate('Game' as never, { 
              gameType: 'cleanup', 
              challengeId: 'river-cleanup' 
            })}
            className="bg-cyan-500 rounded-2xl p-4 mb-3 flex-1 min-w-[140px]"
          >
            <Text className="text-3xl mb-2">🌊</Text>
            <Text className="text-white font-semibold">River Cleanup</Text>
          </AnimatedPressable>
        </View>
      </Animated.View>

      {/* Active Challenges */}
      <Animated.View 
        entering={FadeInDown.delay(300)} 
        className="px-6 mt-6"
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-900">Active Challenges</Text>
          <Pressable onPress={() => navigation.navigate('Challenges' as never)}>
            <Text className="text-green-600 font-semibold">View All</Text>
          </Pressable>
        </View>
        
        {activeChallenges.map((challenge, index) => (
          <AnimatedPressable
            key={challenge.id}
            entering={FadeInDown.delay(400 + index * 100)}
            onPress={() => navigation.navigate('ChallengeDetail' as never, { 
              challengeId: challenge.id 
            })}
            className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="bg-green-100 rounded-full w-12 h-12 items-center justify-center mr-3">
                <Text className="text-xl">
                  {challenge.type === 'trivia' ? '🧠' :
                   challenge.type === 'cleanup' ? '🧹' :
                   challenge.type === 'real-world' ? '📍' : '📊'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-base">
                  {challenge.title}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {challenge.points} points • {challenge.location}
                </Text>
              </View>
              <View className="bg-green-600 rounded-full px-3 py-1">
                <Text className="text-white text-xs font-semibold">
                  +{challenge.points}
                </Text>
              </View>
            </View>
          </AnimatedPressable>
        ))}
      </Animated.View>

      {/* Recent Achievements */}
      {recentBadges.length > 0 && (
        <Animated.View 
          entering={FadeInDown.delay(500)} 
          className="px-6 mt-6 mb-8"
        >
          <Text className="text-xl font-bold text-gray-900 mb-4">Recent Achievements</Text>
          {recentBadges.map((badge, index) => (
            <Animated.View
              key={badge.id}
              entering={FadeInRight.delay(600 + index * 100)}
              className="bg-yellow-50 rounded-2xl p-4 mb-3 border border-yellow-200"
            >
              <View className="flex-row items-center">
                <Text className="text-3xl mr-3">{badge.icon}</Text>
                <View className="flex-1">
                  <Text className="font-bold text-yellow-800 text-base">
                    {badge.name}
                  </Text>
                  <Text className="text-yellow-700 text-sm">
                    {badge.description}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>
      )}

      {/* Georgia Fact of the Day */}
      <Animated.View 
        entering={FadeInDown.delay(600)} 
        className="px-6 mt-6 mb-8"
      >
        <View className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
          <Text className="text-emerald-800 font-bold text-lg mb-2">
            🌲 Georgia Fact of the Day
          </Text>
          <Text className="text-emerald-700 text-base leading-6">
            Georgia is home to the largest state park in the U.S. - Reed Bingham State Park! 
            It covers over 1,600 acres and is a critical habitat for over 200 bird species.
          </Text>
        </View>
      </Animated.View>
      
      <View style={{ height: insets.bottom + 20 }} />
    </ScrollView>
  );
}