import { Component, Input, HostListener, OnInit, OnDestroy } from '@angular/core';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';
import { CountdownTimerComponent } from '../../countdown-timer/countdown-timer.component';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { AiEditableDirective } from '../../../directives/ai-editable.directive';

@Component({
  selector: 'app-portada',
  standalone: true,
  templateUrl: './portada.component.html',
  styleUrls: ['./portada.component.css'],
  imports: [CommonModule, 
            CountdownTimerComponent, 
            FormsModule,
            MatDatepickerModule,
            MatFormFieldModule,
            MatInputModule,
            MatNativeDateModule,
            AiEditableDirective]
})
export class PortadaComponent implements OnInit, OnDestroy {  
  loadingImg: boolean = false;
  newData: any = null;
  newDate: Date = new Date();
  stringDate: string = '';
  @Input() eventId: string = '';
  @Input() data: any; 
  @Input() eventType: string = '';
  @Input() isReadOnly: boolean = false;
  editingTitle: boolean = false;
  editingSubtitle: boolean = false;
  editingDate: boolean = false;
  tempTitle: string = '';
  tempSubtitle: string = '';
  tempDate: Date | null = null;
  tempTime: string = ''; // formato HH:mm
  
  imagenes: string[] = [];
  currentImageIndex: number = 0;
  nextImageIndex: number = 1;
  private carouselTimeout: any = null;
  readonly MAX_IMAGES = 4;
  
  // Configuracion del carrusel (en milisegundos)
  readonly TRANSITION_DURATION = 2000; // Duracion del fade entre imagenes
  readonly SLIDE_INTERVAL = 5000; // Tiempo que se muestra cada imagen
  readonly LAST_TO_FIRST_DELAY = 3000; // Tiempo extra de la ultima a la primera

  constructor(
    private invitationService: InvitationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initCarousel();
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  private initCarousel(): void {
    if (this.data?.imagenes && this.data.imagenes.length > 0) {
      this.imagenes = this.data.imagenes;
    }
    
    if (this.imagenes.length > 1) {
      this.startCarousel();
    }
  }

  private startCarousel(): void {
    this.stopCarousel();
    this.scheduleNextSlide();
  }

  private scheduleNextSlide(): void {
    const isLastImage = this.currentImageIndex === this.imagenes.length - 1;
    const delay = isLastImage 
      ? this.SLIDE_INTERVAL + this.LAST_TO_FIRST_DELAY 
      : this.SLIDE_INTERVAL;

    this.carouselTimeout = setTimeout(() => {
      this.nextImageIndex = (this.currentImageIndex + 1) % this.imagenes.length;
      
      setTimeout(() => {
        this.currentImageIndex = this.nextImageIndex;
        this.scheduleNextSlide();
      }, this.TRANSITION_DURATION);
    }, delay);
  }

  private stopCarousel(): void {
    if (this.carouselTimeout) {
      clearTimeout(this.carouselTimeout);
      this.carouselTimeout = null;
    }
  }

  get currentImage(): string {
    if (this.imagenes.length > 0) {
      return this.imagenes[this.currentImageIndex];
    }
    return this.data?.imagen || '';
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
    element.blur();    
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
    element.blur();
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
    this.tempDate = this.data.date
    this.tempTime = this.data.date
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
      this.updateBackend("Events","Id",this.eventId,"Fecha",this.newDate);
    }

    this.editingDate = false;
  }

  cancelDate() {
    this.editingDate = false;
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
  // --- edición de imagen ---
  triggerImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (event: any) => {
      const files: FileList = event.target.files;
      if (files && files.length > 0) {
        const fileArray: File[] = Array.from(files).slice(0, this.MAX_IMAGES);
        if (files.length > this.MAX_IMAGES) {
          this.notificationService.show('warning', `Máximo ${this.MAX_IMAGES} imágenes permitidas. Se seleccionaron las primeras ${this.MAX_IMAGES}.`);
        }
        this.loadingImg = true;
        this.uploadPortadaImages(fileArray);
      }
    };
    input.click();
  }

  uploadPortadaImages(files: File[]) {
    this.invitationService.uploadPortadaImages(this.eventId, files).subscribe({
      next: (urls: string[]) => {
        this.stopCarousel();
        
        this.imagenes = urls;
        this.data.imagenes = urls;
        this.currentImageIndex = 0;
        this.nextImageIndex = urls.length > 1 ? 1 : 0;
        
        if (this.imagenes.length > 1) {
          this.startCarousel();
        }
        
        this.loadingImg = false;
        this.notificationService.show('success', 'Imágenes actualizadas correctamente');
      },
      error: (err) => {
        this.loadingImg = false;
        this.notificationService.show('error', `Error al subir imágenes: ${err.message}`);
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