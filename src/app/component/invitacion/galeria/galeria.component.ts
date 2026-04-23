import { Component, HostListener, Input, signal } from '@angular/core';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';
import { DisableDownloadDirective } from '../../../directives/disable-download.directive';
import { TemplateService } from '../../../services/template.service';

@Component({
    selector: 'app-galeria',
    imports: [CommonModule, DisableDownloadDirective],
    templateUrl: './galeria.component.html',
    styleUrls: ['./galeria.component.css']
})
export class GaleriaComponent {
  constructor(
    private invitationService: InvitationService,
    private notificationService: NotificationService,
    public templateService: TemplateService
  ) { }

  @Input() eventId: string = '';
  @Input() data: any;
  @Input() height = '60vh';
  @Input() isReadOnly: boolean = false;
  @Input() maxItems: number = 99;

  images: any[] = [];
  loading: boolean = false;
  showGallery: boolean = true;
  private _index = signal(0);

  // swipe state
  private pointerId: number | null = null;
  private startX: number | null = null;
  private lastX: number | null = null;
  private pointerMoved = false;
  private pointerDownTarget: EventTarget | null = null;

  // autoplay
  private autoplayIntervalId: any = null;
  autoplayDelay = 3000; // ms
  autoplayEnabled = true;
  animationDirection: 'left' | 'right' | '' = '';

  ngOnInit() {
    this.images = this.data || [];
    if (this.images.length <= 0) {
      this.showGallery = false;
    }
    this.updateCachedImages();
  }

