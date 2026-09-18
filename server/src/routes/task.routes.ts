import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  addSubtask,
  updateSubtask,
  deleteSubtask,
} from '../controllers/task.controller';
import {
  getComments,
  addComment,
  deleteComment,
} from '../controllers/comment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Task CRUD
router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.patch('/:id', updateTask);
router.patch('/:id/move', moveTask);
router.delete('/:id', deleteTask);

// Subtasks
router.post('/:id/subtasks', addSubtask);
router.patch('/subtasks/:subtaskId', updateSubtask);
router.delete('/subtasks/:subtaskId', deleteSubtask);

// Comments
router.get('/:taskId/comments', getComments);
router.post('/:taskId/comments', addComment);
router.delete('/comments/:id', deleteComment);

export default router;
