export type Meeting = {
    id: number;
    season: number;
    name: string;
    officialName: string;
    startDate: string;
    endDate: string;
    gmtOffset: number;
    country: Country;
    isSprint: boolean;
}

export type Country = {
    id: number;
    name: string;
    code?: string;
    image: string;
}

export type Driver = {
    id: number;
    firstName: string;
    lastName: string;
    acronym: string;
    driverNumber: number;
    driverOrder: number;
    teamName: string;
    teamColor: string;
}