import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./queries/connection";
import { createRouter, authedQuery, publicQuery, adminQuery } from "./middleware";
import { TRPCError } from "@trpc/server";

const QUERY_TYPES = ["general", "career", "love", "health", "future"] as const;

function buildAstrologyPrompt(
  chart: { sunSign: string; moonSign: string; ascendant: string; chartData: unknown },
  queryType: string,
  details?: string,
): string {
  const chartJson = JSON.stringify(chart.chartData, null, 2);
  const typeMap: Record<string, string> = {
    general: "a comprehensive general life reading",
    career: "career and professional guidance",
    love: "love and relationship insights",
    health: "health and wellness advice",
    future: "a future forecast and prediction",
  };

  return `You are an ancient Vedic AI astrologer with thousands of years of cosmic wisdom. The user has the following birth chart:
- Sun Sign: ${chart.sunSign}
- Moon Sign: ${chart.moonSign}
- Ascendant: ${chart.ascendant}
- Full Chart Data: ${chartJson}

The user is seeking ${typeMap[queryType] || "guidance"}.
${details ? `Additional context: ${details}` : ""}

Provide a deeply insightful, mystical yet practical reading in the voice of a wise sage. Use astrological terminology naturally. Include specific house placements when relevant. Keep the tone warm, empowering, and slightly mysterious. Write 4-6 paragraphs. Do not use markdown formatting.`;
}

async function generateAIReading(prompt: string): Promise<string> {
  try {
    const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MOONSHOT_API_KEY || "sk-test"}`,
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          {
            role: "system",
            content:
              "You are an ancient Vedic astrologer with deep cosmic wisdom. You provide birth chart readings that are mystical yet practical, warm yet profound.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "The stars are momentarily clouded. Please try again.";
  } catch (error) {
    console.error("AI generation failed:", error);
    return generateFallbackReading(prompt);
  }
}

function generateFallbackReading(prompt: string): string {
  const sunMatch = prompt.match(/Sun Sign: (\w+)/);
  const moonMatch = prompt.match(/Moon Sign: (\w+)/);
  const ascMatch = prompt.match(/Ascendant: (\w+)/);
  const typeMatch = prompt.match(/seeking ([^.]+)/);

  const sun = sunMatch?.[1] ?? "your Sun sign";
  const moon = moonMatch?.[1] ?? "your Moon sign";
  const asc = ascMatch?.[1] ?? "your Ascendant";
  const type = typeMatch?.[1] ?? "guidance";

  return `The cosmos whispers secrets through your birth chart, dear soul. With ${sun} as your Sun sign, you carry the fire of determination and creative vision. Your ${moon} Moon reveals an inner world of deep emotion and intuitive wisdom, while your ${asc} Ascendant shapes how the world first perceives your radiant energy.

In matters of ${type}, the current celestial alignment speaks of transformation. The North Node has been weaving through your tenth house of destiny, urging you toward a path that honors your authentic self. Saturn's disciplined gaze reminds you that true mastery comes through patience and persistence.

Venus dances gracefully through your relationship sector, bringing opportunities for meaningful connection. Yet Pluto's shadow work calls you to examine what must be released before new growth can flourish. Trust the process of dissolution and rebirth.

Mercury's intellectual currents favor clear communication and strategic thinking during this cycle. When confusion arises, return to your breath and the ancient wisdom written in the stars at the moment of your birth. The universe has always known your name.

Remember: astrology offers a map, but you are the traveler. The stars incline; they do not compel. Your free will remains the most powerful force in your cosmos.`;
}

export const readingRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const items = await getDb()
      .select()
      .from(schema.readings)
      .where(eq(schema.readings.userId, ctx.user.id))
      .orderBy(desc(schema.readings.createdAt));
    return items;
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const rows = await getDb()
        .select()
        .from(schema.readings)
        .where(
          and(
            eq(schema.readings.id, input.id),
            eq(schema.readings.userId, ctx.user.id),
          ),
        )
        .limit(1);
      return rows.at(0) ?? null;
    }),

  create: authedQuery
    .input(
      z.object({
        chartId: z.number(),
        queryType: z.enum(QUERY_TYPES),
        details: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      const chartRows = await getDb()
        .select()
        .from(schema.birthCharts)
        .where(
          and(
            eq(schema.birthCharts.id, input.chartId),
            eq(schema.birthCharts.userId, user.id),
          ),
        )
        .limit(1);

      if (!chartRows[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Birth chart not found" });
      }

      const isFutureQuery = input.queryType === "future";
      const isPremiumQuery = isFutureQuery;

      if (user.subscriptionType === "free") {
        if (isPremiumQuery) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Future forecasts require a Premium subscription",
          });
        }
        if (user.readingsUsed >= user.readingsLimit) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You have reached your free reading limit. Upgrade to Premium for unlimited readings.",
          });
        }
      }

      const prompt = buildAstrologyPrompt(chartRows[0], input.queryType, input.details);
      const generatedText = await generateAIReading(prompt);

      const result = await getDb().insert(schema.readings).values({
        userId: user.id,
        chartId: input.chartId,
        queryType: input.queryType,
        generatedText,
        isPremium: isPremiumQuery,
      });

      await getDb()
        .update(schema.users)
        .set({ readingsUsed: sql`${schema.users.readingsUsed} + 1` })
        .where(eq(schema.users.id, user.id));

      return { id: Number(result[0].insertId), generatedText };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await getDb()
        .delete(schema.readings)
        .where(
          and(
            eq(schema.readings.id, input.id),
            eq(schema.readings.userId, ctx.user.id),
          ),
        );
      return { success: true };
    }),

  // Admin endpoints
  adminList: adminQuery.query(async () => {
    const items = await getDb()
      .select()
      .from(schema.readings)
      .orderBy(desc(schema.readings.createdAt))
      .limit(100);
    return items;
  }),

  adminStats: adminQuery.query(async () => {
    const totalReadings = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.readings);

    const totalUsers = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.users);

    const premiumUsers = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(eq(schema.users.subscriptionType, "premium"));

    const readingsByType = await getDb()
      .select({
        queryType: schema.readings.queryType,
        count: sql<number>`count(*)`,
      })
      .from(schema.readings)
      .groupBy(schema.readings.queryType);

    return {
      totalReadings: totalReadings[0]?.count ?? 0,
      totalUsers: totalUsers[0]?.count ?? 0,
      premiumUsers: premiumUsers[0]?.count ?? 0,
      readingsByType,
    };
  }),
});
