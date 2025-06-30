import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup-html',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-html.component.html',
  styleUrls: ['./popup-html.component.css']
})
export class PopupHtmlComponent {
  @Input() visible: boolean = false;
  @Input() htmlContent: string = '';
  @Input() title: string = 'Términos y Condiciones';
  @Output() closed = new EventEmitter<void>();

  close() {
    this.visible = false;
    this.closed.emit();
  }
}