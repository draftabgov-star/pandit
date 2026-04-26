import { authRouter } from "./auth-router";
import { birthChartRouter } from "./birth-chart-router";
import { readingRouter } from "./reading-router";
import { adminRouter } from "./admin-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  birthChart: birthChartRouter,
  reading: readingRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
