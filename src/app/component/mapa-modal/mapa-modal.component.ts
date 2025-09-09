// mapa-modal.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-mapa-modal',
  template: `
    <h2 mat-dialog-title>Selecciona la ubicación</h2>
    <mat-dialog-content class="mapa-container">
      <google-map 
        height="400px" 
        width="100%" 
        [center]="center"
        [zoom]="15"
        (mapClick)="seleccionarUbicacion($event)">
        <map-marker *ngIf="marker" [position]="marker"></map-marker>
      </google-map>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="guardar()">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .mapa-container {
      width: 100%;
      height: 400px;
    }
  `]
})
export class MapaModalComponent {
  center: google.maps.LatLngLiteral = { lat: 19.4326, lng: -99.1332 }; // CDMX default
  marker: google.maps.LatLngLiteral | null = null;

  constructor(
    private dialogRef: MatDialogRef<MapaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data?.ubicacion) {
      const match = data.ubicacion.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        this.center = { lat, lng };
        this.marker = this.center;
      }
    }
  }

  seleccionarUbicacion(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.marker = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
    }
  }

  cancelar() {
    this.dialogRef.close();
  }

  guardar() {
    if (this.marker) {
      const url = `https://www.google.com/maps?q=${this.marker.lat},${this.marker.lng}`;
      this.dialogRef.close(url);
    }
  }
}
