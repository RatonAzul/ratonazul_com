export const calendarEventIcons = {
    calendar: 'calendar',
    gift: 'gift',
    heart: 'heart',
    airplane: 'airplane',
    'map-pin': 'map pin',
    star: 'star',
    food: 'food',
    music: 'music',
    camera: 'camera',
    flag: 'flag',
    user: 'person'
} as const;

export type CalendarEventIcon = keyof typeof calendarEventIcons;

export function isCalendarEventIcon(value: string): value is CalendarEventIcon {
    return Object.hasOwn(calendarEventIcons, value);
}
