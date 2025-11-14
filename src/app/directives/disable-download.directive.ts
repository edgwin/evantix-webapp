import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appDisableDownload]',
  standalone: true
})
export class DisableDownloadDirective {
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault(); // Bloquea clic derecho
  }

  @HostListener('dragstart', ['$event'])
  onDrag(event: DragEvent) {
    event.preventDefault(); // Bloquea arrastrar imagen
  }

  @HostListener('touchstart', ['$event'])
  onTouch(event: TouchEvent) {
    event.preventDefault(); // Bloquea mantener presionado en móvil
  }
}