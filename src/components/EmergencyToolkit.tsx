import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageSquare, Heart, AlertTriangle, Clock, MapPin, Zap, X } from "lucide-react";

const emergencyContacts = [
  {
    name: "Crisis Text Line",
    number: "Text HOME to 741741",
    description: "24/7 crisis support via text",
    icon: MessageSquare,
    type: "text",
    severity: "crisis"
  },
  {
    name: "National Suicide Prevention Lifeline",
    number: "988",
    description: "Free, confidential 24/7 support",
    icon: Phone,
    type: "call",
    severity: "crisis"
  },
  {
    name: "SAMHSA National Helpline",
    number: "1-800-662-4357",
    description: "Mental health and substance abuse",
    icon: Phone,
    type: "call",
    severity: "support"
  },
  {
    name: "Emergency Services",
    number: "911",
    description: "Immediate emergency assistance",
    icon: AlertTriangle,
    type: "call",
    severity: "emergency"
  }
];

const quickTools = [
  {
    name: "5-4-3-2-1 Grounding",
    description: "5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste",
    icon: Heart,
    color: "bg-primary",
    action: "grounding"
  },
  {
    name: "Box Breathing",
    description: "Breathe in 4, hold 4, out 4, hold 4",
    icon: Clock,
    color: "bg-secondary",
    action: "breathing"
  },
  {
    name: "Safe Space Locator",
    description: "Find nearby mental health facilities",
    icon: MapPin,
    color: "bg-accent",
    action: "location"
  },
  {
    name: "Positive Affirmations",
    description: "Calming self-talk to reduce anxiety",
    icon: Heart,
    color: "bg-info",
    action: "affirmations"
  },
  {
    name: "Progressive Muscle Relaxation",
    description: "Tense and release muscle groups",
    icon: Zap,
    color: "bg-success",
    action: "relaxation"
  },
  {
    name: "Emergency Contact",
    description: "Quick access to your emergency contacts",
    icon: Phone,
    color: "bg-warning",
    action: "contacts"
  }
];

const GroundingExercise = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const steps = [
    "Take a deep breath and look around. Name 5 things you can see.",
    "Now focus on your sense of touch. Name 4 things you can touch or feel.",
    "Listen carefully. Name 3 things you can hear right now.",
    "Focus on your sense of smell. Name 2 things you can smell.",
    "Finally, name 1 thing you can taste."
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            5-4-3-2-1 Grounding Exercise
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">
              Step {step + 1} of 5
            </div>
            <p className="text-sm leading-relaxed">{steps[step]}</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="flex-1"
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (step < steps.length - 1) {
                  setStep(step + 1);
                } else {
                  onClose();
                }
              }}
              className="flex-1"
            >
              {step === steps.length - 1 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const BreathingExercise = ({ onClose }: { onClose: () => void }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [isActive, setIsActive] = useState(false);

  const startExercise = () => {
    setIsActive(true);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          setPhase(current => {
            switch (current) {
              case 'inhale': return 'hold1';
              case 'hold1': return 'exhale';
              case 'exhale': return 'hold2';
              case 'hold2': return 'inhale';
            }
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
      setIsActive(false);
    }, 60000); // 1 minute exercise
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold1': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold2': return 'Hold';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Box Breathing Exercise
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-4">
            <div className={`w-24 h-24 mx-auto rounded-full bg-primary transition-all duration-1000 ${
              isActive ? 'animate-pulse' : ''
            }`} />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{getPhaseText()}</h3>
              {isActive && <p className="text-3xl font-bold">{countdown}</p>}
            </div>
          </div>
          
          {!isActive ? (
            <Button onClick={startExercise} className="w-full">
              Start 1-Minute Exercise
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Continue breathing with the rhythm...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const EmergencyToolkit = () => {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "crisis": return "bg-destructive text-destructive-foreground";
      case "emergency": return "bg-red-600 text-white";
      case "support": return "bg-info text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleToolAction = (action: string) => {
    switch (action) {
      case 'grounding':
        setActiveExercise('grounding');
        break;
      case 'breathing':
        setActiveExercise('breathing');
        break;
      case 'location':
        window.open('https://www.samhsa.gov/find-help/national-helpline', '_blank');
        break;
      case 'affirmations':
        alert('Repeat: "I am safe. This feeling will pass. I can handle this."');
        break;
      case 'relaxation':
        alert('Progressive Muscle Relaxation: Start with your toes, tense for 5 seconds, then release. Move up through each muscle group.');
        break;
      case 'contacts':
        alert('Call your emergency contact or 988 for immediate support.');
        break;
    }
  };

  return (
    <Card className="shadow-soft border-l-4 border-l-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-6 w-6" />
          Emergency Toolkit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Emergency Contacts */}
        <div>
          <h3 className="font-semibold mb-3">Crisis Support</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {emergencyContacts.map((contact, index) => (
              <Card key={index} className="border-l-4 border-l-destructive/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <contact.icon className="h-5 w-5 text-destructive mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{contact.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{contact.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(contact.severity)}>
                          {contact.number}
                        </Badge>
                        <Button size="sm" variant="outline" className="h-6 text-xs">
                          {contact.type === "call" ? "Call" : "Text"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Coping Tools */}
        <div>
          <h3 className="font-semibold mb-3">Quick Coping Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickTools.map((tool, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex-col items-start text-left hover:shadow-md"
                onClick={() => handleToolAction(tool.action)}
              >
                <div className={`p-2 rounded-full ${tool.color} text-white mb-2`}>
                  <tool.icon className="h-4 w-4" />
                </div>
                <h4 className="font-medium text-sm mb-1">{tool.name}</h4>
                <p className="text-xs text-muted-foreground">{tool.description}</p>
              </Button>
            ))}
          </div>
        </div>

        {/* Safety Plan Reminder */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">Remember Your Safety Plan</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              If you're having thoughts of self-harm, follow your personal safety plan or reach out for help immediately.
            </p>
            <Button size="sm" className="w-full">
              View My Safety Plan
            </Button>
          </CardContent>
        </Card>

        {/* Interactive Exercises */}
        {activeExercise === 'grounding' && (
          <GroundingExercise onClose={() => setActiveExercise(null)} />
        )}
        
        {activeExercise === 'breathing' && (
          <BreathingExercise onClose={() => setActiveExercise(null)} />
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyToolkit;