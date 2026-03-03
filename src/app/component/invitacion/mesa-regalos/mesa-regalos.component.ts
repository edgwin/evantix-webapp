import { Component, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { FormsModule } from '@angular/forms';
import { PopupHtmlComponent } from '../../popup-html/popup-html.component';
import { AiEditableDirective } from '../../../directives/ai-editable.directive';

@Component({
  selector: 'app-mesa-regalos',
  standalone: true,
  imports: [CommonModule, FormsModule, PopupHtmlComponent, AiEditableDirective],
  templateUrl: './mesa-regalos.component.html',
  styleUrls: ['./mesa-regalos.component.css', './../invitacion.component.css']
})

export class MesaRegalosComponent {
  constructor(private invitationService: InvitationService, private notificationService: NotificationService) { }

  @Input() eventId: string = '';
  @Input() data: any;
  @Input() eventType: string = '';
  @Input() isReadOnly: boolean = false;
  @Input() maxItems: number = 99;
  tempTituloMap: { [id: string]: string } = {};
  editingTituloId: string | null = null;
  editingDescripcionId: string | null = null;
  tempDescripcionMap: { [id: string]: string } = {};
  showPopup = false;
  loading = false;
  loadingImg: boolean = false;

  ngOnInit(): void {
    this.loadImages();
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

  onKeyDown(event: KeyboardEvent | any, maxLength: number) {
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

    // Detectamos si el elemento es un input o un elemento editable
    if (target instanceof HTMLInputElement) {
      newText = target.value.trim();
    } else {
      newText = target.innerText.replace(/\n/g, '<br>').trim();
    }

    // Si el campo no ha cambiado, salimos
    if (newText === this.tempTituloMap[eventId]) {
      return;
    }

    // Definimos qué campo se va a modificar
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

    // Llamamos al backend
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
      this.tempTituloMap[id] = item.titulo; // 🔹 Guardamos el valor original
    }
  }

  restoreTitulo(item: any, element: HTMLElement) {
    const original = this.tempTituloMap[item.id];
    if (original !== undefined) {
      element.innerText = original; // restaurar en la UI
    }
    this.editingTituloId = null;
    element.blur();
  }

  restoreDescripcion(item: any, element: HTMLElement) {
    const original = this.tempDescripcionMap[item.id];
    if (original !== undefined) {
      element.innerText = original; // restaurar en la UI
    }
    this.editingDescripcionId = null;
    element.blur();
  }

  onClickDescripcion(id: string) {
    this.editingDescripcionId = id;
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempDescripcionMap[id] = item.descripcion; // 🔹 Guardamos el valor original
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

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
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
}
