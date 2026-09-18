"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // 1. Create Demo User
    const passwordHash = await bcryptjs_1.default.hash('password123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            passwordHash,
            name: 'Alex Johnson',
            avatarColor: '#6366F1',
            bio: 'Lead Developer & Product Architect',
        },
    });
    // Secondary team member
    const memberUser = await prisma.user.upsert({
        where: { email: 'sarah@example.com' },
        update: {},
        create: {
            email: 'sarah@example.com',
            passwordHash,
            name: 'Sarah Chen',
            avatarColor: '#EC4899',
            bio: 'Senior Frontend Engineer',
        },
    });
    // 2. Create Workspace
    const workspace = await prisma.workspace.upsert({
        where: { slug: 'acme-engineering' },
        update: {},
        create: {
            name: 'Acme Engineering',
            slug: 'acme-engineering',
            ownerId: user.id,
            members: {
                create: [
                    { userId: user.id, role: 'ADMIN' },
                    { userId: memberUser.id, role: 'MEMBER' },
                ],
            },
        },
    });
    // 3. Create Project
    const project = await prisma.project.create({
        data: {
            name: 'Nebula Platform 2.0',
            key: 'NEB',
            description: 'Next-generation cloud management workspace with real-time telemetry and automation pipelines.',
            colorTag: '#6366F1',
            workspaceId: workspace.id,
            members: {
                create: [
                    { userId: user.id, role: 'ADMIN' },
                    { userId: memberUser.id, role: 'MEMBER' },
                ],
            },
            labels: {
                createMany: {
                    data: [
                        { name: 'Core Feature', color: '#3B82F6' },
                        { name: 'Bugfix', color: '#EF4444' },
                        { name: 'UI / UX', color: '#8B5CF6' },
                        { name: 'Performance', color: '#10B981' },
                    ],
                },
            },
        },
    });
    // Fetch created labels
    const labels = await prisma.label.findMany({ where: { projectId: project.id } });
    const featureLabel = labels.find((l) => l.name === 'Core Feature');
    const uiLabel = labels.find((l) => l.name === 'UI / UX');
    const perfLabel = labels.find((l) => l.name === 'Performance');
    // 4. Create Sample Tasks
    const task1 = await prisma.task.create({
        data: {
            taskNumber: 1,
            title: 'Design token architecture & dark mode theme system',
            description: 'Implement curated CSS custom properties for vibrant dark/light modes, HSL color tokens, and fluid typography.',
            status: 'DONE',
            priority: 'HIGH',
            orderIndex: 1000,
            projectId: project.id,
            creatorId: user.id,
            assignees: { create: [{ userId: memberUser.id }] },
            labels: uiLabel ? { create: [{ labelId: uiLabel.id }] } : undefined,
            subtasks: {
                create: [
                    { title: 'Define HSL color palette variables', isCompleted: true, orderIndex: 0 },
                    { title: 'Setup dark mode toggle state', isCompleted: true, orderIndex: 1 },
                    { title: 'Test contrast ratios against WCAG AAA', isCompleted: true, orderIndex: 2 },
                ],
            },
            comments: {
                create: [
                    { userId: user.id, content: 'Contrast looks crisp and readable in dark mode!' },
                ],
            },
        },
    });
    const task2 = await prisma.task.create({
        data: {
            taskNumber: 2,
            title: 'Implement interactive Kanban drag-and-drop board',
            description: 'Integrate accessible drag-and-drop card movements between Backlog, Todo, In Progress, Review, and Done columns with optimistic UI updates.',
            status: 'IN_PROGRESS',
            priority: 'URGENT',
            orderIndex: 1000,
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            projectId: project.id,
            creatorId: user.id,
            assignees: { create: [{ userId: user.id }, { userId: memberUser.id }] },
            labels: featureLabel ? { create: [{ labelId: featureLabel.id }] } : undefined,
            subtasks: {
                create: [
                    { title: 'Setup column containers with droppable areas', isCompleted: true, orderIndex: 0 },
                    { title: 'Wire PATCH /tasks/:id/move endpoint', isCompleted: true, orderIndex: 1 },
                    { title: 'Add real-time Socket.io broadcast on card drop', isCompleted: false, orderIndex: 2 },
                ],
            },
        },
    });
    const task3 = await prisma.task.create({
        data: {
            taskNumber: 3,
            title: 'Real-time WebSocket event bridge for collaborative board',
            description: 'Setup bidirectional rooms per project so edits, moves, and comments appear instantaneously for active team members.',
            status: 'TODO',
            priority: 'HIGH',
            orderIndex: 2000,
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            projectId: project.id,
            creatorId: user.id,
            assignees: { create: [{ userId: user.id }] },
            labels: perfLabel ? { create: [{ labelId: perfLabel.id }] } : undefined,
        },
    });
    const task4 = await prisma.task.create({
        data: {
            taskNumber: 4,
            title: 'Markdown formatting parser for task descriptions & comments',
            description: 'Support pure text Markdown: bullet lists, inline code snippets, bold emphasis, and structured headings without any media uploads.',
            status: 'BACKLOG',
            priority: 'MEDIUM',
            orderIndex: 1000,
            projectId: project.id,
            creatorId: memberUser.id,
            assignees: { create: [{ userId: memberUser.id }] },
        },
    });
    console.log('✅ Seed completed successfully:');
    console.log(`   User: demo@example.com / password123`);
    console.log(`   Workspace: ${workspace.name}`);
    console.log(`   Project: ${project.name} (${project.key})`);
    console.log(`   Tasks created: 4`);
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
