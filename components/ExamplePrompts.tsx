import React from 'react';

const examples = [
  'A brutalist portfolio for a DJ named HEX, with kinetic text and a dark, high-contrast theme.',
  'An experimental art gallery site called "VOID", showcasing digital sculptures. Use a minimalist black and white style.',
  'A single-page website for a conceptual sci-fi movie, "CHRONOS". Use glitchy text effects and a retro-futuristic feel.',
  'A bold, typography-driven blog for a design critic. The homepage should feature a manifesto with animated text.',
];

interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void;
  isLoading: boolean;
}

const ExamplePrompts: React.FC<ExamplePromptsProps> = ({
  onSelectPrompt,
  isLoading,
}) => {
  return (
    <div className="mt-6 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-stone-500">
        Or try an example
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(example)}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-transparent border-2 border-black text-black hover:bg-black hover:text-white disabled:bg-stone-200 disabled:text-stone-400 disabled:border-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExamplePrompts;
