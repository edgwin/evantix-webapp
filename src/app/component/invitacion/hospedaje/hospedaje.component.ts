
import { Component, Input } from '@angular/core';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { MapaModalComponent } from '../../mapa-modal/mapa-modal.component';
import { TemplateService } from '../../../services/template.service';

@Component({
    selector: 'app-hospedaje',
    imports: [],
    templateUrl: './hospedaje.component.html',
    styleUrls: ['./hospedaje.component.css', './../invitacion.component.css']
})
export class HospedajeComponent {
  constructor(private invitationService: InvitationService, private notificationService: NotificationService,
    private dialog: MatDialog, public templateService: TemplateService) { }
  @Input() eventId: string = '';
  @Input() data: any;
  @Input() isReadOnly: boolean = false;
  @Input() maxItems: number = 99;
  loadingImg: boolean = false;
  loading: boolean = false;
  tempTituloMap: { [id: string]: string } = {};
  editingTituloId: string | null = null;
  editingDescripcionId: string | null = null;
  tempDescripcionMap: { [id: string]: string } = {};

  // --- edición de imagen ---
  triggerImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.loadingImg = true;
        this.uploadImage('HospedajeMaster', 'IdEvento', this.eventId, 'Imagen', file);
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

  triggerElementDelete(hospedajeId: string) {
    this.invitationService.deleteHospedaje(hospedajeId).subscribe({
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

  cargarDatos() {
    this.loading = true;
    if (!this.eventId) return;

    this.invitationService.getHospedaje(this.eventId).subscribe({
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

    // Detectamos si el elemento es un input o un elemento editable
    if (target instanceof HTMLInputElement) {
      newText = target.value.trim();
    } else {
      newText = target.innerText.replace(/\n/g, '<br>').trim();
    }

    // Definimos qué campo se va a modificar
    let modifyField = '';
    switch (field) {
      case 'nombre':
        modifyField = 'Nombre';
        break;
      case 'direccion':
        modifyField = 'Direccion';
        break;
      default:
        console.warn(`Campo no reconocido: ${field}`);
        return;
    }

    // Llamamos al backend
    this.updateBackend('HospedajeDetail', 'Id', eventId, modifyField, newText);
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

  nuevoHospedaje() {
    this.invitationService.postHospedaje(this.eventId).subscribe({
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

  abrirMapa(id: string) {
    const item = this.data.details.find((d: { id: string }) => d.id === id);

    const dialogRef = this.dialog.open(MapaModalComponent, {
      width: '600px',
      data: { ubicacion: item.ubicacion }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        item.ubicacion = result;
        this.updateBackend('HospedajeDetail', 'Id', id, 'Ubicacion', result);
      }
    });
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
