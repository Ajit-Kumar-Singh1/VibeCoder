export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system'
}

export interface ProjectFile {
  path: string;
  content: string;
}

export interface GeneratedProject {
  projectName: string;
  preview: string; // Single HTML file for iframe preview
  files: ProjectFile[]; // Broken down source files
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  project?: GeneratedProject; // Replaces 'code'
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentProject: GeneratedProject | null;
}