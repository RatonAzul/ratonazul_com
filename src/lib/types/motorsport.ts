export type Meeting = {
    id: number;
    season: number;
    meetingName: string;
    meetingOfficialName: string;
    startDate: string;
    endDate: string;
    gmtOffset: number;
    country: Country;
}

export type Country = {
    id: number;
    name: string;
    code?: string;
    image: string;
}