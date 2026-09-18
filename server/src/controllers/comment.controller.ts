import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../types';
import { createCommentSchema } from '../validations/task.validation';
import { emitToProject } from '../sockets/socket';

export const getComments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { taskId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarColor: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.id;
    const { content } = createCommentSchema.parse(req.body);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        taskId,
        userId,
        content,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarColor: true },
        },
      },
    });

    // Record activity
    await prisma.activityLog.create({
      data: {
        taskId,
        userId,
        action: 'COMMENTED',
        details: JSON.stringify({ commentId: comment.id }),
      },
    });

    emitToProject(task.projectId, 'comment_added', { taskId, comment });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { task: { select: { projectId: true } } },
    });

    if (!comment) {
      res.status(404).json({ success: false, error: 'Comment not found' });
      return;
    }

    if (comment.userId !== userId) {
      res.status(403).json({ success: false, error: 'Cannot delete another user\'s comment' });
      return;
    }

    await prisma.comment.delete({
      where: { id },
    });

    emitToProject(comment.task.projectId, 'comment_deleted', { commentId: id, taskId: comment.taskId });

    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};
