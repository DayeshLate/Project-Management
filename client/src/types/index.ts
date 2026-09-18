export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
  bio?: string | null;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: Role;
  user: User;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  members?: WorkspaceMember[];
  projects?: Project[];
  _count?: {
    members: number;
    projects: number;
  };
  userRole?: Role;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: Role;
  user: User;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  colorTag: string;
  workspaceId: string;
  startDate?: string | null;
  endDate?: string | null;
  members?: ProjectMember[];
  labels?: Label[];
  _count?: {
    tasks: number;
    members?: number;
  };
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  orderIndex: number;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: User;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  details?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarColor: string;
  };
}

export interface Task {
  id: string;
  taskNumber: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  orderIndex: number;
  dueDate?: string | null;
  projectId: string;
  creatorId: string;
  createdAt: string;
  creator: User;
  assignees: { user: User }[];
  subtasks: Subtask[];
  labels: { label: Label }[];
  comments?: Comment[];
  activities?: ActivityLog[];
  _count?: {
    comments: number;
    subtasks: number;
  };
}

export interface FilterState {
  search: string;
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
}
