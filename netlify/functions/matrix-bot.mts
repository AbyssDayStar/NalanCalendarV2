import type {Config, Context} from "@netlify/functions"
import { runOnce } from "../../lib/orchestrator.js";
import type {SendResult} from "../../lib/types.js";

export const config: Config = {
    schedule : "* * * * *",
};
export default async (req: Request, context: Context) => {
    const results:{ totalEvents: number; actions: number; results: SendResult[] }=await runOnce();
    console.log(results);
    return new Response(null, { status: 202 });
};

