import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GamepadIcon, Target, Zap, Heart, Trophy, Timer } from "lucide-react";

const games = [
  {
    id: "breathing",
    name: "Breathing Bubble",
    description: "Follow the bubble to practice deep breathing",
    icon: Heart,
    difficulty: "Easy",
    duration: "2 min",
    category: "Relaxation"
  },
  {
    id: "memory",
    name: "Mindful Memory",
    description: "Memory card game with calming images",
    icon: Target,
    difficulty: "Medium",
    duration: "5 min",
    category: "Focus"
  },
  {
    id: "mood",
    name: "Mood Matcher",
    description: "Match emotions with coping strategies",
    icon: Zap,
    difficulty: "Easy",
    duration: "3 min",
    category: "Learning"
  },
  {
    id: "gratitude",
    name: "Gratitude Garden",
    description: "Plant flowers by listing things you're grateful for",
    icon: Trophy,
    difficulty: "Easy",
    duration: "4 min",
    category: "Positivity"
  }
];

const BreathingGame = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [countdown, setCountdown] = useState(4);
  const [cycle, setCycle] = useState(0);
  const totalCycles = 3;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          if (phase === "inhale") {
            setPhase("hold");
            return 4;
          } else if (phase === "hold") {
            setPhase("exhale");
            return 4;
          } else {
            setPhase("inhale");
            setCycle((prevCycle) => {
              const newCycle = prevCycle + 1;
              if (newCycle >= totalCycles) {
                clearInterval(timer);
                setTimeout(onComplete, 1000);
              }
              return newCycle;
            });
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, onComplete]);

  const getPhaseColor = () => {
    switch (phase) {
      case "inhale": return "bg-primary";
      case "hold": return "bg-warning";
      case "exhale": return "bg-secondary";
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case "inhale": return "Breathe In";
      case "hold": return "Hold";
      case "exhale": return "Breathe Out";
    }
  };

  return (
    <div className="text-center space-y-6 p-6">
      <div className="space-y-2">
        <div className={`w-32 h-32 rounded-full mx-auto ${getPhaseColor()} transition-all duration-1000 animate-pulse`} />
        <h3 className="text-xl font-semibold">{getPhaseText()}</h3>
        <p className="text-3xl font-bold">{countdown}</p>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Cycle {cycle + 1} of {totalCycles}</p>
        <Progress value={(cycle / totalCycles) * 100} className="w-full" />
      </div>
    </div>
  );
};

const MemoryGame = ({ onComplete }: { onComplete: () => void }) => {
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const emojis = ['😊', '🌸', '🦋', '🌈', '⭐', '🌺', '🍀', '💚'];

  useEffect(() => {
    const shuffledCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false
      }));
    setCards(shuffledCards);
  }, []);

  const flipCard = (id: number) => {
    if (flippedCards.length === 2) return;
    
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, flipped: true } : card
    ));
    
    setFlippedCards(prev => [...prev, id]);
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      setMoves(prev => prev + 1);
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard?.emoji === secondCard?.emoji) {
        setCards(prev => prev.map(card => 
          card.id === first || card.id === second 
            ? { ...card, matched: true } 
            : card
        ));
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, flipped: false } 
              : card
          ));
        }, 1000);
      }
      
      setTimeout(() => setFlippedCards([]), 1000);
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.matched)) {
      setTimeout(onComplete, 500);
    }
  }, [cards, onComplete]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Moves: {moves}</p>
      </div>
      <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
        {cards.map((card) => (
          <Button
            key={card.id}
            variant="outline"
            className={`aspect-square text-xl ${
              card.flipped || card.matched ? 'bg-primary/10' : 'bg-muted'
            }`}
            onClick={() => !card.flipped && !card.matched && flipCard(card.id)}
            disabled={card.flipped || card.matched}
          >
            {card.flipped || card.matched ? card.emoji : '?'}
          </Button>
        ))}
      </div>
    </div>
  );
};

