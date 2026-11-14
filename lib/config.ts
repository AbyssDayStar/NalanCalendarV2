//从环境变量中获取所需配置
function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const config = {
  matrixBaseUrl: required("MATRIX_BASE_URL"),
  matrixAccessToken: required("MATRIX_ACCESS_TOKEN"),
  matrixUserId: required("MATRIX_USER_ID"),
  matrixRoomId: required("MATRIX_ROOM_ID"),
  blobsStoreName: "matrix-bot-cursor",
  cursorKey: "last-sync-token",
};