export interface CreateVisitDto {
    timestamp: Date;
    duration: number;
    referrer: string;
    page: string | null;
    utm_source: string | null;
}

export interface UpdateVisitDto {
    id: string;
    duration: number;
}
