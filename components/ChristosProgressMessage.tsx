import React, { useState, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { ThinkingIcon, CheckIcon, ChevronDownIcon } from './Icons';

interface ChristosProgressMessageProps {
  message: ChatMessage;
}

const parseThoughtMarkdown = (markdown: string) => {
  const html = markdown
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-stone-300 text-stone-800 px-1.5 py-0.5 font-mono text-sm rounded">$1</code>')
    .replace(/(\n)/g, '<br />');
  return { __html: html };
};

const ChristosProgressMessage: React.FC<ChristosProgressMessageProps> = ({
  message,
}) => {
  const [checkedFiles, setCheckedFiles] = useState<string[]>([]);
  const [isThoughtOpen, setIsThoughtOpen] = useState(false);
  const { status, files = [] } = message.progress || {};
  const { thought } = message;

  useEffect(() => {
    if (status === 'generating' && files.length > 0) {
      setCheckedFiles([]);
      let index = 0;
      const interval = setInterval(() => {
        if (index < files.length) {
          setCheckedFiles((prev) => [...prev, files[index]]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [status, files]);

  const renderContent = () => {
    switch (status) {
      case 'thinking':
        return (
          <div className="flex items-center gap-2 text-stone-500">
            <ThinkingIcon />
            <span className="font-medium">Thinking...</span>
          </div>
        );
      case 'generating':
        return (
          <div>
            <p className="font-bold mb-2">Updating files...</p>
            <ul className="space-y-1">
              {files.map((file) => (
                <li key={file} className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4">
                    {checkedFiles.includes(file) && (
                      <CheckIcon className="text-green-500" />
                    )}
                  </div>
                  <span
                    className={
                      checkedFiles.includes(file)
                        ? 'text-black'
                        : 'text-stone-400'
                    }
                  >
                    {file}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'done':
      case 'error':
        return <p className="whitespace-pre-wrap">{message.text}</p>;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-start gap-3 justify-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
        C
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs md:max-w-md">
        <div
          className={`p-3 rounded-lg text-sm ${
            status === 'error'
              ? 'bg-red-100 text-red-800 border border-red-300'
              : 'bg-stone-200 text-black'
          }`}
        >
          {renderContent()}
        </div>
        {thought && (
          <div className="text-xs bg-stone-100 border border-stone-200 rounded-lg">
            <button
              onClick={() => setIsThoughtOpen(!isThoughtOpen)}
              className="w-full flex justify-between items-center p-2 font-bold text-stone-500 hover:text-black"
            >
              <span>Thought Process</span>
              <ChevronDownIcon
                className={`transition-transform duration-200 ${
                  isThoughtOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isThoughtOpen && (
              <div
                className="p-3 border-t border-stone-200 text-stone-700 leading-relaxed"
                dangerouslySetInnerHTML={parseThoughtMarkdown(thought)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChristosProgressMessage;
