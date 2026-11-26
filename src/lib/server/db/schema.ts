import { boolean, check, pgEnum, pgTable, primaryKey, serial, integer, text } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { notificationGroups } from '../../utils/notification-groups';
import { user } from './auth.schema';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const calendarMember = pgTable('calendar_member', {
	userId: text('user_id').primaryKey().references(() => user.id, { onDelete: 'cascade' })
});

export *  from './auth.schema';

export const notificationPreference = pgTable('notification_preference', {
	userId: text('user_id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
	enabled: boolean('enabled').notNull().default(false),
	lastSeenId: integer('last_seen_id').notNull().default(0)
});

export const pushSubscription = pgTable('push_subscription', {
	endpoint: text('endpoint').primaryKey(),
	userId: text('user_id').notNull().references(() => notificationPreference.userId, { onDelete: 'cascade' }),
	p256dh: text('p256dh').notNull(),
	auth: text('auth').notNull()
});

export const notificationRead = pgTable('notification_read', {
	userId: text('user_id').notNull().references(() => notificationPreference.userId, { onDelete: 'cascade' }),
	notificationId: integer('notification_id').notNull()
}, (table) => [primaryKey({ columns: [table.userId, table.notificationId] })]);

export const notificationGroup = pgEnum('notification_group', notificationGroups);

export const notificationGroupMember = pgTable('notification_group_member', {
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    group: notificationGroup('group_name').notNull()
}, (table) => [primaryKey({ columns: [table.userId, table.group] })]);

export const notificationGroupMute = pgTable('notification_group_mute', {
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    group: notificationGroup('group_name').notNull()
}, (table) => [primaryKey({ columns: [table.userId, table.group] })]);

export const gamePlayers = pgTable('game_players', {
    id: integer('id').primaryKey().default(1),
    firstUserId: text('first_user_id').references(() => user.id, { onDelete: 'set null' }),
    secondUserId: text('second_user_id').references(() => user.id, { onDelete: 'set null' })
}, (table) => [
    check('game_players_single_pair', sql`${table.id} = 1`),
    check('game_players_distinct_users', sql`${table.firstUserId} <> ${table.secondUserId}`)
]);
