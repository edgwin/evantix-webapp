import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CuponService } from '../../services/cupon.service';

@Component({
  selector: 'app-pago-dialog',
  templateUrl: './pago-dialog.component.html',
  styleUrl: './pago-dialog.component.css',
})
export class PagoDialogComponent {
  metodoPago: string = "";
  showCupon: boolean = false;
  cuponCodigo: string = '';
  cuponAplicado: boolean = false;
  cuponError: string = '';
  cuponLoading: boolean = false;
  costoOriginal: number = 0;
  descuentoInfo: string = '';

  constructor(
    public dialogRef: MatDialogRef<PagoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cuponService: CuponService
  ) {
    this.costoOriginal = this.data.evento.costo;
  }

  confirmar(event: Event) {
    const target = event.target as HTMLElement | null;
    const metodo = target?.innerText?.trim() || '';
    this.dialogRef.close(metodo);
  }

  cancelar() {
    this.dialogRef.close(null);
  }

  toggleCupon() {
    this.showCupon = !this.showCupon;
    if (!this.showCupon) {
      this.cuponCodigo = '';
      this.cuponError = '';
    }
  }

  aplicarCupon() {
    if (!this.cuponCodigo.trim()) return;

    this.cuponLoading = true;
    this.cuponError = '';

    this.cuponService.aplicarCupon(this.cuponCodigo.trim(), this.data.evento.id).subscribe({
      next: (res: any) => {
        this.cuponAplicado = true;
        this.cuponLoading = false;
        this.data.evento.costo = res.nuevoCosto;

        if (res.tipoDescuento === 'Porcentaje') {
          this.descuentoInfo = `${res.montoDescuento}% de descuento`;
        } else {
          this.descuentoInfo = `$${res.descuento.toFixed(2)} de descuento`;
        }
      },
      error: (err: any) => {
        this.cuponLoading = false;
        this.cuponError = err.error || 'Código no válido';
      }
    });
  }
}
