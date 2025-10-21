import React, { useState, useCallback, useEffect } from 'react';
import type { Page } from './types';
import { generateWebsite, refineWebsite } from './services/geminiService';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import RefineInput from './components/RefineInput';
import SitePreview from './components/SitePreview';
import CodePreview from './components/CodePreview';
import Loader from './components/Loader';
import { DownloadIcon, TrashIcon } from './components/Icons';

declare const JSZip: any;

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(() => localStorage.getItem('christosPrompt') || '');
  const [refinePrompt, setRefinePrompt] = useState<string>('');
  const [generatedSite, setGeneratedSite] = useState<Page[] | null>(() => {
    const savedSite = localStorage.getItem('christosSite');
    try {
      return savedSite ? JSON.parse(savedSite) : null;
    } catch (e) {
      console.error("Failed to parse saved site from localStorage", e);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<string>('');
  const [previewContent, setPreviewContent] = useState<string>('');

  const buildPreviewContent = useCallback((page: Page | undefined): string => {
    if (!page) return '<html><body style="background-color:#FFFFFF; color:#000000; font-family: sans-serif;">Select a page to preview.</body></html>';
    
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
  
  // Effect to initialize preview on load if site exists in localStorage
  useEffect(() => {
    if (generatedSite && generatedSite.length > 0) {
      const indexPage = generatedSite.find(p => p.filename === 'index.html') || generatedSite[0];
      setActivePage(indexPage.filename);
      setPreviewContent(buildPreviewContent(indexPage));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on initial mount


  useEffect(() => {
    const handleNavigation = (event: MessageEvent) => {
      if (event.data.type === 'navigate') {
        const pageToNavigate = generatedSite?.find(p => p.filename === event.data.path);
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

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your website.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedSite(null);

    try {
      const siteData = await generateWebsite(prompt);
      if (siteData && siteData.length > 0) {
        setGeneratedSite(siteData);
        const indexPage = siteData.find(p => p.filename === 'index.html') || siteData[0];
        setActivePage(indexPage.filename);
        setPreviewContent(buildPreviewContent(indexPage));
      } else {
        setError('The AI returned an empty or invalid site structure. Please try again.');
      }
    } catch (err) {
      setError(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!refinePrompt.trim() || !generatedSite) {
      setError('Please enter a refinement instruction.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const siteData = await refineWebsite(prompt, generatedSite, refinePrompt);
      if (siteData && siteData.length > 0) {
        setGeneratedSite(siteData);
        const newActivePage = siteData.find(p => p.filename === activePage) || siteData.find(p => p.filename === 'index.html') || siteData[0];
        setActivePage(newActivePage.filename);
        setPreviewContent(buildPreviewContent(newActivePage));
        setRefinePrompt('');
      } else {
        setError('The AI returned an empty or invalid site structure. Please try again.');
      }
    } catch (err) {
      setError(`An error occurred during refinement: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePageChange = useCallback((filename: string) => {
    const newPage = generatedSite?.find(p => p.filename === filename);
    if (newPage) {
      setActivePage(filename);
      setPreviewContent(buildPreviewContent(newPage));
    }
  }, [generatedSite, buildPreviewContent]);
  
  const handleClearSite = () => {
    setGeneratedSite(null);
    setPrompt('');
    setRefinePrompt('');
    setActivePage('');
    setError(null);
    localStorage.removeItem('christosSite');
    localStorage.removeItem('christosPrompt');
  };

  const handleDownload = async () => {
    if (!generatedSite) return;

    const zip = new JSZip();

    generatedSite.forEach(page => {
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
          <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
          <script src="${jsFileName}"></script>
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

  const activePageData = generatedSite?.find(p => p.filename === activePage);
  const hasContent = isLoading || !!generatedSite || !!error;

  return (
    <div className={`min-h-screen bg-white text-black p-4 flex flex-col ${hasContent ? 'justify-start' : 'justify-center'}`}>
      
      <div className={`w-full max-w-4xl mx-auto text-center ${hasContent ? 'mb-8' : ''}`}>
        {!generatedSite && !isLoading && <Header />}
        
        {!generatedSite ? (
           <div className={'mt-6'}>
             <PromptInput
               prompt={prompt}
               setPrompt={setPrompt}
               onGenerate={handleGenerate}
               isLoading={isLoading}
             />
           </div>
        ) : (
          !isLoading && (
            <div className="text-left bg-stone-50 border-2 border-black p-4">
              <h2 className="font-bold uppercase tracking-wider text-sm text-stone-600">Refine Vision</h2>
              <p className="text-sm mt-2 p-3 bg-white border-2 border-stone-200">
                  <strong>Original Prompt:</strong> {prompt}
              </p>
              <div className="mt-4">
                <RefineInput 
                    prompt={refinePrompt}
                    setPrompt={setRefinePrompt}
                    onRefine={handleRefine}
                    isLoading={isLoading}
                />
              </div>
            </div>
          )
        )}
      </div>

      {hasContent && (
        <div className="w-full max-w-7xl mx-auto flex-grow flex flex-col">
          {error && <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 text-center my-4" role="alert">{error}</div>}
          
          {isLoading && <Loader />}

          {generatedSite && !isLoading && (
            <div className="flex flex-col gap-4 flex-grow">
              <div className="text-center flex items-center justify-center gap-4">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black focus:outline-none focus:ring-4 focus:ring-yellow-300"
                >
                  <DownloadIcon />
                  <span className="font-bold">Download .zip</span>
                </button>
                <button
                  onClick={handleClearSite}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-black hover:bg-red-500 hover:text-white hover:border-red-500 focus:outline-none focus:ring-4 focus:ring-yellow-300"
                  title="Clear current site and start over"
                >
                  <TrashIcon />
                  <span className="font-bold">Clear Site</span>
                </button>
              </div>
              <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[60vh]">
                <SitePreview content={previewContent} />
                <CodePreview 
                  pages={generatedSite}
                  activePageFilename={activePage}
                  onPageChange={handlePageChange}
                  activePageData={activePageData}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;