import { Component } from '@angular/core';

@Component({
  selector: 'app-upload-images',
  templateUrl: './upload-images.component.html',
  styleUrls: ['./upload-images.component.css']
})
export class UploadImagesComponent {
  images: File[] = [];
  previews: string[] = [];

  onFilesAdded(files: FileList | null): void {
    if (!files) return;
    Array.from(files).forEach(file => this.addFile(file));
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.onFilesAdded(event.dataTransfer.files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  addFile(file: File) {
    if (file.type.startsWith('image/')) {
      this.images.push(file);
      const reader = new FileReader();
      reader.onload = e => this.previews.push((e.target as FileReader).result as string);
      reader.readAsDataURL(file);
    }
  }

  clearAll() {
    this.images = [];
    this.previews = [];
  }

  upload() {
    // Aquí puedes hacer el upload al backend
    console.log('Archivos a subir:', this.images);
  }

  onFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files) {
      this.onFilesAdded(input.files);
    }
  }
}