  cargarDatos(gotoNew: boolean = false) {
    this.loading = true;
    if (!this.eventId) return;

    this.invitationService.getGaleria(this.eventId).subscribe({
      next: (res) => {
        this.data = res;
        this.images = this.data || [];
        if (this.images.length <= 0) {
          this.showGallery = false;
        } else {
          this.showGallery = true;
        }
        this.updateCachedImages();
        this.loading = false;
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

  // Cached image URLs to avoid recalculation on every change detection
  cachedPrevImg: string = '';
  cachedCurrentImg: string = '';
  cachedNextImg: string = '';

  // ---------- index helpers ----------
  currentIndex(): number {
    const n = this.images?.length || 0;
    if (n === 0) return 0;
    return ((this._index()) % n + n) % n;
  }

  get currentIndexValue(): number {
    return this.currentIndex();
  }

  private updateCachedImages(): void {
    const n = this.images?.length || 0;
    if (n === 0) {
      this.cachedPrevImg = '';
      this.cachedCurrentImg = '';
      this.cachedNextImg = '';
      return;
    }
    const currentIdx = this.currentIndex();
    const prevIdx = (currentIdx - 1 + n) % n;
    const nextIdx = (currentIdx + 1) % n;

    this.cachedPrevImg = this.images[prevIdx]?.imagen || '';
    this.cachedCurrentImg = this.images[currentIdx]?.imagen || '';
    this.cachedNextImg = this.images[nextIdx]?.imagen || '';
  }

  prevImg(): string { return this.cachedPrevImg; }
  nextImg(): string { return this.cachedNextImg; }
  currentImg(): string { return this.cachedCurrentImg; }

  // ---------- navigation ----------
  private scheduleIndexUpdate(delta: number) {
    const n = this.images.length || 0;
    if (n === 0) return;
    if (delta > 0) {
      this.animationDirection = 'right';
      setTimeout(() => {
        this._index.update(i => (i + 1) % n);
        this.updateCachedImages();
        this.animationDirection = '';
      }, 400);
    } else if (delta < 0) {
      this.animationDirection = 'left';
      setTimeout(() => {
        this._index.update(i => (i - 1 + n) % n);
        this.updateCachedImages();
        this.animationDirection = '';
      }, 400);
    }
  }

  next() { this.pauseAutoplay(); this.scheduleIndexUpdate(1); this.resumeAutoplayWithDelay(); }
  prev() { this.pauseAutoplay(); this.scheduleIndexUpdate(-1); this.resumeAutoplayWithDelay(); }

  goTo(idx: number) {
    this.pauseAutoplay();
    this._index.set(idx);
    this.updateCachedImages();
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
  onPointerDown(ev: PointerEvent) {
    try { (ev.target as Element)?.setPointerCapture?.(ev.pointerId); } catch { }
    this.pointerId = ev.pointerId;
    this.startX = ev.clientX;
    this.lastX = ev.clientX;
    this.pointerMoved = false;
    this.pointerDownTarget = ev.target;
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
    try { (ev.target as Element)?.releasePointerCapture?.(ev.pointerId); } catch { }
    if (this.pointerId !== ev.pointerId) { this.resetPointerState(); return; }
    if (this.startX == null) { this.resetPointerState(); return; }

    const diff = (this.lastX ?? ev.clientX) - this.startX;
    const threshold = 40;
    if (diff > threshold) {
      this.scheduleIndexUpdate(-1);
    } else if (diff < -threshold) {
      this.scheduleIndexUpdate(1);
    } else if (!this.pointerMoved) {
      // Pure tap — if on the center image, open fullscreen
      const target = this.pointerDownTarget as HTMLElement | null;
      if (target?.classList.contains('center-img')) {
        this.openFullScreen();
      }
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
    this.pointerDownTarget = null;
  }

  // ---------- autoplay ----------
  startAutoplayIfNeeded() {
    if (!this.autoplayEnabled) return;
    const n = this.images.length || 0;
    if (n <= 1) return;
    this.stopAutoplay();
    this.autoplayIntervalId = setInterval(() => {
      this.animationDirection = 'right';
      const nLocal = this.images.length || 0;
      if (nLocal === 0) return;
      this._index.update(i => (i + 1) % nLocal);
      this.updateCachedImages();
      setTimeout(() => this.animationDirection = '', 400);
    }, this.autoplayDelay);
  }

  stopAutoplay() {
    if (this.autoplayIntervalId) {
      clearInterval(this.autoplayIntervalId);
      this.autoplayIntervalId = null;
    }
  }

  pauseAutoplay() { this.stopAutoplay(); }

  resumeAutoplayWithDelay(delay = 2000) {
    this.stopAutoplay();
    if (!this.autoplayEnabled) return;
    this.autoplayIntervalId = setTimeout(() => this.startAutoplayIfNeeded(), delay);
  }

  onKeyDown(event: Event | any, maxLength: number) {
    const key = (event as KeyboardEvent).key;
    if (key === 'Enter' && !(event as KeyboardEvent).shiftKey) {
      event.preventDefault();
      (event.target as HTMLElement).blur();
      return;
    }
    const el = event.target as HTMLElement;
    const text = el.innerText || '';
    const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'];
    if (text.length >= maxLength && !controlKeys.includes(event.key)) {
      event.preventDefault();
    }
    (event.target as HTMLElement).click();
  }

  triggerImageDelete() {
    const fotoId = this.currentId();
    this.invitationService.deleteGaleria(fotoId).subscribe({
      next: () => {
        this.cargarDatos();
        this.invitationService.notifyMutation(this.eventId);
      },
      error: (err) => {
        this.notificationService.show('error', `Error al eliminar imagen: ${err.message}`);
      }
    });
  }

  // Compress image to max 1920px / 80% quality using Canvas API
  private compressImage(file: File, maxPx = 1920, quality = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target!.result as string;
        img.onload = () => {
          let { width, height } = img;
          if (width > maxPx || height > maxPx) {
            if (width > height) { height = Math.round(height * maxPx / width); width = maxPx; }
            else                { width  = Math.round(width  * maxPx / height); height = maxPx; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => resolve(new File([blob!], file.name, { type: 'image/jpeg' })),
            'image/jpeg', quality
          );
        };
      };
      reader.readAsDataURL(file);
    });
  }

  triggerImageUpload(event: any) {
    let selectedFiles = Array.from(event.target.files) as File[];
    if (!selectedFiles.length) return;

    if (!this.eventId) {
      this.notificationService.show('error', 'No se encontró el ID del evento');
      return;
    }

    const currentCount = this.data?.length || 0;
    const availableSlots = this.maxItems - currentCount;

    if (availableSlots <= 0) {
      this.notificationService.show('error', `Ya alcanzaste el máximo de ${this.maxItems} fotos en esta sección.`);
      event.target.value = '';
      return;
    }

    const originalCount = selectedFiles.length;
    if (selectedFiles.length > availableSlots) {
      selectedFiles = selectedFiles.slice(0, availableSlots);
    }

    event.target.value = '';
    this.loading = true;

    const warningMsg = originalCount > availableSlots
      ? `⚠️ Solo se subirán ${availableSlots} de las ${originalCount} fotos seleccionadas (máximo ${this.maxItems}).`
      : `Comprimiendo y subiendo ${selectedFiles.length} imagen(es)... Este proceso puede tardar varios minutos.`;
    this.notificationService.show('info', warningMsg, true);

    Promise.all(selectedFiles.map(f => this.compressImage(f))).then(compressed => {
      this.invitationService.uploadGaleria(this.eventId, compressed).subscribe({
        next: (res) => {
          this.notificationService.clear();
          this.data = res;
          this.cargarDatos();
          this.invitationService.notifyMutation(this.eventId);
          this.notificationService.show('success', 'Imágenes subidas correctamente');
        },
        error: (err) => {
          this.notificationService.clear();
          this.notificationService.show('error', `Hubo un error favor intentar más tarde ${err.message}`);
          this.loading = false;
        }
      });
    });
  }

  selectedImage: string | null = null;

  openFullScreen() {
    const imgUrl: string = this.currentImg();
    if (!imgUrl) return;
    this.selectedImage = imgUrl;
    document.body.style.overflow = 'hidden';
  }

  closeFullScreen() {
    this.selectedImage = null;
    document.body.style.overflow = 'auto';
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.selectedImage) this.closeFullScreen();
  }
}
