import React, { useRef, useState, useEffect } from 'react';
import { FullScreenIcon, ExitFullScreenIcon } from './Icons';

interface SitePreviewProps {
  content: string;
}

const SitePreview: React.FC<SitePreviewProps> = ({ content }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const handleToggleFullScreen = () => {
    if (!previewRef.current) return;

    if (!document.fullscreenElement) {
      previewRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
  }, []);

  return (
    <div ref={previewRef} className="flex flex-col bg-white border-2 border-black">
      <div className="p-2 border-b-2 border-black bg-white flex items-center justify-between">
        <span className="font-bold text-xs tracking-widest">PREVIEW</span>
        <button 
          onClick={handleToggleFullScreen} 
          className="p-1 hover:bg-stone-200"
          title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullScreen ? <ExitFullScreenIcon /> : <FullScreenIcon />}
        </button>
      </div>
      <div className="flex-grow">
         <iframe
            srcDoc={content}
            title="Website Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
      </div>
    </div>
  );
};

export default SitePreview;