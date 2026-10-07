interface RecentMiniCardItem {
    title: string
    subtitle: string
    score: number
    maxScore: number
    date: string
    dateVerb: string
    image: string
}

export function miniCardItemFromBasicAnime(basicAnime: BasicAnime): RecentMiniCardItem {
    return {
        title: basicAnime.title ? basicAnime.title : basicAnime.titleRomaji,
        subtitle: basicAnime.studio,
        score: basicAnime.score,
        maxScore: 10,
        date: basicAnime.finishedAt,
        dateVerb: "Seen",
        image: basicAnime.image ? basicAnime.image : ""
    }
}

export function miniCardItemFromBasicManga(basicManga: BasicManga): RecentMiniCardItem {
    return {
        title: basicManga.title ? basicManga.title : basicManga.titleRomaji,
        subtitle: basicManga.mangaka,
        score: basicManga.score,
        maxScore: 10,
        date: basicManga.finishedAt,
        dateVerb: "Read",
        image: basicManga.image ? basicManga.image : ""
    }
}