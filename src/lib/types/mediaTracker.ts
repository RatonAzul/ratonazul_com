// base
interface BasicBookInfo {
    title: string;
    status: string;
    authors: string[];
    series?: BasicSeriesInfo;
    seriesPosition?: number;
    pages: number;
    lang: string;
    coverImage: string;
}

interface BasicSeriesInfo {
    name: string;
    booksCount: number;
}


interface CurrentlyReadingBook extends BasicBookInfo {
    progress?: number;
    progressPages?: number;
    startedAt?: string;
}

interface RecentlyReadBook extends BasicBookInfo {
    rating?: number;
    review: string;
    customReview: string;
    startedAt?: string;
    finishedAt?: string;
}