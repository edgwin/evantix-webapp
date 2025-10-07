import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-indicaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indicaciones.component.html',
  styleUrl: './indicaciones.component.css'
})
export class IndicacionesComponent {
  constructor(private invitationService: InvitationService, private notificationService: NotificationService)
  {}

  loading: boolean = false;
  loadingImg: boolean = false;
  editingTituloId: string | null = null;
  tempTituloMap: { [id: string]: string } = {};  
  editingDescripcionId: string | null = null;
  tempDescripcionMap: { [id: string]: string } = {};  
  editingDescription: boolean = false;
  tempTitle: string = '';
  @Input() eventId: string = '';
  @Input() data: any;

  cargarDatos() {
    this.loading = true;
    if (!this.eventId) return;

    this.invitationService.getInvitacionIndicaciones(this.eventId).subscribe({
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

  onClickTitulo(id:string){
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
  }

  onClickDescripcion(id:string){
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

  nuevaIndicacion(){
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

  triggerElementDelete(indicacionId:string) {
  this.invitationService.deleteIndicacion(indicacionId).subscribe({
      next: (res) => {
        this.cargarDatos();
      },
      error: (err) => {
        this.notificationService.show(
          'error',
          `Error al subir imagen: ${err.message}`
        );
      }
    });
  }
  saveContent(event: Event, eventId: string, field:string) {
    const target = event.target as HTMLElement;
    const newText = target.innerText.replace(/\n/g, '<br>');
    if (newText == this.tempTituloMap[eventId]){
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
        this.uploadImage('IndicacionesMaster','IdEvento', this.eventId, 'Imagen', file);
      }
    };
    input.click();
  }

  uploadImage(tableName:string, searchField:string, eventId:string, field: string, file: File) {
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

  updateBackend(tableName:string, searchField: string, eventId:string, field:string, value: string) {    
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

  @HostListener('document:keydown.escape', ['$event'])
    onEscape() {    
        if (this.editingTituloId) {
          const item = this.data.details.find((d: { id: string }) => d.id === this.editingTituloId);
          const element = document.querySelector(`[contenteditable][data-id-actividad="${this.editingTituloId}"]`) as HTMLElement;
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
