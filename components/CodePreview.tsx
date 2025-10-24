import React, { useState, useEffect, useRef } from 'react';
import type { Page } from '../types';
import { HtmlIcon, CssIcon, JsIcon } from './Icons';

type CodeType = 'HTML' | 'CSS' | 'JS';

interface CodePreviewProps {
  pages: Page[];
  activePageFilename: string;
  onPageChange: (filename: string) => void;
  activePageData: Page | undefined;
}

declare const hljs: any;

const CodePreview: React.FC<CodePreviewProps> = ({
  pages,
  activePageFilename,
  onPageChange,
  activePageData,
}) => {
  const [activeCodeType, setActiveCodeType] = useState<CodeType>('HTML');
  const codeRef = useRef<HTMLElement>(null);

  const getCodeContent = () => {
    if (!activePageData) return '';
    switch (activeCodeType) {
      case 'HTML':
        return activePageData.html;
      case 'CSS':
        return activePageData.css;
      case 'JS':
        return activePageData.js;
      default:
        return '';
    }
  };

  const getLanguageClass = () => {
    switch (activeCodeType) {
      case 'HTML':
        return 'language-html';
      case 'CSS':
        return 'language-css';
      case 'JS':
        return 'language-javascript';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [activeCodeType, activePageData]);
  
  // When active page changes, default to HTML view
  useEffect(() => {
    setActiveCodeType('HTML');
  }, [activePageFilename]);

  return (
    <div className="bg-white flex flex-col text-sm h-full">
      <div className="flex-shrink-0 border-b-2 border-black">
        <div className="flex items-center px-2 flex-wrap">
          {pages.map((page) => (
            <button
              key={page.filename}
              onClick={() => onPageChange(page.filename)}
              className={`px-4 py-3 -mb-px border-b-2 font-bold ${
                activePageFilename === page.filename
                  ? 'border-black text-black'
                  : 'border-transparent text-stone-500 hover:text-black'
              }`}
            >
              {page.filename}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 p-2 flex items-center justify-between bg-stone-100 border-b-2 border-black">
        <div className="flex items-center gap-1">
          <CodeTypeButton
            type="HTML"
            activeType={activeCodeType}
            setType={setActiveCodeType}
          >
            <HtmlIcon />
          </CodeTypeButton>
          <CodeTypeButton
            type="CSS"
            activeType={activeCodeType}
            setType={setActiveCodeType}
          >
            <CssIcon />
          </CodeTypeButton>
          <CodeTypeButton
            type="JS"
            activeType={activeCodeType}
            setType={setActiveCodeType}
          >
            <JsIcon />
          </CodeTypeButton>
        </div>
      </div>

      <div className="flex-grow overflow-auto bg-black min-h-0">
        <pre className="h-full m-0">
          <code
            key={`${activePageFilename}-${activeCodeType}`}
            ref={codeRef}
            className={`whitespace-pre-wrap text-stone-300 font-mono p-4 block h-full w-full ${getLanguageClass()}`}
          >
            {getCodeContent()}
          </code>
        </pre>
      </div>
    </div>
  );
};

interface CodeTypeButtonProps {
  type: CodeType;
  activeType: CodeType;
  setType: (type: CodeType) => void;
  children: React.ReactNode;
}

const CodeTypeButton: React.FC<CodeTypeButtonProps> = ({
  type,
  activeType,
  setType,
  children,
}) => {
  return (
    <button
      onClick={() => setType(type)}
      className={`flex items-center gap-2 px-3 py-1.5 font-bold ${
        activeType === type
          ? 'bg-black text-white'
          : 'text-stone-600 hover:bg-stone-300'
      }`}
    >
      {children}
      {type}
    </button>
  );
};

export default CodePreview;
