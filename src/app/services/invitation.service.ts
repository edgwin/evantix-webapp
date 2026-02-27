import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface AiTextRequest {
  section: string;
  tone: string;
  eventType: string;
  currentText?: string;
  shortVersion: boolean;
  maxLength: number;
}

@Injectable({
  providedIn: 'root'
})

export class InvitationService {

  constructor(private http: HttpClient) { }
  private apiUrl = 'https://localhost:7282/';
  private postNewInvitationData = 'api/invitaciones/Create';
  private getInvitationData = 'api/invitacion/';
  private getAIController = 'api/Ai/';
  private updateEntry = 'UpdateEntry/';
  private updateEntryImage = 'UpdateEntry/Image/';
  private getDondeCuando = 'DondeCuando/';
  private getIndicaciones = 'Indicaciones/';
  private newIntinerario = 'Intinerario/';
  private getMesa = 'MesaRegalos/';
  private getPersonasFavoritas = 'PersonasFavoritas/';
  private historia = 'Historia/';
  private galeria = 'Galeria/';
  private hospedaje = 'Hospedaje/';
  private photosEvento = 'PhotosEvento/';
  private musicLibrary = 'MusicLibrary/';
  private saveSong = 'SaveSong/';
  private deleteSong = 'DeleteSong/';
  private getSong = 'GetSong/';
  private getText = 'Text'

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

  postNewIntinerario(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.newIntinerario}${eventId}`;
    return this.http.post(url, eventId);
  }

  getInvitacionIntinerario(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.newIntinerario}${eventId}`;
    return this.http.get(url);
  }

  deleteIntinerario(intinerarioId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.newIntinerario}${intinerarioId}`;
    return this.http.delete(url);
  }

  getMesaRegalos(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.getMesa}${eventId}`;
    return this.http.get(url);
  }

  deleteMesa(mesaId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.getMesa}${mesaId}`;
    return this.http.delete(url);
  }

  postNewMesa(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.getMesa}${eventId}`;
    return this.http.post(url, eventId);
  }

  getPersonasFavoritasData(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.getPersonasFavoritas}${eventId}`;
    return this.http.get(url);
  }

  postNewPersonaFavorita(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.getPersonasFavoritas}${eventId}`;
    return this.http.post(url, eventId);
  }

  deletePersonas(personaId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.getPersonasFavoritas}${personaId}`;
    return this.http.delete(url);
  }

  postNewHistoria(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.historia}${eventId}`;
    return this.http.post(url, eventId);
  }

  getHistoria(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.historia}${eventId}`;
    return this.http.get(url);
  }

  deleteHistoria(personaId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.historia}${personaId}`;
    return this.http.delete(url);
  }

  getGaleria(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.galeria}${eventId}`;
    return this.http.get(url);
  }

  deleteGaleria(fotoId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.galeria}${fotoId}`;
    return this.http.delete(url);
  }

  uploadGaleria(eventId: string, files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    const url = `${this.apiUrl}${this.getInvitationData}${this.galeria}${eventId}`;
    return this.http.post(url, formData);
  }

  deleteHospedaje(mesaId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.hospedaje}${mesaId}`;
    return this.http.delete(url);
  }  

  getHospedaje(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.hospedaje}${eventId}`;
    return this.http.get(url);
  }

  postHospedaje(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.hospedaje}${eventId}`;
    return this.http.post(url, eventId);
  }

  uploadPhotos(eventId:string, formData:any){
    const url = `${this.apiUrl}${this.getInvitationData}${this.photosEvento}${eventId}`;
    return this.http.post(url, formData);
  }

  getTracks(tags: string[]): Observable<any> {
    let params = new HttpParams();

    tags.forEach(tag => {
      params = params.append('tags', tag);
    });
    const url = `${this.apiUrl}${this.getInvitationData}${this.musicLibrary}`;
    return this.http.get<any>(url, {params});
  }

  addTrack(eventId:string, trackId:string){
    const payload = {
      eventId: eventId,
      trackId: trackId
    }
    const url = `${this.apiUrl}${this.getInvitationData}${this.musicLibrary}${this.saveSong}`;
    return this.http.post(url, payload);
  }

  deleteTrack(eventId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.musicLibrary}${this.deleteSong}${eventId}`;
    return this.http.delete(url);
  }

  getTrackById(trackId:string){
    const url = `${this.apiUrl}${this.getInvitationData}${this.musicLibrary}${this.getSong}${trackId}`;
    return this.http.get<any>(url);
  }
  
  generateText(payload: AiTextRequest) {
    const url = `${this.apiUrl}${this.getAIController}${this.getText}`;
    return this.http.post<{ text: string }>(url,payload);
  }

  getAssetImages(folder: string) {
    const url = `${this.apiUrl}api/assets/images/${folder}`;
    return this.http.get<string[]>(url);
  }

  uploadPortadaImages(eventId: string, files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    const url = `${this.apiUrl}${this.getInvitationData}Portada/Images/${eventId}`;
    return this.http.post<string[]>(url, formData);
  }

  getTemplates() {
    const url = `${this.apiUrl}${this.getInvitationData}Templates`;
    return this.http.get<any[]>(url);
  }

  updateEventTemplate(eventId: string, templateId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${eventId}/template/${templateId}`;
    return this.http.post(url, {});
  }

  putInReview(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}PutInReview`;
    return this.http.post(url, JSON.stringify(eventId), {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }
}
