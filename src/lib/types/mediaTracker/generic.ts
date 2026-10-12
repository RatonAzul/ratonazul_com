export interface MediaMiniCardItem {
    title: string
    subtitle: string
    score: number
    maxScore: number
    progress: number
    maxProgress: number
    finishDate: string
    lastActivityDate: string
    dateVerb: string
    image: string
}

export function miniCardItemFromBasicAnime(basicAnime: BasicAnime): MediaMiniCardItem {
    return {
        title: basicAnime.title ? basicAnime.title : basicAnime.titleRomaji,
        subtitle: basicAnime.studio,
        score: basicAnime.score,
        maxScore: 10,
        progress: basicAnime.progress,
        maxProgress: basicAnime.episodes,
        finishDate: basicAnime.finishedAt,
        lastActivityDate: basicAnime.lastActivityAt,
        dateVerb: "Seen",
        image: basicAnime.image ? basicAnime.image : ""
    }
}

export function miniCardItemFromBasicManga(basicManga: BasicManga): MediaMiniCardItem {
    return {
        title: basicManga.title ? basicManga.title : basicManga.titleRomaji,
        subtitle: basicManga.mangaka,
        score: basicManga.score,
        maxScore: 10,
        progress: basicManga.progress,
        maxProgress: basicManga.chapters,
        finishDate: basicManga.finishedAt,
        lastActivityDate: basicManga.lastActivityAt,
        dateVerb: "Read",
        image: basicManga.image ? basicManga.image : ""
    }
}