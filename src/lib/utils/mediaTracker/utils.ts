export function getProgressPercentage(total: number, progress: number) {
    if (total === 0) return 100;
    else return Math.round((progress * 100) / total);
}

export function getRecentlyWatchedListSize(currentlyWatchingSize: number) {
    switch (currentlyWatchingSize) {
        case 0: return 4
        case 1: return 3
        case 2: return 3
        case 3: return 2
        default: return 2
    }
}