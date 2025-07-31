import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-pago-dialog',
  templateUrl: './pago-dialog.component.html',
  styleUrl: './pago-dialog.component.css',
})
export class PagoDialogComponent {
  metodoPago:string = ""
  constructor(
    public dialogRef: MatDialogRef<PagoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  confirmar(event:Event) {
    const target = event.target as HTMLElement | null;
    const metodo = target?.innerText?.trim() || '';
    this.dialogRef.close(metodo);
  }

  cancelar() {
    this.dialogRef.close(null);
  }
}
