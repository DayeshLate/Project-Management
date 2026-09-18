# Project Management Application — System Requirements Specification (SRS)

A medium-level, production-ready Project Management Application (similar to Jira / Linear / Trello) designed for agile teams to organize, track, and manage projects, tasks, and workflows seamlessly.

> [!IMPORTANT]
> **Strictly Text-Based Application**: This application is strictly text-based. It does **not** include any file, image, audio, or video uploads. User avatars are rendered using generated text initials and color codes, and all descriptions, subtasks, and comments are pure text and Markdown.

---

## 1. Executive Summary & Architecture Overview

### 1.1 Objective
To build a scalable, responsive, and intuitive web-based Project Management Application that supports team collaboration, project tracking, interactive Kanban boards, role-based access control (RBAC), and real-time activity updates—focusing purely on structured text data without media or file storage overhead.

### 1.2 Technology Stack

| Layer | Technology | Key Libraries / Tools |
| :--- | :--- | :--- |
| **Frontend** | React (v18+) with TypeScript | Vite, Tailwind CSS / Vanilla CSS, Lucide React (Icons) |
| **State Management** | TanStack Query (React Query) | Server-state caching, data fetching, optimistic UI updates |
| **Client State** | Zustand | Lightweight client UI state (sidebar, modals, filters) |
| **Drag & Drop** | `@hello-pangea/dnd` or `@dnd-kit` | Smooth, accessible Kanban drag-and-drop card movements |
| **Forms & Validation**| React Hook Form + Zod | Schema-based strict type-safe form validation |
| **Backend** | Node.js (v20+) with TypeScript | Express.js (or Fastify), RESTful API architecture |
| **Realtime Engine** | Socket.io | Bidirectional WebSocket communication for live updates |
| **Database & ORM** | PostgreSQL + Prisma ORM | Relational schema, type-safe queries, migrations |
| **Authentication** | JWT (Access & Refresh Tokens) | `bcryptjs` (hashing), cookie/header-based session |
| **Testing** | Vitest + React Testing Library (Client), Jest / Supertest (Server) | Unit and integration testing |

---

## 2. User Roles & Permission Matrix (RBAC)

The system is structured around **Workspaces** and **Projects**, where permissions are scoped per workspace and per project.

| Feature / Action | Admin | Project Manager | Team Member | Viewer / Guest |
| :--- | :---: | :---: | :---: | :---: |
| **Workspace Settings & Details** | ✅ | ❌ | ❌ | ❌ |
| **Invite / Remove Workspace Members**| ✅ | ❌ | ❌ | ❌ |
| **Create & Delete Projects** | ✅ | ✅ | ❌ | ❌ |
| **Manage Project Members & Roles** | ✅ | ✅ | ❌ | ❌ |
| **Create, Edit & Delete Tasks** | ✅ | ✅ | ✅ | ❌ |
| **Move Tasks (Change Status)** | ✅ | ✅ | ✅ | ❌ |
| **Assign / Unassign Members** | ✅ | ✅ | ✅ | ❌ |
| **Post Comments** | ✅ | ✅ | ✅ | ❌ |
| **View Board, List, & Dashboards** | ✅ | ✅ | ✅ | ✅ |

---

## 3. Functional Requirements

### 3.1 Authentication & Profile Management
- **Registration & Login:**
  - Email/password signup with password strength validation (min 8 chars, numbers, symbols).
  - Secure login returning short-lived JWT Access Token (15m) and HTTP-only Refresh Token (7d).
  - Password recovery via secure email reset token.
- **User Profile (Text Only):**
  - Display name, bio, job title, and time zone.
  - **Text Initials Avatar**: Dynamically rendered initials badge (e.g., "JD" for John Doe) with customizable or auto-assigned background color (no image upload).
  - Notification preferences (email vs in-app).

### 3.2 Workspace & Organization Management
- Users can belong to multiple workspaces (e.g., "Engineering Team", "Personal Projects").
- Workspace owner can invite users via email with a specific workspace role.
- Member directory with role assignment and removal capabilities.

### 3.3 Project Management
- **Project CRUD:**
  - Title, unique identifier/key (e.g., `PRJ-`, `DEV-`), description (text/markdown), category, and color tag.
  - Project target dates: Start Date, Target Due Date.
  - Project Status: `Planning`, `In Progress`, `On Hold`, `Completed`, `Archived`.
- **Project Members:**
  - Assign specific workspace members to the project.
- **Project Dashboard / Analytics:**
  - Total tasks count, completion percentage (progress bar).
  - Distribution by status (`Backlog`, `To Do`, `In Progress`, `In Review`, `Done`).
  - Overdue tasks counter and workload distribution per member.

