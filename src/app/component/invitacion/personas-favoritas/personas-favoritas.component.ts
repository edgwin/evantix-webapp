import { CommonModule } from '@angular/common';
import { Component, Input, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-personas-favoritas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personas-favoritas.component.html',  
  styleUrls: ['./../invitacion.component.css', './personas-favoritas.component.css']
})
export class PersonasFavoritasComponent {
  @Input() data: any;

  /** Altura del componente (puedes pasar '60vh', '400px', etc.) */
  @Input() height = '60vh';
  images: string[] = [];
  
  get currentIndexValue(): number {
    return this.currentIndex();
  }

  ngOnInit(){
    this.images = this.data.details
  }

  private _index = signal(0);
  //currentIndex = this._index; // alias para plantillas si se requiere

  // swipe handling
  private pointerStartX: number | null = null;
  private pointerEndX: number | null = null;

  // --- Helpers para índices (infinito usando modulo)
  currentIndex(): number {
    const n = this.data?.details.length || 0;
    if (n === 0) return 0;
    return ((this._index()) % n + n) % n;
  }

  prevImg(): string {
    const n = this.data?.details.length || 0;
    if (n === 0) return '';
    const idx = (this.currentIndex() - 1 + n) % n;
    return this.data?.details[idx].foto;
  }

  nextImg(): string {
    const n = this.data?.details.length || 0;
    if (n === 0) return '';
    const idx = (this.currentIndex() + 1) % n;
    return this.data?.details[idx].foto;
  }

  currentImg(): string {
    const n = this.data?.details.length || 0;
    if (n === 0) return '';    
    return this.data?.details[this.currentIndex()].foto;
  }

  // Navegación pública
  animationDirection: 'left' | 'right' | '' = '';
  next() {
    const n = this.images.length || 0;
    if (n === 0) return;

    this.animationDirection = 'right';
    setTimeout(() => {
      this._index.update(i => (i + 1) % n);
      this.animationDirection = '';
    }, 400);
  }

  prev() {
    const n = this.images.length || 0;
    if (n === 0) return;

    this.animationDirection = 'left';
    setTimeout(() => {
      this._index.update(i => (i - 1 + n) % n);
      this.animationDirection = '';
    }, 400);
  }

  goTo(idx: number) {
    this._index.set(idx);
  }

  // teclado
  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.isContentEditable) {
      return; // no interferir con inputs
    }
    if (e.key === 'ArrowLeft') { this.prev(); }
    if (e.key === 'ArrowRight') { this.next(); }
  }

  // swipe (pointer events)
  onPointerDown(ev: PointerEvent) {
    this.pointerStartX = ev.clientX;
  }
  onPointerUp(ev: PointerEvent) {
    if (this.pointerStartX == null) { this.pointerStartX = null; return; }
    this.pointerEndX = ev.clientX;
    const diff = this.pointerEndX - this.pointerStartX;
    const threshold = 30; // px
    if (diff > threshold) { this.prev(); }
    else if (diff < -threshold) { this.next(); }
    this.pointerStartX = null;
    this.pointerEndX = null;
  }

  currentParentesco(): string {
    const n = this.data?.details.length || 0;
    if (n === 0) return '';
    return this.data?.details[this.currentIndex()]?.parentesco || '';
  }

  currentNombres(): string {
    const n = this.data?.details.length || 0;
    if (n === 0) return '';
    return this.data?.details[this.currentIndex()]?.nombres || '';
  }
}
