//使用URL拉取和发送
import { config } from "../config.js";
import type { SyncResponse } from "../types.js";

const headers = {
  Authorization: `Bearer ${config.matrixAccessToken}`,
  "Content-Type": "application/json",
};

/** 拉取增量事件。since 为空时做首次同步 */
export async function syncMatrix(since?: string): Promise<SyncResponse> {
  const url = new URL(`${config.matrixBaseUrl}/_matrix/client/v3/sync`);
  url.searchParams.set("timeout", "0"); // 定时函数中不要长轮询
  if (since) url.searchParams.set("since", since);

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`sync failed: ${res.status}`);
  return res.json();
}

/** 向指定 room 发送纯文本消息 */
export async function sendMessage(
  roomId: string,
  body: string,
  txnId: string,
): Promise<{ event_id: string }> {
  const url = `${config.matrixBaseUrl}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/send/m.room.message/${txnId}`;
  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify({ msgtype: "m.text", body }),
  });
  if (!res.ok) throw new Error(`send failed: ${res.status}`);
  return res.json();
}