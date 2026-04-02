import { Component, ElementRef, Input, ViewChild } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-photo-uploader',
    imports: [],
    templateUrl: './photo-uploader.component.html',
    styleUrls: ['./../invitacion.component.css', './photo-uploader.component.css']
})
export class PhotoUploaderComponent {    
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Input() eventId: string = '';
  
  previews: string[] = [];
  isDragging = false;
  isUploading = false;

  private readonly allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/heic',
    'image/heif'
  ];

  private readonly uploadUrl = 'https://TU_BACKEND/api/photos/upload';

  constructor(private http: HttpClient, private invitationService: InvitationService, private notificationService: NotificationService) {}

  openFileDialog() {
    this.fileInput.nativeElement.click();
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.handleFiles(Array.from(input.files));
    input.value = '';
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    if (!event.dataTransfer?.files.length) return;
    this.handleFiles(Array.from(event.dataTransfer.files));
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave() {
    this.isDragging = false;
  }

  private handleFiles(files: File[]) {
    const validFiles = files.filter(f => this.allowedTypes.includes(f.type));

    if (!validFiles.length) {
      alert('Formato no permitido');
      return;
    }

    this.generatePreviews(validFiles);
    this.uploadFiles(validFiles);
  }

  private generatePreviews(files: File[]) {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => this.previews.push(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  private uploadFiles(files: File[]) {
    this.isUploading = true;

    this.invitationService.uploadGaleria(this.eventId, files).subscribe({
      next: () => {
        this.isUploading = false;
      },
      error: (err) => {
        this.notificationService.show(
          'error',
          `Hubo un error favor intentar más tarde ${err.message}`
        );
        this.isUploading = false;
      }
    });    
  }
}
