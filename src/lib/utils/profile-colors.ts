export const profileColors = ['red', 'green', 'yellow', 'blue', 'purple', 'aqua', 'orange', 'gray'] as const;
export const defaultProfileColor = 'gray';

export function isProfileColor(value: unknown): value is (typeof profileColors)[number] {
    return profileColors.some((color) => color === value);
}
