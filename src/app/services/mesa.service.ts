import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MesaService {
    private apiUrl = 'https://localhost:7282/api/Mesa/';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    getMesasByEvent(eventId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}ByEvent/${eventId}`, { headers: this.getHeaders() });
    }

    createMesa(mesa: any): Observable<any> {
        return this.http.post(`${this.apiUrl}Create`, mesa, { headers: this.getHeaders() });
    }

    updateMesa(id: string, mesa: any): Observable<any> {
        return this.http.put(`${this.apiUrl}Update/${id}`, mesa, { headers: this.getHeaders() });
    }

    deleteMesa(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}Delete/${id}`, { headers: this.getHeaders() });
    }

    assignInvitado(mesaId: string, invitadoId: string): Observable<any> {
        return this.http.put(`${this.apiUrl}${mesaId}/Assign/${invitadoId}`, {}, { headers: this.getHeaders() });
    }

    removeInvitado(invitadoId: string): Observable<any> {
        return this.http.put(`${this.apiUrl}RemoveInvitado/${invitadoId}`, {}, { headers: this.getHeaders() });
    }
}
