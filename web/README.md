# 🎨 Iris Arc Frontend — Next.js Application

This is the **frontend application** for Iris Arc, built with **Next.js 15**, **React 19**, and **TypeScript**. It provides a modern, responsive UI for AI-powered cybersecurity incident response and threat intelligence analysis.

---

## 📋 Overview

The frontend delivers:

- **Modern Chat Interface** — Real-time AI conversations with streaming responses
- **Project Management UI** — Visual organization of security investigations
- **Authentication Flow** — Secure login/register with JWT token management
- **Theme Support** — Dark, light, and system theme preferences
- **Responsive Design** — Mobile-first approach with desktop optimizations
- **File Management** — Drag-and-drop uploads with preview capabilities
- **Code Rendering** — Syntax-highlighted code blocks in chat responses
- **Smooth Animations** — Framer Motion for enhanced user experience

---

## 🏗️ Architecture

```
web/
├── src/
│   ├── app/                       # Next.js 15 App Router
│   │   ├── (auth)/                # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Home/chat page
│   ├── components/                # React components
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── chat/                  # Chat-specific components
│   │   ├── sidebar/               # Sidebar components
│   │   └── providers/             # Context providers
│   ├── lib/                       # Utility functions
│   │   ├── api.ts                 # API client
│   │   ├── utils.ts               # Helper functions
│   │   └── store.ts               # Zustand store
│   ├── types/                     # TypeScript type definitions
│   │   ├── api.ts                 # API response types
│   │   └── chat.ts                # Chat-related types
│   └── pages/                     # Additional pages
├── public/                        # Static assets
│   ├── favicon.ico
│   └── images/
├── .env.local                     # Environment variables (DO NOT commit)
├── .env.example                   # Example environment variables
├── package.json                   # Node dependencies
├── next.config.ts                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── postcss.config.mjs             # PostCSS configuration
└── components.json                # shadcn/ui configuration
```

---

## ⚙️ Tech Stack

### Core Framework

- **Next.js 15.5.4** — React framework with App Router
- **React 19.1.0** — UI library with latest features
- **TypeScript 5** — Type-safe JavaScript

### Styling & UI

- **Tailwind CSS 4** — Utility-first CSS framework
- **shadcn/ui** — High-quality UI components built on Radix UI
- **Radix UI** — Accessible component primitives
  - Dialog, Dropdown Menu, Tooltip, Switch, etc.
- **Framer Motion 12** — Animation library
- **lucide-react** — Icon library
- **class-variance-authority** — Component variant management
- **tailwind-merge** — Merge Tailwind classes intelligently

### State & Data Management

- **Zustand 5** — Lightweight state management
- **React Context** — For theme and auth providers
- **next-themes** — Theme management (dark/light/system)

### Content Rendering

- **react-markdown 10** — Markdown to React component
- **remark-gfm** — GitHub Flavored Markdown support
- **rehype-highlight** — Code syntax highlighting
- **rehype-raw** — Raw HTML support in markdown
- **highlight.js** — Syntax highlighting engine

### Additional Features

- **@hello-pangea/dnd** — Drag and drop for file management
- **react-resizable-panels** — Resizable panel layouts
- **sonner** — Toast notifications
- **next-auth** — Authentication (if used)

### Development Tools

- **ESLint 9** — Code linting
- **TypeScript** — Type checking
- **pnpm** — Fast, disk space efficient package manager

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm/yarn
- Backend server running at http://localhost:8000

### Installation

1. **Navigate to web directory**

```bash
cd web
```

2. **Install dependencies**

```bash
pnpm install
# or
npm install
```

3. **Set up environment variables**

Create a `.env.local` file:

```bash
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000
```

4. **Run the development server**

```bash
pnpm dev
# or
npm run dev
```

The application will start at:
- **Web App:** http://localhost:3000

---

## 📜 Available Scripts

