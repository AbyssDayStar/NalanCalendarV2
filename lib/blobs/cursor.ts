//持久化标识
import { getStore } from "@netlify/blobs";
import { config } from "../config.js";

const store = getStore(config.blobsStoreName);

export async function readCursor(): Promise<string | undefined> {
  const raw = await store.get(config.cursorKey);
  console.log(raw);
  return raw ?? undefined;
}

export async function writeCursor(token: string): Promise<void> {
  await store.set(config.cursorKey, token);
}