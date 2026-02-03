import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvitationService, AiTextRequest } from '../../services/invitation.service';

@Component({
  selector: 'app-ai-text-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-text-widget.component.html',
  styleUrl: './ai-text-widget.component.css'
})
export class AiTextWidgetComponent {
  @Input() section: string = '';
  @Input() currentText: string = '';
  @Input() eventType: string = 'boda'; // xv, boda, bautizo
  @Input() position: { top: number; left: number } = { top: 0, left: 0 };
  
  @Output() textGenerated = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  tone: string = 'formal';
  shortVersion: boolean = false;
  maxLength: number = 200;
  isLoading: boolean = false;
  errorMessage: string = '';
  isExpanded: boolean = false; // NUEVO: controla si está expandido o colapsado

  tones = [
    { value: 'formal', label: 'Formal' },
    { value: 'juvenil', label: 'Juvenil' },
    { value: 'religioso', label: 'Religioso' },
    { value: 'moderno', label: 'Moderno' }
  ];

  constructor(private aiTextService: InvitationService) {}

  // NUEVO: método para toggle expandir/colapsar
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  generateText(): void {
    if (!this.section) {
      this.errorMessage = 'Sección no especificada';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const request: AiTextRequest = {
      section: this.section,
      tone: this.tone,
      eventType: this.eventType,
      currentText: this.currentText || undefined,
      shortVersion: this.shortVersion,
      maxLength: this.maxLength
    };

    this.aiTextService.generateText(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.textGenerated.emit(response.text);
        this.closeWidget();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al generar el texto. Intenta nuevamente.';
        console.error('Error:', error);
      }
    });
  }

  closeWidget(): void {
    this.close.emit();
  }
}