import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-acciones-cell-renderer',
  template: `
    <button 
      (click)="onPay()" 
      [disabled]="isPaid" 
      title="Pagar" 
      style="background: none; border: none; cursor: pointer;"
    >
      💳
    </button>
    <button 
      (click)="onEdit()" 
      title="Editar" 
      style="margin-right: 8px; background: none; border: none; cursor: pointer;"
    >
      ✏️
    </button>
    <button 
      (click)="onDelete()" 
      title="Eliminar" 
      style="background: none; border: none; cursor: pointer;"
    >
      🗑️
    </button>
  `
})
export class AccionesCellRendererComponent implements ICellRendererAngularComp {
  params: any;
  isPaid = false;

  agInit(params: any): void {
    this.params = params;
    const status = params?.data?.estatus?.toUpperCase?.() || '';
    this.isPaid = !params?.data?.showPayment;
  }

  refresh(params: any): boolean {
    return false;
  }

  onEdit() {
    if (this.params.onEdit) {
      this.params.onEdit(this.params.data);
    }
  }

  onDelete() {
    if (this.params.onDelete) {
      this.params.onDelete(this.params.data);
    }
  }

  onPay() {
    if (!this.isPaid && this.params.onPay) {
      this.params.onPay(this.params.data);
    }
  }
}
