import React, { useEffect, useRef } from 'react';
import { Message, MessageRole, GeneratedProject } from '../types';
import { Bot, User, Terminal, FolderOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatAreaProps {
  messages: Message[];
  onLoadProject: (project: GeneratedProject) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, onLoadProject }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-50 select-none">
          <Terminal size={48} className="mb-4" />
          <p className="text-lg font-medium">Start coding the vibe.</p>
        </div>
      )}
      
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-4 ${
            msg.role === MessageRole.User ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {/* Avatar */}
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
              msg.role === MessageRole.User
                ? 'bg-blue-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {msg.role === MessageRole.User ? <User size={18} /> : <Bot size={18} />}
          </div>

          {/* Content */}
          <div
            className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
              msg.role === MessageRole.User
                ? 'bg-zinc-800 text-zinc-100 rounded-tr-none'
                : 'bg-zinc-900 text-zinc-300 rounded-tl-none border border-zinc-800'
            }`}
          >
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown 
                components={{
                    code({node, className, children, ...props}) {
                        return <code className={`${className} bg-black/30 rounded px-1 py-0.5`} {...props}>{children}</code>
                    },
                    pre({node, children, ...props}) {
                         return (
                            <div className="not-prose bg-zinc-950 rounded-lg p-3 my-2 border border-zinc-800 overflow-x-auto">
                                <pre {...props} className="text-xs font-mono">{children}</pre>
                            </div>
                         )
                    }
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>

            {msg.project && (
              <button
                onClick={() => onLoadProject(msg.project!)}
                className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg transition-colors border border-emerald-500/20 w-full justify-between group"
              >
                <span className="flex items-center gap-2">
                    <Terminal size={14} />
                    <span>Load Project: {msg.project.projectName}</span>
                </span>
                <span className="text-emerald-500/50 group-hover:text-emerald-500 transition-colors">
                    <FolderOpen size={14} />
                </span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};