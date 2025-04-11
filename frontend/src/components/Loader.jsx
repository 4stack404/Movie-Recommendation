import React from 'react';

function Loader({ loading }) {
  return (
    <div 
      className={`fixed inset-0 bg-black flex flex-col items-center justify-center z-[1000] transition-opacity duration-300 ${
        loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="w-16 h-16 border-4 border-t-red-600 border-r-transparent border-b-red-600 border-l-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-300">Getting movies ready...</p>
    </div>
  );
}

export default Loader; 