import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appDisableDownload]',
  standalone: true
})
export class DisableDownloadDirective {

  private longPressTimer: any = null;
  private readonly LONG_PRESS_MS = 400; // umbral para long-press

  /** Bloquea clic derecho en desktop */
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
  }

  /** Bloquea arrastrar imagen */
  @HostListener('dragstart', ['$event'])
  onDrag(event: DragEvent) {
    event.preventDefault();
  }

  /**
   * En touchstart NO bloqueamos el evento de inmediato (eso cancela el tap).
   * Arrancamos un timer: si el usuario mantiene presionado > 400ms
   * es un long-press (intento de descargar) → lo prevenimos.
   * Si levanta antes → es un tap normal → dejamos pasar el click.
   */
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.longPressTimer = setTimeout(() => {
      // Long-press detectado — cancelar interacción pendiente
      event.preventDefault();
    }, this.LONG_PRESS_MS);
  }

  @HostListener('touchend')
  onTouchEnd() {
    // El usuario levantó el dedo antes del umbral → tap normal → limpiar timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  @HostListener('touchmove')
  onTouchMove() {
    // El usuario movió el dedo → no es long-press ni tap → limpiar
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
}