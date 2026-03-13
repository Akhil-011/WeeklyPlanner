import { useState, useEffect } from 'react';
import { Reflection } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lightbulb, TrendingUp, FileText } from 'lucide-react';

interface ReflectionSectionProps {
  reflection: Reflection | null;
  onUpdate: (updates: Partial<Reflection>) => void;
}

export function ReflectionSection({ reflection, onUpdate }: ReflectionSectionProps) {
  const [wentWell, setWentWell] = useState('');
  const [improvements, setImprovements] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (reflection) {
      setWentWell(reflection.went_well || '');
      setImprovements(reflection.improvements || '');
      setNotes(reflection.notes || '');
    }
  }, [reflection]);

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (reflection && (
        wentWell !== (reflection.went_well || '') ||
        improvements !== (reflection.improvements || '') ||
        notes !== (reflection.notes || '')
      )) {
        onUpdate({
          went_well: wentWell || null,
          improvements: improvements || null,
          notes: notes || null,
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [wentWell, improvements, notes]);

  return (
    <div className="space-y-3 pt-3 border-t border-gray-200">
      <div>
        <Label className="text-xs font-medium text-gray-700 flex items-center gap-1 mb-1">
          <Lightbulb className="h-3 w-3 text-green-600" />
          What went well
        </Label>
        <Textarea
          value={wentWell}
          onChange={(e) => setWentWell(e.target.value)}
          placeholder="Your wins today..."
          className="text-xs min-h-[60px] resize-none border-gray-200"
        />
      </div>

      <div>
        <Label className="text-xs font-medium text-gray-700 flex items-center gap-1 mb-1">
          <TrendingUp className="h-3 w-3 text-blue-600" />
          Areas for improvement
        </Label>
        <Textarea
          value={improvements}
          onChange={(e) => setImprovements(e.target.value)}
          placeholder="What could be better..."
          className="text-xs min-h-[60px] resize-none border-gray-200"
        />
      </div>

      <div>
        <Label className="text-xs font-medium text-gray-700 flex items-center gap-1 mb-1">
          <FileText className="h-3 w-3 text-purple-600" />
          Notes
        </Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Other thoughts..."
          className="text-xs min-h-[60px] resize-none border-gray-200"
        />
      </div>
    </div>
  );
}
