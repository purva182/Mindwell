import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, RefreshCw, Brain, Heart, Smile, Zap } from "lucide-react";

const healthFacts = [
  {
    fact: "Laughing for 15 minutes can burn as many calories as walking for 30 minutes!",
    category: "Physical Health",
    icon: Smile,
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    fact: "Your brain uses about 20% of your body's total energy, even though it only weighs about 3 pounds.",
    category: "Brain Health",
    icon: Brain,
    color: "bg-purple-100 text-purple-800"
  },
  {
    fact: "Spending just 5 minutes in nature can boost your mood and reduce stress hormones.",
    category: "Mental Health",
    icon: Heart,
    color: "bg-green-100 text-green-800"
  },
  {
    fact: "Listening to music can increase your pain tolerance by up to 15%.",
    category: "Wellness",
    icon: Zap,
    color: "bg-blue-100 text-blue-800"
  },
  {
    fact: "Hugging for 20 seconds releases oxytocin, which can help lower blood pressure and reduce stress.",
    category: "Social Health",
    icon: Heart,
    color: "bg-pink-100 text-pink-800"
  },
  {
    fact: "Dark chocolate contains compounds that can improve brain function and boost your mood.",
    category: "Nutrition",
    icon: Brain,
    color: "bg-amber-100 text-amber-800"
  },
  {
    fact: "Walking backwards can improve your balance and work different muscle groups.",
    category: "Physical Health",
    icon: Zap,
    color: "bg-indigo-100 text-indigo-800"
  },
  {
    fact: "Gratitude journaling for just 5 minutes a day can increase happiness by 25%.",
    category: "Mental Health",
    icon: Smile,
    color: "bg-teal-100 text-teal-800"
  },
  {
    fact: "Your sense of smell is directly connected to the memory center of your brain.",
    category: "Brain Health",
    icon: Brain,
    color: "bg-violet-100 text-violet-800"
  },
  {
    fact: "Smiling, even when you don't feel like it, can trick your brain into feeling happier.",
    category: "Psychology",
    icon: Smile,
    color: "bg-rose-100 text-rose-800"
  },
  {
    fact: "Power posing for 2 minutes can increase confidence hormones by 20%.",
    category: "Psychology",
    icon: Zap,
    color: "bg-emerald-100 text-emerald-800"
  },
  {
    fact: "Pets can help reduce anxiety, depression, and blood pressure in their owners.",
    category: "Social Health",
    icon: Heart,
    color: "bg-cyan-100 text-cyan-800"
  }
];

const HealthFacts = () => {
  const [currentFact, setCurrentFact] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  useEffect(() => {
    if (!isAutoplay) return;

    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % healthFacts.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isAutoplay]);

  const nextFact = () => {
    setCurrentFact((prev) => (prev + 1) % healthFacts.length);
    setIsAutoplay(false);
  };

  const fact = healthFacts[currentFact];

  return (
    <Card className="shadow-soft relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          Fun Health Facts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <div className="absolute -top-2 -right-2 opacity-10">
            <fact.icon className="h-24 w-24" />
          </div>
          
          <div className="relative z-10">
            <Badge className={`mb-3 ${fact.color}`}>
              {fact.category}
            </Badge>
            
            <p className="text-lg leading-relaxed mb-4 fade-in">
              💡 {fact.fact}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Fact {currentFact + 1} of {healthFacts.length}
                </span>
                <div className="flex gap-1">
                  {healthFacts.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentFact ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAutoplay(!isAutoplay)}
                >
                  {isAutoplay ? "Pause" : "Auto"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextFact}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress bar for autoplay */}
        {isAutoplay && (
          <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-100 ease-linear"
              style={{
                animation: 'progressBar 8s linear infinite',
                transformOrigin: 'left'
              }}
            />
          </div>
        )}
      </CardContent>
      
      <style>
        {`
          @keyframes progressBar {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }
        `}
      </style>
    </Card>
  );
};

export default HealthFacts;