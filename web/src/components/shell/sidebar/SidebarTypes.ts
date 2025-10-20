"use client";

export type Chat = {
  id: string;
  title: string;
  projectId?: string;
  updatedAt?: number;
};

export type Project = {
  id: string;
  name: string;
};

export type CommonSidebarProps = {
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  subMenuForMove: string | null;
  setSubMenuForMove: (id: string | null) => void;
  menuRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  toast: any;
};

/* -------------------------------------------------------------------------- */
/*                               ProjectList Props                            */
/* -------------------------------------------------------------------------- */
export type ProjectListProps = CommonSidebarProps & {
  projects?: Project[];
  byProject: Record<string, Chat[]>;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  setProjectFilter: (id?: string) => void;
  currentProjectFilter: string | null | undefined;
  setProjectDlgOpen: (b: boolean) => void;
  setConfirmDeleteOpen: (b: boolean) => void;
  setProjectToDelete: (id: string | null) => void;
  /** ✅ made consistent (string | null only) */
  currentThreadId: string | null;
  editingChatId: string | null;
  chatEditValue: string;
  setEditingChatId: (id: string | null) => void;
  setChatEditValue: (v: string) => void;
  handleInlineChatRename: (id: string, value: string) => void;
  assignThreadToProject: (tid: string, pid?: string) => void;
  setCurrentThread: (id: string) => void;
  handleDeleteChat: (id: string) => void;
};

/* -------------------------------------------------------------------------- */
/*                               ProjectBlock Props                           */
/* -------------------------------------------------------------------------- */
export type ProjectBlockProps = CommonSidebarProps & {
  project: Project;
  chats: Chat[];
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  setProjectFilter: (id?: string) => void;
  currentProjectFilter: string | null | undefined;
  setConfirmDeleteOpen: (b: boolean) => void;
  setProjectToDelete: (id: string | null) => void;
  /** ✅ same type here */
  currentThreadId: string | null;
  editingChatId: string | null;
  chatEditValue: string;
  setEditingChatId: (id: string | null) => void;
  setChatEditValue: (v: string) => void;
  handleInlineChatRename: (id: string, value: string) => void;
  assignThreadToProject: (tid: string, pid?: string) => void;
  projects: Project[];
  setProjectDlgOpen: (b: boolean) => void;
  setCurrentThread: (id: string) => void;
  handleDeleteChat: (id: string) => void;
};

/* -------------------------------------------------------------------------- */
/*                                 ChatList Props                             */
/* -------------------------------------------------------------------------- */
export type ChatListProps = CommonSidebarProps & {
  unassigned: Chat[];
  currentThreadId: string | null;
  setCurrentThread: (id: string) => void;
  editingChatId: string | null;
  setEditingChatId: (id: string | null) => void;
  chatEditValue: string;
  setChatEditValue: (v: string) => void;
  handleInlineChatRename: (id: string, value: string) => void;
  assignThreadToProject: (tid: string, pid?: string) => void;
  projects: Project[];
  setProjectDlgOpen: (b: boolean) => void;
  handleDeleteChat: (id: string) => void;
};

/* -------------------------------------------------------------------------- */
/*                                ChatRow Props                               */
/* -------------------------------------------------------------------------- */
export type ChatRowProps = CommonSidebarProps & {
  t: Chat;
  i: number;
  currentThreadId: string | null;
  editingChatId: string | null;
  chatEditValue: string;
  setEditingChatId: (id: string | null) => void;
  setChatEditValue: (v: string) => void;
  handleInlineChatRename: (id: string, value: string) => void;
  assignThreadToProject: (tid: string, pid?: string) => void;
  setCurrentThread: (id: string) => void;
  setProjectDlgOpen: (b: boolean) => void;
  projects: Project[];
  handleDeleteChat: (id: string) => void;
  isInProject?: boolean;
  isLastInProject?: boolean;
};
