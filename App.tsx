import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Page, ChatMessage } from './types';
import {
  generatePlan,
  generateWebsite,
  refineWebsite,
} from './services/geminiService';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import RefineInput from './components/RefineInput';
import SitePreview from './components/SitePreview';
import CodePreview from './components/CodePreview';
import Loader from './components/Loader';
import ExamplePrompts from './components/ExamplePrompts';
import PlanPreview from './components/PlanPreview';
import ChatHistory from './components/ChatHistory';
import ViewToggle from './components/ViewToggle';
import PreviewControls from './components/PreviewControls';
import { DownloadIcon, TrashIcon } from './components/Icons';

declare const JSZip: any;

type AppState = 'prompt' | 'planning' | 'preview';
type ViewMode = 'preview' | 'code';
export type DeviceMode = 'desktop' | 'tablet' | 'mobile';


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('prompt');
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [plan, setPlan] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>(
    () => localStorage.getItem('christosPrompt') || ''
  );
  const [refinePrompt, setRefinePrompt] = useState<string>('');
  const [generatedSite, setGeneratedSite] = useState<Page[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<string>('');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const buildPreviewContent = useCallback((page: Page | undefined): string => {
    if (!page) {
      return '<html><body style="background-color:#FFFFFF; color:#000000; font-family: sans-serif;">Select a page to preview.</body></html>';
    }

    const navigationInterceptorScript = `
      <script>
        document.addEventListener('click', e => {
          let target = e.target;
          while(target && target.tagName !== 'A') {
            target = target.parentElement;
          }
          if (target && target.href) {
            e.preventDefault();
            try {
              const url = new URL(target.href);
              const path = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
              if (path) {
                window.parent.postMessage({ type: 'navigate', path: path }, '*');
              }
            } catch (error) {
              console.error('Error parsing URL for navigation:', error);
            }
          }
        });
      <\/script>
    `;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${page.title}</title>
        <meta name="description" content="${page.metaDescription}">
        <style>${page.css}</style>
      </head>
      <body>
        ${page.html}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"><\/script>
        <script>${page.js}<\/script>
        ${navigationInterceptorScript}
      </body>
      </html>
    `;
  }, []);

  useEffect(() => {
    localStorage.setItem('christosPrompt', prompt);
  }, [prompt]);

  useEffect(() => {
    if (generatedSite) {
      localStorage.setItem('christosSite', JSON.stringify(generatedSite));
    } else {
      localStorage.removeItem('christosSite');
    }
  }, [generatedSite]);
  
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('christosChat', JSON.stringify(chatHistory));
    } else {
      localStorage.removeItem('christosChat');
    }
  }, [chatHistory]);

  useEffect(() => {
    const savedSite = localStorage.getItem('christosSite');
    if (savedSite) {
      try {
        const parsedSite = JSON.parse(savedSite);
        if (parsedSite && parsedSite.length > 0) {
          setGeneratedSite(parsedSite);
          setAppState('preview');
          const indexPage =
            parsedSite.find((p: Page) => p.filename === 'index.html') ||
            parsedSite[0];
          setActivePage(indexPage.filename);
          setPreviewContent(buildPreviewContent(indexPage));

          const savedChat = localStorage.getItem('christosChat');
          if (savedChat) {
            setChatHistory(JSON.parse(savedChat));
          } else {
            setChatHistory([
              { id: Date.now().toString(), sender: 'christos', text: "Welcome back! How can I refine this site for you?" }
            ]);
          }
        }
      } catch (e) {
        console.error('Failed to parse saved site, clearing storage.', e);
        handleStartOver();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleNavigation = (event: MessageEvent) => {
      if (event.data.type === 'navigate' && event.data.path) {
        const pageToNavigate = generatedSite?.find(
          (p) => p.filename === event.data.path
        );
        if (pageToNavigate) {
          setActivePage(pageToNavigate.filename);
          setPreviewContent(buildPreviewContent(pageToNavigate));
        }
      }
    };

    window.addEventListener('message', handleNavigation);
    return () => {
      window.removeEventListener('message', handleNavigation);
    };
  }, [generatedSite, buildPreviewContent]);

  const handleGeneratePlan = async (isRegen = false) => {
    if (!prompt.trim()) {
      setError('Please enter a description for your website.');
      return;
    }
    setIsLoading(true);
    setError(null);
    if (!isRegen) {
      setGeneratedSite(null);
    }

    try {
      const planData = await generatePlan(prompt);
      setPlan(planData);
      setAppState('planning');
    } catch (err) {
      setError(
        `An error occurred while planning: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
      setAppState('prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSite = async () => {
    if (!prompt || !plan) return;
    setIsLoading(true);
    setError(null);

    try {
      const { thought, pages: siteData } = await generateWebsite(prompt, plan);
      if (siteData && siteData.length > 0) {
        setGeneratedSite(siteData);
        const indexPage =
          siteData.find((p) => p.filename === 'index.html') || siteData[0];
        setActivePage(indexPage.filename);
        setPreviewContent(buildPreviewContent(indexPage));
        setChatHistory([
          { 
            id: Date.now().toString(), 
            sender: 'christos', 
            text: "I've generated the first version of your site. What would you like to change?",
            thought: thought
          }
        ]);
        setAppState('preview');
      } else {
        setError(
          'The AI returned an empty or invalid site structure. Please try again.'
        );
        setAppState('planning');
      }
    } catch (err) {
      setError(
        `An error occurred: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
      setAppState('planning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!refinePrompt.trim() || !generatedSite) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: refinePrompt };
    const christosMessageId = (Date.now() + 1).toString();
    const thinkingMessage: ChatMessage = {
      id: christosMessageId,
      sender: 'christos',
      text: '',
      progress: { status: 'thinking', files: [] },
    };

    setChatHistory(prev => [...prev, userMessage, thinkingMessage]);
    setIsLoading(true);
    setError(null);
    setRefinePrompt('');

    // Transition to generating state
    setTimeout(() => {
      setChatHistory(prev => prev.map(msg => 
        msg.id === christosMessageId
          ? { ...msg, progress: { status: 'generating', files: generatedSite?.map(p => p.filename) || [] } }
          : msg
      ));
    }, 1000);


    try {
      const { thought, pages: siteData } = await refineWebsite(prompt, generatedSite, refinePrompt);
      if (siteData && siteData.length > 0) {
        setGeneratedSite(siteData);
        const newActivePage =
          siteData.find((p) => p.filename === activePage) ||
          siteData.find((p) => p.filename === 'index.html') ||
          siteData[0];
        setActivePage(newActivePage.filename);
        setPreviewContent(buildPreviewContent(newActivePage));
        setChatHistory(prev => prev.map(msg => 
          msg.id === christosMessageId
            ? { ...msg, text: "Done! I've updated the website. What's next?", progress: { ...msg.progress!, status: 'done' }, thought: thought }
            : msg
        ));
      } else {
        throw new Error("The AI returned an empty or invalid site structure.");
      }
    } catch (err) {
       const errorMessage = `An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`;
       setError(errorMessage);
       setChatHistory(prev => prev.map(msg =>
          msg.id === christosMessageId
            ? { ...msg, text: `Sorry, something went wrong. ${errorMessage}`, progress: { ...msg.progress!, status: 'error' } }
            : msg
        ));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = useCallback(
    (filename: string) => {
      const newPage = generatedSite?.find((p) => p.filename === filename);
      if (newPage) {
        setActivePage(filename);
        setPreviewContent(buildPreviewContent(newPage));
        setViewMode('code'); // Switch to code view when a new file is selected
      }
    },
    [generatedSite, buildPreviewContent]
  );

  const handleStartOver = () => {
    setAppState('prompt');
    setPlan(null);
    setGeneratedSite(null);
    setPrompt('');
    setRefinePrompt('');
    setActivePage('');
    setError(null);
    setChatHistory([]);
    setViewMode('preview');
    setDeviceMode('desktop');
    localStorage.removeItem('christosSite');
    localStorage.removeItem('christosPrompt');
    localStorage.removeItem('christosChat');
  };

  const handleDownload = async () => {
    if (!generatedSite) return;
    const zip = new JSZip();
    generatedSite.forEach((page) => {
      const pageName = page.filename.replace('.html', '');
      const cssFileName = `styles/${pageName}.css`;
      const jsFileName = `js/${pageName}.js`;
      const linkedHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${page.title}</title>
          <meta name="description" content="${page.metaDescription}">
          <link rel="stylesheet" href="${cssFileName}">
        </head>
        <body>
          ${page.html}
          <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"><\/script>
          <script src="${jsFileName}"><\/script>
        </body>
        </html>
      `;
      zip.file(page.filename, linkedHtml);
      if (page.css.trim()) zip.file(cssFileName, page.css);
      if (page.js.trim()) zip.file(jsFileName, page.js);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'christos-generated-site.zip';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleToggleFullscreen = useCallback(() => {
    if (!previewContainerRef.current) return;
    if (!document.fullscreenElement) {
      previewContainerRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleRefreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = previewContent;
    }
  };

  const activePageData = generatedSite?.find((p) => p.filename === activePage);

  const renderContent = () => {
    if (isLoading && appState !== 'preview') {
      return (
        <div className="w-full max-w-4xl mx-auto flex-grow flex items-center justify-center">
          <Loader />
        </div>
      );
    }
    
    if (error && appState !== 'preview') {
      return (
        <div
          className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 text-center my-4 max-w-4xl mx-auto"
          role="alert"
        >
          {error}
        </div>
      )
    }

    switch (appState) {
      case 'prompt':
        return (
          <div className="w-full max-w-4xl mx-auto text-center">
            <Header />
            <div className={'mt-6'}>
              <PromptInput
                prompt={prompt}
                setPrompt={setPrompt}
                onGenerate={() => handleGeneratePlan()}
                isLoading={isLoading}
              />
              <ExamplePrompts onSelectPrompt={setPrompt} isLoading={isLoading} />
            </div>
          </div>
        );
      case 'planning':
        return plan ? (
          <>
            <PlanPreview
              plan={plan}
              onApprove={handleGenerateSite}
              onRegenerate={() => handleGeneratePlan(true)}
              isLoading={isLoading}
            />
            <div className="text-center mt-6">
              <button
                onClick={handleStartOver}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-black hover:bg-red-500 hover:text-white hover:border-red-500 focus:outline-none focus:ring-4 focus:ring-yellow-300"
                title="Start over"
              >
                <TrashIcon />
                <span className="font-bold">Start Over</span>
              </button>
            </div>
          </>
        ) : null;
      case 'preview':
        return generatedSite ? (
          <div className="w-full max-w-full mx-auto flex-grow grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="xl:col-span-4 flex flex-col gap-6">
              <div className="sticky top-6 flex flex-col gap-6 h-[calc(100vh-3rem)]">
                <div className="text-left bg-stone-50 border-2 border-black p-4 flex flex-col h-full">
                  <h2 className="font-bold uppercase tracking-wider text-sm text-stone-600 flex-shrink-0">
                    Refine Vision
                  </h2>
                  <p className="text-sm my-2 p-2 bg-white border-2 border-stone-200 overflow-y-auto max-h-20 flex-shrink-0">
                    <strong>Original:</strong> {prompt}
                  </p>
                  <ChatHistory messages={chatHistory} />
                  <RefineInput
                    prompt={refinePrompt}
                    setPrompt={setRefinePrompt}
                    onRefine={handleRefine}
                    isLoading={isLoading}
                  />
                </div>
                <div className="flex items-center justify-start gap-4 flex-shrink-0">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black focus:outline-none focus:ring-4 focus:ring-yellow-300"
                  >
                    <DownloadIcon />
                    <span className="font-bold">Download .zip</span>
                  </button>
                  <button
                    onClick={handleStartOver}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-black hover:bg-red-500 hover:text-white hover:border-red-500 focus:outline-none focus:ring-4 focus:ring-yellow-300"
                    title="Clear current site and start over"
                  >
                    <TrashIcon />
                    <span className="font-bold">Start Over</span>
                  </button>
                </div>
              </div>
            </div>
    
            {/* Main Content Area */}
            <div className="xl:col-span-8 flex flex-col min-h-0" ref={previewContainerRef}>
              <div className="flex flex-col h-full border-2 border-black bg-white">
                <div className="flex-shrink-0 p-2 border-b-2 border-black bg-white flex items-center justify-between">
                    <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                    <PreviewControls 
                      onToggleFullscreen={handleToggleFullscreen}
                      isFullscreen={isFullscreen}
                      deviceMode={deviceMode}
                      setDeviceMode={setDeviceMode}
                      onRefresh={handleRefreshPreview}
                    />
                </div>
                <div className="flex-grow min-h-0">
                  {viewMode === 'preview' ? (
                     <SitePreview 
                       content={previewContent} 
                       device={deviceMode} 
                       ref={iframeRef} 
                     />
                  ) : (
                    <CodePreview
                      pages={generatedSite}
                      activePageFilename={activePage}
                      onPageChange={handlePageChange}
                      activePageData={activePageData}
                    />
                  )}
                </div>
              </div>
            </div>
    
          </div>
        ) : null;
      default:
        return null;
    }
  };

  const isCentered = appState === 'prompt' || (isLoading && appState !== 'preview');

  return (
    <div className="min-h-screen bg-white text-black p-4 flex flex-col">
      <main
        className={`flex-grow flex flex-col ${
          isCentered ? 'justify-center' : 'justify-start'
        }`}
      >
        {renderContent()}
      </main>
      <footer className="w-full text-center py-4 shrink-0">
        <p className="text-xs uppercase tracking-widest text-stone-500">
          Created by{' '}
          <a
            href="https://github.com/arxivius/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-black hover:underline"
            aria-label="Visit arxivius on GitHub"
          >
            arxivius
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
