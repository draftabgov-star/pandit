import { z } from "zod";
import { eq, sql, desc } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./queries/connection";
import { createRouter, adminQuery } from "./middleware";

export const adminRouter = createRouter({
  users: adminQuery
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(["user", "admin", "all"]).default("all"),
        subscription: z.enum(["free", "premium", "all"]).default("all"),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional(),
    )
    .query(async ({ input }) => {
      const params = input ?? {};
      let query = getDb().select().from(schema.users).orderBy(desc(schema.users.createdAt));

      const conditions = [];
      if (params.role && params.role !== "all") {
        conditions.push(eq(schema.users.role, params.role));
      }
      if (params.subscription && params.subscription !== "all") {
        conditions.push(eq(schema.users.subscriptionType, params.subscription));
      }
      if (params.search) {
        conditions.push(sql`LOWER(${schema.users.name}) LIKE LOWER(${'%' + params.search + '%'})`);
      }

      if (conditions.length > 0) {
        query = query.where(sql.join(conditions, sql` AND `));
      }

      const users = await query.limit(params.limit ?? 50).offset(params.offset ?? 0);
      return users;
    }),

  userStats: adminQuery.query(async () => {
    const totalUsers = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.users);

    const premiumUsers = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(eq(schema.users.subscriptionType, "premium"));

    const adminUsers = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(eq(schema.users.role, "admin"));

    const newThisWeek = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(sql`${schema.users.createdAt} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);

    return {
      totalUsers: totalUsers[0]?.count ?? 0,
      premiumUsers: premiumUsers[0]?.count ?? 0,
      adminUsers: adminUsers[0]?.count ?? 0,
      newThisWeek: newThisWeek[0]?.count ?? 0,
    };
  }),

  updateUserRole: adminQuery
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.users)
        .set({ role: input.role })
        .where(eq(schema.users.id, input.userId));
      return { success: true };
    }),

  updateUserSubscription: adminQuery
    .input(
      z.object({
        userId: z.number(),
        subscriptionType: z.enum(["free", "premium"]),
      }),
    )
    .mutation(async ({ input }) => {
      const limit = input.subscriptionType === "premium" ? 999999 : 3;
      await getDb()
        .update(schema.users)
        .set({
          subscriptionType: input.subscriptionType,
          readingsLimit: limit,
        })
        .where(eq(schema.users.id, input.userId));
      return { success: true };
    }),
});
