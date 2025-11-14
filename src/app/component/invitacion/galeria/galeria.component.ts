import { Component, HostListener, Input, signal } from '@angular/core';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';
import { DisableDownloadDirective } from '../../../directives/disable-download.directive';

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule, DisableDownloadDirective],
  templateUrl: './galeria.component.html',  
  styleUrls: ['./../invitacion.component.css', './galeria.component.css']
})
export class GaleriaComponent {
  constructor(private invitationService: InvitationService,private notificationService: NotificationService)
    {}
  @Input() eventId: string = '';
  @Input() data: any;
  @Input() height = '60vh';
  images: any[] = []; 
  loading: boolean = false;
  showGallery: boolean = true;
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

  ngOnInit() {
    this.images = this.data || [];
    if (this.images.length <= 0){
      this.showGallery = false;
    }    
  }

  cargarDatos(gotoNew:boolean = false) {
    this.loading = true;
    if (!this.eventId) return;

    this.invitationService.getGaleria(this.eventId).subscribe({
      next: (res) => {
        this.data = res;
        this.images = this.data || [];
        if (this.images.length <= 0){
          this.showGallery = false;
        }else{
          this.showGallery = true;
        }
        this.loading = false;
        if (gotoNew){
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
    return this.images[idx]?.imagen || '';
  }

  nextImg(): string {
    const n = this.images?.length || 0;
    if (n === 0) return '';
    const idx = (this.currentIndex() + 1) % n;
    return this.images[idx]?.imagen || '';
  }

  currentImg(): string {
    const n = this.images?.length || 0;
    if (n === 0) return '';
    return this.images[this.currentIndex()]?.imagen || '';
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
    } catch {}
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
    } catch {}
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
    const n = this.data?.length || 0;
    if (n === 0) return '';
    return this.data[this.currentIndex()]?.imagen || '';
  }

  currentNombres(): string {
    const n = this.data?.length || 0;
    if (n === 0) return '';
    return this.data[this.currentIndex()]?.nombres || '';
  }

  currentParentesco(): string {
    const n = this.data?.length || 0;
    if (n === 0) return '';
    return this.data[this.currentIndex()]?.parentesco || '';
  }

  currentId(): string {
    const n = this.data?.length || 0;
    if (n === 0) return '';
    return this.data[this.currentIndex()]?.id || '';
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

  onKeyDown(event: KeyboardEvent | any, maxLength:number) {
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

  triggerImageDelete() {
    const fotoId = this.currentId();
    this.invitationService.deleteGaleria(fotoId).subscribe({
        next: (res) => {
          this.cargarDatos();
        },
        error: (err) => {          
          this.notificationService.show(
            'error',
            `Error al subir imagen: ${err.message}`
          );
        }
      });
  }

  imagesToUpload: any[] = [];
  triggerImageUpload(event: any) {
    this.loading = true;
    const selectedFiles = Array.from(event.target.files) as File[];
    if (!selectedFiles.length) return;

    const readPromises = selectedFiles.map(file => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagesToUpload.push({
            preview: e.target.result,
            file
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(readPromises).then(() => {
      this.bulkImagesUpload();
    });
  }

  bulkImagesUpload(){
    if (this.imagesToUpload.length === 0) {
      this.notificationService.show('error','No hay imágenes para subir');
      return;
    }

    const formData = new FormData();

    this.imagesToUpload.forEach((img, i) => {
      formData.append('images', img.file, img.file.name);
    });

    this.invitationService.uploadGaleria(this.eventId, formData).subscribe({
      next: (res) => {
        this.data = res;
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

  selectedImage: string | null = null;

  openFullScreen() {
    const imgUrl: string = this.currentImg();
    this.selectedImage = imgUrl;
    document.body.style.overflow = 'hidden'; // bloquea scroll del fondo
  }

  closeFullScreen() {
    this.selectedImage = null;
    document.body.style.overflow = 'auto'; // restablece scroll
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
  }
}
