import { z } from "zod";
import { eq, and } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./queries/connection";
import { createRouter, authedQuery } from "./middleware";

const ZOD_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const ZOD_PLANETS = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
] as const;

function getSunSign(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

function getMoonSign(dateStr: string, timeStr: string): string {
  const d = new Date(`${dateStr}T${timeStr}`);
  const hours = d.getHours();
  const sunIndex = ZOD_SIGNS.indexOf(getSunSign(dateStr));
  const offset = ((hours + 12) % 24) / 2;
  return ZOD_SIGNS[(sunIndex + Math.floor(offset)) % 12];
}

function getAscendant(dateStr: string, timeStr: string): string {
  const d = new Date(`${dateStr}T${timeStr}`);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const index = Math.floor((totalMinutes / 120) % 12);
  return ZOD_SIGNS[index];
}

function generateChartData(dateStr: string, timeStr: string) {
  const ascendantIndex = ZOD_SIGNS.indexOf(getAscendant(dateStr, timeStr));
  const houses: Record<string, { sign: string; planets: string[] }> = {};

  for (let i = 0; i < 12; i++) {
    const houseNum = i + 1;
    const signIndex = (ascendantIndex + i) % 12;
    const sign = ZOD_SIGNS[signIndex];
    const planets: string[] = [];

    if (i === 0) planets.push("Sun");
    if (i === 1 && Math.random() > 0.3) planets.push("Mercury");
    if (i === 2 && Math.random() > 0.4) planets.push("Venus");
    if (i === 3 && Math.random() > 0.5) planets.push("Mars");
    if (i === 4 && Math.random() > 0.6) planets.push("Jupiter");
    if (i === 5 && Math.random() > 0.7) planets.push("Saturn");
    if (i === 6 && Math.random() > 0.8) planets.push("Uranus");
    if (i === 7 && Math.random() > 0.8) planets.push("Neptune");
    if (i === 8 && Math.random() > 0.9) planets.push("Pluto");
    if (i === 9 && Math.random() > 0.9) planets.push("Moon");

    houses[`house_${houseNum}`] = { sign, planets };
  }

  return houses;
}

export const birthChartRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const charts = await getDb()
      .select()
      .from(schema.birthCharts)
      .where(eq(schema.birthCharts.userId, ctx.user.id));
    return charts;
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const rows = await getDb()
        .select()
        .from(schema.birthCharts)
        .where(
          and(
            eq(schema.birthCharts.id, input.id),
            eq(schema.birthCharts.userId, ctx.user.id),
          ),
        )
        .limit(1);
      return rows.at(0) ?? null;
    }),

  create: authedQuery
    .input(
      z.object({
        chartName: z.string().min(1).max(255),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        time: z.string().regex(/^\d{2}:\d{2}$/),
        location: z.string().min(1).max(255),
        latitude: z.string(),
        longitude: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sunSign = getSunSign(input.date);
      const moonSign = getMoonSign(input.date, input.time);
      const ascendant = getAscendant(input.date, input.time);
      const chartData = generateChartData(input.date, input.time);

      const result = await getDb().insert(schema.birthCharts).values({
        userId: ctx.user.id,
        chartName: input.chartName,
        date: input.date,
        time: input.time,
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
        sunSign,
        moonSign,
        ascendant,
        chartData,
      });

      return { id: Number(result[0].insertId), sunSign, moonSign, ascendant };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        chartName: z.string().min(1).max(255).optional(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        location: z.string().min(1).max(255).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const setData: Record<string, unknown> = { ...updates };

      if (updates.date || updates.time) {
        const chart = await getDb()
          .select()
          .from(schema.birthCharts)
          .where(
            and(
              eq(schema.birthCharts.id, id),
              eq(schema.birthCharts.userId, ctx.user.id),
            ),
          )
          .limit(1);

        if (!chart[0]) throw new Error("Chart not found");

        const date = updates.date ?? chart[0].date;
        const time = updates.time ?? chart[0].time;
        setData.sunSign = getSunSign(date);
        setData.moonSign = getMoonSign(date, time);
        setData.ascendant = getAscendant(date, time);
        setData.chartData = generateChartData(date, time);
      }

      await getDb()
        .update(schema.birthCharts)
        .set(setData)
        .where(
          and(
            eq(schema.birthCharts.id, id),
            eq(schema.birthCharts.userId, ctx.user.id),
          ),
        );

      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await getDb()
        .delete(schema.birthCharts)
        .where(
          and(
            eq(schema.birthCharts.id, input.id),
            eq(schema.birthCharts.userId, ctx.user.id),
          ),
        );
      return { success: true };
    }),
});
