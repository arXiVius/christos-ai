import React, { useState, useEffect, useRef } from 'react';
import {
  FullScreenIcon,
  ExitFullScreenIcon,
  DeviceDesktopIcon,
  DeviceTabletIcon,
  DeviceMobileIcon,
  RefreshIcon,
} from './Icons';
import type { DeviceMode } from '../App';

interface PreviewControlsProps {
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  onRefresh: () => void;
}

const deviceOptions: { mode: DeviceMode, icon: React.ReactNode, title: string }[] = [
    { mode: 'desktop', icon: <DeviceDesktopIcon />, title: 'Desktop' },
    { mode: 'tablet', icon: <DeviceTabletIcon />, title: 'Tablet' },
    { mode: 'mobile', icon: <DeviceMobileIcon />, title: 'Mobile' },
];

const PreviewControls: React.FC<PreviewControlsProps> = ({
  onToggleFullscreen,
  isFullscreen,
  deviceMode,
  setDeviceMode,
  onRefresh
}) => {
  const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false);
  const deviceMenuRef = useRef<HTMLDivElement>(null);

  const baseButtonClasses = "p-2 rounded-full hover:bg-stone-200 transition-colors text-stone-500";
  const currentDeviceIcon = deviceOptions.find(opt => opt.mode === deviceMode)?.icon;
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deviceMenuRef.current && !deviceMenuRef.current.contains(event.target as Node)) {
        setIsDeviceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="flex items-center gap-2">
      <button onClick={onToggleFullscreen} className={baseButtonClasses} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
        {isFullscreen ? <ExitFullScreenIcon /> : <FullScreenIcon />}
      </button>

      <div className="relative" ref={deviceMenuRef}>
        <button 
          onClick={() => setIsDeviceMenuOpen(prev => !prev)} 
          className={`${baseButtonClasses} ${isDeviceMenuOpen ? 'bg-stone-200' : 'bg-stone-100'} text-black`} 
          title="Toggle Device Preview"
        >
          {currentDeviceIcon}
        </button>
        {isDeviceMenuOpen && (
           <div className="absolute top-full right-0 mt-2 p-1 bg-white rounded-full flex items-center gap-1 shadow-lg border-2 border-black z-10">
             {deviceOptions.map(({ mode, icon, title }) => (
                <button 
                    key={mode} 
                    onClick={() => {
                        setDeviceMode(mode);
                        setIsDeviceMenuOpen(false);
                    }} 
                    className={`p-2 rounded-full transition-colors ${deviceMode === mode ? 'bg-black text-white' : 'text-stone-500 hover:bg-stone-100'}`} 
                    title={`${title} View`}
                >
                    {icon}
                </button>
             ))}
           </div>
        )}
      </div>

      <button onClick={onRefresh} className={baseButtonClasses} title="Refresh Preview">
        <RefreshIcon />
      </button>
    </div>
  );
};

export default PreviewControls;