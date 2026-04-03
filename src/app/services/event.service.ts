import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.coreApiUrl}/`;
  private eventCreate = 'api/Event/Create';
  private getEventByUserId = 'api/Event/GetUserEvents/';
  private getEventById = 'api/Event/GetEventById/';
  private getTermsAndConditions = 'api/Event/GetTermsAndConditions';
  private getPrivacyPolicyUrl = 'api/Event/GetPrivacyPolicy';
  private getEventForInvitationById = 'api/Event/GetUserEventsForInvitations/';
  private getPlansData = 'api/Event/GetPlans';
  private deleteEventById = 'api/Event/Delete/';

  constructor(private http: HttpClient) { }

  crearEvento(formData: FormData) {
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}${this.eventCreate}`, formData, { headers });
  }

  getEventsByUserId(userId: string) {
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url = `${this.apiUrl}${this.getEventByUserId}${userId}`;
    return this.http.get(url, { headers });
  }

  getAllEvents() {
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url = `${this.apiUrl}api/Event/GetAllEvents`;
    return this.http.get(url, { headers });
  }

  getEventsById(eventId: string) {
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url = `${this.apiUrl}${this.getEventById}${eventId}`;
    return this.http.get(url, { headers });
  }

  getTermsAndCoditions() {
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url = `${this.apiUrl}${this.getTermsAndConditions}`;
    return this.http.get(url, { headers });
  }

  getPrivacyPolicy() {
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url = `${this.apiUrl}${this.getPrivacyPolicyUrl}`;
    return this.http.get(url, { headers });
  }

  getPlans() {
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url = `${this.apiUrl}${this.getPlansData}`;
    return this.http.get(url, { headers });
  }

  getEventsForInvitationsById(eventId: string) {
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url = `${this.apiUrl}${this.getEventForInvitationById}${eventId}`;
    return this.http.get(url, { headers });
  }

  DeleteEvent(eventId: string) {
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url = `${this.apiUrl}${this.deleteEventById}${eventId}`;
    return this.http.delete(url, { headers });
  }

  updateEvent(eventId: string, formData: FormData) {
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.put(`${this.apiUrl}api/Event/Update/${eventId}`, formData, { headers });
  }
}
