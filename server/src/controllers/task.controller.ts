import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../types';
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  createSubtaskSchema,
  updateSubtaskSchema,
} from '../validations/task.validation';
import { emitToProject } from '../sockets/socket';

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { projectId, status, priority, search, assigneeId } = req.query;

    if (!projectId || typeof projectId !== 'string') {
      res.status(400).json({ success: false, error: 'projectId is required' });
      return;
    }

    const whereClause: any = { projectId };

    if (status && typeof status === 'string') {
      whereClause.status = status;
    }

    if (priority && typeof priority === 'string') {
      whereClause.priority = priority;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (assigneeId && typeof assigneeId === 'string') {
      whereClause.assignees = {
        some: { userId: assigneeId },
      };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatarColor: true },
        },
        assignees: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarColor: true },
            },
          },
        },
        subtasks: {
          orderBy: { orderIndex: 'asc' },
        },
        labels: {
          include: {
            label: true,
          },
        },
        _count: {
          select: { comments: true, subtasks: true },
        },
      },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
    });

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, key: true, workspaceId: true },
        },
        creator: {
          select: { id: true, name: true, email: true, avatarColor: true },
        },
        assignees: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarColor: true },
            },
          },
        },
        subtasks: {
          orderBy: { orderIndex: 'asc' },
        },
        labels: {
          include: {
            label: true,
          },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarColor: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        activities: {
          include: {
            user: {
              select: { id: true, name: true, avatarColor: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = createTaskSchema.parse(req.body);

    // Get max task number in this project
    const lastTask = await prisma.task.findFirst({
      where: { projectId: data.projectId },
      orderBy: { taskNumber: 'desc' },
      select: { taskNumber: true },
    });
    const nextTaskNumber = (lastTask?.taskNumber || 0) + 1;

    // Get highest order index for this status
    const lastStatusTask = await prisma.task.findFirst({
      where: { projectId: data.projectId, status: data.status },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });
    const nextOrderIndex = (lastStatusTask?.orderIndex || 0) + 1000;

    const task = await prisma.task.create({
      data: {
        taskNumber: nextTaskNumber,
        title: data.title,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
        orderIndex: nextOrderIndex,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        projectId: data.projectId,
        creatorId: userId,
        assignees: {
          create: data.assigneeIds.map((uId) => ({ userId: uId })),
        },
        labels: {
          create: data.labels.map((lId) => ({ labelId: lId })),
        },
        activities: {
          create: {
            userId,
            action: 'CREATED_TASK',
            details: JSON.stringify({ title: data.title, status: data.status }),
          },
        },
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatarColor: true },
        },
        assignees: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarColor: true },
            },
          },
        },
        subtasks: true,
        labels: {
          include: { label: true },
        },
        _count: {
          select: { comments: true, subtasks: true },
        },
      },
    });

    emitToProject(data.projectId, 'task_created', task);

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const data = updateTaskSchema.parse(req.body);

    const currentTask = await prisma.task.findUnique({
      where: { id },
      include: { assignees: true, labels: true },
    });

    if (!currentTask) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    // Prepare update data
    const updatePayload: any = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
      orderIndex: data.orderIndex,
    };

    if (data.assigneeIds) {
      updatePayload.assignees = {
        deleteMany: {},
        create: data.assigneeIds.map((uId) => ({ userId: uId })),
      };
    }

    if (data.labels) {
      updatePayload.labels = {
        deleteMany: {},
        create: data.labels.map((lId) => ({ labelId: lId })),
      };
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...updatePayload,
        activities: {
          create: {
            userId,
            action: 'UPDATED_TASK',
            details: JSON.stringify(data),
          },
        },
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatarColor: true },
        },
        assignees: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarColor: true },
            },
          },
        },
        subtasks: true,
        labels: {
          include: { label: true },
        },
        _count: {
          select: { comments: true, subtasks: true },
        },
      },
    });

    emitToProject(currentTask.projectId, 'task_updated', updatedTask);

    res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    next(error);
  }
};

export const moveTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { status, orderIndex } = moveTaskSchema.parse(req.body);

    const currentTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!currentTask) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    const statusChanged = currentTask.status !== status;

    const task = await prisma.task.update({
      where: { id },
      data: {
        status,
        orderIndex,
        activities: statusChanged
          ? {
              create: {
                userId,
                action: 'MOVED_STATUS',
                details: JSON.stringify({ from: currentTask.status, to: status }),
              },
            }
          : undefined,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatarColor: true },
        },
        assignees: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarColor: true },
            },
          },
        },
        subtasks: true,
        labels: {
          include: { label: true },
        },
        _count: {
          select: { comments: true, subtasks: true },
        },
      },
    });

    emitToProject(currentTask.projectId, 'task_moved', {
      taskId: id,
      projectId: currentTask.projectId,
      fromStatus: currentTask.status,
      toStatus: status,
      orderIndex,
      task,
    });

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      select: { id: true, projectId: true },
    });

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    await prisma.task.delete({
      where: { id },
    });

    emitToProject(task.projectId, 'task_deleted', { taskId: id, projectId: task.projectId });

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- Subtasks ---
export const addSubtask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: taskId } = req.params;
    const { title } = createSubtaskSchema.parse(req.body);

    const lastSubtask = await prisma.subtask.findFirst({
      where: { taskId },
      orderBy: { orderIndex: 'desc' },
    });

    const subtask = await prisma.subtask.create({
      data: {
        taskId,
        title,
        orderIndex: (lastSubtask?.orderIndex ?? -1) + 1,
      },
    });

    res.status(201).json({ success: true, data: subtask });
  } catch (error) {
    next(error);
  }
};

export const updateSubtask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { subtaskId } = req.params;
    const data = updateSubtaskSchema.parse(req.body);

    const subtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data,
    });

    res.status(200).json({ success: true, data: subtask });
  } catch (error) {
    next(error);
  }
};

export const deleteSubtask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { subtaskId } = req.params;

    await prisma.subtask.delete({
      where: { id: subtaskId },
    });

    res.status(200).json({ success: true, message: 'Subtask deleted' });
  } catch (error) {
    next(error);
  }
};
