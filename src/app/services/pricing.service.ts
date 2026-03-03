import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface SectionPricing {
    sectionKey: string;
    sectionName: string;
    enableCost: number;
    defaultItems: number;
    maxItems: number;
    extraItemCost: number;
    enabledByDefault: boolean;
}

export interface SectionCostDetail {
    sectionKey: string;
    sectionName: string;
    isEnabled: boolean;
    enableCost: number;
    enabledByDefault: boolean;
    sectionCost: number;
    currentItems: number;
    defaultItems: number;
    maxItems: number;
    extraItemCost: number;
    extraItemsTotalCost: number;
}

export interface EventCostResponse {
    baseCost: number;
    totalCost: number;
    sections: SectionCostDetail[];
}

@Injectable({
    providedIn: 'root'
})
export class PricingService {

    private apiUrl = 'https://localhost:7282/api/pricing/';

    private costSubject = new BehaviorSubject<EventCostResponse | null>(null);
    public cost$ = this.costSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    getSectionPricing(): Observable<SectionPricing[]> {
        return this.http.get<SectionPricing[]>(`${this.apiUrl}sections`, { headers: this.getAuthHeaders() });
    }

    getEventCost(eventId: string): Observable<EventCostResponse> {
        this.loadingSubject.next(true);
        return this.http.get<EventCostResponse>(`${this.apiUrl}event/${eventId}`, { headers: this.getAuthHeaders() }).pipe(
            tap(cost => {
                this.costSubject.next(cost);
                this.loadingSubject.next(false);
            })
        );
    }

    toggleSection(eventId: string, sectionKey: string, enable: boolean): Observable<EventCostResponse> {
        const payload = { sectionKey, enable };
        return this.http.post<EventCostResponse>(`${this.apiUrl}event/${eventId}/toggle-section`, payload, { headers: this.getAuthHeaders() }).pipe(
            tap(cost => this.costSubject.next(cost))
        );
    }

    isSectionEnabled(sectionKey: string): boolean {
        const cost = this.costSubject.value;
        if (!cost) return false;
        const section = cost.sections.find(s => s.sectionKey === sectionKey);
        return section?.isEnabled ?? false;
    }

    getSectionDetail(sectionKey: string): SectionCostDetail | undefined {
        return this.costSubject.value?.sections.find(s => s.sectionKey === sectionKey);
    }

    getCurrentCost(): number {
        return this.costSubject.value?.totalCost ?? 999;
    }
}
