import { Component, HostListener, Input, OnInit } from '@angular/core';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';
import { PopupHtmlComponent } from '../../popup-html/popup-html.component';
import { AiEditableDirective } from '../../../directives/ai-editable.directive';

@Component({
  selector: 'app-intinerario',
  standalone: true,
  imports: [CommonModule, PopupHtmlComponent, AiEditableDirective],
  templateUrl: './intinerario.component.html',
  styleUrls: ['./intinerario.component.css']
})
export class IntinerarioComponent implements OnInit {
  constructor(private invitationService: InvitationService,
        private notificationService: NotificationService){}
        
  loading:boolean = false;
  loadingImgs: { [key: string]: boolean } = {};
  @Input() dataIntinerario:any = null;
  @Input() eventId: string = '';
  @Input() eventType: string = '';
  @Input() isReadOnly: boolean = false;  
  showPopup = false;
  images: string[] = [];

  editingDescripcion: boolean = false;
  tempDescripcion: string = '';

  editingActividadIntId: string | null = null;
  tempActividadIntMap: { [id: string]: string } = {};
  editingFechaIntId: string | null = null;
  tempFechaIntMap: { [id: string]: string } = {};
  editingHoraIntId: string | null = null;
  tempHoraIntMap: { [id: string]: string } = {};

