import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useGameStore } from '../state/gameStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeOutUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;

interface GameItem {
  id: string;
  emoji: string;
  type: 'pollution' | 'tree' | 'good' | 'bad';
  x: number;
  y: number;
}

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<GameScreenRouteProp>();
  const navigation = useNavigation();
  const { gameType, challengeId } = route.params;
  
  const { completeChallenge, addPoints } = useGameStore();
  
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameItems, setGameItems] = useState<GameItem[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const scoreScale = useSharedValue(1);
  const gameAreaOpacity = useSharedValue(1);

  // Initialize game items based on game type
  const initializeGame = () => {
    const items: GameItem[] = [];
    const itemCount = 15;
    
    for (let i = 0; i < itemCount; i++) {
      let item: GameItem;
      
      if (gameType === 'cleanup') {
        // River cleanup game - remove pollution
        const pollutionItems = ['🗑️', '🛢️', '🥫', '🍾', '👟', '🎣', '💊'];
        const goodItems = ['🐟', '🦆', '🌿', '💧'];
        
        const isPollution = Math.random() > 0.3;
        item = {
          id: `item-${i}`,
          emoji: isPollution 
            ? pollutionItems[Math.floor(Math.random() * pollutionItems.length)]
            : goodItems[Math.floor(Math.random() * goodItems.length)],
          type: isPollution ? 'pollution' : 'good',
          x: Math.random() * 250 + 50,
          y: Math.random() * 400 + 100,
        };
      } else {
        // Tree planting game - plant trees in good spots
        const treeItems = ['🌳', '🌲', '🌱'];
        const badSpots = ['🏢', '🚗', '🛣️', '⚡'];
        const goodSpots = ['🟫', '🌾', '🌼'];
        
        const isTree = Math.random() > 0.7;
        if (isTree) {
          item = {
            id: `item-${i}`,
            emoji: treeItems[Math.floor(Math.random() * treeItems.length)],
            type: 'tree',
            x: Math.random() * 250 + 50,
            y: Math.random() * 400 + 100,
          };
        } else {
          const isGoodSpot = Math.random() > 0.4;
          item = {
            id: `item-${i}`,
            emoji: isGoodSpot 
              ? goodSpots[Math.floor(Math.random() * goodSpots.length)]
              : badSpots[Math.floor(Math.random() * badSpots.length)],
            type: isGoodSpot ? 'good' : 'bad',
            x: Math.random() * 250 + 50,
            y: Math.random() * 400 + 100,
          };
        }
      }
      
      items.push(item);
    }
    
    setGameItems(items);
  };

  const handleItemPress = (item: GameItem) => {
    let points = 0;
    let shouldRemove = false;
    
    if (gameType === 'cleanup') {
      if (item.type === 'pollution') {
        points = 10;
        shouldRemove = true;
      } else if (item.type === 'good') {
        // Penalty for removing good items
        points = -5;
      }
    } else {
      // Tree planting
      if (item.type === 'good' && Math.random() > 0.5) {
        // Plant tree on good spot
        points = 15;
        shouldRemove = true;
        // Add a tree emoji to show planting
        setGameItems(prev => prev.map(i => 
          i.id === item.id 
            ? { ...i, emoji: '🌳', type: 'tree' }
            : i
        ));
      } else if (item.type === 'bad') {
        // Penalty for planting in bad spots
        points = -5;
      } else if (item.type === 'tree') {
        // Bonus for existing trees
        points = 5;
      }
    }
    
    if (points !== 0) {
      setScore(prev => Math.max(0, prev + points));
      
      // Animate score change
      scoreScale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
      
      if (shouldRemove) {
        setGameItems(prev => prev.filter(i => i.id !== item.id));
      }
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    initializeGame();
  };

  const endGame = () => {
    setGameOver(true);
    
    // Calculate final score and complete challenge
    const finalScore = Math.max(score, 0);
    const pointsEarned = Math.floor(finalScore * 2); // Convert game score to challenge points
    
    if (finalScore > 50) {
      addPoints(pointsEarned);
      completeChallenge(challengeId);
      
      Alert.alert(
        '🎉 Game Complete!',
        `Great job! You scored ${finalScore} points and earned ${pointsEarned} challenge points!`,
        [{ text: 'Awesome!', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert(
        '🎮 Good Try!',
        `You scored ${finalScore} points. Try again to earn more points!`,
        [
          { text: 'Try Again', onPress: startGame },
          { text: 'Back', onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameOver && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      endGame();
    }
  }, [gameStarted, gameOver, timeLeft]);

  const animatedScoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const getGameTitle = () => {
    return gameType === 'cleanup' 
      ? 'River Cleanup Game 🌊' 
      : 'Tree Planting Game 🌳';
  };

  const getGameInstructions = () => {
    return gameType === 'cleanup'
      ? 'Tap on pollution items (🗑️ 🛢️ 🥫) to clean the river. Avoid tapping fish and plants!'
      : 'Tap on good spots (🟫 🌾 🌼) to plant trees. Avoid bad spots like roads and buildings!';
  };

  if (!gameStarted) {
    return (
      <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
        <Animated.View 
          entering={FadeInDown.delay(100)} 
          className="flex-1 px-6 justify-center"
        >
          <View className="bg-white rounded-3xl p-8 items-center">
            <Text className="text-4xl mb-4">
              {gameType === 'cleanup' ? '🌊' : '🌳'}
            </Text>
            <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
              {getGameTitle()}
            </Text>
            <Text className="text-gray-600 text-center mb-6 leading-6">
              {getGameInstructions()}
            </Text>
            
            <View className="bg-blue-50 rounded-2xl p-4 mb-6 w-full">
              <Text className="text-blue-800 font-bold text-center mb-2">Game Rules:</Text>
              <Text className="text-blue-700 text-sm text-center">
                • 60 seconds to score as many points as possible{'\n'}
                • Need 50+ points to complete the challenge{'\n'}
                • Good choices: +10-15 points{'\n'}
                • Wrong choices: -5 points
              </Text>
            </View>
            
            <Pressable 
              onPress={startGame}
              className="bg-green-600 rounded-2xl py-4 px-8 w-full"
            >
              <Text className="text-white font-bold text-center text-lg">
                Start Game
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blue-100" style={{ paddingTop: insets.top }}>
      {/* Game Header */}
      <Animated.View 
        entering={FadeInDown.delay(100)} 
        className="flex-row justify-between items-center px-6 py-4 bg-white/90"
      >
        <Animated.View style={animatedScoreStyle}>
          <Text className="text-green-600 font-bold text-xl">
            Score: {score}
          </Text>
        </Animated.View>
        
        <Text className="text-red-600 font-bold text-xl">
          Time: {timeLeft}s
        </Text>
      </Animated.View>

      {/* Game Area */}
      <Animated.View 
        entering={FadeInUp.delay(200)}
        className="flex-1 relative"
        style={{ opacity: gameAreaOpacity }}
      >
        {gameItems.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(300 + index * 50)}
            exiting={FadeOutUp}
            className="absolute"
            style={{
              left: item.x,
              top: item.y,
            }}
          >
            <Pressable
              onPress={() => handleItemPress(item)}
              className="bg-white/80 rounded-full p-2"
            >
              <Text className="text-3xl">{item.emoji}</Text>
            </Pressable>
          </Animated.View>
        ))}
        
        {/* Game background elements */}
        <View className="absolute inset-0">
          {gameType === 'cleanup' ? (
            <Text className="text-8xl opacity-20 text-center mt-20">🌊</Text>
          ) : (
            <Text className="text-8xl opacity-20 text-center mt-20">🏞️</Text>
          )}
        </View>
      </Animated.View>

      {/* Instructions */}
      <View className="px-6 pb-4">
        <Text className="text-center text-gray-700 text-sm">
          {getGameInstructions()}
        </Text>
      </View>
    </View>
  );
}