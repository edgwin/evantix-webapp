import { Component, HostListener, Input } from '@angular/core';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';
import { DisableDownloadDirective } from '../../../directives/disable-download.directive';
import { AiEditableDirective } from '../../../directives/ai-editable.directive';

@Component({
  selector: 'app-historia',
  standalone: true,
  imports: [CommonModule, DisableDownloadDirective, AiEditableDirective],
  templateUrl: './historia.component.html',
  styleUrls: ['./../invitacion.component.css', './historia.component.css']
})
export class HistoriaComponent {
constructor(private invitationService: InvitationService, private notificationService: NotificationService)
  {}

 @Input() dataHistoria: any;
 @Input() eventId: string = '';
 @Input() eventType: string = '';
 loadingImgs: { [key: string]: boolean } = {};
 loading: boolean = false;
 section: string = ''
 editingTituloHistoria: boolean = false;
 tempTituloHistoria: string = '';
 editingFechaHistoriaId: string | null = null;
 tempFechaHistoriaMap: { [id: string]: string } = {};
 editingDescHistoriaId: string | null = null;
 tempDescHistoriaMap: { [id: string]: string } = {};

 cargarDatosHistoria() {
    this.loading = true;
    if (!this.eventId) return;

    this.invitationService.getHistoria(this.eventId).subscribe({
      next: (res) => {
        this.dataHistoria = res;
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

  onClickTituloHistoria(){    
    this.editingTituloHistoria = true; 
    this.tempTituloHistoria = this.dataHistoria.titulo; // 🔹 Guardamos el valor original
  }

  onTituloHistoriaBlur(event: Event){
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== this.dataHistoria.titulo) {
      this.dataHistoria.titulo = nuevoTexto;      
      this.updateBackend('HistoriaMaster','IdEvento',this.eventId, 'Titulo', this.dataHistoria.titulo);
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

  onClickFechaHistoria(id:string){
    this.editingFechaHistoriaId = id; 
    const item = this.dataHistoria.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempFechaHistoriaMap[id] = item.fecha;
    }
  }

  onFechaHistoriaBlur(event: Event, item: any) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== item.fecha) {
      item.fecha = nuevoTexto;
      this.updateBackend('HistoriaDetail', 'Id', item.id, 'Fecha', nuevoTexto);
    }

    // salimos del modo edición
    this.editingFechaHistoriaId = null;
  }    

  restoreFechaHistoria(item: any, element: HTMLElement) {
    const original = this.tempFechaHistoriaMap[item.id];
    if (original !== undefined) {
      element.innerText = original; // restaurar en la UI
    }
    this.editingFechaHistoriaId = null;
    element.blur();
  }

  onClickDescHistoria(id:string){
    this.editingDescHistoriaId = id; 
    const item = this.dataHistoria.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempDescHistoriaMap[id] = item.descripcion;
    }
  }

  onDescHistoriaBlur(event: Event, item: any) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== item.fecha) {
      item.descripcion = nuevoTexto;
      this.updateBackend('HistoriaDetail', 'Id', item.id, 'Descripcion', nuevoTexto);
    }

    // salimos del modo edición
    this.editingDescHistoriaId = null;
  }    

  restoreDescHistoria(item: any, element: HTMLElement) {
    const original = this.tempDescHistoriaMap[item.id];
    if (original !== undefined) {
      element.innerText = original; // restaurar en la UI
    }
    this.editingDescHistoriaId = null;
    element.blur();
  }

  nuevaHistoria(){
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

  triggerImageDelete(historiaId:string) {
    this.invitationService.deleteHistoria(historiaId).subscribe({
        next: (res) => {
          this.cargarDatosHistoria();
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

  triggerImageUpload(historiaId:string) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.loadingImgs[historiaId] = true;
        this.uploadImage('HistoriaDetail', 'Id', historiaId, 'Imagen', file, historiaId);
      }
    };
    input.click();
  }
  
  updateBackend(tableName:string, searchField: string, eventId:string, field:string, value: string, loadData: boolean = false) {    
    this.invitationService.updateTableField(tableName, searchField, eventId, field, value).subscribe({
      next: () => { 
        if (loadData){
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

  uploadImage(tableName:string, searchField:string, eventId:string, field: string, file: File, historiaId:string) 
  {
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

  showAddHistoriaBtn(){ 
    return !this.loading && (this.dataHistoria?.details?.length || 0) < 5
  }

  onKeyDown(event: KeyboardEvent | any, maxLength:number) {
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

  @HostListener('document:keydown.escape', ['$event'])
    onEscape(event: KeyboardEvent) {
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
}
