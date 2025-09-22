import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import EmergencyAlertSystem from '@/components/EmergencyAlertSystem';

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself"
];

const RESPONSE_OPTIONS = [
  { value: "0", label: "Not at all" },
  { value: "1", label: "Several days" },
  { value: "2", label: "More than half the days" },
  { value: "3", label: "Nearly every day" }
];

const getSeverityLevel = (score: number) => {
  if (score <= 4) return { level: "Minimal", description: "Minimal depression symptoms" };
  if (score <= 9) return { level: "Mild", description: "Mild depression symptoms" };
  if (score <= 14) return { level: "Moderate", description: "Moderate depression symptoms" };
  if (score <= 19) return { level: "Moderately Severe", description: "Moderately severe depression symptoms" };
  return { level: "Severe", description: "Severe depression symptoms" };
};

interface PHQ9QuestionnaireProps {
  onComplete: (score: number, severity: string) => void;
  onClose: () => void;
}

export default function PHQ9Questionnaire({ onComplete, onClose }: PHQ9QuestionnaireProps) {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [alertData, setAlertData] = useState<{ score: number; severity: string } | null>(null);

  const handleResponse = (value: string) => {
    setResponses(prev => ({ ...prev, [currentQuestion]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestion < PHQ9_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      submitQuestionnaire();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitQuestionnaire = async () => {
    setIsSubmitting(true);
    
    try {
      const totalScore = Object.values(responses).reduce((sum, response) => sum + parseInt(response), 0);
      const { level, description } = getSeverityLevel(totalScore);

      const { error } = await supabase
        .from('questionnaire_responses')
        .insert({
          user_id: user.id,
          questionnaire_type: 'PHQ9',
          responses: responses,
          total_score: totalScore,
          severity_level: level
        });

      if (error) throw error;

      toast({
        title: "Assessment Complete",
        description: `Your PHQ-9 score: ${totalScore}/27 (${level})`,
      });

      // Trigger emergency alert if needed
      if (level === 'Moderately Severe' || level === 'Severe') {
        setAlertData({ score: totalScore, severity: level });
        setShowEmergencyAlert(true);
      }

      onComplete(totalScore, level);
    } catch (error: any) {
      console.error('Error submitting PHQ-9:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to save your assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestion + 1) / PHQ9_QUESTIONS.length) * 100;
  const currentResponse = responses[currentQuestion] || "";

  return (
    <>
      {showEmergencyAlert && alertData && (
        <EmergencyAlertSystem 
          score={alertData.score}
          severity={alertData.severity}
          questionnaireType="PHQ9"
        />
      )}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-center">PHQ-9 Depression Assessment</CardTitle>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Question {currentQuestion + 1} of {PHQ9_QUESTIONS.length}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">
              Over the last 2 weeks, how often have you been bothered by:
            </h3>
            <p className="text-base mb-6 p-4 bg-muted rounded-lg">
              {PHQ9_QUESTIONS[currentQuestion]}
            </p>
          </div>

          <RadioGroup value={currentResponse} onValueChange={handleResponse}>
            {RESPONSE_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={option.value} id={`option-${option.value}`} />
                <Label htmlFor={`option-${option.value}`} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={currentQuestion === 0 ? onClose : prevQuestion}
            >
              {currentQuestion === 0 ? 'Cancel' : 'Previous'}
            </Button>
            
            <Button 
              onClick={nextQuestion}
              disabled={!currentResponse || isSubmitting}
            >
              {isSubmitting 
                ? 'Submitting...' 
                : currentQuestion === PHQ9_QUESTIONS.length - 1 
                  ? 'Complete Assessment' 
                  : 'Next'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}