import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-pago-dialog',
  templateUrl: './pago-dialog.component.html'
})
export class PagoDialogComponent {
  opcionesPago = [
    { label: 'Anticipo (50%)', valor: 0.5 },
    { label: 'Pago Total (100%)', valor: 1.0 }
  ];
  opcionSeleccionada = this.opcionesPago[0].valor;

  constructor(
    public dialogRef: MatDialogRef<PagoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  confirmar() {
    this.dialogRef.close(this.opcionSeleccionada);
  }

  cancelar() {
    this.dialogRef.close(null);
  }
}
