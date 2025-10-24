import React from 'react';
import { CheckIcon, RefreshIcon } from './Icons';

interface PlanPreviewProps {
  plan: string;
  onApprove: () => void;
  onRegenerate: () => void;
  isLoading: boolean;
}

const getContrastColor = (hex: string): string => {
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    return '#000000'; // default to black for invalid hex
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000);
  return brightness > 125 ? '#000000' : '#FFFFFF';
};


const parseMarkdown = (markdown: string) => {
  const lines = markdown.split('\n');
  let html = '';
  let listType: 'ul' | null = null;
  let inSection = false;

  const processInlineFormatting = (line: string) => {
    return line
      .replace(/(#([a-fA-F0-9]{6}|[a-fA-F0-9]{3}))\b/g, (hex) => {
        const contrast = getContrastColor(hex);
        return `<span class="color-hex-wrapper" style="--hex-color: ${hex}; --hex-contrast-color: ${contrast};">` +
                 `<span class="color-hex-swatch" style="background-color: ${hex};"></span>` +
                 `<code class="color-hex-code font-mono text-sm">${hex}</code>` +
               `</span>`;
      })
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(
        /`([^<]*?)`/g, // Avoid re-wrapping our color swatch codes
        '<code class="bg-stone-200 text-stone-800 px-1.5 py-0.5 font-mono text-sm rounded">$1</code>'
      );
  };

  const closeList = () => {
    if (listType) {
      html += `</${listType}>`;
      listType = null;
    }
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === '') continue;

    const isUlItem = trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ');
    const isNumberedHeading = /^\d+\.\s/.test(line);
    const isHashHeading = trimmedLine.startsWith('#');

    if (isNumberedHeading) {
      closeList();
      inSection = true;
      const content = line.replace(/^\d+\.\s/, '');
      html += `<h2 class="font-bold text-lg mt-8 mb-4 uppercase tracking-wider">${processInlineFormatting(
        content
      )}</h2>`;
      continue;
    }

    if (isUlItem) {
      if (listType !== 'ul') {
        closeList();
        html += `<ul class="space-y-2 my-4 ${inSection ? 'ml-4' : ''}">`;
        listType = 'ul';
      }
      const content = trimmedLine.substring(2);
      html += `<li class="list-disc ml-5">${processInlineFormatting(content)}</li>`;
    } else {
      closeList();
      if (isHashHeading) {
        const level = (trimmedLine.match(/^#+/) || [''])[0].length;
        const content = trimmedLine.replace(/^#+\s*/, '');
        html += `<h${
          level + 2
        } class="font-bold text-base mt-6 mb-3 uppercase tracking-wider ${
          inSection ? 'ml-4' : ''
        }">${processInlineFormatting(content)}</h${level + 2}>`;
      } else {
        html += `<p class="${
          inSection ? 'ml-4' : ''
        } mb-4 leading-relaxed">${processInlineFormatting(line)}</p>`;
      }
    }
  }
  closeList();
  return { __html: html };
};

const PlanPreview: React.FC<PlanPreviewProps> = ({
  plan,
  onApprove,
  onRegenerate,
  isLoading,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <div className="border-2 border-black bg-white p-6 sm:p-8">
        <h2 className="text-xl font-extrabold text-black tracking-tighter uppercase mb-4">
          The Blueprint
        </h2>
        <div
          className="text-black"
          dangerouslySetInnerHTML={parseMarkdown(plan)}
        />
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-4 bg-white text-black font-bold border-2 border-black disabled:bg-stone-300 disabled:text-stone-500 disabled:border-stone-300 disabled:cursor-wait hover:bg-black hover:text-white focus:outline-none focus:ring-4 focus:ring-yellow-300"
        >
          <RefreshIcon />
          <span>{isLoading ? 'Thinking...' : 'Regenerate Plan'}</span>
        </button>
        <button
          onClick={onApprove}
          disabled={isLoading}
          className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-4 bg-black text-white font-bold border-2 border-black disabled:bg-stone-300 disabled:text-stone-500 disabled:border-stone-300 disabled:cursor-wait hover:bg-white hover:text-black focus:outline-none focus:ring-4 focus:ring-yellow-300"
        >
          <CheckIcon />
          <span>{isLoading ? 'Creating...' : 'Generate Site'}</span>
        </button>
      </div>
    </div>
  );
};

export default PlanPreview;