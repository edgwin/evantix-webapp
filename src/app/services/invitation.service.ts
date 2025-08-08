import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {

  constructor(private http: HttpClient) { }
  private apiUrl = 'https://localhost:7282/';
  private postNewInvitationData = 'api/invitaciones/Create';
  private getInvitationData = 'api/invitacion/'

  guardarInvitacion(data: FormData): Observable<any> {
      const token = localStorage.getItem('access_token');
  
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
  
      const url = `${this.apiUrl}${this.postNewInvitationData}`;
      return this.http.post(url, data, { headers });
  }

  getInvitacion(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${eventId}`;
    return this.http.get(url);
  }
}
