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
  editingFrase: boolean = false;
  tempTitle: string = '';  
  tempFrase: string = '';  
  tempMap: { [id: string]: string } = {};
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
 
  //Titulo
  onTituloBlur(event: Event) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== this.data.titulo) {
      this.data.titulo = nuevoTexto;      
      this.updateBackend('Festejados','IdEvento',this.eventId, 'Titulo', this.data.titulo);
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
  //Frase
  onFraseBlur(event: Event) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== this.data.frase) {
      this.data.frase = nuevoTexto;      
      this.updateBackend('Festejados','IdEvento',this.eventId, 'Frase', this.data.frase);
    }
  }
  
  onClickFrase(){
    this.editingFrase = true; 
    this.tempFrase = this.data.frase; // 🔹 Guardamos el valor original
  }

  restoreFrase(element: HTMLElement) {
    const original = this.tempFrase;
    if (original !== undefined) {
      element.innerText = `${original}`;
    }
    this.editingFrase = false;
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
    if (this.editingTitle) {
      const element = document.querySelector('#TituloFestejados') as HTMLElement;
      this.restoreTitulo(element);
    }

    if (this.editingFrase) {
      const element = document.querySelector('#FraseFestejados') as HTMLElement;
      this.restoreFrase(element);
    }
  }
  
}
