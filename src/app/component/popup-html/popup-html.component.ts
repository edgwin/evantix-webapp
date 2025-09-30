import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-popup-html',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-html.component.html',
  styleUrls: ['./popup-html.component.css']
})
export class PopupHtmlComponent {
  @Input() visible: boolean = false;
  @Input() title: string = 'Galería';
  // soporte para html en string / SafeHtml (legacy)
  @Input() htmlContent: SafeHtml | string = '';
  // nueva forma: pasar array de imágenes
  @Input() images: string[] | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() imageSelected = new EventEmitter<string>();

  // índice del carrusel (solo se usa si images está presente)
  currentIndex = 0;

  close() {
    this.visible = false;
    this.closed.emit();
  }

  // seleccionar imagen (clic en la imagen)
  selectImage(path: string) {
    this.imageSelected.emit(path);
    this.close();
  }

  prev() {
    if (!this.images || this.images.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  next() {
    if (!this.images || this.images.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }
}
