import type { Config } from "@netlify/functions";

export const config: Config = {
    schedule: "* * * * *",
};

async function sendMatrixMessage({ homeserver, roomId, accessToken, text }) {
    const txnId = crypto.randomUUID(); // 生成唯一事务 ID
    const url = `${homeserver}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/send/m.room.message/${txnId}`;

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            msgtype: "m.text",
            body: text,
        }),
    });

    if (!response.ok) {
        throw new Error(`发送消息失败: ${response.status}`);
    }
}

export default async () =>
{
    const homeserver = process.env.HOMESERVER;
    const roomId = process.env.ROOT_ID;
    const acToken = process.env.AC_TOKEN;
    if (!homeserver || !roomId || !acToken){throw new Error("缺失相关配置，请检查环境变量")}

    const apiPath = `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/messages`;
    const url = new URL(apiPath,homeserver);

    url.searchParams.append("dir", "b");
    url.searchParams.append("limit", "20");

    const response = await fetch(url.toString(),{
        headers: {
            "Authorization": `Bearer ${acToken}`,
            "Content-Type": "application/json",
        }
    });

    if (!response.ok){
        throw new Error(`Matrix error: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    const messages = data.chunk || [];
    for (const event of sortedMessages) {
        // 1. 过滤：用户加入事件
        if (
            event.type === "m.room.member" &&
            event.content?.membership === "join"
        ) {
            const joinedUser = event.state_key;
            const text =   `欢迎${joinedUser}`;

            await sendMatrixMessage({homeserver,roomId,acToken,text});
            // 在这里写你的处理逻辑
        }

        // 2. 过滤：被 @ 事件
        if (event.type === "m.room.message") {
            let isMentioned = false;

            // 方式 A：检查新版标准 mentions 字段
            if (event.content?.["m.mentions"]?.user_ids?.includes(myUserId)) {
                isMentioned = true;
            }

            // 方式 B：检查文本中是否直接包含你的 ID（兜底）
            if (event.content?.body?.includes(myUserId)) {
                isMentioned = true;
            }

            if (isMentioned) {
                const sender = event.sender;
                const text = event.content?.body;
                if (text="更新日志"){
                    const text = `dev1.4RC1 换后端为netlify,使用functions进行消息回复`;
                    await sendMatrixMessage({homeserver,roomId,acToken,text});
                }
            }

                // 在这里写你的处理逻辑
            }
        }
}