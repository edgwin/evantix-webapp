// portada.component.ts
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

@Component({
  selector: 'app-portada',
  standalone: true,
  templateUrl: './portada.component.html',
  styleUrls: ['./../portada.component.css'],
  imports: [CommonModule, 
            CountdownTimerComponent, 
            FormsModule,
            MatDatepickerModule,
            MatFormFieldModule,
            MatInputModule,
            MatNativeDateModule]
})
export class PortadaComponent {
  loading: boolean = false;
  data: any = null;
  newData: any = null;
  newDate: string = '';
  @Input() eventId: string = '';

  editingTitle: boolean = false;
  editingSubtitle: boolean = false;
  editingDate: boolean = false;
  tempTitle: string = '';
  tempSubtitle: string = '';
  tempDate: string = '';

  constructor(
    private invitationService: InvitationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    if (!this.eventId) return;

    this.invitationService.getInvitacionPortada(this.eventId).subscribe({
      next: (res) => {
        this.data = res;
        this.newDate = this.formatearFecha(this.data.fecha);
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

  formatearFecha(fechaISO:string) {
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const fecha = new Date(fechaISO);
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();

    return `${dia} de ${mes} del ${anio}`;
  }

  // --- edición de título ---
  enableTitleEdit() {
    this.tempTitle = this.data.titulo;
    this.editingTitle = true;
  }

  saveTitle() {
    this.data.titulo = this.tempTitle;
    this.editingTitle = false;    
    this.updateBackend('Portada','IdEvento',this.eventId, 'Titulo', this.data.titulo);
  }

  cancelTitle() {
    this.editingTitle = false;
  }

  // --- edición de subtítulo ---
  enableSubtitleEdit() {
    this.tempSubtitle = this.data.subTitulo;
    this.editingSubtitle = true;
  }

  saveSubtitle() {
    this.data.subTitulo = this.tempSubtitle;
    this.editingSubtitle = false;
    this.updateBackend('Portada','IdEvento',this.eventId, 'Subtitulo', this.data.titulo);
  }

  cancelSubtitle() {
    this.editingSubtitle = false;
  }

  // --- edición de fecha ---
  enableDateEdit() {
    this.tempDate = this.data.fecha;
    this.editingDate = true;
  }

  saveDate() {
    this.data.fecha = this.tempDate;
    this.newDate = this.formatearFecha(this.tempDate);
    this.editingDate = false;
    this.updateBackend('Events','Id',this.eventId, 'Fecha', this.data.fecha);
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
        this.loading = true;
        this.uploadImage('Portada','IdEvento', this.eventId, 'Imagen', file);
      }
    };
    input.click();
  }

  uploadImage(tableName:string, searchField:string, eventId:string, field: string, file: File) {
    this.invitationService.updateTableFieldImagen(tableName, searchField, eventId, field, file).subscribe({
      next: (res) => {
        this.data.imagen = res;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
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
    if (this.editingTitle) this.cancelTitle();
    if (this.editingSubtitle) this.cancelSubtitle();
  }
}
