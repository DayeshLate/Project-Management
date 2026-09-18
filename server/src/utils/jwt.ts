import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { AuthUser } from '../types';

export const signToken = (payload: AuthUser): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });
};

export const verifyToken = (token: string): AuthUser | null => {
  try {
    return jwt.verify(token, ENV.JWT_SECRET) as AuthUser;
  } catch (error) {
    return null;
  }
};