| Command              | Description                                    |
| -------------------- | ---------------------------------------------- |
| `pnpm dev`           | Start development server (http://localhost:3000) |
| `pnpm build`         | Build production bundle                        |
| `pnpm start`         | Run production server                          |
| `pnpm lint`          | Run ESLint linter                              |
| `pnpm type-check`    | Run TypeScript type checking                   |

---

## 🎨 Component Structure

### Key Components

#### Chat Components

- **ChatInterface** — Main chat container
- **MessageList** — Displays conversation messages
- **MessageBubble** — Individual message component with markdown rendering
- **ChatComposer** — Message input with file upload
- **StreamingMessage** — Handles real-time AI response streaming

#### Sidebar Components

- **Sidebar** — Main navigation and project list
- **ProjectList** — Lists user's projects
- **ConversationList** — Lists conversations within a project
- **SidebarHeader** — User profile and settings

#### UI Components (shadcn/ui)

- **Button** — Customizable button component
- **Dialog** — Modal dialogs
- **DropdownMenu** — Context menus
- **Tooltip** — Hover tooltips
- **Switch** — Toggle switches
- **Separator** — Visual dividers

---

## 🔐 Authentication

### Authentication Flow

1. **User visits protected route** → Redirected to `/login`
2. **User logs in** → Credentials sent to backend
3. **Backend validates** → Returns JWT tokens
4. **Frontend stores tokens** → In memory or secure storage
5. **Subsequent requests** → Include token in Authorization header
6. **Token refresh** → Automatic refresh on expiration

### Protected Routes

The middleware checks authentication for all routes except:
- `/login`
- `/register`
- `/public/*`

### Token Management

Tokens are managed via the API client in `src/lib/api.ts`:

```typescript
// Example API call with authentication
const response = await api.get('/api/chats', {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
});
```

---

## 🎨 Theming

### Theme System

The app supports three theme modes:
- **Light** — Light color scheme
- **Dark** — Dark color scheme
- **System** — Follows OS preference

### Changing Themes

```typescript
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

### Custom Colors

Tailwind configuration in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      border: "hsl(var(--border))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      // ... more colors
    }
  }
}
```

---

## 📡 API Integration

### API Client (`src/lib/api.ts`)

Centralized API communication:

```typescript
import { api } from '@/lib/api';

// Fetch projects
const projects = await api.get('/api/projects');

// Create conversation
const conversation = await api.post('/api/chats', {
  title: 'New Investigation',
  project_id: 1
});

// Stream chat response
const stream = await api.streamChat({
  message: 'Analyze this incident',
  conversation_id: 1
});
```

### Streaming Support

Real-time AI responses using Server-Sent Events:

```typescript
async function streamChat(message: string) {
  const response = await fetch(`${API_URL}/api/stream/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message })
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    // Update UI with chunk
  }
}
```

---

## 🗂️ State Management

### Zustand Store

Global state management for:
- User authentication state
- Active project
- Conversations list
- UI preferences

Example store setup:

```typescript
import { create } from 'zustand';

interface AppState {
  user: User | null;
  activeProject: Project | null;
  setUser: (user: User) => void;
  setActiveProject: (project: Project) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  activeProject: null,
  setUser: (user) => set({ user }),
  setActiveProject: (project) => set({ activeProject: project }),
}));
```

---

## 🎯 Features

### 1. Real-time Chat

- Streaming AI responses with typing indicators
- Message history with infinite scroll
- Code blocks with syntax highlighting
- Markdown rendering (bold, italic, lists, etc.)
- Message roles (user, assistant, system)

### 2. File Management

- Drag-and-drop file uploads
- Multiple file selection
- File preview before sending
- Attachment display in messages
- Download attached files

### 3. Project Organization

- Create and manage projects
- Associate conversations with projects
- Project-based filtering
- Quick project switching

### 4. Responsive Design

- Mobile-first approach
- Collapsible sidebar on mobile
- Touch-friendly interactions
- Adaptive layouts for all screen sizes

### 5. Keyboard Shortcuts

- `Cmd/Ctrl + K` — Quick search
- `Cmd/Ctrl + /` — Toggle sidebar
- `Enter` — Send message
- `Shift + Enter` — New line in message

---

## 🧪 Testing

### Type Checking

```bash
pnpm type-check
```

### Linting

```bash
pnpm lint
```

### Building for Production

```bash
pnpm build
```

This will:
1. Type check the codebase
2. Lint all files
3. Build optimized production bundle
4. Generate static assets

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**

2. **Set environment variables in Vercel dashboard:**
   - `NEXT_PUBLIC_BACKEND_BASE_URL` — Your backend API URL

3. **Deploy:**

```bash
vercel --prod
```

### Self-Hosted (Node.js)

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

The app will run on port 3000 by default.

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t iris-arc-frontend .
docker run -p 3000:3000 --env-file .env.local iris-arc-frontend
```

---

## 🛠️ Development

### Adding New Components

Use shadcn/ui CLI to add components:

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

### Creating Custom Components

```tsx
// src/components/MyComponent.tsx
import { FC } from 'react';

interface MyComponentProps {
  title: string;
}

export const MyComponent: FC<MyComponentProps> = ({ title }) => {
  return (
    <div className="p-4 bg-background">
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  );
};
```

### Styling Best Practices

1. Use Tailwind utility classes
2. Extract repeated patterns to components
3. Use CSS variables for theme colors
4. Follow mobile-first responsive design
5. Use `cn()` utility to merge classes

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)} />
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** `Module not found` error
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
```

**Issue:** Environment variables not working
```bash
# Make sure variables start with NEXT_PUBLIC_ for client-side access
# Restart dev server after changing .env.local
```

**Issue:** Tailwind styles not applying
```bash
# Check tailwind.config.ts content paths
# Ensure globals.css is imported in layout.tsx
```

**Issue:** API connection errors
```bash
# Verify NEXT_PUBLIC_BACKEND_BASE_URL is correct
# Check that backend server is running
# Check browser console for CORS errors
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)

---

## 🤝 Contributing

Contributions are welcome! Please ensure:

1. Code follows TypeScript best practices
2. Components are properly typed
3. Styles use Tailwind CSS utilities
4. New features include appropriate error handling
5. Changes maintain responsive design

---

## 📄 License

This project is currently unlicensed. License will be added in future releases.

---

**For the complete project documentation, see the main [README.md](../README.md) in the root directory.**
