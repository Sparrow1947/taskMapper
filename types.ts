
export enum Proficiency {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  EXPERT = 'Expert'
}

export interface Task {
  id: string;
  name: string;
  client: string;
  role: string;
  from: string;
  to: string;
  isOngoing: boolean;
  description?: string;
  dayToDay?: string;
}

export interface Skill {
  id: string;
  name: string;
  proficiency: Proficiency;
  certifications: string;
}

export interface Member {
  id: string;
  empId: string;
  name: string;
  designation: string;
  department: string;
  tasks: Task[];
  skills: Skill[];
  summary?: string;
}

export interface GithubConfig {
  token: string;
  owner: string;
  repo: string;
  path: string;
  branch: string;
}

export type View = 'dashboard' | 'members' | 'add-member';
