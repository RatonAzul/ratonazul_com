import { meetingsApi } from '$lib/api/motorsport/meetings';
import { meetingBetsApi } from '$lib/api/motorsport/meetingBets';
import { gamesRequest } from '$lib/server/games-api';
import { deliverNotification, getNotificationRecipients } from '$lib/server/notifications';
import type { SiteNotification } from '$lib/types/notifications';
import { formatShortMeetingName } from '$lib/utils/motorsport/pick-the-grid/meetings';
import { dueReminder, reminderSeason, timeUntilBetCloses } from '$lib/utils/motorsport/pick-the-grid/reminder-schedule';
import { pageColors } from '$lib/utils/page-colors';

export async function runPickTheGridReminders(now = new Date()) {
    const audience = await getNotificationRecipients('motorsport');
    if (!audience.length) return;

    const season = reminderSeason(now);
    const nextSeason = reminderSeason(new Date(now.getTime() + 7 * 86_400_000));
    const seasons = season === nextSeason ? [season] : [season, nextSeason];
    const meetings = (await Promise.all(seasons.map(year => meetingsApi.getBySeason(year, AbortSignal.timeout(5000))))).flat();
    for (const meeting of meetings) {
        const kind = dueReminder(meeting.startDate, now);
        if (!kind) continue;

        try {
            const submitted = new Set(await meetingBetsApi.getBettors(meeting.id, AbortSignal.timeout(5000)));
            const recipients = audience.filter(id => !submitted.has(id));
            if (!recipients.length) continue;
            const name = formatShortMeetingName(meeting.name);
            const description = kind === 'open'
                ? `The bet for the ${name} is now open. It will close in ${timeUntilBetCloses(meeting.startDate, now)}.`
                : `The bet for the ${name} is closing in 1 ${kind === 'day' ? 'day' : 'hour'}. Don't miss it!`;

            const alert = await gamesRequest<SiteNotification | undefined>('notifications', 'pick-the-grid', 'POST', {
                title: kind === 'open' ? "It's Race week!" : 'Bet closing soon',
                description,
                section: 'Motorsport',
                color: pageColors.motorsport,
                audience: 'motorsport',
                link: '/pick-the-grid',
                recipient_ids: recipients,
                delivery_key: `pick-the-grid:${meeting.id}:${kind}`
            }, { publishNotifications: true });
            if (alert) await deliverNotification(alert, undefined, recipients);
        } catch (cause) {
            console.error('Unable to send a Pick the Grid reminder', meeting.id, kind, cause);
        }
    }
}

export function startPickTheGridReminders() {
    const runtime = globalThis as typeof globalThis & { pickTheGridReminders?: NodeJS.Timeout };
    if (runtime.pickTheGridReminders) clearInterval(runtime.pickTheGridReminders);
    let running = false;
    const tick = async () => {
        if (running) return;
        running = true;
        try {
            await runPickTheGridReminders();
        } catch (cause) {
            console.error('Unable to check Pick the Grid reminders', cause);
        } finally {
            running = false;
        }
    };

    runtime.pickTheGridReminders = setInterval(() => void tick(), 30_000).unref();
    void tick();
}
