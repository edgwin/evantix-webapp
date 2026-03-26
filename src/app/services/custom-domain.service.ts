import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomDomainService {
    private apiUrl = `${environment.coreApiUrl}/api/CustomDomain/`;

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    getByEventId(eventId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}${eventId}`, { headers: this.getHeaders() });
    }

    checkAvailability(tipo: number, valor: string): Observable<any> {
        return this.http.get(`${this.apiUrl}check?tipo=${tipo}&valor=${encodeURIComponent(valor)}`, { headers: this.getHeaders() });
    }

    create(payload: any): Observable<any> {
        return this.http.post(this.apiUrl, payload, { headers: this.getHeaders() });
    }

    resolveSlug(slug: string): Observable<any> {
        return this.http.get(`${this.apiUrl}resolve/${slug}`);
    }

    resolveDomain(hostname: string): Observable<any> {
        return this.http.get(`${this.apiUrl}resolve-domain/${hostname}`);
    }
}