### 3.4 Task & Issue Management (Core Feature — Text Only)
- **Task Attributes:**
  - **Key & Number:** Auto-generated ID (e.g., `PRJ-101`).
  - **Title:** Required text string (max 150 chars).
  - **Description:** Structured text / Markdown-formatted content (bullet points, bold/italic, inline code, headings; strictly text with no media uploads).
  - **Status:** Standard columns (`Backlog`, `To Do`, `In Progress`, `In Review`, `Done`).
  - **Priority:** `Low`, `Medium`, `High`, `Urgent` (color-coded badges).
  - **Assignee(s):** One or multiple project members.
  - **Reporter:** Auto-set to the task creator.
  - **Due Date:** Date picker with overdue indicator if past date.
  - **Labels / Tags:** Custom text badges (e.g., `Bug`, `Feature`, `UI/UX`, `Backend`).
  - **Story Points / Estimate:** Numerical points or hours estimate.
- **Subtasks & Checklists (Text Only):**
  - Text checklist items with completion checkboxes.
  - Progress indicator (e.g., "3 of 5 completed").
- **Views:**
  - **Kanban Board View:**
    - Drag-and-drop task cards between status columns.
    - Reorder tasks within the same column (maintains position order).
    - Quick-create task button directly inside columns.
  - **List / Table View:**
    - Tabular layout with sortable headers (Due Date, Priority, Assignee).
    - Multi-select bulk actions (delete, change status, assign member).
  - **Task Detail Modal / Drawer:**
    - Slide-over drawer or modal displaying full task text metadata, comments, and activity history.
    - Real-time updates when another user edits the same task.

### 3.5 Collaboration & Activity Tracking (Text Only)
- **Task Comments:**
  - Plain text and Markdown comments on each task.
  - `@mention` auto-complete for project members by name or email.
  - Timestamp, edit, and delete functionality (by comment author or admin).
- **Activity Log (Audit Trail):**
  - Automated text history record whenever task fields change (e.g., *"Alice changed status from In Progress to Done 5 minutes ago"*).

### 3.6 Search, Filtering & Sorting
- **Global Search:** Instant modal search (`Ctrl+K` / `Cmd+K`) across projects and tasks.
- **Filters:**
  - Filter by Assignee (`Assigned to me`, specific users).
  - Filter by Priority, Status, Label, and Due Date range.
- **Sorting:** By Creation Date, Due Date, Priority, or Alphabetical.

### 3.7 Real-time Collaboration & Notifications
- **WebSockets (Socket.io):**
  - Instant board updates when a task is moved, created, or deleted by another user.
  - Presence indicators (who is currently viewing a project).
- **Notifications:**
  - In-app notification bell dropdown with unread badge.
  - Triggers: Assigned to a task, mentioned in a comment, task due within 24 hours.
  - "Mark all as read" functionality.

---

## 4. Non-Functional Requirements

| Dimension | Requirement |
| :--- | :--- |
| **Performance** | • Page load < 1.0 second; API latency < 150ms.<br>• Optimistic UI updates for drag-and-drop to eliminate UI lag.<br>• Extremely lightweight payload due to zero binary media transfer. |
| **Security** | • Password hashed with bcrypt (salt rounds: 10+).<br>• JWT signed with secret keys, stored in secure HTTP-only cookies or Bearer tokens.<br>• SQL injection protected via Prisma parameterization.<br>• Input sanitization to prevent XSS attacks.<br>• Rate limiting on authentication routes (e.g., 5 attempts / 15 mins). |
| **Scalability** | • Stateless backend server enabling horizontal scaling.<br>• Database indexing on foreign keys (`projectId`, `workspaceId`, `assigneeId`, `status`).<br>• Cursor-based or page-based pagination for task lists. |
| **Usability & Design**| • Responsive design (optimized for 1280px+ desktop, compatible with tablets & phones).<br>• Dark / Light mode toggle support.<br>• Keyboard shortcuts (e.g., `C` for Create Task, `/` for search). |

---

## 5. Database Schema Design (PostgreSQL / Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  MANAGER
  MEMBER
  VIEWER
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  BACKLOG
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

model User {
  id               String            @id @default(uuid())
  email            String            @unique
  passwordHash     String
  name             String
  avatarColor      String            @default("#6366F1") // Hex color for initials avatar badge
  bio              String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  workspaces       WorkspaceMember[]
  projectMembers   ProjectMember[]
  createdTasks     Task[]            @relation("TaskCreator")
  assignedTasks    TaskAssignee[]
  comments         Comment[]
  notifications    Notification[]
  activityLogs     ActivityLog[]
}

