export function validDate(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function formatCalendarDate(value: string): string {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
}

export function calendarMonths(year: number) {
    return Array.from({ length: 12 }, (_, month) => ({
        name: new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month, 1))),
        offset: (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7,
        dates: Array.from({ length: new Date(Date.UTC(year, month + 1, 0)).getUTCDate() }, (_, day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`)
    }));
}

export function calendarDayColors(accent: string) {
    const color = `var(--${accent})`;
    return {
        color,
        backgroundColor: `color-mix(in srgb, ${color} ${accent === 'red' ? 15 : 25}%, transparent)`
    };
}

export const emptyCalendarDayClass = 'bg-bg0 text-gray';
export const interactiveEmptyCalendarDayClass = `${emptyCalendarDayClass} hover:bg-bg2 focus-visible:bg-bg2 hover:text-fg0 focus-visible:text-fg0`;

export function calendarWeekRange(date: string) {
    const monday = new Date(date);
    monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
    const start = monday.toISOString().slice(0, 10);
    monday.setUTCDate(monday.getUTCDate() + 7);
    return { start, end: monday.toISOString().slice(0, 10) };
}
