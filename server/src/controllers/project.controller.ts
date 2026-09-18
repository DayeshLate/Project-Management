import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../types';
import { createProjectSchema, updateProjectSchema } from '../validations/project.validation';

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { workspaceId } = req.query;
    const userId = req.user!.id;

    if (!workspaceId || typeof workspaceId !== 'string') {
      res.status(400).json({ success: false, error: 'workspaceId query parameter is required' });
      return;
    }

    // Verify workspace membership
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({ success: false, error: 'Access denied to this workspace' });
      return;
    }

    const projects = await prisma.project.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: { tasks: true, members: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarColor: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        workspace: {
          select: { id: true, name: true, slug: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarColor: true },
            },
          },
        },
        labels: true,
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    // Check workspace membership
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: project.workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({ success: false, error: 'Access denied to this project' });
      return;
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = createProjectSchema.parse(req.body);

    // Verify workspace membership
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: data.workspaceId,
          userId,
        },
      },
    });

    if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'MANAGER')) {
      res.status(403).json({ success: false, error: 'Only admins and managers can create projects' });
      return;
    }

    // Check if key is unique in workspace
    const existingKey = await prisma.project.findFirst({
      where: {
        workspaceId: data.workspaceId,
        key: data.key,
      },
    });

    if (existingKey) {
      res.status(400).json({ success: false, error: `Project key '${data.key}' is already in use in this workspace` });
      return;
    }

    const project = await prisma.project.create({
      data: {
        name: data.name,
        key: data.key,
        description: data.description || '',
        colorTag: data.colorTag || '#3B82F6',
        workspaceId: data.workspaceId,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        members: {
          create: {
            userId,
            role: 'MANAGER',
          },
        },
        labels: {
          createMany: {
            data: [
              { name: 'Bug', color: '#EF4444' },
              { name: 'Feature', color: '#3B82F6' },
              { name: 'Enhancement', color: '#10B981' },
              { name: 'Documentation', color: '#F59E0B' },
            ],
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarColor: true },
            },
          },
        },
        labels: true,
      },
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateProjectSchema.parse(req.body);

    const project = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        colorTag: data.colorTag,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id },
    });

    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};
