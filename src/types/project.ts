export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  githubUrl?: string;
  img?: string;
}