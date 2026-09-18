import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../types';
import { registerSchema, loginSchema, updateProfileSchema } from '../validations/auth.validation';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';

// Helper to pick random pleasant color for text avatar
const AVATAR_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E',
  '#F97316', '#EAB308', '#10B981', '#06B6D4', '#3B82F6'
];

export const register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      res.status(400).json({ success: false, error: 'Email already registered' });
      return;
    }

    const passwordHash = await hashPassword(data.password);
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    // Create user and auto-create their default personal workspace
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        bio: data.bio || '',
        avatarColor: randomColor,
        workspaces: {
          create: {
            role: 'ADMIN',
            workspace: {
              create: {
                name: `${data.name}'s Workspace`,
                slug: `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
                ownerId: '', // updated below
              },
            },
          },
        },
      },
      include: {
        workspaces: {
          include: { workspace: true },
        },
      },
    });

    // Update workspace ownerId
    if (user.workspaces.length > 0) {
      await prisma.workspace.update({
        where: { id: user.workspaces[0].workspaceId },
        data: { ownerId: user.id },
      });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarColor: user.avatarColor,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          bio: user.bio,
          avatarColor: user.avatarColor,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const isValid = await comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarColor: user.avatarColor,
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          bio: user.bio,
          avatarColor: user.avatarColor,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatarColor: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const data = updateProfileSchema.parse(req.body);
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatarColor: true,
      },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
