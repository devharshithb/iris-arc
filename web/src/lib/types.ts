// src/lib/types.ts
export type AgentRole = "attacker" | "defender" | "decider" | "assistant" | "user" | "system" | string;

export type Attachment = {
  id: string;
  name: string;
  mime: string;
  size: number;
  previewUrl?: string;
};

export type MessagePart =
  | { kind: "text"; text: string }
  | { kind: "code"; lang?: string; code: string }
  | { kind: "attachment"; attachmentId: string };

export type Message = {
  id: string;
  threadId: string;
  role: "user" | "assistant" | "system" | "tool";
  parts: MessagePart[];
  createdAt: number;
  meta?: Record<string, unknown>;
};

export type Thread = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  agentMode: "single" | "multi";
  model?: string;
  temperature?: number;
  participants?: AgentRole[];
};
