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
  private getInvitationData = 'api/invitacion/';
  private getPortada = 'portada/'
  private updateEntry = 'UpdateEntry/'
  private updateEntryImage = 'UpdateEntry/Image/'

  guardarInvitacion(data: FormData): Observable<any> {
      const token = localStorage.getItem('access_token');
  
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
  
      const url = `${this.apiUrl}${this.postNewInvitationData}`;
      return this.http.post(url, data, { headers });
  }

  getInvitacionPortada(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.getPortada}${eventId}`;
    return this.http.get(url);
  }

  updateInvitacionPortada(eventId: string, payload: any) {
    return this.http.put(`/api/invitaciones/${eventId}/portada`, payload);
  }

  uploadPortadaImage(eventId: string, file:any) {
    return this.http.post(`/api/invitaciones/${eventId}/portada/imagen`, file);
  }

  updateTableField(tabla:string, searchField:string, eventId: string, field:string, value:any) {
    const payload = {
      tableName: tabla,
      searchField: searchField,
      fieldName: field,
      newValue: value
    }
    return this.http.patch(`${this.apiUrl}${this.getInvitationData}${this.updateEntry}${eventId}`, payload);
  }

  updateTableFieldImagen(tabla: string, searchField: string, eventId: string, field: string, file: File) {
      const formData = new FormData();
      formData.append('TableName', tabla);
      formData.append('SearchField', searchField);
      formData.append('FieldName', field);
      formData.append('File', file);

      return this.http.patch(`${this.apiUrl}${this.getInvitationData}${this.updateEntryImage}${eventId}`, formData);
  }

}
