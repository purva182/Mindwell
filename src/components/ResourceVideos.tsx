import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, User, BookOpen, Heart, Brain, Zap } from "lucide-react";

const videoResources = [
  {
    id: 1,
    title: "5-Minute Morning Meditation for Peace",
    instructor: "Headspace",
    duration: "5:23",
    category: "Meditation",
    thumbnail: "🧘‍♀️",
    description: "Start your day with calm and clarity",
    views: "2.1M",
    icon: Heart,
    youtubeId: "ZToicYcHIOU"
  },
  {
    id: 2,
    title: "Understanding Depression and Finding Hope",
    instructor: "TED-Ed",
    duration: "8:45",
    category: "Education",
    thumbnail: "🧠",
    description: "Educational video about depression and recovery",
    views: "8.2M",
    icon: Brain,
    youtubeId: "z-IR48Mb3W0"
  },
  {
    id: 3,
    title: "Progressive Muscle Relaxation Guided Exercise",
    instructor: "Johns Hopkins",
    duration: "12:10",
    category: "Relaxation",
    thumbnail: "💆‍♀️",
    description: "Complete body relaxation technique",
    views: "1.5M",
    icon: Zap,
    youtubeId: "86HUcX8ZtAk"
  },
  {
    id: 4,
    title: "How to Build Resilience and Mental Strength",
    instructor: "TEDx Talks",
    duration: "15:33",
    category: "Resilience",
    thumbnail: "💪",
    description: "Practical strategies for mental resilience",
    views: "3.2M",
    icon: Heart,
    youtubeId: "NWH8N-BvhAw"
  },
  {
    id: 5,
    title: "Sleep Stories for Anxiety Relief",
    instructor: "The Honest Guys",
    duration: "30:12",
    category: "Sleep",
    thumbnail: "😴",
    description: "Calming bedtime stories for better sleep",
    views: "11.3M",
    icon: Brain,
    youtubeId: "1ZYbU82GVz4"
  },
  {
    id: 6,
    title: "Grounding Techniques: 5-4-3-2-1 Method",
    instructor: "Psych Hub",
    duration: "4:56",
    category: "Crisis Support",
    thumbnail: "🆘",
    description: "Quick grounding technique for anxiety and panic",
    views: "892K",
    icon: Zap,
    youtubeId: "30VMIEmA114"
  },
  {
    id: 7,
    title: "Daily Affirmations for Mental Health",
    instructor: "Louise Hay",
    duration: "21:00",
    category: "Affirmations",
    thumbnail: "✨",
    description: "Positive affirmations for self-love and healing",
    views: "5.7M",
    icon: Heart,
    youtubeId: "e4jFVGBaLy0"
  },
  {
    id: 8,
    title: "Breathing Exercises for Anxiety and Stress",
    instructor: "Yoga with Adriene",
    duration: "11:26",
    category: "Breathing",
    thumbnail: "🌬️",
    description: "Simple breathing techniques for immediate relief",
    views: "2.8M",
    icon: Zap,
    youtubeId: "odADuoTtVpE"
  },
  {
    id: 9,
    title: "How to Stop Overthinking Everything",
    instructor: "Therapy in a Nutshell",
    duration: "13:42",
    category: "Mindfulness",
    thumbnail: "🤯",
    description: "Practical strategies to quiet racing thoughts",
    views: "1.9M",
    icon: Brain,
    youtubeId: "Kq-VeHZNUuI"
  },
  {
    id: 10,
    title: "Self-Care Isn't Selfish",
    instructor: "The School of Life",
    duration: "6:18",
    category: "Self-Care",
    thumbnail: "🌱",
    description: "Why taking care of yourself matters",
    views: "1.2M",
    icon: Heart,
    youtubeId: "bbqbLp_4Ib8"
  }
];

const categories = ["All", "Meditation", "Education", "Relaxation", "Resilience", "Sleep", "Crisis Support", "Affirmations", "Breathing", "Mindfulness", "Self-Care"];

const ResourceVideos = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  const filteredVideos = selectedCategory === "All" 
    ? videoResources 
    : videoResources.filter(video => video.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors = {
      "Meditation": "bg-purple-100 text-purple-800",
      "Education": "bg-blue-100 text-blue-800",
      "Relaxation": "bg-green-100 text-green-800",
      "Resilience": "bg-orange-100 text-orange-800",
      "Sleep": "bg-indigo-100 text-indigo-800",
      "Crisis Support": "bg-red-100 text-red-800",
      "Affirmations": "bg-pink-100 text-pink-800",
      "Breathing": "bg-teal-100 text-teal-800",
      "Mindfulness": "bg-amber-100 text-amber-800",
      "Self-Care": "bg-emerald-100 text-emerald-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Resource Videos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="hover:shadow-md transition-all group">
              <CardContent className="p-0">
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center rounded-t-lg cursor-pointer group-hover:from-primary/20 group-hover:to-secondary/20 transition-all">
                  <span className="text-4xl">{video.thumbnail}</span>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-all">
                    <Button
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setPlayingVideo(video.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Play
                    </Button>
                  </div>
                  <Badge className="absolute top-2 right-2 bg-black/50 text-white text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {video.duration}
                  </Badge>
                </div>

                {/* Video Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{video.instructor}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <Badge className={getCategoryColor(video.category)}>
                      <video.icon className="h-3 w-3 mr-1" />
                      {video.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {video.views} views
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* YouTube Video Player Modal */}
        {playingVideo && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {videoResources.find(v => v.id === playingVideo)?.title}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPlayingVideo(null)}
                >
                  Close
                </Button>
              </div>
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoResources.find(v => v.id === playingVideo)?.youtubeId}?autoplay=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceVideos;