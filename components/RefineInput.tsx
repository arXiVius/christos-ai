import React from 'react';
import { SparklesIcon } from './Icons';

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
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Now, describe your changes... e.g., 'Make the background black and the main font white.'"
        className="w-full p-4 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black resize-none h-24 sm:h-auto"
        disabled={isLoading}
      />
      <button
        onClick={onRefine}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 px-6 py-4 bg-black text-white font-bold border-2 border-black disabled:bg-stone-300 disabled:text-stone-500 disabled:border-stone-300 disabled:cursor-wait hover:bg-white hover:text-black focus:outline-none focus:ring-4 focus:ring-yellow-300"
      >
        <SparklesIcon />
        <span>{isLoading ? 'Refining...' : 'Refine'}</span>
      </button>
    </div>
  );
};

export default RefineInput;
