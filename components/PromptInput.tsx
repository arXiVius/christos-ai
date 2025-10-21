import React from 'react';
import { SparklesIcon } from './Icons';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onGenerate, isLoading }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your vision... e.g., 'A brutalist portfolio for a DJ named HEX, with kinetic text and a dark, high-contrast theme.'"
        className="w-full p-4 border-2 border-black bg-transparent focus:outline-none focus:ring-2 focus:ring-black resize-none h-24 sm:h-auto"
        disabled={isLoading}
      />
      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 px-6 py-4 bg-black text-white font-bold border-2 border-black disabled:bg-stone-300 disabled:text-stone-500 disabled:border-stone-300 disabled:cursor-wait hover:bg-white hover:text-black focus:outline-none focus:ring-4 focus:ring-yellow-300"
      >
        <SparklesIcon />
        <span>{isLoading ? 'Creating...' : 'Generate'}</span>
      </button>
    </div>
  );
};

export default PromptInput;