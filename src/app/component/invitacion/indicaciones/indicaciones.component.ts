import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { AiEditableDirective } from '../../../directives/ai-editable.directive';
import { TemplateService } from '../../../services/template.service';

@Component({
    selector: 'app-indicaciones',
    imports: [CommonModule, AiEditableDirective],
    templateUrl: './indicaciones.component.html',
    styleUrls: ['./indicaciones.component.css', './../focal-point.css']
})
export class IndicacionesComponent {
  constructor(private invitationService: InvitationService, private notificationService: NotificationService,
    public templateService: TemplateService) { }

  loading: boolean = false;
  loadingImg: boolean = false;
  tempTituloMap: { [id: string]: string } = {};
  editingDescripcionId: string | null = null;
  tempDescripcionMap: { [id: string]: string } = {};
  editingDescription: boolean = false;
  tempTitle: string = '';
  imagenPosicion: string = '50% 50%';
  adjustingPosition: boolean = false;
  @Input() eventId: string = '';
  @Input() data: any;
  @Input() eventType: string = '';
  @Input() isReadOnly: boolean = false;
  @Input() maxItems: number = 99;
  @Input() aiEnabled: boolean = false;
  private editingTituloId: string | null = null;
  get valor() {
    return this.editingTituloId;
  }
  set valor(nuevoValor: string | null) {
    if (nuevoValor !== this.editingTituloId) {
      this.editingTituloId = nuevoValor;
      console.log('El valor cambió:', nuevoValor);
    }
  }

  cargarDatos() {
    this.loading = true;
    if (!this.eventId) return;

    this.invitationService.getInvitacionIndicaciones(this.eventId).subscribe({
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

  ngOnInit() {
    this.imagenPosicion = this.data?.imagenPosicion || '50% 50%';
  }

  // --- Focal point adjustment ---
  togglePositionAdjust() {
    this.adjustingPosition = !this.adjustingPosition;
  }

  isDragging = false;

  onDragStart(event: MouseEvent | TouchEvent) {
    if (!this.adjustingPosition) return;
    event.preventDefault();
    this.isDragging = true;
    this.updatePositionFromEvent(event);
  }

  onDragMove(event: MouseEvent | TouchEvent) {
    if (!this.adjustingPosition || !this.isDragging) return;
    event.preventDefault();
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
    this.updateBackend('IndicacionesMaster', 'IdEvento', this.eventId, 'ImagenPosicion', this.imagenPosicion);
    this.notificationService.show('success', 'Posición de imagen guardada');
  }

  cancelPositionAdjust() {
    this.adjustingPosition = false;
    this.imagenPosicion = this.data?.imagenPosicion || '50% 50%';
  }

  onClickTitulo(id: string) {
    this.editingTituloId = id;
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempTituloMap[id] = item.titulo; // 🔹 Guardamos el valor original
    }
  }

  restoreTitulo(item: any, element: HTMLElement) {
    const original = this.tempTituloMap[item.id];
    if (original !== undefined) {
      element.innerHTML = original; // restaurar en la UI
    }
    this.editingTituloId = null;
    element.blur();
  }

  onClickDescripcion(id: string) {
    this.editingDescripcionId = id;
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempDescripcionMap[id] = item.descripcion; // 🔹 Guardamos el valor original
    }
  }

  restoreDescripcion(item: any, element: HTMLElement) {
    const original = this.tempDescripcionMap[item.id];
    if (original !== undefined) {
      element.innerHTML = original; // restaurar en la UI
    }
    this.editingDescripcionId = null;
    element.blur();
  }

  maxLength = 150;
  onDescKeyDown(event: KeyboardEvent | any) {
    const el = event.target as HTMLElement;
    const text = el.innerText || '';

    // permite borrar, mover cursor, etc.
    const controlKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
      'ArrowUp', 'ArrowDown', 'Tab'
    ];

    if (text.length >= this.maxLength && !controlKeys.includes(event.key)) {
      event.preventDefault(); // bloquea más escritura
    }
  }

  maxTituloLength = 22;
  onTituloKeyDown(event: KeyboardEvent | any) {
    const el = event.target as HTMLElement;
    const text = el.innerText || '';

    // permite borrar, mover cursor, etc.
    const controlKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
      'ArrowUp', 'ArrowDown', 'Tab'
    ];

    if (text.length >= this.maxTituloLength && !controlKeys.includes(event.key)) {
      event.preventDefault(); // bloquea más escritura
    }
  }

  nuevaIndicacion() {
    this.invitationService.postNewIndicacion(this.eventId).subscribe({
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

  triggerElementDelete(indicacionId: string) {
    this.invitationService.deleteIndicacion(indicacionId).subscribe({
      next: (res) => {
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
  saveContent(event: Event, eventId: string, field: string) {
    const target = event.target as HTMLElement;
    const newText = target.innerText.replace(/\n/g, '<br>');
    if (newText == this.tempTituloMap[eventId]) {
      return
    }
    const modifyField = field === "titulo" ? 'Titulo' : 'Descripcion';
    this.updateBackend('IndicacionesDetail', 'Id', eventId, modifyField, newText);
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
        this.uploadImage('IndicacionesMaster', 'IdEvento', this.eventId, 'Imagen', file);
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

  updateBackend(tableName: string, searchField: string, eventId: string, field: string, value: string) {
    this.invitationService.updateTableField(tableName, searchField, eventId, field, value).subscribe({
      next: () => { },
      error: (err) => {
        this.notificationService.show(
          'error',
          `Error al actualizar ${field}: ${err.message}`
        );
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.editingTituloId) {
      const item = this.data.details.find((d: { id: string }) => d.id === this.editingTituloId);
      const element = document.querySelector(`[contenteditable][data-id-titulo-Indicaciones="${this.editingTituloId}"]`) as HTMLElement;
      if (item && element) {
        this.restoreTitulo(item, element);
      }
    }
    if (this.editingDescripcionId) {
      const item = this.data.details.find((d: { id: string }) => d.id === this.editingDescripcionId);
      const element = document.querySelector(`[contenteditable][data-id-descripcion-indicaciones="${this.editingDescripcionId}"]`) as HTMLElement;
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
