import { Router } from 'express';
import { getMyWorkspaces, createWorkspace, getWorkspaceById } from '../controllers/workspace.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getMyWorkspaces);
router.post('/', createWorkspace);
router.get('/:id', getWorkspaceById);

export default router;
