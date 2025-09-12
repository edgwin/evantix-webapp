import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-indicaciones',
  standalone: true,
  imports: [CommonModule, ],
  templateUrl: './indicaciones.component.html',
  styleUrl: './indicaciones.component.css'
})
export class IndicacionesComponent {
  cards = [
    'Hola 1\nTexto 1',
    'Hola 2\nTexto 2',
    'Hola 3\nTexto 3'
  ];
  constructor(private invitationService: InvitationService, private notificationService: NotificationService)
  {}

  loading: boolean = false;
  data: any;
  @Input() eventId: string = '';

  ngOnInit(): void {
    this.cargarDatos();
  }

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

  saveContent(event: Event, eventId: string) {
    const target = event.target as HTMLElement;
    const newText = target.innerText.replace(/\n/g, '<br>');
    this.updateBackend('IndicacionesDetail', 'Id', eventId, 'Descripcion', newText);
  }

  // onKeyDown(event: KeyboardEvent, index: number) {
  //   if (event.key === 'Enter') {
  //     const target = event.target as HTMLElement;
  //     this.cards[index] = target.innerText;
  //     console.log('Guardado con Enter:', this.cards[index]);
  //   }
  // }

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
}
