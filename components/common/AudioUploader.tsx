
import React, { useState, useRef } from 'react';

interface AudioUploaderProps {
  onAudioUpload: (file: File) => void;
  onAudioClear: () => void;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({ onAudioUpload, onAudioClear }) => {
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioPreview(url);
      onAudioUpload(file);
    }
  };

  const handleClear = () => {
    if (audioPreview) {
        URL.revokeObjectURL(audioPreview);
    }
    setAudioPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onAudioClear();
  };

  return (
    <div className="w-full">
      <div className="w-full relative border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:border-cyan-500 transition-colors duration-300 bg-slate-800/30">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {audioPreview ? (
          <div className="relative flex items-center justify-center space-x-3 z-10">
            <audio src={audioPreview} controls className="h-8 max-w-[200px]" />
             <button 
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="p-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-cyan-400">Upload audio</span> (Optional reference)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioUploader;
