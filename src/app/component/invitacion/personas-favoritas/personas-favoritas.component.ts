import { CommonModule } from '@angular/common';
import { Component, Input, HostListener, signal, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { PopupHtmlComponent } from '../../popup-html/popup-html.component';
import { DisableDownloadDirective } from '../../../directives/disable-download.directive';
import { AiEditableDirective } from '../../../directives/ai-editable.directive';
import { TemplateService } from '../../../services/template.service';

@Component({
    selector: 'app-personas-favoritas',
    imports: [CommonModule, PopupHtmlComponent, DisableDownloadDirective, AiEditableDirective],
    templateUrl: './personas-favoritas.component.html',
    styleUrls: ['./personas-favoritas.component.css']
})
export class PersonasFavoritasComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private invitationService: InvitationService,
    private notificationService: NotificationService,
    public templateService: TemplateService
  ) { }
  @Input() eventId: string = '';
  @Input() data: any;
  @Input() height = '60vh';
  @Input() eventType: string = '';
  @Input() isReadOnly: boolean = false;
  @Input() maxItems: number = 99;
  @Input() aiEnabled: boolean = false;
  images: any[] = [];
  editingTituloPF: boolean = false;
  tempTituloPF: string = '';
  showPopup: boolean = false;
  loadingImgs: { [key: string]: boolean } = {};
  showGallery: boolean = true;

  editingFrasePF: boolean = false;
  tempFrasePF: string = '';
  loading: boolean = false;

  private _index = signal(0);

  // swipe state
  private pointerId: number | null = null;
  private startX: number | null = null;
  private lastX: number | null = null;
  private pointerMoved = false;

  // autoplay
  private autoplayIntervalId: any = null;
  autoplayDelay = 3000; // ms
  autoplayEnabled = true;
  animationDirection: 'left' | 'right' | '' = '';

  currentImagen4Popup: string | null = null;
  currentNombre4Popup: string | null = null;
  currentParentesco4Popup: string | null = null;
  currentId4Popup: string = "";

  ngOnInit() {
    this.images = this.data?.details || [];
    if (this.images.length <= 0) {
      this.showGallery = false;
    }
  }

  cargarDatosPF(gotoNew: boolean = false) {
    this.loading = true;
    if (!this.eventId) return;

    this.invitationService.getPersonasFavoritasData(this.eventId).subscribe({
      next: (res) => {
        this.data = res;
        this.images = this.data?.details || [];
        this.loading = false;
        if (this.data?.details.length <= 0) {
          this.showGallery = false;
        } else {
          this.showGallery = true;
        }
        if (gotoNew) {
          this.goTo(this.data.details.length - 1);
        }
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

  ngAfterViewInit() {
    this.startAutoplayIfNeeded();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  // ---------- index helpers ----------
  currentIndex(): number {
    const n = this.images?.length || 0;
    if (n === 0) return 0;
    return ((this._index()) % n + n) % n;
  }

  get currentIndexValue(): number {
    return this.currentIndex();
  }

  prevImg(): string {
    const n = this.images?.length || 0;
    if (n === 0) return '';
    const idx = (this.currentIndex() - 1 + n) % n;
    return this.images[idx]?.foto || '';
  }

  nextImg(): string {
    const n = this.images?.length || 0;
    if (n === 0) return '';
    const idx = (this.currentIndex() + 1) % n;
    return this.images[idx]?.foto || '';
  }

  currentImg(): string {
    const n = this.images?.length || 0;
    if (n === 0) return '';
    return this.images[this.currentIndex()]?.foto || '';
  }

  // ---------- navigation ----------
  private scheduleIndexUpdate(delta: number) {
    const n = this.images.length || 0;
    if (n === 0) return;
    if (delta > 0) {
      this.animationDirection = 'right';
      setTimeout(() => {
        this._index.update(i => (i + 1) % n);
        this.animationDirection = '';
      }, 400);
    } else if (delta < 0) {
      this.animationDirection = 'left';
      setTimeout(() => {
        this._index.update(i => (i - 1 + n) % n);
        this.animationDirection = '';
      }, 400);
    }
  }

  next() {
    this.pauseAutoplay();
    this.scheduleIndexUpdate(1);
    this.resumeAutoplayWithDelay();
  }

  prev() {
    this.pauseAutoplay();
    this.scheduleIndexUpdate(-1);
    this.resumeAutoplayWithDelay();
  }

  goTo(idx: number) {
    this.pauseAutoplay();
    this._index.set(idx);
    this.resumeAutoplayWithDelay();
  }

  // ---------- keyboard ----------
  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.isContentEditable) return;
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'ArrowRight') this.next();
  }

  // ---------- pointer / swipe handlers ----------
  // In your template you already have: (pointerdown)="onPointerDown($event)" (pointerup)="onPointerUp($event)"
  onPointerDown(ev: PointerEvent) {
    // capture pointer to follow moves reliably
    try {
      (ev.target as Element)?.setPointerCapture?.(ev.pointerId);
    } catch { }
    this.pointerId = ev.pointerId;
    this.startX = ev.clientX;
    this.lastX = ev.clientX;
    this.pointerMoved = false;
    this.pauseAutoplay();
  }

  onPointerMove(ev: PointerEvent) {
    if (this.pointerId !== ev.pointerId) return;
    this.lastX = ev.clientX;
    if (this.startX == null) return;
    const diff = ev.clientX - this.startX;
    if (Math.abs(diff) > 10) this.pointerMoved = true;
  }

  onPointerUp(ev: PointerEvent) {
    try {
      (ev.target as Element)?.releasePointerCapture?.(ev.pointerId);
    } catch { }
    if (this.pointerId !== ev.pointerId) {
      this.resetPointerState();
      return;
    }

    if (this.startX == null) {
      this.resetPointerState();
      return;
    }

    const diff = (this.lastX ?? ev.clientX) - this.startX;
    const threshold = 40; // swipe threshold px
    if (diff > threshold) {
      // swipe right -> previous image
      this.scheduleIndexUpdate(-1);
    } else if (diff < -threshold) {
      // swipe left -> next image
      this.scheduleIndexUpdate(1);
    } else {
      // tap/click — do nothing (or optionally treat as click on center)
    }

    this.resetPointerState();
    this.resumeAutoplayWithDelay();
  }

  currentImage(): string {
    const n = this.data?.details.length || 0;
    if (n === 0) return '';
    return this.data?.details[this.currentIndex()]?.foto || '';
  }

  currentNombres(): string {
    const n = this.data?.details.length || 0;
    if (n === 0) return '';
    return this.data?.details[this.currentIndex()]?.nombres || '';
  }

  currentParentesco(): string {
    const n = this.data?.details.length || 0;
    if (n === 0) return '';
    return this.data?.details[this.currentIndex()]?.parentesco || '';
  }

  currentId(): string {
    const n = this.data?.details.length || 0;
    if (n === 0) return '';
    return this.data?.details[this.currentIndex()]?.id || '';
  }

  resetPointerState() {
    this.pointerId = null;
    this.startX = null;
    this.lastX = null;
    this.pointerMoved = false;
  }

  // ---------- autoplay ----------
  startAutoplayIfNeeded() {
    if (!this.autoplayEnabled) return;
    const n = this.images.length || 0;
    if (n <= 1) return;
    this.stopAutoplay();
    this.autoplayIntervalId = setInterval(() => {
      // advance one
      this.animationDirection = 'right';
      const nLocal = this.images.length || 0;
      if (nLocal === 0) return;
      this._index.update(i => (i + 1) % nLocal);
      // clear animation after duration (matches CSS)
      setTimeout(() => this.animationDirection = '', 400);
    }, this.autoplayDelay);
  }

  stopAutoplay() {
    if (this.autoplayIntervalId) {
      clearInterval(this.autoplayIntervalId);
      this.autoplayIntervalId = null;
    }
  }

  pauseAutoplay() {
    this.stopAutoplay();
  }

  resumeAutoplayWithDelay(delay = 2000) {
    // restart autoplay after short delay (so user sees change)
    this.stopAutoplay();
    if (!this.autoplayEnabled) return;
    this.autoplayIntervalId = setTimeout(() => this.startAutoplayIfNeeded(), delay);
  }

  onKeyDown(event: Event | any, maxLength: number) {
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

    if (text.length >= maxLength && !controlKeys.includes(event.key)) {
      event.preventDefault(); // bloquea más escritura
    }
    (event.target as HTMLElement).click();
  }

  onClickTituloPF() {
    this.editingTituloPF = true;
    this.tempTituloPF = this.data.titulo; // 🔹 Guardamos el valor original
  }

  onTituloBlur(event: Event) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== this.data.titulo) {
      this.data.titulo = nuevoTexto;
      this.updateBackend('PersonasFavoritasMaster', 'IdEvento', this.eventId, 'Titulo', this.data.titulo);
    }
  }

  onClickFrasePF() {
    this.editingFrasePF = true;
    this.tempFrasePF = this.data.frase; // 🔹 Guardamos el valor original
  }

  onFraseBlur(event: Event) {
    const el = event.target as HTMLElement;
    const nuevoTexto = el.innerText.trim();

    // si cambió, guardamos y llamamos backend
    if (nuevoTexto !== this.data.frase) {
      this.data.frase = nuevoTexto;
      this.updateBackend('PersonasFavoritasMaster', 'IdEvento', this.eventId, 'Frase', this.data.frase);
    }
  }

  updateBackend(tableName: string, searchField: string, eventId: string, field: string, value: string, loadData: boolean = false) {
    this.invitationService.updateTableField(tableName, searchField, eventId, field, value).subscribe({
      next: () => {
        if (loadData) {
          this.cargarDatosPF();
        }
      },
      error: (err) => {
        this.notificationService.show(
          'error',
          `Error al actualizar ${field}: ${err.message}`
        );
      }
    });
  }

  onOpenPopup() {
    this.currentImagen4Popup = this.currentImage();
    this.currentNombre4Popup = this.currentNombres();
    this.currentParentesco4Popup = this.currentParentesco();
    this.currentId4Popup = this.currentId();
    this.showPopup = true;
  }

  onClosePopup() {
    this.showPopup = false;
    this.cargarDatosPF();
    this.invitationService.notifyMutation(this.eventId);
  }

  addNewPersonaFavorita() {
    this.invitationService.postNewPersonaFavorita(this.eventId).subscribe({
      next: (res) => {
        this.cargarDatosPF(true);
        this.invitationService.notifyMutation(this.eventId);
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

  restoreTituloPF(element: HTMLElement) {
    const original = this.tempTituloPF;
    if (original !== undefined) {
      element.innerText = `${original}`;
    }
    this.editingTituloPF = false;
    element.blur();
  }

  restoreFrasePF(element: HTMLElement) {
    const original = this.tempFrasePF;
    if (original !== undefined) {
      element.innerText = `${original}`;
    }
    this.editingFrasePF = false;
    element.blur();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.editingTituloPF) {
      const element = document.querySelector('#TituloPF') as HTMLElement;
      this.restoreTituloPF(element);
    }

    if (this.editingFrasePF) {
      const element = document.querySelector('#FrasePF') as HTMLElement;
      this.restoreFrasePF(element);
    }
  }
}