model Workspace {
  id          String            @id @default(uuid())
  name        String
  slug        String            @unique
  ownerId     String
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  members     WorkspaceMember[]
  projects    Project[]
}

model WorkspaceMember {
  id          String     @id @default(uuid())
  workspaceId String
  userId      String
  role        Role       @default(MEMBER)
  joinedAt    DateTime   @default(now())

  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId])
}

model Project {
  id          String          @id @default(uuid())
  name        String
  key         String          // e.g. "PRJ"
  description String?         // Markdown/text description
  colorTag    String          @default("#3B82F6") // Project theme color
  workspaceId String
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  workspace   Workspace       @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  members     ProjectMember[]
  tasks       Task[]
  labels      Label[]
}

model ProjectMember {
  id        String    @id @default(uuid())
  projectId String
  userId    String
  role      Role      @default(MEMBER)

  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
}

model Task {
  id          String         @id @default(uuid())
  taskNumber  Int            // 1, 2, 3...
  title       String
  description String?        // Rich-text / Markdown content
  status      TaskStatus     @default(TODO)
  priority    Priority       @default(MEDIUM)
  orderIndex  Float          @default(0.0)
  dueDate     DateTime?
  projectId   String
  creatorId   String
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  project     Project        @relation(fields: [projectId], references: [id], onDelete: Cascade)
  creator     User           @relation("TaskCreator", fields: [creatorId], references: [id])
  assignees   TaskAssignee[]
  subtasks    Subtask[]
  comments    Comment[]
  labels      TaskLabel[]
  activities  ActivityLog[]

  @@unique([projectId, taskNumber])
  @@index([projectId, status])
}

model TaskAssignee {
  taskId String
  userId String

  task   Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([taskId, userId])
}

model Subtask {
  id          String   @id @default(uuid())
  taskId      String
  title       String
  isCompleted Boolean  @default(false)
  orderIndex  Int      @default(0)

  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
}

model Label {
  id        String      @id @default(uuid())
  projectId String
  name      String
  color     String      // Hex color code

  project   Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tasks     TaskLabel[]
}

model TaskLabel {
  taskId  String
  labelId String

  task    Task  @relation(fields: [taskId], references: [id], onDelete: Cascade)
  label   Label @relation(fields: [labelId], references: [id], onDelete: Cascade)

  @@id([taskId, labelId])
}

