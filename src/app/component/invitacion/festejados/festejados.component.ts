import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { DisableDownloadDirective } from '../../../directives/disable-download.directive';
import { AiEditableDirective } from '../../../directives/ai-editable.directive';
import { TemplateService } from '../../../services/template.service';

@Component({
    selector: 'app-festejados',
    templateUrl: './festejados.component.html',
    styleUrl: './festejados.component.css',
    imports: [CommonModule, FormsModule, DisableDownloadDirective, AiEditableDirective],
    animations: [
        trigger('fadeInScale', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.5)' }),
                animate('600ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
            ])
        ])
    ]
})
export class FestejadosComponent implements OnInit {
  constructor(
    private invitationService: InvitationService,
    private notificationService: NotificationService,
    public templateService: TemplateService
  ) { }

  loading: boolean = false;
  @Input() eventId: string = '';
  @Input() data: any = null;
  @Input() eventType: string = '';
  @Input() isReadOnly: boolean = false;
  @Input() aiEnabled: boolean = false;
  editingTitle: boolean = false;
  editingFrase: boolean = false;
  tempTitle: string = '';
  tempFrase: string = '';
  tempMap: { [id: string]: string } = {};
  loadingImg: boolean = false;
  imagenPosicion: string = '50% 50%';
  adjustingPosition: boolean = false;

  ngOnInit() {
    if (this.data?.imagenPosicion) {
      this.imagenPosicion = this.data.imagenPosicion;
    }
  }

  //Titulo
  onTituloBlur(event: Event) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== this.data.titulo) {
      this.data.titulo = nuevoTexto;
      this.updateBackend('Festejados', 'IdEvento', this.eventId, 'Titulo', this.data.titulo);
    }
  }

  onClickTitulo() {
    this.editingTitle = true;
    this.tempTitle = this.data.titulo; // 🔹 Guardamos el valor original
  }

  restoreTitulo(element: HTMLElement) {
    const original = this.tempTitle;
    if (original !== undefined) {
      element.innerText = `${original}`;
    }
    this.editingTitle = false;
    element.blur();
  }
  //Frase
  onFraseBlur(event: Event) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== this.data.frase) {
      this.data.frase = nuevoTexto;
      this.updateBackend('Festejados', 'IdEvento', this.eventId, 'Frase', this.data.frase);
    }
  }

  onClickFrase() {
    this.editingFrase = true;
    this.tempFrase = this.data.frase; // 🔹 Guardamos el valor original
  }

  restoreFrase(element: HTMLElement) {
    const original = this.tempFrase;
    if (original !== undefined) {
      element.innerText = `${original}`;
    }
    this.editingFrase = false;
    element.blur();
  }

  onKeyDown(event: Event | any, maxLength: number) {
    const key = (event as KeyboardEvent).key;
    if (key === 'Enter' && !(event as KeyboardEvent).shiftKey) {
      event.preventDefault();
      (event.target as HTMLElement).blur(); // dispara onActividadBlur y guarda
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
  // --- edición de imagen ---
  triggerImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.loadingImg = true;
        this.uploadImage('Festejados', 'IdEvento', this.eventId, 'Imagen', file);
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

  // --- Ajuste de posición focal ---
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
    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('clientX' in event) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else { return; }
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    this.imagenPosicion = `${Math.round(x)}% ${Math.round(y)}%`;
    this.data.imagenPosicion = this.imagenPosicion;
  }

  savePosition() {
    this.adjustingPosition = false;
    this.updateBackend('Festejados', 'IdEvento', this.eventId, 'ImagenPosicion', this.imagenPosicion);
    this.notificationService.show('success', 'Posición de imagen guardada');
  }

  cancelPositionAdjust() {
    this.adjustingPosition = false;
    if (this.data?.imagenPosicion) {
      this.imagenPosicion = this.data.imagenPosicion;
    } else {
      this.imagenPosicion = '50% 50%';
    }
  }

  // --- Guardar en backend ---
  updateBackend(tableName: string, searchField: string, eventId: string, field: string, value: any) {
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

  // --- ESC para cancelar ---
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.editingTitle) {
      const element = document.querySelector('#TituloFestejados') as HTMLElement;
      this.restoreTitulo(element);
    }

    if (this.editingFrase) {
      const element = document.querySelector('#FraseFestejados') as HTMLElement;
      this.restoreFrase(element);
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
