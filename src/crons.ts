import getBot from "./telegram/bot";
import { composedFetch } from "./lib/database/mongo";
import { formatPoems } from "./utils/format-poems";
import { shuffleArray } from "./utils/shuffle-arr";
import { Env, MongoResponse, SessionData_v1 } from "./main";
import { D1Adapter, KvAdapter } from "@grammyjs/storage-cloudflare";
import { Enhance, enhanceStorage } from "grammy";
import { addNewPoems, reorganizeSections } from "./telegram/migrations";

export async function dispatchTelegram(
  e: ScheduledController,
  env: Env,
  c: ExecutionContext,
) {
  switch (e.cron) {
    case "0 * * * *":
      const bot = await getBot(env);
      const currentHour = new Date(e.scheduledTime).getUTCHours();
      const subscribersAtThisHour = await new KvAdapter(env.KV_LEZAMA).read(
        `cron-${currentHour}`,
      ) as Record<string, any>;
      const enhancedSessions = enhanceStorage({
        storage: await D1Adapter.create<Enhance<SessionData_v1>>(
          env.D1_LEZAMA,
          "sessions",
        ),
        migrations: {
          1: reorganizeSections,
          2: addNewPoems,
        },
      });

      for (const user in subscribersAtThisHour) {
        try {
          const userSession = await enhancedSessions.read(user);
          if (
            !userSession ||
            !userSession.subscribed
          ) {
            continue;
          }
          let poemID = userSession.poems.queue.shift();
          if (!poemID) {
            userSession.poems.queue = shuffleArray(
              userSession.poems.all.slice(),
            );
            poemID = userSession.poems.queue.shift();
            userSession.poems.visited = [];
          }
          const poem = await composedFetch(env, "poems", "findOne", {
            filter: {
              "_id": poemID,
            },
          }) as MongoResponse;
          await bot.api.sendMessage(user, formatPoems(poem.document));

          userSession.poems.visited.push(poemID!);
          await enhancedSessions.write(user, userSession);
        } catch (err) {
          console.trace(err);
        }
      }
  }
}
