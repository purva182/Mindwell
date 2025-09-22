import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Star, Send, ThumbsUp } from "lucide-react";

const FeedbackForm = () => {
  const [rating, setRating] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const feedbackTypes = [
    { value: "bug", label: "Bug Report", color: "bg-red-100 text-red-800" },
    { value: "feature", label: "Feature Request", color: "bg-blue-100 text-blue-800" },
    { value: "improvement", label: "Improvement", color: "bg-green-100 text-green-800" },
    { value: "general", label: "General Feedback", color: "bg-purple-100 text-purple-800" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would normally send data to backend
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  if (submitted) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
            <ThumbsUp className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-xl font-semibold">Thank You!</h3>
          <p className="text-muted-foreground">
            Your feedback has been received and will help us improve MindWell.
          </p>
          <Badge className="bg-success text-white">
            Feedback Submitted Successfully
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Send Us Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              How would you rate your experience with MindWell?
            </Label>
            <RadioGroup value={rating} onValueChange={setRating}>
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="flex items-center space-x-2">
                    <RadioGroupItem value={star.toString()} id={`star-${star}`} />
                    <Label htmlFor={`star-${star}`} className="flex items-center gap-1 cursor-pointer">
                      <Star className={`h-4 w-4 ${rating && parseInt(rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                      <span className="text-sm">{star}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Feedback Type */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              What type of feedback would you like to share?
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {feedbackTypes.map((type) => (
                <Button
                  key={type.value}
                  type="button"
                  variant={feedbackType === type.value ? "default" : "outline"}
                  onClick={() => setFeedbackType(type.value)}
                  className="justify-start h-auto p-3"
                >
                  <Badge className={`mr-2 ${type.color}`}>
                    {type.label}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email (optional) - for follow-up
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="mt-1"
            />
          </div>

          {/* Feedback Text */}
          <div>
            <Label htmlFor="feedback" className="text-sm font-medium">
              Your Feedback *
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please share your thoughts, suggestions, or report any issues you've encountered..."
              className="mt-1 h-32"
              required
            />
          </div>

          {/* Privacy Notice */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Privacy Note:</strong> Your feedback helps us improve MindWell. 
              We may use your comments to enhance our services, but will never share 
              personal information without your consent.
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={!feedback.trim() || !rating || !feedbackType}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;