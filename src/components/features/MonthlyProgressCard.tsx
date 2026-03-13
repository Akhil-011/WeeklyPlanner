import { useState } from 'react';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Win {
  id: string;
  text: string;
}

export function MonthlyProgressCard() {
  const [wins, setWins] = useState<Win[]>([
    { id: '1', text: 'Got an A+ on English Exam' },
    { id: '2', text: 'Bought a New Car' },
  ]);
  const [newWin, setNewWin] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddWin = () => {
    if (newWin.trim()) {
      setWins([...wins, { id: Date.now().toString(), text: newWin.trim() }]);
      setNewWin('');
    }
  };

  const handleDeleteWin = (id: string) => {
    setWins(wins.filter(w => w.id !== id));
  };

  const handleEditWin = (id: string, newText: string) => {
    setWins(wins.map(w => w.id === id ? { ...w, text: newText } : w));
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-green-600" />
        <h2 className="text-lg font-semibold text-gray-800">Monthly Progress</h2>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Wins of the Month So Far</h3>
        <div className="space-y-2">
          {wins.map((win, index) => (
            <div key={win.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 group transition-colors">
              <span className="text-green-600 font-bold text-sm mt-0.5">•</span>
              {editingId === win.id ? (
                <Input
                  autoFocus
                  defaultValue={win.text}
                  onBlur={(e) => handleEditWin(win.id, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleEditWin(win.id, e.currentTarget.value);
                    }
                  }}
                  className="flex-1 text-sm"
                />
              ) : (
                <span
                  onClick={() => setEditingId(win.id)}
                  className="flex-1 text-sm text-gray-700 cursor-pointer"
                >
                  {win.text}
                </span>
              )}
              <button
                onClick={() => handleDeleteWin(win.id)}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          value={newWin}
          onChange={(e) => setNewWin(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddWin()}
          placeholder="Add a new win..."
          className="flex-1 text-sm"
        />
        <Button
          onClick={handleAddWin}
          size="sm"
          className="bg-green-600 hover:bg-green-700 ripple"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
