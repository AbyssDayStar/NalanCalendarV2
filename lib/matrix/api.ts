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
  url.searchParams.set("timeout", "0");
  if (since) url.searchParams.set("since", since);

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      // HTTP 错误（4xx/5xx），res 有值，可以读取 status
      throw new Error(`sync failed with HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return data as SyncResponse;
  } catch (e) {
    // 网络层错误（DNS/TLS/连接拒绝/超时）或上面抛出的 HTTP 错误
    if (e instanceof Error) {
      // 关键：Node.js 把真实的网络错误放在 cause 里
      const cause = e.cause as (Error & { code?: string }) | undefined;
      const causeInfo = cause
          ? `${cause.code || cause.name}: ${cause.message}`
          : "no cause available";
      console.error(`[syncMatrix] fetch failed: ${e.message} | cause: ${causeInfo}`);
    } else {
      console.error("[syncMatrix] non-Error thrown:", e);
    }
    throw e; // 向上抛出，让 Netlify 日志记录 Invoke Error
  }
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
  const data = await res.json();
  return data as { event_id: string };
}