  cargarDatosIntinerario() {
    this.loading = true;
    if (!this.eventId) return;

    this.invitationService.getInvitacionIntinerario(this.eventId).subscribe({
      next: (res) => {
        this.dataIntinerario = res;
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

  updateBackend(tableName:string, searchField: string, eventId:string, field:string, value: string, loadData: boolean = false) {    
    this.invitationService.updateTableField(tableName, searchField, eventId, field, value).subscribe({
      next: () => { 
        if (loadData){
          this.cargarDatosIntinerario();
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

  restoreActividadInt(item: any, element: HTMLElement) {
    const original = this.tempActividadIntMap[item.id];
    if (original !== undefined) {
      element.innerText = original; // restaurar en la UI
    }
    this.editingActividadIntId = null;
    element.blur();
  }

  restoreHoraInt(item: any, element: HTMLElement) {
    const original = this.tempHoraIntMap[item.id];
    if (original !== undefined) {
      element.innerText = original; // restaurar en la UI
    }
    this.editingHoraIntId = null;
    element.blur();
  }

  restoreFechaInt(item: any, element: HTMLElement) {
    const original = this.tempFechaIntMap[item.id];
    if (original !== undefined) {
      element.innerText = original; // restaurar en la UI
    }
    this.editingFechaIntId = null;
    element.blur();
  }

  onKeyDown(event: KeyboardEvent | any, item: any) {
    const key = (event as KeyboardEvent).key;
    if (key === 'Enter' && !(event as KeyboardEvent).shiftKey) {
      event.preventDefault();
      (event.target as HTMLElement).blur(); // dispara onActividadBlur y guarda
      return;
    }
    (event.target as HTMLElement).click();
  }

  trackById(index: number, item: any) {
    return item?.id;
  }

  triggerIntinerarioImageDelete(intinerarioId:string) {
    this.invitationService.deleteIntinerario(intinerarioId).subscribe({
        next: () => {
          this.cargarDatosIntinerario();
        },
        error: (err) => {          
          this.notificationService.show(
            'error',
            `Error al subir imagen: ${err.message}`
          );
        }
      });
  }

  nuevoIntinerario(){
    this.invitationService.postNewIntinerario(this.eventId).subscribe({
      next: (res) => {
        this.cargarDatosIntinerario();
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

  selectedItemIndex: number | null = null;
  openPopup(index: number) {
    this.selectedItemIndex = index;
    this.showPopup = true;
  }

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.invitationService.getAssetImages('Intinerario').subscribe({
      next: (images) => {
        this.images = images;
      },
      error: (err) => {
        console.error('Error al cargar imágenes del itinerario:', err);
        this.images = [];
      }
    });
  }  

  onClosePopup() {
    this.showPopup = false;
  }

  async onImageSelected(img: string) {
    if (this.selectedItemIndex !== null) {      
      const itemId = this.dataIntinerario.details[this.selectedItemIndex].id;      
      this.updateBackend('IntinerarioHistoriaDetail', 'Id', itemId, 'Imagen', img, true);      
    }
    this.onClosePopup();
  }

  onClickDescripcion(){
    this.editingDescripcion = true; 
    this.tempDescripcion = this.dataIntinerario.descripcion; // 🔹 Guardamos el valor original
  }

  onClickActividadInt(id:string){
      this.editingActividadIntId = id; 
      const item = this.dataIntinerario.details.find((d: { id: string }) => d.id === id);
      if (item) {
        this.tempActividadIntMap[id] = item.actividad;
      }
  }
  
  onActividadIntBlur(event: Event, item: any) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== item.actividad) {
      item.actividad = nuevoTexto;
      this.updateBackend('IntinerarioHistoriaDetail', 'Id', item.id, 'Actividad', nuevoTexto);
    }

    // salimos del modo edición
    this.editingActividadIntId = null;
  }

  onClickFechaInt(id:string){
    this.editingFechaIntId = id; 
    const item = this.dataIntinerario.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempFechaIntMap[id] = item.fecha;
    }
  }

  onFechaIntBlur(event: Event, item: any) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== item.fecha) {
      item.fecha = nuevoTexto;
      this.updateBackend('IntinerarioHistoriaDetail', 'Id', item.id, 'Fecha', nuevoTexto);
    }

    // salimos del modo edición
    this.editingFechaIntId = null;
  }

  onClickHoraInt(id:string){
    this.editingHoraIntId = id; 
    const item = this.dataIntinerario.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempHoraIntMap[id] = item.hora;
    }
  }

  onHoraIntBlur(event: Event, item: any) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== item.hora) {
      item.hora = nuevoTexto;
      this.updateBackend('IntinerarioHistoriaDetail', 'Id', item.id, 'Hora', nuevoTexto);
    }

    // salimos del modo edición
    this.editingHoraIntId = null;
  }

  showAddBtn(){ 
    return !this.loading && (this.dataIntinerario?.details?.length || 0) < 6
  }

  onKeyDownInt(event: KeyboardEvent | any, maxLength:number) {
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

  onDescripcionBlur(event: Event){
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== this.dataIntinerario.descripcion) {
      this.dataIntinerario.descripcion = nuevoTexto;      
      this.updateBackend('IntinerarioHistoriaMaster','IdEvento',this.eventId, 'Descripcion', this.dataIntinerario.descripcion);
    }
  }  

  @HostListener('document:keydown.escape', ['$event'])
    onEscape(event: KeyboardEvent) {     
      if (this.editingActividadIntId) {
         const item = this.dataIntinerario.details.find((d: { id: string }) => d.id === this.editingActividadIntId);
         const element = document.querySelector(`[contenteditable][data-id-actividad-int="${this.editingActividadIntId}"]`) as HTMLElement;
         if (item && element) {
           this.restoreActividadInt(item, element);
         }
      }
  
      if (this.editingFechaIntId) {
         const item = this.dataIntinerario.details.find((d: { id: string }) => d.id === this.editingFechaIntId);
         const element = document.querySelector(`[contenteditable][data-id-fecha-int="${this.editingFechaIntId}"]`) as HTMLElement;
         if (item && element) {
           this.restoreFechaInt(item, element);
         }
      }
  
      if (this.editingHoraIntId) {
         const item = this.dataIntinerario.details.find((d: { id: string }) => d.id === this.editingHoraIntId);
         const element = document.querySelector(`[contenteditable][data-id-hora-int="${this.editingHoraIntId}"]`) as HTMLElement;
         if (item && element) {
           this.restoreHoraInt(item, element);
         }
      }    
    }
}
