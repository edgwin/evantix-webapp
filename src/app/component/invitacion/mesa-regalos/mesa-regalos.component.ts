import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { FormsModule } from '@angular/forms';
import { PopupHtmlComponent } from '../../popup-html/popup-html.component';
import { AiEditableDirective } from '../../../directives/ai-editable.directive';

@Component({
    selector: 'app-mesa-regalos',
    imports: [CommonModule, FormsModule, PopupHtmlComponent, AiEditableDirective],
    templateUrl: './mesa-regalos.component.html',
    styleUrls: ['./mesa-regalos.component.css', './../invitacion.component.css', './../focal-point.css']
})

export class MesaRegalosComponent implements OnInit {
  constructor(private invitationService: InvitationService, private notificationService: NotificationService) { }

  @Input() eventId: string = '';
  @Input() data: any;
  @Input() eventType: string = '';
  @Input() isReadOnly: boolean = false;
  @Input() maxItems: number = 99;
  @Input() aiEnabled: boolean = false;
  tempTituloMap: { [id: string]: string } = {};
  editingTituloId: string | null = null;
  editingDescripcionId: string | null = null;
  tempDescripcionMap: { [id: string]: string } = {};
  showPopup = false;
  loading = false;
  loadingImg: boolean = false;
  imagenPosicion: string = '50% 50%';
  adjustingPosition: boolean = false;

  ngOnInit(): void {
    this.loadImages();
    this.imagenPosicion = this.data?.imagenPosicion || '50% 50%';
  }

  gotoUrl(url: string) {
    window.open(url, '_blank');
  }

  cargarDatos() {
    this.loading = true;
    if (!this.eventId) return;

    this.invitationService.getMesaRegalos(this.eventId).subscribe({
      next: (res) => {
        this.data = res;
        this.imagenPosicion = this.data?.imagenPosicion || '50% 50%';
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.show(
          'error',
          `Hubo un error favor intentar más tarde ${err.message}`
        );
        this.loading = false;
      }
    });
  }

