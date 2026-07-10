# KanBan Task Manager — Frontend

A full-featured Kanban task management frontend built with **React 19**, **TypeScript**, **Vite**, and **Apollo Client**. Features drag-and-drop boards, paginated task lists, role-based permissions, and a consistent shadcn/ui design system.

---

## ✨ Features

- **Authentication** — Login, registration, and session restoration via JWT stored in `localStorage`
- **Protected Routes** — Role-aware routing with `ProtectedRoute` guard and `RoleHomeRedirect` redirection
- **Kanban Board** — Drag-and-drop task cards across status columns powered by `@dnd-kit`
- **List View** — Server-side paginated task table with search and priority filters
- **Task CRUD** — Create, edit, archive, delete, assign, and move tasks
- **Comments** — Add, edit, and delete task comments in real time
- **Board Management** — Create, rename, archive, and delete boards; manage board members and roles
- **User Management** — Admin/manager user table with role assignment
- **Responsive Layout** — Mobile-friendly navbar and page layouts
- **shadcn/ui Design System** — Consistent primitives: `Button`, `Table`, `Dialog`, `Input`, `Badge`, `Pagination`, `ConfirmationDialog`, `PageHeader`, `StatePanel`
- **Dark Mode Ready** — Semantic CSS variables supporting light and dark themes

---

## 🛠️ Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | React | ^19.2.7 |
| Language | TypeScript | ~6.0.2 |
| Build Tool | Vite | ^8.1.1 |
| Routing | React Router DOM | ^7.18.1 |
| Data Fetching | Apollo Client | ^4.2.5 |
| Schema | GraphQL | ^16.14.2 |
| Codegen | @graphql-codegen/cli | ^7.1.3 |
| Styling | Tailwind CSS | ^4.3.2 |
| UI Primitives | shadcn/ui (Radix UI + CVA) | — |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable | ^6 / ^10 |
| Icons | lucide-react | ^1.23.0 |
| Forms | react-hook-form + zod | ^7 / ^4 |
| Notifications | sonner | ^2.0.7 |
| Date Utilities | date-fns | ^4.4.0 |
| Font | Geist Variable (@fontsource-variable) | ^5.2.9 |

---

## 🗂️ Project Structure

```
src/
├── apollo/              # Apollo Client configuration
│   └── client.ts
├── components/
│   ├── board/           # Board-specific components
│   │   ├── BoardKanbanView.tsx    # DnD Kanban columns view
│   │   ├── BoardListView.tsx      # Paginated list view
│   │   ├── BoardHeader.tsx
│   │   ├── BoardSelector.tsx
│   │   ├── BoardMembersModal.tsx
│   │   ├── BoardActionModals.tsx
│   │   └── TaskDetailsModal.tsx
│   ├── common/          # Shared utility components
│   │   ├── Button.tsx             # Adapter around shadcn Button
│   │   └── StatePanel.tsx         # Unified loading/error/empty state
│   ├── layout/          # App layout
│   │   └── Navbar.tsx
│   ├── task/            # Task components
│   │   ├── KanbanColumn.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   └── TaskFilterBar.tsx
│   └── ui/              # shadcn/ui primitives
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── ConfirmationDialog.tsx
│       ├── Dialog.tsx
│       ├── Input.tsx
│       ├── PageHeader.tsx
│       ├── Pagination.tsx
│       ├── Table.tsx
│       ├── button.tsx
│       └── utils.ts
├── context/
│   └── AuthProvider.tsx # Auth state, login/register/logout/session restore
├── gql/
│   └── graphql.ts       # Auto-generated GraphQL types & documents
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useBoard.ts
│   ├── useBoardOperations.ts
│   ├── useBoardPermissions.ts
│   ├── useComments.ts
│   └── useTaskOperations.ts
├── pages/
│   ├── auth/            # Login, Register, Profile
│   ├── boards/          # Board.tsx — state orchestrator for kanban/list views
│   ├── dashboard/       # Dashboard with board + task statistics
│   ├── manager/         # Manager-specific page
│   ├── profile/         # User profile page
│   └── users/           # Admin user management table
├── routes/
│   └── AppRoutes.tsx    # Route definitions and protected routing
├── test/                # Centralized unit and component tests (Vitest + JSDOM)
│   ├── setup.ts             # JSDOM global setup and imports
│   ├── ProtectedRoute.test.tsx
│   ├── TaskForm.test.tsx
│   ├── tokenRefreshLink.test.ts
│   ├── useBoardPermissions.test.ts
│   ├── formatDate.test.ts
│   ├── taskConstants.test.ts
│   └── utils.test.ts
├── types/
│   └── task.ts          # Shared Task and TaskStatus types
├── index.css            # Tailwind v4 + shadcn/ui semantic CSS variables
└── main.tsx             # App entry point
```

---

## 🏗️ Architecture

```
main.tsx
  └── ApolloProvider
        └── AuthProvider (session restore via Me query)
              └── App → AppRoutes
                    ├── Unauthenticated Routes → Login / Register
                    └── ProtectedRoute (Role checking) → Dashboard / Board / Tasks / Users / Profile / Me
```

**State Management** — All server state is managed through Apollo Client (reactive variables + cache). Local UI state lives in component `useState`.

**Board Page Pattern** — `Board.tsx` is a pure state orchestrator. All rendering is delegated:
- `BoardKanbanView` → DnD drag-and-drop Kanban columns
- `BoardListView` → Server-paginated table list

**Permissions** — `useBoardPermissions` derives `canEditTasks`, `canManageBoard`, `isBoardOwner`, and `userBoardRole` from the current user and board data.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A running GraphQL backend (defaults to `http://localhost:4000/graphql`)

### Install

```bash
npm install
```

### Environment

Create a `.env` file in the project root:

```env
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

### Generate GraphQL Types

```bash
npm run codegen
```

Requires `codegen.ts` configured against your running backend schema.

### Lint

```bash
npm run lint
```

---

## 🔐 Authentication

- Tokens are stored in `localStorage`
- `AuthProvider` runs a `Me` query on app load to restore the session
- Protected pages skip their data queries until auth is confirmed
- Roles: `ADMIN`, `MANAGER`, `USER` — controls board creation, task editing, and user management access

---

## 🎨 Theming

Styling uses **Tailwind CSS v4** with semantic CSS custom properties defined in `src/index.css`:

```css
:root {
  --color-primary: ...;
  --color-background: ...;
  --color-foreground: ...;
  /* shadcn/ui semantic tokens */
}
```

Dark mode is supported via the `.dark` class toggle. All components consume semantic tokens rather than hardcoded colors.

---

## 📦 Key Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check → Vite production bundle |
| `npm run test` | Run all unit and component tests with Vitest |
| `npm run preview` | Preview production build locally |
| `npm run codegen` | Regenerate GraphQL types from schema |
| `npm run lint` | Run ESLint across the project |

---

## 🔌 Required Backend Schema

The frontend expects these GraphQL operations:

```graphql
query Me
query Boards
query Board($id: ID!)
query Tasks(page, limit, search, priority, boardId)
query GetUsers
query Dashboard

mutation Login / Register
mutation CreateBoard / UpdateBoard / DeleteBoard / ArchiveBoard
mutation AddBoardMember / RemoveBoardMember / UpdateBoardMemberRole
mutation CreateTask / UpdateTask / DeleteTask / ArchiveTask
mutation UpdateTaskStatus / AssignTask
mutation AddComment / UpdateComment / DeleteComment
mutation UpdateUser / DeleteUser
```
