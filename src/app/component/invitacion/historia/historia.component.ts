import { Component, HostListener, Input, OnInit } from '@angular/core';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';
import { DisableDownloadDirective } from '../../../directives/disable-download.directive';
import { AiEditableDirective } from '../../../directives/ai-editable.directive';

@Component({
    selector: 'app-historia',
    imports: [CommonModule, DisableDownloadDirective, AiEditableDirective],
    templateUrl: './historia.component.html',
    styleUrls: ['./../invitacion.component.css', './historia.component.css', './../focal-point.css']
})
export class HistoriaComponent implements OnInit {
  constructor(private invitationService: InvitationService, private notificationService: NotificationService) { }

  @Input() dataHistoria: any;
  @Input() eventId: string = '';
  @Input() eventType: string = '';
      private _isReadOnly = false;
  @Input() set isReadOnly(val: boolean) {
    this._isReadOnly = val;
    if (val) {
      this.adjustingPositionId = null;
      this.isDragging = false;
    }
  }
  get isReadOnly(): boolean { return this._isReadOnly; }
  @Input() maxItems: number = 99;
  @Input() aiEnabled: boolean = false;
  loadingImgs: { [key: string]: boolean } = {};
  loading: boolean = false;
  section: string = ''
  editingTituloHistoria: boolean = false;
  tempTituloHistoria: string = '';
  editingFechaHistoriaId: string | null = null;
  tempFechaHistoriaMap: { [id: string]: string } = {};
  editingDescHistoriaId: string | null = null;
  tempDescHistoriaMap: { [id: string]: string } = {};

  // Focal point per item
  adjustingPositionId: string | null = null;  // ID of item being adjusted
  imagenPosiciones: { [id: string]: string } = {};  // Positions per item

  ngOnInit(): void {
    this.initPositions();
  }

  private initPositions() {
    if (this.dataHistoria?.details) {
      for (const item of this.dataHistoria.details) {
        this.imagenPosiciones[item.id] = item.imagenPosicion || '50% 50%';
      }
    }
  }

  getImagenPosicion(id: string): string {
    return this.imagenPosiciones[id] || '50% 50%';
  }

  togglePositionAdjust(id: string) {
    if (this.adjustingPositionId === id) {
      this.adjustingPositionId = null;
    } else {
      this.adjustingPositionId = id;
    }
  }

  isDragging = false;
  draggingItemId: string | null = null;

  onDragStart(event: MouseEvent | TouchEvent, id: string) {
    if (this.adjustingPositionId !== id) return;
    const el = event.target as HTMLElement;
    if (el.closest('button, a, input, .adjust-actions, .adjust-actions-compact, .position-controls-bg, .position-controls-item, .editImage')) return;

    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
    this.draggingItemId = id;
    this.updatePositionFromEvent(event, id);
  }

  onDragMove(event: MouseEvent | TouchEvent, id: string) {
    if (!this.isDragging || this.draggingItemId !== id) return;
    event.preventDefault();
    event.stopPropagation();
    this.updatePositionFromEvent(event, id);
  }

  onDragEnd() {
    this.isDragging = false;
    this.draggingItemId = null;
  }

