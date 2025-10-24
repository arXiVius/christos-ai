import React, { forwardRef } from 'react';
import type { DeviceMode } from '../App';

interface SitePreviewProps {
  content: string;
  device: DeviceMode;
}

const deviceStyles: Record<DeviceMode, { width: string; height: string, border: string }> = {
  desktop: { width: '100%', height: '100%', border: 'none' },
  tablet: { width: '768px', height: '1024px', border: '8px solid black' },
  mobile: { width: '375px', height: '667px', border: '8px solid black' },
};

const SitePreview = forwardRef<HTMLIFrameElement, SitePreviewProps>(
  ({ content, device }, ref) => {
    const deviceStyle = deviceStyles[device];
    const wrapperStyle = device === 'desktop'
      ? { width: '100%', height: '100%' }
      : { 
          width: deviceStyle.width, 
          height: deviceStyle.height,
          border: deviceStyle.border,
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          flexShrink: 0,
        };

    return (
      <div className="flex flex-col bg-stone-100 h-full w-full items-center justify-center p-4 overflow-auto">
        <div style={wrapperStyle} className="transition-all duration-300 ease-in-out bg-white">
          <iframe
            ref={ref}
            srcDoc={content}
            title="Website Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    );
  }
);

export default SitePreview;