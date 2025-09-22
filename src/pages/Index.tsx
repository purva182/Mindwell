import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const questions = [
  {
    id: "mood",
    question: "How would you rate your current mood?",
    type: "scale",
    options: ["Very Poor", "Poor", "Fair", "Good", "Excellent"]
  },
  {
    id: "sleep",
    question: "How many hours of sleep did you get last night?",
    type: "number"
  },
  {
    id: "stress",
    question: "On a scale of 1-10, how stressed do you feel today?",
    type: "scale",
    options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
  },
  {
    id: "support",
    question: "Do you feel you have adequate support from friends and family?",
    type: "scale",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
  },
  {
    id: "goals",
    question: "What would you like to focus on improving?",
    type: "textarea"
  }
];

const Index = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [showIntro, setShowIntro] = useState(true);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (showIntro) {
    return (
      <div className="professional-page min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl bg-white border-professional-border">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-professional text-professional-text">
              MindWell Support Center
            </CardTitle>
            <CardDescription className="text-lg text-professional-text/70">
              Welcome to your personalized mental health assessment. This professional evaluation will help us understand your current state and provide tailored support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-professional-text font-medium">
                  Please enter your name to begin
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 border-professional-border focus:border-professional-primary"
                  placeholder="Your full name"
                />
              </div>
              <div className="bg-professional-bg/50 p-4 rounded-lg">
                <h3 className="font-medium text-professional-text mb-2">Assessment Overview</h3>
                <ul className="text-sm text-professional-text/70 space-y-1">
                  <li>• 5-minute professional assessment</li>
                  <li>• Confidential and secure</li>
                  <li>• Personalized recommendations</li>
                  <li>• Evidence-based approach</li>
                </ul>
              </div>
              <Button
                onClick={() => setShowIntro(false)}
                disabled={!name.trim()}
                className="w-full bg-professional-primary text-white hover:bg-professional-primary/90"
              >
                Begin Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="professional-page min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl bg-white border-professional-border">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-xl font-professional text-professional-text">
              Question {currentQuestion + 1} of {questions.length}
            </CardTitle>
            <span className="text-sm text-professional-text/70">{name}</span>
          </div>
          <div className="w-full bg-professional-border rounded-full h-2">
            <div
              className="bg-professional-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-professional-text">
              {currentQ.question}
            </h2>

            {currentQ.type === "scale" && (
              <RadioGroup
                value={answers[currentQ.id] || ""}
                onValueChange={(value) => handleAnswer(currentQ.id, value)}
              >
                {currentQ.options!.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="text-professional-text">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQ.type === "number" && (
              <Input
                type="number"
                value={answers[currentQ.id] || ""}
                onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                className="border-professional-border focus:border-professional-primary"
                placeholder="Enter number"
              />
            )}

            {currentQ.type === "textarea" && (
              <Textarea
                value={answers[currentQ.id] || ""}
                onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                className="border-professional-border focus:border-professional-primary"
                placeholder="Please share your thoughts..."
                rows={4}
              />
            )}

            <div className="flex justify-between">
              <Button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                variant="outline"
                className="border-professional-border text-professional-text"
              >
                Previous
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={!answers[currentQ.id]}
                className="bg-professional-primary text-white hover:bg-professional-primary/90"
              >
                {currentQuestion === questions.length - 1 ? "Complete Assessment" : "Next"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;