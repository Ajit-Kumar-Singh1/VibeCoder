import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string, imageData?: string) => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;
    onSend(input, selectedImage || undefined);
    setInput('');
    setSelectedImage(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix for API
        const base64Data = base64String.split(',')[1];
        setSelectedImage(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-resize textarea
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
      <div className="relative flex flex-col gap-2 max-w-4xl mx-auto w-full bg-zinc-900 border border-zinc-700 focus-within:border-zinc-500 rounded-xl overflow-hidden shadow-lg transition-colors">
        
        {selectedImage && (
          <div className="px-4 pt-4">
            <div className="relative inline-block">
              <img 
                src={`data:image/jpeg;base64,${selectedImage}`} 
                alt="Selected" 
                className="h-16 w-16 object-cover rounded-md border border-zinc-700"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-full p-0.5 border border-zinc-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-2 p-3">
            <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Upload Image"
            >
            <ImageIcon size={20} />
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
            />
            </button>

            <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
                setInput(e.target.value);
                adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Describe the app you want to build..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 resize-none outline-none max-h-[200px] py-2"
            rows={1}
            />

            <button
            onClick={handleSubmit}
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className={`p-2 rounded-lg transition-all ${
                isLoading || (!input.trim() && !selectedImage)
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-900/20'
            }`}
            >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
        </div>
      </div>
      <div className="text-center mt-2">
         <p className="text-[10px] text-zinc-500">Powered by Gemini 2.5 Flash. Generates single-file React apps.</p>
      </div>
    </div>
  );
};