  private updatePositionFromEvent(event: MouseEvent | TouchEvent, id: string) {
    const target = (event.currentTarget || event.target) as HTMLElement;
    const rect = target.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in event && event.touches.length > 0) { clientX = event.touches[0].clientX; clientY = event.touches[0].clientY; }
    else if ('clientX' in event) { clientX = event.clientX; clientY = event.clientY; }
    else { return; }
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    this.imagenPosiciones[id] = `${Math.round(x)}% ${Math.round(y)}%`;
  }

  savePosition(id: string) {
    const pos = this.imagenPosiciones[id] || '50% 50%';
    this.adjustingPositionId = null;
    this.updateBackend('HistoriaDetail', 'Id', id, 'ImagenPosicion', pos);
    this.notificationService.show('success', 'Posición de imagen guardada');
  }

  cancelPositionAdjust(id: string) {
    this.adjustingPositionId = null;
    const item = this.dataHistoria?.details?.find((d: any) => d.id === id);
    this.imagenPosiciones[id] = item?.imagenPosicion || '50% 50%';
  }

  cargarDatosHistoria() {
    this.loading = true;
    if (!this.eventId) return;

    this.invitationService.getHistoria(this.eventId).subscribe({
      next: (res) => {
        this.dataHistoria = res;
        this.initPositions();
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

  onClickTituloHistoria() {
    this.editingTituloHistoria = true;
    this.tempTituloHistoria = this.dataHistoria.titulo;
  }

  onTituloHistoriaBlur(event: Event) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    if (nuevoTexto !== this.dataHistoria.titulo) {
      this.dataHistoria.titulo = nuevoTexto;
      this.updateBackend('HistoriaMaster', 'IdEvento', this.eventId, 'Titulo', this.dataHistoria.titulo);
    }
  }

  restoreTituloHistoria(element: HTMLElement) {
    const original = this.tempTituloHistoria;
    if (original !== undefined) {
      element.innerText = `${original}`;
    }
    this.editingTituloHistoria = false;
    element.blur();
  }

  onClickFechaHistoria(id: string) {
    this.editingFechaHistoriaId = id;
    const item = this.dataHistoria.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempFechaHistoriaMap[id] = item.fecha;
    }
  }

  onFechaHistoriaBlur(event: Event, item: any) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    if (nuevoTexto !== item.fecha) {
      item.fecha = nuevoTexto;
      this.updateBackend('HistoriaDetail', 'Id', item.id, 'Fecha', nuevoTexto);
    }

    this.editingFechaHistoriaId = null;
  }

  restoreFechaHistoria(item: any, element: HTMLElement) {
    const original = this.tempFechaHistoriaMap[item.id];
    if (original !== undefined) {
      element.innerText = original;
    }
    this.editingFechaHistoriaId = null;
    element.blur();
  }

  onClickDescHistoria(id: string) {
    this.editingDescHistoriaId = id;
    const item = this.dataHistoria.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempDescHistoriaMap[id] = item.descripcion;
    }
  }

  onDescHistoriaBlur(event: Event, item: any) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    if (nuevoTexto !== item.fecha) {
      item.descripcion = nuevoTexto;
      this.updateBackend('HistoriaDetail', 'Id', item.id, 'Descripcion', nuevoTexto);
    }

    this.editingDescHistoriaId = null;
  }

  restoreDescHistoria(item: any, element: HTMLElement) {
    const original = this.tempDescHistoriaMap[item.id];
    if (original !== undefined) {
      element.innerText = original;
    }
    this.editingDescHistoriaId = null;
    element.blur();
  }

  nuevaHistoria() {
    if ((this.dataHistoria?.details?.length || 0) >= this.maxItems) return;
    this.invitationService.postNewHistoria(this.eventId).subscribe({
      next: (res) => {
        this.cargarDatosHistoria();
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

  triggerImageDelete(historiaId: string) {
    this.invitationService.deleteHistoria(historiaId).subscribe({
      next: (res) => {
        this.cargarDatosHistoria();
        this.invitationService.notifyMutation(this.eventId);
      },
      error: (err) => {
        this.loadingImgs[historiaId] = false;
        this.notificationService.show(
          'error',
          `Error al subir imagen: ${err.message}`
        );
      }
    });
  }

  triggerImageUpload(historiaId: string) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.loadingImgs[historiaId] = true;
        this.uploadImage('HistoriaDetail', 'Id', historiaId, 'Imagen', file, historiaId);
      }
      document.body.removeChild(input);
    };
    input.click();
  }

  updateBackend(tableName: string, searchField: string, eventId: string, field: string, value: string, loadData: boolean = false) {
    this.invitationService.updateTableField(tableName, searchField, eventId, field, value).subscribe({
      next: () => {
        if (loadData) {
          this.cargarDatosHistoria();
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

  uploadImage(tableName: string, searchField: string, eventId: string, field: string, file: File, historiaId: string) {
    this.invitationService.updateTableFieldImagen(tableName, searchField, eventId, field, file).subscribe({
      next: (res) => {
        const url = res;
        const item = this.dataHistoria.details.find((d: { id: string; }) => d.id === historiaId);
        if (item) {
          item.imagen = url;
        }
        this.loadingImgs[historiaId] = false;
      },
      error: (err) => {
        this.loadingImgs[historiaId] = false;
        this.notificationService.show(
          'error',
          `Error al subir imagen: ${err.message}`
        );
      }
    });
  }

  showAddHistoriaBtn() {
    return !this.loading && (this.dataHistoria?.details?.length || 0) < this.maxItems
  }

  onKeyDown(event: Event | any, maxLength: number) {
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
    (event.target as HTMLElement).click();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.editingTituloHistoria) {
      const element = document.querySelector('#TituloHistoria') as HTMLElement;
      this.restoreTituloHistoria(element);
    }

    if (this.editingFechaHistoriaId) {
      const item = this.dataHistoria.details.find((d: { id: string }) => d.id === this.editingFechaHistoriaId);
      const element = document.querySelector(`[contenteditable][data-id-fecha-historia="${this.editingFechaHistoriaId}"]`) as HTMLElement;
      if (item && element) {
        this.restoreFechaHistoria(item, element);
      }
    }

    if (this.editingDescHistoriaId) {
      const item = this.dataHistoria.details.find((d: { id: string }) => d.id === this.editingDescHistoriaId);
      const element = document.querySelector(`[contenteditable][data-id-desc-historia="${this.editingDescHistoriaId}"]`) as HTMLElement;
      if (item && element) {
        this.restoreDescHistoria(item, element);
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
