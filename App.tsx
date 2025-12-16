import React, { useState } from 'react';
import { generateResponse } from './services/gemini';
import { ChatArea } from './components/ChatArea';
import { InputArea } from './components/InputArea';
import { PreviewArea } from './components/PreviewArea';
import { Message, MessageRole, GeneratedProject } from './types';
import { Sparkles, Github } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentProject, setCurrentProject] = useState<GeneratedProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSendMessage = async (text: string, imageData?: string) => {
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.User,
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // Call Gemini API
      const { text: responseText, project } = await generateResponse(messages, text, imageData);

      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.Assistant,
        content: responseText,
        project: project,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newBotMsg]);

      if (project) {
        setCurrentProject(project);
      }
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.System,
        content: "Sorry, I encountered an error generating the project. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-white overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-zinc-800 p-2 rounded-lg border border-zinc-700 text-white"
        >
            {isSidebarOpen ? 'View Preview' : 'View Chat'}
        </button>
      </div>

      {/* Left Sidebar (Chat) */}
      <div className={`${isSidebarOpen ? 'flex' : 'hidden'} md:flex w-full md:w-[450px] lg:w-[500px] flex-col border-r border-zinc-800 bg-black`}>
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
                <h1 className="font-bold text-lg tracking-tight">Vibe Coder</h1>
            </div>
          </div>
          <a 
            href="#" 
            className="text-zinc-500 hover:text-white transition-colors"
            title="View on GitHub"
          >
            <Github size={20} />
          </a>
        </header>

        {/* Chat List */}
        <ChatArea messages={messages} onLoadProject={setCurrentProject} />

        {/* Input */}
        <InputArea onSend={handleSendMessage} isLoading={isLoading} />
      </div>

      {/* Right Area (Preview) */}
      <div className={`${!isSidebarOpen ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full bg-zinc-950`}>
        <PreviewArea project={currentProject} />
      </div>
    </div>
  );
};

export default App;