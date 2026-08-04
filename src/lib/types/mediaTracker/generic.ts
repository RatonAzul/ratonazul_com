interface RecentMiniCardItem {
    title: string
    subtitle: string
    score: number
    maxScore: number
    date: string
    dateVerb: string
    imageUrl: string
}

export function miniCardItemFromBasicAnime(basicAnime: BasicAnime): RecentMiniCardItem {
    return {
        title: basicAnime.title ? basicAnime.title : basicAnime.titleRomaji,
        subtitle: basicAnime.studio,
        score: basicAnime.score,
        maxScore: 10,
        date: basicAnime.finishedAt,
        dateVerb: "Seen",
        imageUrl: basicAnime.image ? basicAnime.image : ""
    }
}