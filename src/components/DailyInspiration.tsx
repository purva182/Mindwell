import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, RefreshCw, Heart, Star, Sunrise, Moon } from 'lucide-react';

const inspirationalQuotes = [
  {
    quote: "The only way out is through.",
    author: "Robert Frost",
    category: "Resilience",
    icon: Heart,
    timeOfDay: "morning"
  },
  {
    quote: "You are stronger than you think and more capable than you imagine.",
    author: "Anonymous",
    category: "Self-Belief",
    icon: Star,
    timeOfDay: "morning"
  },
  {
    quote: "Progress, not perfection, is the goal.",
    author: "Anonymous",
    category: "Growth",
    icon: Sunrise,
    timeOfDay: "afternoon"
  },
  {
    quote: "It's okay to not be okay. It's not okay to stay that way.",
    author: "Anonymous",
    category: "Hope",
    icon: Heart,
    timeOfDay: "evening"
  },
  {
    quote: "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
    author: "Anonymous",
    category: "Self-Care",
    icon: Star,
    timeOfDay: "morning"
  },
  {
    quote: "Healing isn't about getting back to who you were. It's about becoming who you're meant to be.",
    author: "Anonymous",
    category: "Healing",
    icon: Sunrise,
    timeOfDay: "afternoon"
  },
  {
    quote: "Tomorrow is the first day of the rest of your life.",
    author: "Anonymous",
    category: "New Beginnings",
    icon: Moon,
    timeOfDay: "evening"
  },
  {
    quote: "You have been assigned this mountain to show others it can be moved.",
    author: "Mel Robbins",
    category: "Purpose",
    icon: Star,
    timeOfDay: "morning"
  },
  {
    quote: "Your current situation is not your final destination.",
    author: "Anonymous",
    category: "Hope",
    icon: Sunrise,
    timeOfDay: "afternoon"
  },
  {
    quote: "Take time to rest tonight. Tomorrow is a new day with new possibilities.",
    author: "Anonymous",
    category: "Rest",
    icon: Moon,
    timeOfDay: "evening"
  },
  {
    quote: "Small steps in the right direction can turn out to be the biggest steps of your life.",
    author: "Anonymous",
    category: "Progress",
    icon: Star,
    timeOfDay: "morning"
  },
  {
    quote: "The brave may not live forever, but the cautious do not live at all.",
    author: "Richard Branson",
    category: "Courage",
    icon: Heart,
    timeOfDay: "afternoon"
  }
];

const affirmations = [
  "I am worthy of love and respect",
  "I choose peace over worry",
  "I am resilient and can handle challenges",
  "I deserve happiness and joy",
  "I am enough, just as I am",
  "I trust my ability to overcome difficulties",
  "I am growing stronger every day",
  "I choose to focus on what I can control",
  "I am grateful for this moment",
  "I have the power to create positive change"
];

const DailyInspiration = () => {
  const [currentQuote, setCurrentQuote] = useState(inspirationalQuotes[0]);
  const [currentAffirmation, setCurrentAffirmation] = useState(affirmations[0]);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  useEffect(() => {
    const hour = new Date().getHours();
    let period: 'morning' | 'afternoon' | 'evening';
    
    if (hour < 12) {
      period = 'morning';
    } else if (hour < 18) {
      period = 'afternoon';
    } else {
      period = 'evening';
    }
    
    setTimeOfDay(period);
    
    // Get quote appropriate for time of day
    const timeBasedQuotes = inspirationalQuotes.filter(q => q.timeOfDay === period);
    const randomQuote = timeBasedQuotes[Math.floor(Math.random() * timeBasedQuotes.length)] || inspirationalQuotes[0];
    setCurrentQuote(randomQuote);
    
    // Random affirmation
    const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    setCurrentAffirmation(randomAffirmation);
  }, []);

  const getNewQuote = () => {
    const availableQuotes = inspirationalQuotes.filter(q => q.quote !== currentQuote.quote);
    const randomQuote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
    setCurrentQuote(randomQuote);
  };

  const getNewAffirmation = () => {
    const availableAffirmations = affirmations.filter(a => a !== currentAffirmation);
    const randomAffirmation = availableAffirmations[Math.floor(Math.random() * availableAffirmations.length)];
    setCurrentAffirmation(randomAffirmation);
  };

  const getTimeGreeting = () => {
    switch (timeOfDay) {
      case 'morning':
        return { text: 'Good Morning', icon: Sunrise, color: 'text-amber-500' };
      case 'afternoon':
        return { text: 'Good Afternoon', icon: Star, color: 'text-yellow-500' };
      case 'evening':
        return { text: 'Good Evening', icon: Moon, color: 'text-blue-500' };
    }
  };

  const greeting = getTimeGreeting();
  const GreetingIcon = greeting.icon;

  const getCategoryColor = (category: string) => {
    const colors = {
      'Resilience': 'bg-emerald-100 text-emerald-800',
      'Self-Belief': 'bg-blue-100 text-blue-800',
      'Growth': 'bg-purple-100 text-purple-800',
      'Hope': 'bg-pink-100 text-pink-800',
      'Self-Care': 'bg-indigo-100 text-indigo-800',
      'Healing': 'bg-green-100 text-green-800',
      'New Beginnings': 'bg-yellow-100 text-yellow-800',
      'Purpose': 'bg-red-100 text-red-800',
      'Rest': 'bg-slate-100 text-slate-800',
      'Progress': 'bg-orange-100 text-orange-800',
      'Courage': 'bg-teal-100 text-teal-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="shadow-soft border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          Daily Inspiration
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GreetingIcon className={`h-4 w-4 ${greeting.color}`} />
          <span>{greeting.text}! Here's your inspiration for today</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inspirational Quote */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <currentQuote.icon className="h-8 w-8 text-primary" />
            </div>
            <blockquote className="text-lg font-medium leading-relaxed">
              "{currentQuote.quote}"
            </blockquote>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">— {currentQuote.author}</span>
              <Badge className={getCategoryColor(currentQuote.category)}>
                {currentQuote.category}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={getNewQuote}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              New Quote
            </Button>
          </CardContent>
        </Card>

        {/* Daily Affirmation */}
        <Card className="bg-gradient-to-br from-accent/10 to-muted/10">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <Heart className="h-6 w-6 text-accent fill-current" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Daily Affirmation</h3>
              <p className="text-lg font-medium text-accent">
                {currentAffirmation}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={getNewAffirmation}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              New Affirmation
            </Button>
          </CardContent>
        </Card>

        {/* Mindful Moment */}
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">💫 Mindful Moment</h4>
              <p className="text-xs text-muted-foreground">
                Take three deep breaths and remind yourself: 
                <br />
                <span className="font-medium">"I am exactly where I need to be in this moment."</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default DailyInspiration;