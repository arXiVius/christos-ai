import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-black bg-white">
      <div className="animate-spin h-12 w-12 border-4 border-black border-t-transparent rounded-full"></div>
      <p className="text-black font-bold tracking-wider">
        GENERATING MASTERPIECE...
      </p>
    </div>
  );
};

export default Loader;
