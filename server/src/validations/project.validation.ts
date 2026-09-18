import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
});

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  key: z.string().min(2).max(10).toUpperCase(),
  description: z.string().optional(),
  colorTag: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i).optional(),
  workspaceId: z.string().uuid(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  colorTag: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i).optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});
