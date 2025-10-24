import React from 'react';

type ViewMode = 'preview' | 'code';

interface ViewToggleProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, setViewMode }) => {
  const baseClasses = "px-4 py-2 text-sm font-bold rounded-full flex items-center gap-2 transition-colors";
  const activeClasses = "bg-stone-200 text-black";
  const inactiveClasses = "bg-transparent text-stone-500 hover:bg-stone-100";
  
  return (
    <div className="p-1 bg-stone-100 rounded-full flex items-center">
        <button 
        onClick={() => setViewMode('preview')}
        className={`${baseClasses} ${viewMode === 'preview' ? activeClasses : inactiveClasses}`}
        >
        {viewMode === 'preview' && <span className="w-2 h-2 bg-black rounded-full"></span>}
        Preview
        </button>
        <button 
        onClick={() => setViewMode('code')}
        className={`${baseClasses} ${viewMode === 'code' ? activeClasses : inactiveClasses}`}
        >
        {viewMode === 'code' && <span className="w-2 h-2 bg-black rounded-full"></span>}
        Code
        </button>
    </div>
  );
};

export default ViewToggle;
