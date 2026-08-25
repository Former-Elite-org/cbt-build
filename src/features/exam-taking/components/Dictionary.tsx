import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookOpen, Search } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/card';

interface DictionaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Dictionary({ open, onOpenChange }: DictionaryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [definition, setDefinition] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setDefinition(null);

    try {
      // Using a free dictionary API (Dictionary API)
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(searchTerm.trim())}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const firstEntry = data[0];
          const meanings = firstEntry.meanings || [];
          
          if (meanings.length > 0) {
            const firstMeaning = meanings[0];
            const firstDefinition = firstMeaning.definitions?.[0]?.definition || 'No definition found';
            setDefinition(firstDefinition);
          } else {
            setDefinition('No definition found for this word.');
          }
        } else {
          setDefinition('No definition found for this word.');
        }
      } else {
        setDefinition('Word not found. Please check the spelling and try again.');
      }
    } catch (error) {
      console.error('Dictionary API error:', error);
      setDefinition('Unable to fetch definition. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Dictionary
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter a word to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading || !searchTerm.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {loading && (
            <div className="text-center py-8 text-gray-500">Searching...</div>
          )}

          {definition && !loading && (
            <Card>
              <CardBody>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">{searchTerm}</p>
                  <p className="text-gray-700">{definition}</p>
                </div>
              </CardBody>
            </Card>
          )}

          {!definition && !loading && (
            <div className="text-center py-8 text-gray-400 text-sm">
              Enter a word above to search for its definition
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


