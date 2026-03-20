import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WhatsAppMasivoService {
    private apiUrl = 'https://localhost:7282/';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    buyPackage(userId: string, mensajes: number): Observable<any> {
        return this.http.post(`${this.apiUrl}api/WhatsAppMasivo/BuyPackage`,
            { userId, mensajes }, { headers: this.getHeaders() });
    }

    getCredits(userId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}api/WhatsAppMasivo/Credits/${userId}`,
            { headers: this.getHeaders() });
    }

    sendAll(eventId: string, mensajeTemplate: string): Observable<any> {
        return this.http.post(`${this.apiUrl}api/WhatsAppMasivo/SendAll`,
            { eventId, mensajeTemplate }, { headers: this.getHeaders() });
    }

    resendUnconfirmed(eventId: string, mensajeTemplate: string): Observable<any> {
        return this.http.post(`${this.apiUrl}api/WhatsAppMasivo/ResendUnconfirmed`,
            { eventId, mensajeTemplate }, { headers: this.getHeaders() });
    }

    getEnvios(eventId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}api/WhatsAppMasivo/Envios/${eventId}`,
            { headers: this.getHeaders() });
    }
}
