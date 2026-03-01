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

export enum SessionName {
    SprintQualifying = 'Sprint Qualifying',
    SprintRace = 'Sprint',
    Qualifying = "Qualifying",
    Race = 'Race',
}

export type PositionBet = {
    id: number;
    userId: string;
    position: number;
    guessedDriverId?: number;
    points?: number;
    sessionName: SessionName;
}

export type PositionBetDraft = Omit<PositionBet, 'id' | 'userId'> & { id?: number };

export type TimeBet = {
    id: number;
    userId: string;
    guessedTime?: number;
    points?: number;
    sessionName: SessionName;
}

export type TimeBetDraft = Omit<TimeBet, 'id' | 'userId'> & { id?: number };