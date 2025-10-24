import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import ChristosProgressMessage from './ChristosProgressMessage';

interface ChatHistoryProps {
  messages: ChatMessage[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-grow p-4 space-y-6 overflow-y-auto bg-white border-2 border-stone-200">
      {messages.map((msg) => {
        if (msg.sender === 'christos' && msg.progress) {
          return <ChristosProgressMessage key={msg.id} message={msg} />;
        }

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'christos' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                C
              </div>
            )}
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-lg text-sm ${
                msg.sender === 'user'
                  ? 'bg-black text-white'
                  : 'bg-stone-200 text-black'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
            {msg.sender === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-sm">
                U
              </div>
            )}
          </div>
        );
      })}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatHistory;
