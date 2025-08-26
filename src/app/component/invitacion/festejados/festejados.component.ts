import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-festejados',
  templateUrl: './festejados.component.html',
  styleUrl: './../invitacion.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('fadeInScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class FestejadosComponent {
  constructor(
    private invitationService: InvitationService,
    private notificationService: NotificationService
  ) {}

  loading:boolean = false;
  data:any = null;
  @Input() eventId: string = '';
  editingTitle: boolean = false;
  tempTitle: string = '';
  editingFrase: boolean = false;
  tempFrase: string = '';
  loadingImg: boolean = false;
  
  ngOnInit(): void {
    this.loading = true;
    if (!this.eventId) return;

    this.invitationService.getInvitacionFestejados(this.eventId).subscribe({
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

  enableTitleEdit() {
    this.tempTitle = this.data.titulo;
    this.editingTitle = true;
  }

  saveTitle() {
    this.data.titulo = this.tempTitle;
    this.editingTitle = false;    
    this.updateBackend('Festejados','IdEvento',this.eventId, 'Titulo', this.data.titulo);
  }

  cancelTitle() {
    this.editingTitle = false;
  }

  enableFrase() {
    this.tempFrase = this.data.frase;
    this.editingFrase = true;
  }

  saveFrase() {
    this.data.frase = this.tempFrase;
    this.editingFrase = false;    
    this.updateBackend('Festejados','IdEvento',this.eventId, 'Frase', this.data.frase);
  }

  cancelFrase() {
    this.editingFrase = false;
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
        this.uploadImage('Festejados','IdEvento', this.eventId, 'Imagen', file);
      }
    };
    input.click();
  }

  uploadImage(tableName:string, searchField:string, eventId:string, field: string, file: File) 
  {
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
    if (this.editingTitle) this.cancelTitle();
    if (this.editingFrase) this.cancelFrase();
  }
  
}
