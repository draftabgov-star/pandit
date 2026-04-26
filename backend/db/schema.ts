import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  json,
  date,
  time,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  subscriptionType: mysqlEnum("subscription_type", ["free", "premium"]).default("free").notNull(),
  readingsUsed: int("readings_used").default(0).notNull(),
  readingsLimit: int("readings_limit").default(3).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export const birthCharts = mysqlTable("birth_charts", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  chartName: varchar("chart_name", { length: 255 }).default("My Chart").notNull(),
  date: date("date").notNull(),
  time: time("time").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  latitude: varchar("latitude", { length: 50 }).notNull(),
  longitude: varchar("longitude", { length: 50 }).notNull(),
  sunSign: varchar("sun_sign", { length: 50 }).notNull(),
  moonSign: varchar("moon_sign", { length: 50 }).notNull(),
  ascendant: varchar("ascendant", { length: 50 }).notNull(),
  chartData: json("chart_data").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const readings = mysqlTable("readings", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  chartId: bigint("chart_id", { mode: "number", unsigned: true }).notNull(),
  queryType: mysqlEnum("query_type", ["general", "career", "love", "health", "future"]).notNull(),
  generatedText: text("generated_text").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type BirthChart = typeof birthCharts.$inferSelect;
export type InsertBirthChart = typeof birthCharts.$inferInsert;
export type Reading = typeof readings.$inferSelect;
export type InsertReading = typeof readings.$inferInsert;
