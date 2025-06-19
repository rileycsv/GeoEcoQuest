import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useGameStore } from '../state/gameStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

type ChallengeDetailRouteProp = RouteProp<RootStackParamList, 'ChallengeDetail'>;

// Georgia-specific trivia questions
const triviaQuestions = {
  'okefenokee-trivia': [
    {
      question: "What type of ecosystem is the Okefenokee Swamp?",
      options: ["Wetland", "Desert", "Forest", "Grassland"],
      correct: 0,
      explanation: "The Okefenokee is a wetland ecosystem, one of the largest intact freshwater ecosystems in the world!"
    },
    {
      question: "Which endangered species calls the Okefenokee home?",
      options: ["Bald Eagle", "American Alligator", "Sandhill Crane", "All of the above"],
      correct: 3,
      explanation: "The Okefenokee supports many species including alligators, over 200 bird species, and serves as critical habitat for endangered species."
    },
    {
      question: "What does 'Okefenokee' mean in the Seminole language?",
      options: ["Big Water", "Trembling Earth", "Sacred Land", "Dark Swamp"],
      correct: 1,
      explanation: "Okefenokee means 'trembling earth' because the peat bog foundation quakes when you walk on it!"
    }
  ]
};

export default function ChallengeDetailScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<ChallengeDetailRouteProp>();
  const navigation = useNavigation();
  const { challengeId } = route.params;
  
  const { challenges, completeChallenge, addPoints, visitPark, identifyPlant, updateTrackingData } = useGameStore();
  const challenge = challenges.find(c => c.id === challengeId);

  const [triviaStarted, setTriviaStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [trackingAmount, setTrackingAmount] = useState('');

  if (!challenge) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500 text-lg">Challenge not found</Text>
      </View>
    );
  }

  const handleStartTrivia = () => {
    setTriviaStarted(true);
    setCurrentQuestion(0);
    setScore(0);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    const questions = triviaQuestions[challengeId as keyof typeof triviaQuestions];
    const isCorrect = selectedAnswer === questions[currentQuestion].correct;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Quiz completed
        const finalScore = isCorrect ? score + 1 : score;
        const pointsEarned = Math.floor((finalScore / questions.length) * challenge.points);
        
        addPoints(pointsEarned);
        completeChallenge(challengeId);
        
        Alert.alert(
          '🎉 Challenge Complete!',
          `You scored ${finalScore}/${questions.length} and earned ${pointsEarned} points!`,
          [{ text: 'Great!', onPress: () => navigation.goBack() }]
        );
      }
    }, 2000);
  };

  const handleRealWorldChallenge = () => {
    // Simulate completing real-world challenges
    if (challenge.type === 'real-world') {
      visitPark();
      completeChallenge(challengeId);
      addPoints(challenge.points);
      
      Alert.alert(
        '📍 Check-in Successful!',
        `Welcome to ${challenge.location}! You've earned ${challenge.points} points.`,
        [{ text: 'Awesome!', onPress: () => navigation.goBack() }]
      );
    }
  };

  const handleTrackingSubmit = () => {
    const amount = parseFloat(trackingAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number');
      return;
    }

    updateTrackingData('water', amount);
    completeChallenge(challengeId);
    addPoints(challenge.points);
    
    Alert.alert(
      '📊 Data Logged!',
      `You've tracked ${amount} gallons of water and earned ${challenge.points} points!`,
      [{ text: 'Nice!', onPress: () => navigation.goBack() }]
    );
  };

  const handleGameChallenge = () => {
    navigation.navigate('Game', { 
      gameType: challenge.id === 'river-cleanup' ? 'cleanup' : 'tree-planting',
      challengeId: challenge.id
    });
  };

  const renderTriviaContent = () => {
    if (!triviaStarted) {
      return (
        <Animated.View entering={FadeInDown.delay(300)} className="px-6">
          <View className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <Text className="text-blue-800 font-bold text-lg mb-2">🧠 Trivia Challenge</Text>
            <Text className="text-blue-700 mb-4">
              Test your knowledge about Georgia's environment with {triviaQuestions[challengeId as keyof typeof triviaQuestions]?.length || 3} questions.
            </Text>
            <Pressable 
              onPress={handleStartTrivia}
              className="bg-blue-600 rounded-2xl py-4 px-6"
            >
              <Text className="text-white font-bold text-center text-lg">Start Quiz</Text>
            </Pressable>
          </View>
        </Animated.View>
      );
    }

    const questions = triviaQuestions[challengeId as keyof typeof triviaQuestions];
    if (!questions) return null;
    
    const question = questions[currentQuestion];

    return (
      <Animated.View entering={FadeInDown.delay(300)} className="px-6">
        <View className="bg-white rounded-2xl p-6 border border-gray-200">
          <Text className="text-gray-600 text-sm mb-2">
            Question {currentQuestion + 1} of {questions.length}
          </Text>
          <Text className="text-gray-900 font-bold text-lg mb-4">
            {question.question}
          </Text>
          
          {question.options.map((option, index) => (
            <Pressable
              key={index}
              onPress={() => handleAnswerSelect(index)}
              disabled={showResult}
              className={`p-4 rounded-xl mb-3 border-2 ${
                showResult
                  ? index === question.correct
                    ? 'bg-green-100 border-green-500'
                    : selectedAnswer === index
                    ? 'bg-red-100 border-red-500'
                    : 'bg-gray-50 border-gray-200'
                  : selectedAnswer === index
                  ? 'bg-blue-100 border-blue-500'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <Text className={`font-semibold ${
                showResult
                  ? index === question.correct
                    ? 'text-green-800'
                    : selectedAnswer === index
                    ? 'text-red-800'
                    : 'text-gray-600'
                  : selectedAnswer === index
                  ? 'text-blue-800'
                  : 'text-gray-700'
              }`}>
                {option}
              </Text>
            </Pressable>
          ))}
          
          {showResult && (
            <Animated.View entering={FadeInUp} className="mt-4 p-4 bg-gray-50 rounded-xl">
              <Text className="text-gray-800 text-sm">
                {question.explanation}
              </Text>
            </Animated.View>
          )}
          
          {selectedAnswer !== null && !showResult && (
            <Pressable 
              onPress={handleNextQuestion}
              className="bg-green-600 rounded-2xl py-3 px-6 mt-4"
            >
              <Text className="text-white font-bold text-center">
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
    );
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
        className="bg-green-600 px-6 py-6 rounded-b-3xl"
      >
        <Text className="text-white text-2xl font-bold mb-2">
          {challenge.title}
        </Text>
        <Text className="text-white/90 text-base mb-4">
          {challenge.description}
        </Text>
        
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-white/80 text-sm mr-4">
              💰 {challenge.points} points
            </Text>
            {challenge.location && (
              <Text className="text-white/80 text-sm">
                📍 {challenge.location}
              </Text>
            )}
          </View>
          
          {challenge.completed && (
            <View className="bg-white/20 rounded-full px-3 py-1">
              <Text className="text-white font-bold text-sm">✅ DONE</Text>
            </View>
          )}
        </View>
      </Animated.View>

      <View className="mt-6">
        {/* Trivia Challenge */}
        {challenge.type === 'trivia' && !challenge.completed && renderTriviaContent()}
        
        {/* Cleanup Game Challenge */}
        {challenge.type === 'cleanup' && !challenge.completed && (
          <Animated.View entering={FadeInDown.delay(300)} className="px-6">
            <View className="bg-cyan-50 rounded-2xl p-6 border border-cyan-200">
              <Text className="text-cyan-800 font-bold text-lg mb-2">🧹 Cleanup Game</Text>
              <Text className="text-cyan-700 mb-4">
                Play an interactive mini-game to clean up Georgia's waterways and earn points!
              </Text>
              <Pressable 
                onPress={handleGameChallenge}
                className="bg-cyan-600 rounded-2xl py-4 px-6"
              >
                <Text className="text-white font-bold text-center text-lg">Start Game</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
        
        {/* Real World Challenge */}
        {challenge.type === 'real-world' && !challenge.completed && (
          <Animated.View entering={FadeInDown.delay(300)} className="px-6">
            <View className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
              <Text className="text-purple-800 font-bold text-lg mb-2">📍 Real World Challenge</Text>
              <Text className="text-purple-700 mb-4">
                Visit {challenge.location} and check in to complete this challenge!
              </Text>
              <Pressable 
                onPress={handleRealWorldChallenge}
                className="bg-purple-600 rounded-2xl py-4 px-6"
              >
                <Text className="text-white font-bold text-center text-lg">Check In Here</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
        
        {/* Tracking Challenge */}
        {challenge.type === 'tracking' && !challenge.completed && (
          <Animated.View entering={FadeInDown.delay(300)} className="px-6">
            <View className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
              <Text className="text-orange-800 font-bold text-lg mb-2">📊 Track Your Impact</Text>
              <Text className="text-orange-700 mb-4">
                Log how much water you've saved today (in gallons):
              </Text>
              <View className="bg-white rounded-xl p-4 border border-orange-200 mb-4">
                <Text className="text-gray-700 text-sm mb-2">Water saved (gallons):</Text>
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-2">💧</Text>
                  <View className="flex-1 bg-gray-100 rounded-lg p-3">
                    <Text 
                      className="text-gray-700 text-lg"
                      onPress={() => {
                        // Simple input simulation - in real app, would use TextInput
                        const amount = Math.floor(Math.random() * 20) + 5;
                        setTrackingAmount(amount.toString());
                      }}
                    >
                      {trackingAmount || 'Tap to enter amount'}
                    </Text>
                  </View>
                </View>
              </View>
              <Pressable 
                onPress={handleTrackingSubmit}
                className="bg-orange-600 rounded-2xl py-4 px-6"
              >
                <Text className="text-white font-bold text-center text-lg">Log Data</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
        
        {/* Completed Challenge */}
        {challenge.completed && (
          <Animated.View entering={FadeInDown.delay(300)} className="px-6">
            <View className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <Text className="text-green-800 font-bold text-lg mb-2">✅ Challenge Completed!</Text>
              <Text className="text-green-700">
                Great job! You've earned {challenge.points} points and contributed to protecting Georgia's environment.
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
      
      <View style={{ height: insets.bottom + 40 }} />
    </ScrollView>
  );
}