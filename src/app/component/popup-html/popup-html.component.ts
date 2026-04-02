import { Component, Input, Output, EventEmitter } from '@angular/core';

import { SafeHtml } from '@angular/platform-browser';
import { InvitationService } from '../../services/invitation.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-popup-html',
    imports: [],
    templateUrl: './popup-html.component.html',
    styleUrls: ['./popup-html.component.css']
})
export class PopupHtmlComponent {
  constructor(
      private invitationService: InvitationService, private notificationService: NotificationService
  )
  {}

  @Input() visible: boolean = false;
  @Input() title: string = 'Galería';
  // soporte para html en string / SafeHtml (legacy)
  @Input() htmlContent: SafeHtml | string = '';
  // nueva forma: pasar array de imágenes
  @Input() images: string[] | null = null;
  @Input() personasFavoritasEdit: boolean = false;
  @Input() showCloseButton: boolean = false;
  @Input() imagenPF: any;
  @Input() parentescoPF: string | null = null;
  @Input() nombresPF: string | null = null;
  @Input() personaFavoritaId: string = "";
  @Output() closed = new EventEmitter<void>();
  @Output() imageSelected = new EventEmitter<string>();

  // índice del carrusel (solo se usa si images está presente)
  currentIndex = 0;
  tempParentesco: string | null = null;
  tempNombres: string | null = null;
  loadingImg:boolean = false;

  close() {
    this.visible = false;
    this.closed.emit();
  }

  // seleccionar imagen (clic en la imagen)
  selectImage(path: string) {
    this.imageSelected.emit(path);
    this.close();
  }

  prev() {
    if (!this.images || this.images.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  next() {
    if (!this.images || this.images.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  onKeyDown(event: KeyboardEvent | any, maxLength:number) {
    const key = (event as KeyboardEvent).key;
    if (key === 'Enter' && !(event as KeyboardEvent).shiftKey) {
      event.preventDefault();
      (event.target as HTMLElement).blur();
      return;
    }
    const el = event.target as HTMLElement;
    const text = el.innerText || '';

    // permite borrar, mover cursor, etc.
    const controlKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
      'ArrowUp', 'ArrowDown', 'Tab'
    ];

    if (text.length >= maxLength && !controlKeys.includes(event.key)) {
      event.preventDefault(); // bloquea más escritura
    }
    (event.target as HTMLElement).click();
  }

  onParentescoBlur(event: Event) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== this.parentescoPF) {
      this.parentescoPF = nuevoTexto;      
      this.updateBackend('PersonasFavoritasDetail','Id',this.personaFavoritaId, 'Parentesco', this.parentescoPF);
    }
  }

  onClickParentesco(){
    this.tempParentesco = this.parentescoPF; // 🔹 Guardamos el valor original
  }

  onNombresBlur(event: Event) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== this.nombresPF) {
      this.nombresPF = nuevoTexto;          
      this.updateBackend('PersonasFavoritasDetail','Id',this.personaFavoritaId, 'Nombres', this.nombresPF);
    }
  }

  onClickNombres(){
    this.tempNombres = this.nombresPF; // 🔹 Guardamos el valor original
  }

  triggerImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.loadingImg = true;
        this.uploadImage('PersonasFavoritasDetail', 'Id', this.personaFavoritaId, 'Foto', file);
      }
    };
    input.click();
  }

  uploadImage(tableName:string, searchField:string, Id:string, field: string, file: File) 
  {
      this.invitationService.updateTableFieldImagen(tableName, searchField, Id, field, file).subscribe({
        next: (res) => {
          this.imagenPF = res;
          this.loadingImg = false;
        },
        error: (err) => {
          this.loadingImg = false;
          this.notificationService.show(
            'error',
            `Error al subir imagen: ${err.message}`
          );
        }
      });
  }

  updateBackend(tableName:string, searchField: string, eventId:string, field:string, value: string) {    
    this.invitationService.updateTableField(tableName, searchField, eventId, field, value).subscribe({
      next: () => {         
      },
      error: (err) => {
        this.notificationService.show(
          'error',
          `Error al actualizar ${field}: ${err.message}`
        );
      }
    });
  }
  
  deletePersonaFavorita(){    
    this.invitationService.deletePersonas(this.personaFavoritaId).subscribe({
        next: () => {
          this.close();
        },
        error: (err) => {
          this.notificationService.show(
            'error',
            `Error al subir imagen: ${err.message}`
          );
        }
    });  
  }  
}