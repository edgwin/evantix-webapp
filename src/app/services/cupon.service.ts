import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CuponService {
    private apiUrl = 'https://localhost:7282/';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    crearCupon(cupon: any) {
        return this.http.post(`${this.apiUrl}api/Cupon/Create`, cupon, { headers: this.getHeaders() });
    }

    getCupones() {
        return this.http.get(`${this.apiUrl}api/Cupon/GetAll`, { headers: this.getHeaders() });
    }

    aplicarCupon(codigo: string, eventId: string) {
        return this.http.post(`${this.apiUrl}api/Cupon/Apply`, { codigo, eventId }, { headers: this.getHeaders() });
    }

    claimFree(eventId: string) {
        return this.http.post(`${this.apiUrl}api/Cupon/ClaimFree`, { eventId }, { headers: this.getHeaders() });
    }
}
