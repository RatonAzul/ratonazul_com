enum MangaStatus {
    READING = 'reading',
    REREADING = 'rereading',
    COMPLETED = 'completed',
    DROPPED = 'dropped',
    PAUSED = 'paused',
    PLANNING_TO_READ = 'planning_to_read',

}

interface BasicManga {
    title?: string;
    titleRomaji: string;
    mangaka: string;
    chapters: number;
    score: number;
    image?: string;
    progress: number;
    status: MangaStatus;
    startedAt: string;
    finishedAt: string;
    lastActivityAt: string;
}