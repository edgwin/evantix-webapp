import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mesa-regalos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mesa-regalos.component.html',
  styleUrls: ['./mesa-regalos.component.css','./../invitacion.component.css']
})

export class MesaRegalosComponent {
  constructor(private invitationService: InvitationService, private notificationService: NotificationService)
    {}
    
  @Input() eventId: string = '';
  @Input() data: any;
  tempTituloMap: { [id: string]: string } = {};
  editingTituloId: string | null = null;
  editingDescripcionId: string | null = null;
  tempDescripcionMap: { [id: string]: string } = {};  

  gotoUrl(url:string){
    window.open(url, '_blank');
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

  saveContent(event: Event, eventId: string, field:string) {
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

  onClickTitulo(id:string){
    this.editingTituloId = id;
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempTituloMap[id] = item.titulo; // 🔹 Guardamos el valor original
    }    
  }

  onClickDescripcion(id:string){
    this.editingDescripcionId = id; 
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempDescripcionMap[id] = item.descripcion; // 🔹 Guardamos el valor original
    }    
  }
}
