import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WhatsAppMasivoService } from '../../services/whatsapp-masivo.service';

@Component({
    selector: 'app-whatsapp-paquete-dialog',
    templateUrl: './whatsapp-paquete-dialog.component.html',
    styleUrl: './whatsapp-paquete-dialog.component.css',
})
export class WhatsAppPaqueteDialogComponent {
    paquetes = [
        { mensajes: 50, precio: 149, popular: false },
        { mensajes: 100, precio: 199, popular: true },
        { mensajes: 200, precio: 249, popular: false },
        { mensajes: 300, precio: 299, popular: false }
    ];
    selectedPaquete: any = null;
    purchasing = false;
    error = '';

    constructor(
        public dialogRef: MatDialogRef<WhatsAppPaqueteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private whatsAppService: WhatsAppMasivoService
    ) { }

    selectPaquete(paquete: any) {
        this.selectedPaquete = paquete;
        this.error = '';
    }

    comprar() {
        if (!this.selectedPaquete) return;
        // Cerrar con la info del paquete seleccionado — el pago se procesa en invitados
        this.dialogRef.close(this.selectedPaquete);
    }

    cancelar() {
        this.dialogRef.close(null);
    }

    getPrecioPerMsg(paquete: any): string {
        return (paquete.precio / paquete.mensajes).toFixed(2);
    }
}
