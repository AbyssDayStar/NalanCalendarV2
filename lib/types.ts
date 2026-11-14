//规范化所有数据结构
export interface MatrixEvent {
  event_id: string;
  type: string;
  sender: string;
  content: {
    msgtype?: string;
    body?: string;
    membership?: string;
    displayname?: string;
    "m.mentions"?: {user_ids?: string[];room?: boolean;};
  };
  origin_server_ts: number;
}

export interface SyncResponse {
  next_batch: string;
  rooms?: {
    join?: Record<string, { timeline?: { events: MatrixEvent[] } }>;
  };
}

export type FilteredAction =
  | { kind: "new_user"; sender: string; displayname: string }
  | { kind: "mention"; eventId: string; sender: string; body: string };

export interface SendResult {
  roomId: string;
  eventId?: string;
  success: boolean;
  error?: string;
}