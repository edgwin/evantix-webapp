import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InvitadoService {
    private apiUrl = 'https://localhost:7282/api/Invitado/';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    getPaidEvents(userId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}PaidEvents/${userId}`, { headers: this.getHeaders() });
    }

    getGruposByEvent(eventId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}ByEvent/${eventId}`, { headers: this.getHeaders() });
    }

    createGrupo(grupo: any): Observable<any> {
        return this.http.post(`${this.apiUrl}Create`, grupo, { headers: this.getHeaders() });
    }

    updateGrupo(id: string, grupo: any): Observable<any> {
        return this.http.put(`${this.apiUrl}Update/${id}`, grupo, { headers: this.getHeaders() });
    }

    deleteGrupo(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}Delete/${id}`, { headers: this.getHeaders() });
    }

    // Public endpoints (no auth) for guest RSVP
    getGrupoByInvitacion(eventId: string, idInvitacion: string): Observable<any> {
        return this.http.get(`${this.apiUrl}Invitacion/${eventId}/${idInvitacion}`);
    }

    confirmInvitacion(eventId: string, idInvitacion: string, data: any[]): Observable<any> {
        return this.http.put(`${this.apiUrl}Invitacion/${eventId}/${idInvitacion}/Confirm`, data);
    }
}
