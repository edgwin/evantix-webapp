import { Component, HostListener, Input } from '@angular/core';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FechasHelper } from '../../../helpers/fechas';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MapaModalComponent } from '../../mapa-modal/mapa-modal.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-donde-cuando',
  templateUrl: './donde-cuando.component.html',
  styleUrls: ['./../invitacion.component.css', './../icomoon.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, DragDropModule]
})
export class DondeCuandoComponent {
  constructor(
      private invitationService: InvitationService,
      private notificationService: NotificationService,
      private fechasHelper: FechasHelper,
      private dialog: MatDialog
    ) {}
    
  loading:boolean = true;
  loadingImgs: { [key: string]: boolean } = {};
  loadingImg: boolean = false;
  data:any = null;
  fecha: string = '';
  editingActividad: boolean = false;
  tempActividad: string = '';
  editingActividadId: string | null = null;
  editingHora: boolean = false;
  tempHora: string = '';
  editingHoraId: string | null = null;

  editingFecha: boolean = false;
  tempFecha: string = '';
  editingFechaId: string | null = null;

  editingLugar: boolean = false;
  tempLugar: string = '';
  editingLugarId: string | null = null;

  editingDireccion: boolean = false;
  tempDireccion: string = '';
  editingDireccionId: string | null = null;
  @Input() eventId: string = '';

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    if (!this.eventId) return;

    this.invitationService.getInvitacionDondeCuando(this.eventId).subscribe({
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

  nuevoDondeCuando(){
    this.invitationService.postNewDondeCuando(this.eventId).subscribe({
      next: (res) => {
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

  convertDate(date:string){
    return this.fechasHelper.formatearFechaHora(date);
  }

  enableActividad(id: string) {
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    this.tempActividad = item.actividad;
    this.editingActividadId = id;    
  }

  saveActividad(id: string) {
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    item.actividad = this.tempActividad;
    this.editingActividadId = null; // ya terminó edición
    this.updateBackend('DondeCuandoDetails','Id', id, 'Actividad', item.actividad);
  }

  cancelActividad() {
    this.editingActividadId = null;    
  }

  enableHora(id: string) {
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    this.tempHora = item.hora;
    this.editingHoraId = id;
  }

  saveHora(id: string) {
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    item.hora = this.tempHora;
    this.editingHoraId = null;
    this.updateBackend('DondeCuandoDetails','Id', id, 'Hora', item.hora);
  }

  cancelHora() {
    this.editingHoraId = null;
  }

  enableFecha(id: string) {
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    this.tempFecha = item.fecha;
    this.editingFechaId = id;
  }

  saveFecha(id: string) {
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    item.fecha = this.tempFecha;
    this.editingFechaId = null;
    this.updateBackend('DondeCuandoDetails','Id', id, 'Fecha', item.fecha);
  }

  cancelFecha() {
    this.editingFechaId = null;
  }

  enableLugar(id: string) {
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    this.tempLugar = item.lugar;
    this.editingLugarId = id;
  }

  saveLugar(id: string) {
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    item.lugar = this.tempLugar;
    this.editingLugarId = null;
    this.updateBackend('DondeCuandoDetails','Id', id, 'Lugar', item.lugar);
  }

  cancelLugar() {
    this.editingLugarId = null;
  }

  enableDireccion(id: string) {
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    this.tempDireccion = item.direccion;
    this.editingDireccionId = id;
  }

  saveDireccion(id: string) {
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    item.direccion = this.tempDireccion;
    this.editingDireccionId = null;
    this.updateBackend('DondeCuandoDetails','Id', id, 'Direccion', item.direccion);
  }

  cancelDireccion() {
    this.editingLugarId = null;
  }

  triggerImageUpload(dondeCuandoId:string) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.loadingImgs[dondeCuandoId] = true;
        this.uploadImage('DondeCuandoDetails', 'Id', dondeCuandoId, 'Imagen', file, dondeCuandoId);
      }
    };
    input.click();
  }

  triggerImageDelete(dondeCuandoId:string) {
    this.invitationService.deleteDondeCuando(dondeCuandoId).subscribe({
        next: (res) => {
          this.cargarDatos();
        },
        error: (err) => {
          this.loadingImgs[dondeCuandoId] = false;
          this.notificationService.show(
            'error',
            `Error al subir imagen: ${err.message}`
          );
        }
      });
  }
  
  triggerBGImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.loadingImg = true;
        this.uploadBKImage('DondeCuandoMaster','  IdEvento', this.eventId, 'Imagen', file);
      }
    };
    input.click();
  }

  uploadImage(tableName:string, searchField:string, eventId:string, field: string, file: File, dondeCuandoId:string) 
  {
      this.invitationService.updateTableFieldImagen(tableName, searchField, eventId, field, file).subscribe({
        next: (res) => {
          const url = res;
          const item = this.data.details.find((d: { id: string; }) => d.id === dondeCuandoId);
          if (item) {
             item.imagen = url;
          }
          this.loadingImgs[dondeCuandoId] = false;
        },
        error: (err) => {
          this.loadingImgs[dondeCuandoId] = false;
          this.notificationService.show(
            'error',
            `Error al subir imagen: ${err.message}`
          );
        }
      });
  }
  
  uploadBKImage(tableName:string, searchField:string, eventId:string, field: string, file: File) {
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

//Todo Sigue lo que el usuario pueda mover los eventos y agregar un eventOrder en la tabla
abrirMapa(id: string) {
  const item = this.data.details.find((d: { id: string }) => d.id === id);

  const dialogRef = this.dialog.open(MapaModalComponent, {
    width: '600px',
    data: { ubicacion: item.ubicacion }
  });

  dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        item.ubicacion = result;
        this.updateBackend('DondeCuandoDetails','Id', id, 'Ubicacion', result);
      }
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.data.details, event.previousIndex, event.currentIndex);

    // 🔹 después de mover, actualiza el orden en backend
    this.data.details.forEach((item: { id: string; }, index: any) => {
      this.updateBackend('DondeCuandoDetails', 'Id', item.id, 'Orden', index);
    });
  }

  // --- ESC para cancelar ---
  @HostListener('document:keydown.escape', ['$event'])
  onEscape() {
    if (this.editingActividadId) this.cancelActividad();
    if (this.editingHoraId) this.cancelHora();
    if (this.editingFechaId) this.cancelFecha();
    if (this.editingLugarId) this.cancelLugar();
    if (this.editingDireccionId) this.cancelDireccion();
  }
}
