export interface Project {
  id: string;
  title: string;
  company: string;
  description: string;
  type: 'Market Audit' | 'Data Cleanup' | 'Social Media' | 'Research' | 'Strategy';
  status: 'Open' | 'In Progress' | 'Completed';
  compensation: string;
  duration: string;
  skills: string[];
}

export interface StudentProfile {
  name: string;
  university: string;
  year: number;
  bio: string;
  stackPoints: number;
  badges: Badge[];
  projects: Project[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  date: string;
}

