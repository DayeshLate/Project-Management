import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
