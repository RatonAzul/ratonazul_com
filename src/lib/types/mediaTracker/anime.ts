enum AnimeStatus {
    WATCHING = 'watching',
    REWATCHING = 'rewatching',
    COMPLETED = 'completed',
    DROPPED = 'dropped',
    PAUSED = 'paused',
    PLANNING_TO_WATCH = 'planning_to_watch',

}

interface BasicAnime {
    title?: string;
    titleRomaji: string;
    studio: string;
    episodes: number;
    score: number;
    image?: string;
    progress: number;
    status: AnimeStatus;
    startedAt: string;
    finishedAt: string;
    lastActivityAt: string;
}