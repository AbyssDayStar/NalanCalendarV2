//分析和格式化，运行主函数
import { config } from "./config.js";
import { syncMatrix, sendMessage } from "./matrix/api.js";
import { extractEvents, toActions } from "./logic/filter.js";
import { readCursor, writeCursor } from "./blobs/cursor.js";
import type { SendResult, FilteredAction } from "./types.js";

function txnId(): string {
  return `bot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function respondNewUser(
  action: Extract<FilteredAction, { kind: "new_user" }>,
  roomId: string,
): Promise<SendResult> {
  try {
    let body: string;
      body = `欢迎 ${action.displayname}！`;
    const { event_id } = await sendMessage(roomId, body, txnId());
    return { roomId, eventId: event_id, success: true };
  } catch (e) {
    return {
      roomId,
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function respondMentions(
  action: Extract<FilteredAction, { kind: "mention" }>,
  roomId: string,
): Promise<SendResult> {
  try {
    let body: string;
      if (action.body.includes("更新日志"))
      {
          body = `V2 DEV1 正在制作中……`;      
          const { event_id } = await sendMessage(roomId, body, txnId());
          return { roomId, eventId: event_id, success: true };
      }
      return { roomId, eventId: "", success: true };
  } catch (e) {
    return {
      roomId,
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/** 核心流程：拉取 → 过滤 → 顺序响应 → 持久化游标 */
export async function runOnce(): Promise<{
  totalEvents: number;
  actions: number;
  results: SendResult[];
}> {
  const since = await readCursor();
  const sync = await syncMatrix(since);
  const events = extractEvents(sync, config.matrixRoomId);
  const actions = toActions(events, config.matrixUserId);

  const results: SendResult[] = [];
  for (const action of actions) {
    // 顺序处理：等一条发送完成再发下一条
    let result: SendResult;
    
    if (action.kind === "new_user") {
      result = await respondNewUser(action, config.matrixRoomId);
    } else {
      result = await respondMentions(action, config.matrixRoomId);
    }
    
    results.push(result);
  }

  // 游标全部处理完后才更新
  await writeCursor(sync.next_batch);

  return { totalEvents: events.length, actions: actions.length, results };
}