model Comment {
  id        String   @id @default(uuid())
  taskId    String
  userId    String
  content   String   // Text/Markdown comment
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ActivityLog {
  id        String   @id @default(uuid())
  taskId    String
  userId    String
  action    String   // e.g. "CHANGED_STATUS", "ADDED_COMMENT", "UPDATED_PRIORITY"
  details   Json?
  createdAt DateTime @default(now())

  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  title     String
  message   String
  link      String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 6. RESTful API Endpoints Specification

### 6.1 Authentication (`/api/v1/auth`)
- `POST /register` — Register a new account
- `POST /login` — Authenticate and receive JWT tokens
- `POST /refresh` — Refresh expired access token using refresh token
- `POST /logout` — Invalidate session / clear cookies
- `GET  /me` — Fetch currently authenticated user profile

### 6.2 Workspaces (`/api/v1/workspaces`)
- `GET    /` — Get all workspaces for current user
- `POST   /` — Create a new workspace
- `GET    /:id` — Get workspace details & members
- `PUT    /:id` — Update workspace information (Admin only)
- `POST   /:id/invite` — Invite user to workspace by email
- `DELETE /:id/members/:userId` — Remove member from workspace

### 6.3 Projects (`/api/v1/projects`)
- `GET    /?workspaceId=:workspaceId` — List all projects in a workspace
- `POST   /` — Create new project
- `GET    /:id` — Get project details, overview stats, and member list
- `PUT    /:id` — Update project metadata
- `DELETE /:id` — Delete project (Admin/Manager only)
- `POST   /:id/members` — Add member to project

### 6.4 Tasks (`/api/v1/tasks`)
- `GET    /?projectId=:id&status=&assignee=&priority=&search=` — Get tasks with filtering & pagination
- `POST   /` — Create new task
- `GET    /:id` — Get single task details (subtasks, assignees, labels)
- `PATCH  /:id` — Update task fields (title, description, due date, priority)
- `PATCH  /:id/move` — Reorder or update task status (`status`, `newOrderIndex`)
- `DELETE /:id` — Delete task

### 6.5 Comments (`/api/v1/tasks/:taskId/comments`)
- `GET    /` — Get all text comments for a task
- `POST   /` — Add a new text/Markdown comment to task
- `DELETE /:commentId` — Delete comment

### 6.6 Notifications (`/api/v1/notifications`)
- `GET   /` — Get user notifications (paginated)
- `PATCH /:id/read` — Mark notification as read
- `PATCH /read-all` — Mark all notifications as read

---

## 7. Recommended Project Folder Structure

```
project-management/
├── client/                     # React + TypeScript Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/             # SVGs, static icons
│   │   ├── components/         # Reusable atomic UI components
│   │   │   ├── ui/             # Buttons, Inputs, Dialogs, Badges, Dropdowns
│   │   │   ├── layout/         # Navbar, Sidebar, Header, AppLayout
│   │   │   └── common/         # InitialsAvatar, Spinner, ErrorBoundary
│   │   ├── features/           # Domain-driven feature modules
│   │   │   ├── auth/           # Login, Register, ProtectedRoute
│   │   │   ├── workspaces/     # WorkspaceSwitcher, WorkspaceSettings
│   │   │   ├── projects/       # ProjectList, ProjectForm, ProjectStats
│   │   │   ├── kanban/         # Board, Column, TaskCard, DragOverlay
│   │   │   ├── tasks/          # TaskDetailModal, TaskForm, SubtaskList
│   │   │   ├── comments/       # CommentList, CommentInput (Text/Markdown)
│   │   │   └── notifications/  # NotificationBell, NotificationItem
│   │   ├── hooks/              # Custom React hooks (useAuth, useSocket, useDebounce)
│   │   ├── services/           # Axios / Fetch API client & endpoint handlers
│   │   ├── store/              # Zustand stores (useUIStore, useFilterStore)
│   │   ├── types/              # Global TypeScript interfaces & DTOs
│   │   ├── utils/              # Formatters, date helpers, cn classnames utility
│   │   ├── App.tsx             # Route configuration
│   │   └── main.tsx            # App entry point & QueryClientProvider
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema & models
│   │   └── migrations/         # Prisma migration history
│   ├── src/
│   │   ├── config/             # Environment variables & DB connection
│   │   ├── controllers/        # Request handling & HTTP response logic
│   │   ├── middlewares/        # Auth guard, RBAC validation, error handler
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # Core business logic & database queries
│   │   ├── sockets/            # Socket.io connection & event handlers
│   │   ├── types/              # Request/Response TypeScript types
│   │   ├── utils/              # JWT helpers, password hashing, logger
│   │   ├── validations/        # Zod request validation schemas
│   │   ├── app.ts              # Express application configuration
│   │   └── server.ts           # Server bootstrap & WebSocket listener
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── README.md                   # Setup guide & local execution instructions
```

---

## 8. Step-by-Step Implementation Roadmap

### Phase 1: Foundation & Setup
1. Setup dual-directory structure (`client/` and `server/`).
2. Initialize TypeScript configs, ESLint, and Prettier.
3. Setup PostgreSQL database and initialize Prisma schema with migration.
4. Implement JWT authentication system (Registration, Login, Refresh token, Auth middleware).

### Phase 2: Workspaces & Project Organization
1. Build Workspace CRUD & user invitation logic.
2. Build Project CRUD with workspace association.
3. Setup frontend application shell: Sidebar, Navbar, Workspace Switcher, and Breadcrumbs.

### Phase 3: Task Management & Kanban Board
1. Implement Task API (Create, Read, Update, Delete, Move).
2. Build responsive Kanban Board with drag-and-drop (`@hello-pangea/dnd` or `@dnd-kit`).
3. Implement optimistic UI updates for instant card movement feedback.
4. Implement List View with column sorting and multi-criteria filtering.

### Phase 4: Collaboration & Text-Based Features
1. Implement Subtasks checklist inside tasks (plain text with checkbox).
2. Implement Comments system with user timestamps and text-initials avatar badges.
3. Implement Activity Log recording status and attribute changes.

### Phase 5: Real-time Integration & Notifications
1. Setup Socket.io on server and client.
2. Broadcast task updates (`TASK_CREATED`, `TASK_MOVED`, `TASK_UPDATED`, `COMMENT_ADDED`) to project rooms.
3. In-app notification bell with live popover notifications.

### Phase 6: Polish, Testing & Deployment
1. Add Dark/Light mode theme support.
2. Form validation handling and polished empty/error states.
3. Write API integration tests using Supertest and frontend tests with Vitest.
4. Dockerize backend and frontend for production readiness.
