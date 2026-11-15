//过滤有用内容
import type { MatrixEvent, FilteredAction } from "../types.js";

/** 从 join 房间中提取所有时间线事件 */
export function extractEvents(
  sync: { rooms?: { join?: Record<string, { timeline?: { events: MatrixEvent[] } }> } },
  roomId: string,
): MatrixEvent[] {
  return sync.rooms?.join?.[roomId]?.timeline?.events ?? [];
}

/** 判断一条事件是否代表“新用户加入” */
export function isNewUserJoin(event: MatrixEvent): boolean {
  return event.type === "m.room.member" && event.content.membership === "join";
}

/** 判断一条事件是否 @ 了当前机器人账号 */
export function isMention(event: MatrixEvent, botUserId: string): boolean {
  if (event.type !== "m.room.message") return false;
  //const body = event.content.body ?? "";

  //return body.includes(botUserId); // 使用是否包含完整名称判断，虽然我想不会有人提及它的标准名，但保险起见用m.mentions
  return event.content?.["m.mentions"]?.user_ids?.includes(botUserId) ?? false;
}

/** 将事件转换为标准化动作（纯函数，无副作用） */
export function toActions(
  events: MatrixEvent[],
  botUserId: string,
): FilteredAction[] {
  return events.flatMap<FilteredAction>((e) => {
    if (isNewUserJoin(e)) {
      console.log("分析到一个加入事件");
      return [{
        kind: "new_user",
        sender: e.sender,
        displayname: e.content.displayname ?? e.sender,
      }];
    }
    if (isMention(e, botUserId)) {
      console.log("分析到一个@事件");
      return [{
        kind: "mention",
        eventId: e.event_id,
        sender: e.sender,
        body: e.content.body ?? "",
      }];
    }
    return [];
  });
}