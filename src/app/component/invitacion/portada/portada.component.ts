import { Component, Input, HostListener } from '@angular/core';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';
import { CountdownTimerComponent } from '../../countdown-timer/countdown-timer.component';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FechasHelper } from '../../../helpers/fechas';

@Component({
  selector: 'app-portada',
  standalone: true,
  templateUrl: './portada.component.html',
  styleUrls: ['./../invitacion.component.css'],
  imports: [CommonModule, 
            CountdownTimerComponent, 
            FormsModule,
            MatDatepickerModule, //ToDo ver si se puede quitar
            MatFormFieldModule,
            MatInputModule,
            MatNativeDateModule]
})
export class PortadaComponent {
  loading: boolean = false;
  loadingImg: boolean = false;
  data: any = null;
  newData: any = null;
  newDate: Date = new Date();
  stringDate: string = '';
  @Input() eventId: string = '';

  editingTitle: boolean = false;
  editingSubtitle: boolean = false;
  editingDate: boolean = false;
  tempTitle: string = '';
  tempSubtitle: string = '';
  tempDate: Date | null = null;
  tempTime: string = ''; // formato HH:mm

  constructor(
    private invitationService: InvitationService,
    private notificationService: NotificationService,
    private fechasHelper: FechasHelper
  ) {}

  ngOnInit(): void {
    this.loading = true;
    if (!this.eventId) return;

    this.invitationService.getInvitacionPortada(this.eventId).subscribe({
      next: (res) => {
        this.data = res;
        this.stringDate = this.fechasHelper.formatearFechaHora(this.data.fecha);
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

  // --- edición de título ---
  onTituloBlur(event: Event) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== this.data.titulo) {
      this.data.titulo = nuevoTexto;      
      this.updateBackend('Portada','IdEvento',this.eventId, 'Titulo', this.data.titulo);
    }
  }

  onClickTitulo(){
    this.editingTitle = true; 
    this.tempTitle = this.data.titulo; // 🔹 Guardamos el valor original
  }

  restoreTitulo(element: HTMLElement) {
    const original = this.tempTitle;
    if (original !== undefined) {
      element.innerText = `${original}`;
    }
    this.editingTitle = false;
  }

  // --- edición de subtítulo ---
  onSubtitleBlur(event: Event) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== this.data.subTitulo) {
      this.data.subTitulo = nuevoTexto;      
      this.updateBackend('Portada','IdEvento',this.eventId, 'Subtitulo', this.data.subTitulo);
    }    
  }

  onClickSubtitulo(){
    this.editingSubtitle = true; 
    this.tempSubtitle = this.data.subTitulo; // 🔹 Guardamos el valor original
  }

  restoreSubtitulo(element: HTMLElement) {
    const original = this.tempSubtitle;
    if (original !== undefined) {
      element.innerText = `${original}`;
    }
    this.editingSubtitle = false;
  }
  
  maxLength = 35;
  onKeyDown(event: KeyboardEvent | any) {
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

    if (text.length >= this.maxLength && !controlKeys.includes(event.key)) {
      event.preventDefault(); // bloquea más escritura
    }
    (event.target as HTMLElement).click();
  }

  // --- edición de fecha ---
  enableDateEdit() {
    this.editingDate = true;
    this.tempDate = this.newDate ? new Date(this.newDate) : new Date();
    this.tempTime = this.newDate
      ? this.newDate.toISOString().substring(11, 16) // HH:mm
      : '12:00';
  }

  onDateChange(event: any) {
    this.tempDate = event.value;
  }

  onTimeChange(event: any) {
    this.updateFullDate();
  }

  updateFullDate() {
    if (this.tempDate && this.tempTime) {
      const [hours, minutes] = this.tempTime.split(':').map(Number);
      this.tempDate.setHours(hours, minutes, 0, 0);
      this.saveDate();
    }
  }

  saveDate() {
    if (this.tempDate && this.tempTime) {
      const [hours, minutes] = this.tempTime.split(':').map(Number);
      const finalDate = new Date(this.tempDate);
      finalDate.setHours(hours, minutes, 0, 0);

      this.newDate = finalDate;
    }

    this.editingDate = false;
  }

  cancelDate() {
    this.editingDate = false;
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
        this.uploadImage('Portada','IdEvento', this.eventId, 'Imagen', file);
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

  // --- Guardar en backend ---
  updateBackend(tableName:string, searchField: string, eventId:string, field:string, value: any) {    
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
  @HostListener('document:keydown.escape', ['$event'])
  onEscape() {    
    if (this.editingTitle) {
      const element = document.querySelector('.text-center.fh5co-heading.editablePortadaTitulo') as HTMLElement;
      this.restoreTitulo(element);
    }

    if (this.editingSubtitle) {
      const element = document.querySelector('.editablePortadaSubtitulo') as HTMLElement;
      this.restoreSubtitulo(element);
    }
  }
}