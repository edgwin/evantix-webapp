import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';


export interface AiTextRequest {
  section: string;
  tone: string;
  eventType: string;
  currentText?: string;
  shortVersion: boolean;
  maxLength: number;
  eventId?: string;
}

@Injectable({
  providedIn: 'root'
})

export class InvitationService {

  constructor(private http: HttpClient) { }
  private apiUrl = `${environment.coreApiUrl}/`;
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
  private redesSociales = 'RedesSociales/';
  private photosEvento = 'PhotosEvento/';
  private musicLibrary = 'MusicLibrary/';
  private saveSong = 'SaveSong/';
  private deleteSong = 'DeleteSong/';
  private getSong = 'GetSong/';
  private getText = 'Text'

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // Emite el eventId después de cualquier mutación (add/delete) para que el parent pueda refrescar el costo
  private mutationSubject = new Subject<string>();
  public mutationOccurred$ = this.mutationSubject.asObservable();

  private emitMutation(eventId: string) {
    this.mutationSubject.next(eventId);
  }

  // Los componentes hijos pueden llamar esto después de un delete para refrescar costo
  notifyMutation(eventId: string) {
    this.emitMutation(eventId);
  }

  guardarInvitacion(data: FormData): Observable<any> {
    const url = `${this.apiUrl}${this.postNewInvitationData}`;
    return this.http.post(url, data, { headers: this.getAuthHeaders() });
  }

  // Sin Authorize en el backend
  getInvitacion(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${eventId}`;
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  checkAdmin(): Observable<any> {
    const url = `${this.apiUrl}${this.getInvitationData}check-admin`;
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  // Obtiene la invitación final desde MongoDB (para eventos pagados)
  getInvitacionFinal(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}final/${eventId}`;
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  updateInvitacionPortada(eventId: string, payload: any) {
    return this.http.put(`/api/invitaciones/${eventId}/portada`, payload, { headers: this.getAuthHeaders() });
  }

  uploadPortadaImage(eventId: string, file: any) {
    return this.http.post(`/api/invitaciones/${eventId}/portada/imagen`, file, { headers: this.getAuthHeaders() });
  }

  updateTableField(tabla: string, searchField: string, eventId: string, field: string, value: string) {
    const payload = {
      tableName: tabla,
      searchField: searchField,
      fieldName: field,
      newValue: value.toString()
    }
    return this.http.patch(`${this.apiUrl}${this.getInvitationData}${this.updateEntry}${eventId}`, payload, { headers: this.getAuthHeaders() });
  }

  updateTableFieldImagen(tabla: string, searchField: string, eventId: string, field: string, file: File) {
    const formData = new FormData();
    formData.append('TableName', tabla);
    formData.append('SearchField', searchField);
    formData.append('FieldName', field);
    formData.append('File', file);

    return this.http.patch(`${this.apiUrl}${this.getInvitationData}${this.updateEntryImage}${eventId}`, formData, { headers: this.getAuthHeaders() });
  }

  getInvitacionDondeCuando(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.getDondeCuando}${eventId}`;
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  postNewDondeCuando(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.getDondeCuando}${eventId}`;
    return this.http.post(url, eventId, { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.emitMutation(eventId))
    );
  }

