import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

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
  ) {}

  @Input() visible: boolean = false;
  @Input() title: string = 'Galería';
  @Input() htmlContent: SafeHtml | string = '';
  @Input() images: string[] | null = null;
  @Input() personasFavoritasEdit: boolean = false;
  @Input() showCloseButton: boolean = false;
  @Input() imagenPF: any;
  @Input() parentescoPF: string | null = null;
  @Input() nombresPF: string | null = null;
  @Input() personaFavoritaId: string = '';
  @Output() closed = new EventEmitter<void>();
  @Output() imageSelected = new EventEmitter<string>();

  // Direct DOM references — most reliable on mobile
  @ViewChild('parentescoEl') parentescoRef!: ElementRef<HTMLElement>;
  @ViewChild('nombresEl')    nombresRef!: ElementRef<HTMLElement>;

  currentIndex = 0;
  loadingImg: boolean = false;

  /**
   * Called via (pointerdown) on the "Cerrar" button — fires BEFORE blur and BEFORE
   * the virtual keyboard dismisses, so innerText is still intact on iOS/Android.
   */
  captureAndSave() {
    if (this.parentescoRef) {
      const val = this.parentescoRef.nativeElement.innerText.trim();
      if (val && val !== this.parentescoPF) {
        this.parentescoPF = val;
        this.updateBackend('PersonasFavoritasDetail', 'Id', this.personaFavoritaId, 'Parentesco', val);
      }
    }
    if (this.nombresRef) {
      const val = this.nombresRef.nativeElement.innerText.trim();
      if (val && val !== this.nombresPF) {
        this.nombresPF = val;
        this.updateBackend('PersonasFavoritasDetail', 'Id', this.personaFavoritaId, 'Nombres', val);
      }
    }
  }

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

  onKeyDown(event: KeyboardEvent | any, maxLength: number) {
    const key = (event as KeyboardEvent).key;
    if (key === 'Enter' && !(event as KeyboardEvent).shiftKey) {
      event.preventDefault();
      (event.target as HTMLElement).blur();
      return;
    }
    const el = event.target as HTMLElement;
    const text = el.innerText || '';
    const controlKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
      'ArrowUp', 'ArrowDown', 'Tab'
    ];
    if (text.length >= maxLength && !controlKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  // ── Parentesco blur (desktop fallback) ───────────────────────────────────

  onParentescoBlur(event: Event) {
    const val = (event.target as HTMLElement).innerText.trim();
    if (val && val !== this.parentescoPF) {
      this.parentescoPF = val;
      this.updateBackend('PersonasFavoritasDetail', 'Id', this.personaFavoritaId, 'Parentesco', val);
    }
  }

  // ── Nombres blur (desktop fallback) ──────────────────────────────────────

  onNombresBlur(event: Event) {
    const val = (event.target as HTMLElement).innerText.trim();
    if (val && val !== this.nombresPF) {
      this.nombresPF = val;
      this.updateBackend('PersonasFavoritasDetail', 'Id', this.personaFavoritaId, 'Nombres', val);
    }
  }

  // ── Image upload ──────────────────────────────────────────────────────────

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

  uploadImage(tableName: string, searchField: string, Id: string, field: string, file: File) {
    this.invitationService.updateTableFieldImagen(tableName, searchField, Id, field, file).subscribe({
      next: (res) => {
        this.imagenPF = res;
        this.loadingImg = false;
      },
      error: (err) => {
        this.loadingImg = false;
        this.notificationService.show('error', `Error al subir imagen: ${err.message}`);
      }
    });
  }

  updateBackend(tableName: string, searchField: string, eventId: string, field: string, value: string) {
    this.invitationService.updateTableField(tableName, searchField, eventId, field, value).subscribe({
      next: () => {},
      error: (err) => {
        this.notificationService.show('error', `Error al actualizar ${field}: ${err.message}`);
      }
    });
  }

  deletePersonaFavorita() {
    this.invitationService.deletePersonas(this.personaFavoritaId).subscribe({
      next: () => { this.close(); },
      error: (err) => {
        this.notificationService.show('error', `Error al eliminar: ${err.message}`);
      }
    });
  }
}