import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Star, Video, Phone, MessageCircle, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const counselors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Anxiety & Depression",
    rating: 4.9,
    experience: "8 years",
    avatar: "SJ",
    available: ["Today 2:00 PM", "Tomorrow 10:00 AM", "Friday 3:30 PM"],
    sessionTypes: ["Video", "Phone", "Chat"]
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Trauma & PTSD",
    rating: 4.8,
    experience: "12 years",
    avatar: "MC",
    available: ["Today 4:00 PM", "Thursday 1:00 PM", "Friday 11:00 AM"],
    sessionTypes: ["Video", "Phone"]
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Relationship Counseling",
    rating: 4.7,
    experience: "6 years",
    avatar: "ER",
    available: ["Tomorrow 9:00 AM", "Wednesday 2:00 PM", "Friday 4:00 PM"],
    sessionTypes: ["Video", "Chat"]
  },
  {
    id: 4,
    name: "Dr. James Williams",
    specialty: "Stress Management",
    rating: 4.9,
    experience: "10 years",
    avatar: "JW",
    available: ["Today 5:00 PM", "Thursday 11:00 AM", "Saturday 10:00 AM"],
    sessionTypes: ["Video", "Phone", "Chat"]
  }
];

const CounselorBooking = () => {
  const [selectedCounselor, setSelectedCounselor] = useState<number | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSessionType, setSelectedSessionType] = useState<string>("");
  const [bookingComplete, setBookingComplete] = useState(false);

  const getSessionIcon = (type: string) => {
    switch (type) {
      case "Video": return <Video className="h-4 w-4" />;
      case "Phone": return <Phone className="h-4 w-4" />;
      case "Chat": return <MessageCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleBookAppointment = (counselorId: number) => {
    setSelectedCounselor(counselorId);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    const counselor = counselors.find(c => c.id === selectedCounselor);
    
    toast({
      title: "Appointment Booked!",
      description: `Your ${selectedSessionType} session with ${counselor?.name} is scheduled for ${selectedDate} at ${selectedTime}.`,
    });

    setBookingComplete(true);
    setTimeout(() => {
      setShowBookingModal(false);
      setBookingComplete(false);
      setSelectedCounselor(null);
      setSelectedDate("");
      setSelectedTime("");
      setSelectedSessionType("");
    }, 2000);
  };

  const getAvailableTimes = () => {
    return [
      "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", 
      "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
    ];
  };

  const getAvailableDates = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Book a Counselor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {counselors.map((counselor) => (
            <Card 
              key={counselor.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCounselor === counselor.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCounselor(counselor.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {counselor.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{counselor.name}</h3>
                    <p className="text-sm text-muted-foreground">{counselor.specialty}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{counselor.rating}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {counselor.experience}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Next Available:</p>
                  <div className="flex flex-wrap gap-1">
                    {counselor.available.slice(0, 2).map((time, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {time}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-1 mt-2">
                    {counselor.sessionTypes.map((type) => (
                      <Badge key={type} className="text-xs bg-accent text-accent-foreground">
                        {getSessionIcon(type)}
                        <span className="ml-1">{type}</span>
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedCounselor === counselor.id && (
                  <Button 
                    className="w-full mt-3" 
                    size="sm"
                    onClick={() => handleBookAppointment(counselor.id)}
                  >
                    Book Appointment
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Booking Modal */}
        <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {bookingComplete ? "Booking Confirmed!" : "Book Appointment"}
              </DialogTitle>
            </DialogHeader>
            
            {bookingComplete ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">All Set!</h3>
                  <p className="text-sm text-muted-foreground">
                    You'll receive a confirmation email shortly with session details.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedCounselor && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {counselors.find(c => c.id === selectedCounselor)?.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">
                        {counselors.find(c => c.id === selectedCounselor)?.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {counselors.find(c => c.id === selectedCounselor)?.specialty}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Date</label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a date" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDates().map((date) => (
                        <SelectItem key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Time</label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableTimes().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Type</label>
                  <Select value={selectedSessionType} onValueChange={setSelectedSessionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose session type" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCounselor && 
                        counselors.find(c => c.id === selectedCounselor)?.sessionTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              {getSessionIcon(type)}
                              {type}
                            </div>
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmBooking}
                    disabled={!selectedDate || !selectedTime || !selectedSessionType}
                    className="flex-1"
                  >
                    Confirm Booking
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CounselorBooking;