const MoodMatcherGame = ({ onComplete }: { onComplete: () => void }) => {
  const [currentEmotion, setCurrentEmotion] = useState<{ emotion: string; strategies: string[] } | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const totalQuestions = 5;

  const emotionStrategies = {
    'Anxious 😰': ['Deep breathing', 'Progressive muscle relaxation', 'Grounding techniques'],
    'Sad 😢': ['Talk to a friend', 'Journal writing', 'Gentle exercise'],
    'Angry 😠': ['Count to ten', 'Physical exercise', 'Express feelings safely'],
    'Stressed 😫': ['Take breaks', 'Practice mindfulness', 'Organize priorities'],
    'Overwhelmed 😵': ['Break tasks down', 'Ask for help', 'Practice self-care']
  };

  useEffect(() => {
    getNewEmotion();
  }, []);

  const getNewEmotion = () => {
    const emotions = Object.keys(emotionStrategies);
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    setCurrentEmotion({
      emotion: randomEmotion,
      strategies: emotionStrategies[randomEmotion as keyof typeof emotionStrategies]
    });
  };

  const handleAnswer = (strategy: string) => {
    if (currentEmotion?.strategies.includes(strategy)) {
      setScore(prev => prev + 1);
    }
    
    setQuestionsAnswered(prev => {
      const newCount = prev + 1;
      if (newCount >= totalQuestions) {
        setTimeout(onComplete, 1000);
      } else {
        setTimeout(getNewEmotion, 1000);
      }
      return newCount;
    });
  };

  const allStrategies = Object.values(emotionStrategies).flat();
  const shuffledOptions = currentEmotion ? 
    [...currentEmotion.strategies, ...allStrategies.filter(s => !currentEmotion.strategies.includes(s))]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4) : [];

  if (!currentEmotion) return null;

  return (
    <div className="space-y-4 text-center">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Question {questionsAnswered + 1} of {totalQuestions} | Score: {score}
        </p>
        <h3 className="text-lg font-semibold">
          When feeling {currentEmotion.emotion}, which strategy helps most?
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {shuffledOptions.map((strategy, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => handleAnswer(strategy)}
            className="text-sm"
          >
            {strategy}
          </Button>
        ))}
      </div>
      
      <Progress value={(questionsAnswered / totalQuestions) * 100} className="w-full" />
    </div>
  );
};

const GratitudeGame = ({ onComplete }: { onComplete: () => void }) => {
  const [gratitudeItems, setGratitudeItems] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const targetItems = 5;

  const addGratitudeItem = () => {
    if (currentInput.trim() && gratitudeItems.length < targetItems) {
      setGratitudeItems(prev => [...prev, currentInput.trim()]);
      setCurrentInput('');
      
      if (gratitudeItems.length + 1 >= targetItems) {
        setTimeout(onComplete, 1000);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Gratitude Garden 🌸</h3>
        <p className="text-sm text-muted-foreground">
          Plant {targetItems} flowers by listing things you're grateful for
        </p>
        <p className="text-xs text-muted-foreground">
          Progress: {gratitudeItems.length}/{targetItems}
        </p>
      </div>

      <div className="space-y-3">
        {gratitudeItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
            <span className="text-lg">🌸</span>
            <span className="text-sm">{item}</span>
          </div>
        ))}
      </div>

      {gratitudeItems.length < targetItems && (
        <div className="space-y-2">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="I'm grateful for..."
            className="w-full p-2 border rounded-md text-sm"
            onKeyPress={(e) => e.key === 'Enter' && addGratitudeItem()}
          />
          <Button size="sm" onClick={addGratitudeItem} disabled={!currentInput.trim()}>
            Plant Flower 🌸
          </Button>
        </div>
      )}

      <Progress value={(gratitudeItems.length / targetItems) * 100} className="w-full" />
    </div>
  );
};

const WellnessGames = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [completedGames, setCompletedGames] = useState<string[]>([]);

  const startGame = (gameId: string) => {
    setActiveGame(gameId);
  };

  const completeGame = () => {
    if (activeGame) {
      setCompletedGames(prev => [...prev, activeGame]);
    }
    setActiveGame(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-success text-white";
      case "Medium": return "bg-warning text-white";
      case "Hard": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (activeGame === "breathing") {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            Breathing Bubble
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BreathingGame onComplete={completeGame} />
        </CardContent>
      </Card>
    );
  }

  if (activeGame === "memory") {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Mindful Memory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MemoryGame onComplete={completeGame} />
        </CardContent>
      </Card>
    );
  }

  if (activeGame === "mood") {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Mood Matcher
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MoodMatcherGame onComplete={completeGame} />
        </CardContent>
      </Card>
    );
  }

  if (activeGame === "gratitude") {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Gratitude Garden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GratitudeGame onComplete={completeGame} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GamepadIcon className="h-6 w-6 text-primary" />
          Interactive Wellness Games
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map((game) => (
            <Card key={game.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <game.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center gap-2">
                      {game.name}
                      {completedGames.includes(game.id) && (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">{game.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={getDifficultyColor(game.difficulty)}>
                        {game.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Timer className="h-3 w-3 mr-1" />
                        {game.duration}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {game.category}
                      </Badge>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => startGame(game.id)}
                      disabled={activeGame !== null}
                    >
                      {completedGames.includes(game.id) ? "Play Again" : "Start Game"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {completedGames.length > 0 && (
          <Card className="mt-6 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold">Your Progress</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                You've completed {completedGames.length} out of {games.length} wellness games today!
              </p>
              <Progress value={(completedGames.length / games.length) * 100} className="w-full" />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default WellnessGames;