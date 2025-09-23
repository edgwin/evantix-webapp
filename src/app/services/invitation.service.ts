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
  private updateEntry = 'UpdateEntry/';
  private updateEntryImage = 'UpdateEntry/Image/';
  private getDondeCuando = 'DondeCuando/';
  private getIndicaciones = 'Indicaciones/';

  guardarInvitacion(data: FormData): Observable<any> {
      const token = localStorage.getItem('access_token');
  
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
  
      const url = `${this.apiUrl}${this.postNewInvitationData}`;
      return this.http.post(url, data, { headers });
  }

  getInvitacion(eventId:string){
    const token = localStorage.getItem('access_token');  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url = `${this.apiUrl}${this.getInvitationData}${eventId}`;
    return this.http.get(url, {headers});
  }

  updateInvitacionPortada(eventId: string, payload: any) {
    return this.http.put(`/api/invitaciones/${eventId}/portada`, payload);
  }

  uploadPortadaImage(eventId: string, file:any) {
    return this.http.post(`/api/invitaciones/${eventId}/portada/imagen`, file);
  }

  updateTableField(tabla:string, searchField:string, eventId: string, field:string, value:string) {
    const payload = {
      tableName: tabla,
      searchField: searchField,
      fieldName: field,
      newValue: value.toString()
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

  getInvitacionDondeCuando(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.getDondeCuando}${eventId}`;
    return this.http.get(url);
  }

  postNewDondeCuando(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.getDondeCuando}${eventId}`;
    return this.http.post(url, eventId);
  }

  deleteDondeCuando(dondeCuandoId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.getDondeCuando}${dondeCuandoId}`;
    return this.http.delete(url);
  }

  getInvitacionIndicaciones(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.getIndicaciones}${eventId}`;
    return this.http.get(url);
  }

  postNewIndicacion(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.getIndicaciones}${eventId}`;
    return this.http.post(url, eventId);
  }

  deleteIndicacion(indicacionId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.getIndicaciones}${indicacionId}`;
    return this.http.delete(url);
  }
}
