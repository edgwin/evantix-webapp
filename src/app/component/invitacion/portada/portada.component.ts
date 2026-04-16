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
  @Input() maxItems: number = 99;
  @Input() aiEnabled: boolean = false;
  editingTitle: boolean = false;
  editingSubtitle: boolean = false;
  editingDate: boolean = false;
  showCalendarDropdown: boolean = false;
  tempTitle: string = '';
  tempSubtitle: string = '';
  tempDate: Date | null = null;
  tempTime: string = ''; // formato HH:mm

  imagenes: string[] = [];
  currentImageIndex: number = 0;
  nextImageIndex: number = 1;
  private carouselTimeout: any = null;
  // MAX_IMAGES ahora viene de @Input() maxItems (SectionPricing.MaxItems)

  // Configuracion del carrusel (en milisegundos)
  readonly TRANSITION_DURATION = 2000; // Duracion del fade entre imagenes
  readonly SLIDE_INTERVAL = 5000; // Tiempo que se muestra cada imagen
  readonly LAST_TO_FIRST_DELAY = 3000; // Tiempo extra de la ultima a la primera

  constructor(
    private invitationService: InvitationService,
    private notificationService: NotificationService
  ) { }

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
      this.updateBackend('Portada', 'IdEvento', this.eventId, 'Titulo', this.data.titulo);
    }
  }

  onClickTitulo() {
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
      this.updateBackend('Portada', 'IdEvento', this.eventId, 'Subtitulo', this.data.subTitulo);
    }
  }

  onClickSubtitulo() {
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

  maxLengthTitulo = 30;
  maxLengthSubtitulo = 40;
  maxLength = 35;
  onKeyDown(event: Event | any, maxLen?: number) {
    const limit = maxLen ?? this.maxLength;
    const key = (event as KeyboardEvent).key;
    if (key === 'Enter' && !(event as KeyboardEvent).shiftKey) {
      event.preventDefault();
      (event.target as HTMLElement).blur(); // dispara blur y guarda
      return;
    }
    const el = event.target as HTMLElement;
    const text = el.innerText || '';

    // permite borrar, mover cursor, etc.
    const controlKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
      'ArrowUp', 'ArrowDown', 'Tab'
    ];

    if (text.length >= limit && !controlKeys.includes(event.key)) {
      event.preventDefault(); // bloquea más escritura
    }
    (event.target as HTMLElement).click();
  }

  // --- edición de fecha ---
  enableDateEdit() {
    this.editingDate = true;
    this.tempDate = this.data.date;
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
      this.updateBackend("Events", "Id", this.eventId, "Fecha", this.newDate);
    }

    this.editingDate = false;
  }

  cancelDate() {
    this.editingDate = false;
  }

  formatearFecha(fechaISO: string) {
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
        let fileArray: File[] = Array.from(files);
        const originalCount = fileArray.length;

        if (fileArray.length > this.maxItems) {
          fileArray = fileArray.slice(0, this.maxItems);
          this.notificationService.show(
            'warning',
            `⚠️ Solo se subirán ${this.maxItems} de las ${originalCount} imágenes seleccionadas (máximo ${this.maxItems}).`,
            true
          );
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
        this.invitationService.notifyMutation(this.eventId);
        this.notificationService.show('success', 'Imágenes actualizadas correctamente');
      },
      error: (err) => {
        this.loadingImg = false;
        this.notificationService.show('error', `Error al subir imágenes: ${err.message}`);
      }
    });
  }

  // --- Guardar en backend ---
  updateBackend(tableName: string, searchField: string, eventId: string, field: string, value: any) {
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
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.editingTitle) {
      const element = document.querySelector('.text-center.fh5co-heading.editablePortadaTitulo') as HTMLElement;
      this.restoreTitulo(element);
    }

    if (this.editingSubtitle) {
      const element = document.querySelector('.editablePortadaSubtitulo') as HTMLElement;
      this.restoreSubtitulo(element);
    }

    this.showCalendarDropdown = false;
  }

  // --- Calendario ---
  toggleCalendarDropdown() {
    this.showCalendarDropdown = !this.showCalendarDropdown;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.calendar-wrapper')) {
      this.showCalendarDropdown = false;
    }
  }

  private getEventDate(): Date {
    return new Date(this.data?.fecha);
  }

  private getEventTitle(): string {
    return this.data?.nombreEvento || this.data?.titulo || this.eventType || 'Evento';
  }

  private getEventDescription(): string {
    return `${this.eventType} - ${this.data?.subTitulo || ''}`;
  }

  private formatDateForGoogle(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  private formatDateForICS(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  addToGoogleCalendar() {
    const start = this.getEventDate();
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000); // +3 horas
    const title = encodeURIComponent(this.getEventTitle());
    const details = encodeURIComponent(this.getEventDescription());
    const startStr = this.formatDateForGoogle(start);
    const endStr = this.formatDateForGoogle(end);

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}`;
    window.open(url, '_blank');
    this.showCalendarDropdown = false;
  }

  addToOutlook() {
    const start = this.getEventDate();
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
    const title = encodeURIComponent(this.getEventTitle());
    const body = encodeURIComponent(this.getEventDescription());
    const startStr = start.toISOString();
    const endStr = end.toISOString();

    const url = `https://outlook.live.com/calendar/0/action/compose?subject=${title}&body=${body}&startdt=${startStr}&enddt=${endStr}`;
    window.open(url, '_blank');
    this.showCalendarDropdown = false;
  }

  addToYahoo() {
    const start = this.getEventDate();
    const title = encodeURIComponent(this.getEventTitle());
    const desc = encodeURIComponent(this.getEventDescription());
    const startStr = this.formatDateForGoogle(start);
    const dur = '0300'; // 3 horas

    const url = `https://calendar.yahoo.com/?v=60&title=${title}&desc=${desc}&st=${startStr}&dur=${dur}`;
    window.open(url, '_blank');
    this.showCalendarDropdown = false;
  }

  downloadICS() {
    const start = this.getEventDate();
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
    const title = this.getEventTitle();
    const description = this.getEventDescription();
    const startStr = this.formatDateForICS(start);
    const endStr = this.formatDateForICS(end);
    const now = this.formatDateForICS(new Date());

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Evantix//Event//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `DTSTAMP:${now}`,
      `UID:${this.eventId}@evantix.com`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      `DESCRIPTION:Recordatorio: ${title}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '')}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    this.showCalendarDropdown = false;
  }
}