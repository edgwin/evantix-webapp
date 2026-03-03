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
import { PopupHtmlComponent } from '../../popup-html/popup-html.component';


@Component({
  selector: 'app-donde-cuando',
  templateUrl: './donde-cuando.component.html',
  styleUrls: ['./donde-cuando.component.css', './../icomoon.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, DragDropModule, PopupHtmlComponent]
})
export class DondeCuandoComponent {
  constructor(
    private invitationService: InvitationService,
    private notificationService: NotificationService,
    private fechasHelper: FechasHelper,
    private dialog: MatDialog
  ) { }

  loading: boolean = false;
  loadingImgs: { [key: string]: boolean } = {};
  loadingImg: boolean = false;
  fecha: string = '';
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

  tempActividadMap: { [id: string]: string } = {};
  tempHoraMap: { [id: string]: string } = {};
  tempFechaMap: { [id: string]: string } = {};
  tempLugarMap: { [id: string]: string } = {};
  tempDireccionMap: { [id: string]: string } = {};

  @Input() eventId: string = '';
  @Input() data: any = null;
  @Input() isReadOnly: boolean = false;
  @Input() maxItems: number = 99;

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

  nuevoDondeCuando() {
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

  convertDate(date: string) {
    return this.fechasHelper.formatearFechaHora(date);
  }

  onActividadBlur(event: Event, item: any) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== item.actividad) {
      item.actividad = nuevoTexto;
      this.updateBackend('DondeCuandoDetails', 'Id', item.id, 'Actividad', nuevoTexto);
    }

    // salimos del modo edición
    this.editingActividadId = null;
  }

  // Actividad
  onClickActividad(id: string) {
    this.editingActividadId = id;
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempActividadMap[id] = item.actividad; // 🔹 Guardamos el valor original
    }
  }

  restoreActividad(item: any, element: HTMLElement) {
    const original = this.tempActividadMap[item.id];
    if (original !== undefined) {
      element.innerText = original; // restaurar en la UI
    }
    this.editingActividadId = null;
    element.blur();
  }

  //Hora
  onHoraBlur(event: Event, item: any) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== item.hora) {
      item.hora = nuevoTexto;
      this.updateBackend('DondeCuandoDetails', 'Id', item.id, 'Hora', nuevoTexto);
    }

    // salimos del modo edición
    this.editingHoraId = null;
  }

  onClickHora(id: string) {
    this.editingHoraId = id;
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempHoraMap[id] = item.hora; // 🔹 Guardamos el valor original
    }
  }

  restoreHora(item: any, element: HTMLElement) {
    const original = this.tempHoraMap[item.id];
    if (original !== undefined) {
      element.innerText = `${original}`;
    }
    this.editingHoraId = null;
    element.blur();
  }

  //Fecha
  onFechaBlur(event: Event, item: any) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== item.hora) {
      item.fecha = nuevoTexto;
      this.updateBackend('DondeCuandoDetails', 'Id', item.id, 'Fecha', nuevoTexto);
    }

    // salimos del modo edición
    this.editingFechaId = null;
  }

  onClickFecha(id: string) {
    this.editingFechaId = id;
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempFechaMap[id] = item.fecha;
    }
  }

  restoreFecha(item: any, element: HTMLElement) {
    const original = this.tempFechaMap[item.id];
    if (original !== undefined) {
      element.innerText = original; // restaurar en la UI
    }
    this.editingFechaId = null;
    element.blur();
  }

  //Lugar
  onLugarBlur(event: Event, item: any) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== item.lugar) {
      item.lugar = nuevoTexto;
      this.updateBackend('DondeCuandoDetails', 'Id', item.id, 'Lugar', nuevoTexto);
    }

    // salimos del modo edición
    this.editingLugarId = null;
  }

  onClickLugar(id: string) {
    this.editingLugarId = id;
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempLugarMap[id] = item.lugar;
    }
  }

  restoreLugar(item: any, element: HTMLElement) {
    const original = this.tempLugarMap[item.id];
    if (original !== undefined) {
      element.innerText = original; // restaurar en la UI
    }
    this.editingLugarId = null;
    element.blur();
  }

  //Direccion
  onDireccionBlur(event: Event, item: any) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== item.direccion) {
      item.direccion = nuevoTexto;
      this.updateBackend('DondeCuandoDetails', 'Id', item.id, 'Direccion', nuevoTexto);
    }

    // salimos del modo edición
    this.editingDireccionId = null;
  }

  onClickDireccion(id: string) {
    this.editingDireccionId = id;
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempDireccionMap[id] = item.direccion;
    }
  }

  restoreDireccion(item: any, element: HTMLElement) {
    const original = this.tempDireccionMap[item.id];
    if (original !== undefined) {
      element.innerText = original; // restaurar en la UI
    }
    this.editingDireccionId = null;
    element.blur();
  }

  //genericos
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

  saveHora(id: string) {
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    item.hora = this.tempHora;
    this.editingHoraId = null;
    this.updateBackend('DondeCuandoDetails', 'Id', id, 'Hora', item.hora);
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
    this.updateBackend('DondeCuandoDetails', 'Id', id, 'Fecha', item.fecha);
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
    this.updateBackend('DondeCuandoDetails', 'Id', id, 'Lugar', item.lugar);
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
    this.updateBackend('DondeCuandoDetails', 'Id', id, 'Direccion', item.direccion);
  }

  cancelDireccion() {
    this.editingLugarId = null;
  }

  triggerImageUpload(dondeCuandoId: string) {
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

  triggerImageDelete(dondeCuandoId: string) {
    this.invitationService.deleteDondeCuando(dondeCuandoId).subscribe({
      next: (res) => {
        this.cargarDatos();
        this.invitationService.notifyMutation(this.eventId);
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
        this.uploadBKImage('DondeCuandoMaster', 'IdEvento', this.eventId, 'Imagen', file);
      }
    };
    input.click();
  }

  uploadImage(tableName: string, searchField: string, eventId: string, field: string, file: File, dondeCuandoId: string) {
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

  uploadBKImage(tableName: string, searchField: string, eventId: string, field: string, file: File) {
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

  updateBackend(tableName: string, searchField: string, eventId: string, field: string, value: string) {
    this.invitationService.updateTableField(tableName, searchField, eventId, field, value).subscribe({
      next: () => {
      },
      error: (err) => {
        this.notificationService.show(
          'error',
          `Error al actualizar ${field}: ${err.message}`
        );
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
        this.updateBackend('DondeCuandoDetails', 'Id', id, 'Ubicacion', result);
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

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
    if (this.editingActividadId) {
      const item = this.data.details.find((d: { id: string }) => d.id === this.editingActividadId);
      const element = document.querySelector(`[contenteditable][data-id-actividad="${this.editingActividadId}"]`) as HTMLElement;
      if (item && element) {
        this.restoreActividad(item, element);
      }
    }

    if (this.editingHoraId) {
      const item = this.data.details.find((d: { id: string }) => d.id === this.editingHoraId);
      const element = document.querySelector(`[contenteditable][data-id-hora="${this.editingHoraId}"]`) as HTMLElement;
      if (item && element) {
        this.restoreHora(item, element);
      }
    }

    if (this.editingFechaId) {
      const item = this.data.details.find((d: { id: string }) => d.id === this.editingFechaId);
      const element = document.querySelector(`[contenteditable][data-id-fecha="${this.editingFechaId}"]`) as HTMLElement;
      if (item && element) {
        this.restoreFecha(item, element);
      }
    }

    if (this.editingLugarId) {
      const item = this.data.details.find((d: { id: string }) => d.id === this.editingLugarId);
      const element = document.querySelector(`[contenteditable][data-id-lugar="${this.editingLugarId}"]`) as HTMLElement;
      if (item && element) {
        this.restoreLugar(item, element);
      }
    }

    if (this.editingDireccionId) {
      const item = this.data.details.find((d: { id: string }) => d.id === this.editingDireccionId);
      const element = document.querySelector(`[contenteditable][data-id-direccion="${this.editingDireccionId}"]`) as HTMLElement;
      if (item && element) {
        this.restoreDireccion(item, element);
      }
    }
  }
}
