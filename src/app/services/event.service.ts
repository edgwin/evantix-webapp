import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'https://localhost:7282/';
  private eventCreate = 'api/Event/Create';
  private getEventByUserId = 'api/Event/GetUserEvents/';
  private getEventById = 'api/Event/GetEventById/';
  private getTermsAndConditions = 'api/Event/GetTermsAndConditions';
  private getEventForInvitationById = 'api/Event/GetUserEventsForInvitations/';

  constructor(private http: HttpClient) {}

  crearEvento(formData: FormData) {
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}${this.eventCreate}`, formData, { headers });
  }

  getEventsByUserId(userId: string){
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url = `${this.apiUrl}${this.getEventByUserId}${userId}`;
    return this.http.get(url, { headers });
  }

  getEventsById(eventId: string){
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url = `${this.apiUrl}${this.getEventById}${eventId}`;
    return this.http.get(url, { headers });
  }

  getTermsAndCoditions(){
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url = `${this.apiUrl}${this.getTermsAndConditions}`;
    return this.http.get(url, { headers });
  }

  getEventsForInvitationsById(eventId: string){
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url = `${this.apiUrl}${this.getEventForInvitationById}${eventId}`;
    return this.http.get(url, { headers });
  }

  guardarInvitacion(data: FormData): Observable<any> {
    return this.http.post('/api/invitaciones', data);
  }

}