  deleteDondeCuando(dondeCuandoId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.getDondeCuando}${dondeCuandoId}`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }

  getInvitacionIndicaciones(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.getIndicaciones}${eventId}`;
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  postNewIndicacion(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.getIndicaciones}${eventId}`;
    return this.http.post(url, eventId, { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.emitMutation(eventId))
    );
  }

  deleteIndicacion(indicacionId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.getIndicaciones}${indicacionId}`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }

  postNewIntinerario(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.newIntinerario}${eventId}`;
    return this.http.post(url, eventId, { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.emitMutation(eventId))
    );
  }

  getInvitacionIntinerario(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.newIntinerario}${eventId}`;
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  deleteIntinerario(intinerarioId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.newIntinerario}${intinerarioId}`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }

  getMesaRegalos(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.getMesa}${eventId}`;
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  deleteMesa(mesaId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.getMesa}${mesaId}`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }

  postNewMesa(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.getMesa}${eventId}`;
    return this.http.post(url, eventId, { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.emitMutation(eventId))
    );
  }

  getPersonasFavoritasData(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.getPersonasFavoritas}${eventId}`;
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  postNewPersonaFavorita(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.getPersonasFavoritas}${eventId}`;
    return this.http.post(url, eventId, { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.emitMutation(eventId))
    );
  }

  deletePersonas(personaId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.getPersonasFavoritas}${personaId}`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }

  postNewHistoria(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.historia}${eventId}`;
    return this.http.post(url, eventId, { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.emitMutation(eventId))
    );
  }

  getHistoria(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.historia}${eventId}`;
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  deleteHistoria(personaId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.historia}${personaId}`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }

  getGaleria(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.galeria}${eventId}`;
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  deleteGaleria(fotoId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.galeria}${fotoId}`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }

  uploadGaleria(eventId: string, files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      // Pass filename explicitly — required on mobile where browser may not include it
      formData.append('images', file, file.name);
    });
    const url = `${this.apiUrl}${this.getInvitationData}${this.galeria}${eventId}`;
    const token = localStorage.getItem('access_token');
    // Use a plain object for headers so Angular does NOT set Content-Type,
    // letting the browser set multipart/form-data with the correct boundary
    return this.http.post(url, formData, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => this.emitMutation(eventId))
    );
  }

  deleteHospedaje(mesaId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.hospedaje}${mesaId}`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }

  getHospedaje(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.hospedaje}${eventId}`;
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  postHospedaje(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.hospedaje}${eventId}`;
    return this.http.post(url, eventId, { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.emitMutation(eventId))
    );
  }

  getSocialNetworks(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.redesSociales}${eventId}`;
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  postNewSocialNetwork(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.redesSociales}${eventId}`;
    return this.http.post(url, eventId, { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.emitMutation(eventId))
    );
  }

  deleteSocialNetwork(socialNetworkId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.redesSociales}${socialNetworkId}`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }

  uploadPhotos(eventId: string, formData: any) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.photosEvento}${eventId}`;
    return this.http.post(url, formData, { headers: this.getAuthHeaders() });
  }

  getTracks(tags: string[]): Observable<any> {
    let params = new HttpParams();

    tags.forEach(tag => {
      params = params.append('tags', tag);
    });
    const url = `${this.apiUrl}${this.getInvitationData}${this.musicLibrary}`;
    return this.http.get<any>(url, { params });
  }

  addTrack(eventId: string, trackId: string) {
    const payload = {
      eventId: eventId,
      trackId: trackId
    }
    const url = `${this.apiUrl}${this.getInvitationData}${this.musicLibrary}${this.saveSong}`;
    return this.http.post(url, payload, { headers: this.getAuthHeaders() });
  }

  deleteTrack(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.musicLibrary}${this.deleteSong}${eventId}`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }

  getTrackById(trackId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${this.musicLibrary}${this.getSong}${trackId}`;
    return this.http.get<any>(url);
  }

  generateText(payload: AiTextRequest) {
    const url = `${this.apiUrl}${this.getAIController}${this.getText}`;
    return this.http.post<{ text: string }>(url, payload, { headers: this.getAuthHeaders() });
  }

  getAiUsageCount(eventId: string): Observable<{ usedCount: number }> {
    const url = `${this.apiUrl}${this.getAIController}UsageCount/${eventId}`;
    return this.http.get<{ usedCount: number }>(url, { headers: this.getAuthHeaders() });
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
    return this.http.post<string[]>(url, formData, { headers: this.getAuthHeaders() });
  }

  getTemplates() {
    const url = `${this.apiUrl}${this.getInvitationData}Templates`;
    return this.http.get<any[]>(url, { headers: this.getAuthHeaders() });
  }

  createTemplate(template: any) {
    const url = `${this.apiUrl}${this.getInvitationData}Templates`;
    return this.http.post<any>(url, template, { headers: this.getAuthHeaders() });
  }

  updateTemplate(id: string, template: any) {
    const url = `${this.apiUrl}${this.getInvitationData}Templates/${id}`;
    return this.http.put<any>(url, template, { headers: this.getAuthHeaders() });
  }

  deleteTemplate(id: string) {
    const url = `${this.apiUrl}${this.getInvitationData}Templates/${id}`;
    return this.http.delete<any>(url, { headers: this.getAuthHeaders() });
  }

  updateEventTemplate(eventId: string, templateId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}${eventId}/template/${templateId}`;
    return this.http.post(url, {}, { headers: this.getAuthHeaders() });
  }

  putInReview(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}PutInReview`;
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');
    return this.http.post(url, JSON.stringify(eventId), { headers });
  }

  setToRevisado(eventId: string) {
    const url = `${this.apiUrl}${this.getInvitationData}SetToRevisado`;
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');
    return this.http.post(url, JSON.stringify(eventId), { headers });
  }

  // --- Muro de Fotos (Guest Uploads) ---
  getFotosInvitados(eventId: string, idInvitacion?: string) {
    let url = `${this.apiUrl}${this.getInvitationData}MuroFotos/${eventId}`;
    if (idInvitacion) url += `?idInvitacion=${idInvitacion}`;
    return this.http.get<any[]>(url);
  }

  uploadFotosInvitados(eventId: string, files: File[], idInvitacion?: string) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    let url = `${this.apiUrl}${this.getInvitationData}MuroFotos/${eventId}`;
    if (idInvitacion) url += `?idInvitacion=${idInvitacion}`;
    return this.http.post<any[]>(url, formData);
  }

  deleteFotoInvitado(fotoId: string, idInvitacion: string) {
    const url = `${this.apiUrl}${this.getInvitationData}MuroFotos/${fotoId}?idInvitacion=${encodeURIComponent(idInvitacion)}`;
    return this.http.delete(url);
  }
}