  // --- edición de imagen ---
  triggerImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.loadingImg = true;
        this.uploadImage('MesaRegalosMaster', 'IdEvento', this.eventId, 'Imagen', file);
      }
    };
    input.click();
  }

  uploadImage(tableName: string, searchField: string, eventId: string, field: string, file: File) {
    this.invitationService.updateTableFieldImagen(tableName, searchField, eventId, field, file).subscribe({
      next: (res) => {
        this.data.imagen = res;
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

  // --- Focal point adjustment ---
  togglePositionAdjust() {
    this.adjustingPosition = !this.adjustingPosition;
  }

  isDragging = false;

  onDragStart(event: MouseEvent | TouchEvent) {
    if (!this.adjustingPosition) return;
    const el = event.target as HTMLElement;
    if (el.closest('button, a, input, .adjust-actions, .adjust-actions-compact, .position-controls-bg, .position-controls-item, .editImage')) return;

    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
    this.updatePositionFromEvent(event);
  }

  onDragMove(event: MouseEvent | TouchEvent) {
    if (!this.adjustingPosition || !this.isDragging) return;
    event.preventDefault();
    event.stopPropagation();
    this.updatePositionFromEvent(event);
  }

  onDragEnd() {
    this.isDragging = false;
  }

  private updatePositionFromEvent(event: MouseEvent | TouchEvent) {
    const target = (event.currentTarget || event.target) as HTMLElement;
    const rect = target.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in event && event.touches.length > 0) { clientX = event.touches[0].clientX; clientY = event.touches[0].clientY; }
    else if ('clientX' in event) { clientX = event.clientX; clientY = event.clientY; }
    else { return; }
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    this.imagenPosicion = `${Math.round(x)}% ${Math.round(y)}%`;
  }

  savePosition() {
    this.adjustingPosition = false;
    this.updateBackend('MesaRegalosMaster', 'IdEvento', this.eventId, 'ImagenPosicion', this.imagenPosicion);
    this.notificationService.show('success', 'Posición de imagen guardada');
  }

  cancelPositionAdjust() {
    this.adjustingPosition = false;
    this.imagenPosicion = this.data?.imagenPosicion || '50% 50%';
  }

  onKeyDown(event: Event | any, maxLength: number) {
    const el = event.target as HTMLElement;
    const text = el.innerText || '';

    // permite borrar, mover cursor, etc.
    const controlKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
      'ArrowUp', 'ArrowDown', 'Tab'
    ];

    if (text.length >= maxLength && !controlKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  saveContent(event: Event, eventId: string, field: string) {
    const target = event.target as HTMLElement | HTMLInputElement;
    let newText: string;

    if (target instanceof HTMLInputElement) {
      newText = target.value.trim();
    } else {
      newText = target.innerText.replace(/\n/g, '<br>').trim();
    }

    if (newText === this.tempTituloMap[eventId]) {
      return;
    }

    let modifyField = '';
    switch (field) {
      case 'titulo':
        modifyField = 'Titulo';
        break;
      case 'descripcion':
        modifyField = 'Descripcion';
        break;
      case 'url':
        modifyField = 'Url';
        break;
      default:
        console.warn(`Campo no reconocido: ${field}`);
        return;
    }

    this.updateBackend('MesaRegalosDetail', 'Id', eventId, modifyField, newText);
  }

  updateBackend(tableName: string, searchField: string, eventId: string, field: string, value: string, loadData: boolean = false) {
    this.invitationService.updateTableField(tableName, searchField, eventId, field, value).subscribe({
      next: () => {
        if (loadData) {
          this.cargarDatos();
        }
      },
      error: (err) => {
        this.notificationService.show(
          'error',
          `Error al actualizar ${field}: ${err.message}`
        );
      }
    });
  }

  onClickTitulo(id: string) {
    this.editingTituloId = id;
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempTituloMap[id] = item.titulo;
    }
  }

  restoreTitulo(item: any, element: HTMLElement) {
    const original = this.tempTituloMap[item.id];
    if (original !== undefined) {
      element.innerText = original;
    }
    this.editingTituloId = null;
    element.blur();
  }

  restoreDescripcion(item: any, element: HTMLElement) {
    const original = this.tempDescripcionMap[item.id];
    if (original !== undefined) {
      element.innerText = original;
    }
    this.editingDescripcionId = null;
    element.blur();
  }

  onClickDescripcion(id: string) {
    this.editingDescripcionId = id;
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempDescripcionMap[id] = item.descripcion;
    }
  }

  images: string[] = [];

  selectedItemIndex: number | null = null;
  openPopup(index: number) {
    this.selectedItemIndex = index;
    this.showPopup = true;
  }

  onClosePopup() {
    this.showPopup = false;
  }

  async onImageSelected(img: string) {
    if (this.selectedItemIndex !== null) {
      const itemId = this.data.details[this.selectedItemIndex].id;
      this.updateBackend('MesaRegalosDetail', 'Id', itemId, 'Imagen', img, true);
    }
    this.onClosePopup();
  }

  triggerElementDelete(mesaId: string) {
    this.invitationService.deleteMesa(mesaId).subscribe({
      next: () => {
        this.cargarDatos();
        this.invitationService.notifyMutation(this.eventId);
      },
      error: (err) => {
        this.notificationService.show(
          'error',
          `Error al subir imagen: ${err.message}`
        );
      }
    });
  }

  nuevaMesa() {
    this.invitationService.postNewMesa(this.eventId).subscribe({
      next: () => {
        this.cargarDatos();
      },
      error: (err) => {
        this.notificationService.show(
          'error',
          `Hubo un error favor intentar más tarde ${err.message}`
        );
        this.loading = false;
      }
    });
  }

  loadImages(): void {
    this.invitationService.getAssetImages('MesaRegalos').subscribe({
      next: (images) => {
        this.images = images;
      },
      error: (err) => {
        console.error('Error al cargar imágenes del itinerario:', err);
        this.images = [];
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.editingTituloId) {
      const item = this.data.details.find((d: { id: string }) => d.id === this.editingTituloId);
      const element = document.querySelector(`[contenteditable][data-id-titulo="${this.editingTituloId}"]`) as HTMLElement;
      if (item && element) {
        this.restoreTitulo(item, element);
      }
    }

    if (this.editingDescripcionId) {
      const item = this.data.details.find((d: { id: string }) => d.id === this.editingDescripcionId);
      const element = document.querySelector(`[contenteditable][data-id-descripcion="${this.editingDescripcionId}"]`) as HTMLElement;
      if (item && element) {
        this.restoreDescripcion(item, element);
      }
    }
  }
  // Mobile: enforces char limit for autocorrect/paste/predictive text
  onInput(event: Event, maxLen: number): void {
    const el = event.target as HTMLElement;
    const text = el.innerText || '';
    if (text.length > maxLen) {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const offset = range ? Math.min(range.startOffset, maxLen) : maxLen;
      el.innerText = text.substring(0, maxLen);
      if (selection && el.firstChild) {
        const newRange = document.createRange();
        newRange.setStart(el.firstChild, Math.min(offset, maxLen));
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
  }
}
