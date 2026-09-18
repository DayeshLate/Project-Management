import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../types';
import { createWorkspaceSchema } from '../validations/project.validation';

export const getMyWorkspaces = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            projects: {
              select: { id: true, name: true, key: true, colorTag: true },
            },
            _count: {
              select: { members: true, projects: true },
            },
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    const workspaces = memberships.map((m) => ({
      ...m.workspace,
      userRole: m.role,
    }));

    res.status(200).json({ success: true, data: workspaces });
  } catch (error) {
    next(error);
  }
};

export const createWorkspace = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name } = createWorkspaceSchema.parse(req.body);
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: true,
      },
    });

    res.status(201).json({ success: true, data: workspace });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarColor: true, bio: true },
            },
          },
        },
        projects: {
          include: {
            _count: {
              select: { tasks: true, members: true },
            },
          },
        },
      },
    });

    if (!workspace) {
      res.status(404).json({ success: false, error: 'Workspace not found' });
      return;
    }

    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    res.status(200).json({ success: true, data: workspace });
  } catch (error) {
    next(error);
  }
};
