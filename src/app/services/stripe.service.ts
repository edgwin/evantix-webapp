import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StripeService {
    constructor(private http: HttpClient) { }

    apiUrl = `${environment.coreApiUrl}/api/Event/`;
    createSessionEndpoint = 'CreateStripeSession';

    createSession(event: any, eventPayment: boolean = true) {
        const token = localStorage.getItem('access_token');
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.http.post<{ sessionUrl: string }>(`${this.apiUrl}${this.createSessionEndpoint}`, {
            title: event.nombre,
            description: `Pago del Evento ${event.nombre}`,
            quantity: 1,
            unitPrice: event.costo,
            externalReference: eventPayment ? event.id : `wa_${event.id}`,
            callbackUrl: event.callbackUrl || null
        }, { headers });
    }
}
