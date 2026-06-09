import { relations } from "drizzle-orm";
import {
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull().default("👤"),
  colorCode: text("color_code").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const categories = pgTable("categories", {
  slug: text("slug").primaryKey(),
  label: text("label").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paidBy: uuid("paid_by")
    .notNull()
    .references(() => members.id),
  category: text("category").notNull(),
  date: date("date").notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const expenseSplits = pgTable("expense_splits", {
  id: uuid("id").primaryKey().defaultRandom(),
  expenseId: uuid("expense_id")
    .notNull()
    .references(() => expenses.id, { onDelete: "cascade" }),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  share: numeric("share", { precision: 10, scale: 2 }).notNull(),
});

export const settlements = pgTable("settlements", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromId: uuid("from_id")
    .notNull()
    .references(() => members.id),
  toId: uuid("to_id")
    .notNull()
    .references(() => members.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  settledAt: timestamp("settled_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  note: text("note"),
});

export const membersRelations = relations(members, ({ many }) => ({
  expensesPaid: many(expenses),
  splits: many(expenseSplits),
  settlementsFrom: many(settlements, { relationName: "fromMember" }),
  settlementsTo: many(settlements, { relationName: "toMember" }),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  payer: one(members, {
    fields: [expenses.paidBy],
    references: [members.id],
  }),
  splits: many(expenseSplits),
}));

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseSplits.expenseId],
    references: [expenses.id],
  }),
  member: one(members, {
    fields: [expenseSplits.memberId],
    references: [members.id],
  }),
}));

export const settlementsRelations = relations(settlements, ({ one }) => ({
  fromMember: one(members, {
    fields: [settlements.fromId],
    references: [members.id],
    relationName: "fromMember",
  }),
  toMember: one(members, {
    fields: [settlements.toId],
    references: [members.id],
    relationName: "toMember",
  }),
}));
