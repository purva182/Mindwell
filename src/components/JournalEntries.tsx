import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Calendar as CalendarIcon, Zap, Eye, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface JournalEntry {
  id: string;
  content: string;
  mood_rating: number | null;
  energy_level: number;
  created_at: string;
  entry_date: string;
}

const JournalEntries = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [content, setContent] = useState('');
  const [moodRating, setMoodRating] = useState<number>(5);
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [viewMode, setViewMode] = useState<'write' | 'view'>('write');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching journal entries:', error);
    } else {
      // Map data to include required fields with fallbacks
      const mappedEntries = (data || []).map((entry: any) => ({
        id: entry.id,
        content: entry.content,
        mood_rating: entry.mood_rating,
        energy_level: entry.energy_level || 5,
        created_at: entry.created_at,
        entry_date: entry.entry_date || entry.created_at.split('T')[0]
      }));
      setEntries(mappedEntries);
    }
  };

  const saveEntry = async () => {
    if (!content.trim() || !user) return;

    const entryDate = format(selectedDate, 'yyyy-MM-dd');
    
    try {
        const insertData: any = {
          user_id: user.id,
          content: content.trim(),
          mood_rating: moodRating
        };

        // Only add energy_level and entry_date if columns exist
        try {
          insertData.energy_level = energyLevel;
          insertData.entry_date = entryDate;
        } catch (e) {
          // Fallback if columns don't exist yet
        }

        const { error } = await supabase
          .from('journal_entries')
          .insert(insertData);

      if (error) throw error;

      toast({
        title: "Journal entry saved",
        description: `Entry for ${format(selectedDate, 'MMM dd, yyyy')} has been saved.`,
      });

      setContent('');
      setMoodRating(5);
      setEnergyLevel(5);
      fetchEntries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save journal entry.",
        variant: "destructive",
      });
    }
  };

  const getMoodEmoji = (rating: number) => {
    if (rating <= 2) return '😢';
    if (rating <= 4) return '😔';
    if (rating <= 6) return '😐';
    if (rating <= 8) return '🙂';
    return '😊';
  };

  const getEnergyColor = (level: number) => {
    if (level <= 2) return 'text-red-500';
    if (level <= 4) return 'text-orange-500';
    if (level <= 6) return 'text-yellow-500';
    if (level <= 8) return 'text-green-500';
    return 'text-emerald-500';
  };

  const filteredEntries = entries.filter(entry =>
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (viewMode === 'view') {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Past Journal Entries
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('write')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search your entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
            />
          </div>

          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <Card key={entry.id} className="border-l-4 border-l-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {format(new Date(entry.entry_date), 'MMM dd, yyyy')}
                        </Badge>
                        <span className="text-lg">{getMoodEmoji(entry.mood_rating || 5)}</span>
                        <div className="flex items-center gap-1">
                          <Zap className={`h-4 w-4 ${getEnergyColor(entry.energy_level)}`} />
                          <span className="text-sm text-muted-foreground">
                            Energy: {entry.energy_level}/10
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{entry.content}</p>
                  </CardContent>
                </Card>
              ))}

              {filteredEntries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No journal entries found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Daily Journal
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('view')}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Past Entries
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Entry Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Mood Rating */}
        <div className="space-y-3">
          <label className="text-sm font-medium">How are you feeling? ({moodRating}/10)</label>
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <Button
                key={rating}
                variant={moodRating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => setMoodRating(rating)}
                className="w-12 h-12 text-lg"
              >
                {getMoodEmoji(rating)}
              </Button>
            ))}
          </div>
        </div>

        {/* Energy Level */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Energy Level: {energyLevel}/10</label>
          <div className="px-3">
            <Slider
              value={[energyLevel]}
              onValueChange={(value) => setEnergyLevel(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Journal Content */}
        <div className="space-y-2">
          <label className="text-sm font-medium">What's on your mind?</label>
          <Textarea
            placeholder="Share your thoughts, feelings, and experiences from today..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <Button 
          onClick={saveEntry} 
          disabled={!content.trim()}
          className="w-full"
        >
          Save Entry for {format(selectedDate, 'MMM dd, yyyy')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JournalEntries;