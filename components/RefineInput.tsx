import React from 'react';
import { SendIcon } from './Icons';

interface RefineInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onRefine: () => void;
  isLoading: boolean;
}

const RefineInput: React.FC<RefineInputProps> = ({
  prompt,
  setPrompt,
  onRefine,
  isLoading,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && prompt.trim()) {
        onRefine();
      }
    }
  };

  return (
    <div className="flex items-start gap-2 pt-2">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Describe your changes..."
        className="flex-grow p-3 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black resize-none text-sm"
        rows={2}
        disabled={isLoading}
      />
      <button
        onClick={onRefine}
        disabled={isLoading || !prompt.trim()}
        className="flex items-center justify-center p-3 bg-black text-white font-bold border-2 border-black disabled:bg-stone-300 disabled:text-stone-500 disabled:border-stone-300 disabled:cursor-not-allowed hover:bg-white hover:text-black focus:outline-none focus:ring-4 focus:ring-yellow-300 h-[52px] aspect-square"
        aria-label="Send refinement message"
      >
        <SendIcon />
      </button>
    </div>
  );
};

export default RefineInput;
