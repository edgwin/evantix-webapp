import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StripeService {
    constructor(private http: HttpClient) { }

    apiUrl = 'https://localhost:7282/api/Event/';
    createSessionEndpoint = 'CreateStripeSession';

    createSession(event: any) {
        const token = localStorage.getItem('access_token');
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.http.post<{ sessionUrl: string }>(`${this.apiUrl}${this.createSessionEndpoint}`, {
            title: event.nombre,
            description: `Pago del plan ${event.plan} del event ID: ${event.id}`,
            quantity: 1,
            unitPrice: event.costo,
            eventId: event.id
        }, { headers });
    }
}
