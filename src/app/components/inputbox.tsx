import React from 'react';
import { Plus, Youtube } from 'lucide-react';

const InputBox = () => {
  return (
    <div className="bg-gray-900 p-4 rounded-xl">
      <div className="flex gap-2 items-center">
        <button 
          className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-5 h-5 text-gray-300" />
        </button>
        
        <div className="flex-1 flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2">
          <Youtube className="w-5 h-5 text-gray-300" />
          <input 
            type="text"
            placeholder="Enter text..."
            className="flex-1 bg-transparent border-none outline-none text-gray-300 placeholder-gray-500"
          />
        </div>
        
        <button 
          className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
            <div className="w-1 h-2 bg-gray-300 rounded-full mx-1"></div>
            <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default InputBox;
