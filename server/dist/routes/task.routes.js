"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const comment_controller_1 = require("../controllers/comment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Task CRUD
router.get('/', task_controller_1.getTasks);
router.post('/', task_controller_1.createTask);
router.get('/:id', task_controller_1.getTaskById);
router.patch('/:id', task_controller_1.updateTask);
router.patch('/:id/move', task_controller_1.moveTask);
router.delete('/:id', task_controller_1.deleteTask);
// Subtasks
router.post('/:id/subtasks', task_controller_1.addSubtask);
router.patch('/subtasks/:subtaskId', task_controller_1.updateSubtask);
router.delete('/subtasks/:subtaskId', task_controller_1.deleteSubtask);
// Comments
router.get('/:taskId/comments', comment_controller_1.getComments);
router.post('/:taskId/comments', comment_controller_1.addComment);
router.delete('/comments/:id', comment_controller_1.deleteComment);
exports.default = router;
