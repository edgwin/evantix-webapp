import { Component, OnInit } from '@angular/core';
import { CuponService } from '../../services/cupon.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-descuentos',
    templateUrl: './descuentos.component.html',
    styleUrls: ['./descuentos.component.css'],
    standalone: false
})
export class DescuentosComponent implements OnInit {
    cupones: any[] = [];
    loading = true;
    showForm = false;

    nuevoCupon: any = {
        codigo: '',
        tipoDescuento: 1,
        montoDescuento: 0,
        cantidad: 1,
        email: '',
        fechaVencimiento: ''
    };

    constructor(private cuponService: CuponService, private notificationService: NotificationService) { }

    ngOnInit(): void {
        this.loadCupones();
    }

    loadCupones() {
        this.loading = true;
        this.cuponService.getCupones().subscribe({
            next: (res: any) => {
                this.cupones = res;
                this.loading = false;
            },
            error: () => {
                this.notificationService.show('error', 'Error al cargar cupones');
                this.loading = false;
            }
        });
    }

    toggleForm() {
        this.showForm = !this.showForm;
        if (this.showForm) {
            this.resetForm();
        }
    }

    resetForm() {
        this.nuevoCupon = {
            codigo: '',
            tipoDescuento: 1,
            montoDescuento: 0,
            cantidad: 1,
            email: '',
            fechaVencimiento: ''
        };
    }

    autogenerarCodigo() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.nuevoCupon.codigo = code;
    }

    isFormValid(): boolean {
        return this.nuevoCupon.codigo?.trim() &&
            this.nuevoCupon.cantidad > 0 &&
            this.nuevoCupon.montoDescuento > 0 &&
            this.nuevoCupon.fechaVencimiento;
    }

    guardarCupon() {
        if (!this.isFormValid()) {
            this.notificationService.show('error', 'Completa los campos: Código, Monto, Cantidad y Fecha de Vencimiento');
            return;
        }

        const payload = {
            ...this.nuevoCupon,
            tipoDescuento: Number(this.nuevoCupon.tipoDescuento),
            email: this.nuevoCupon.email?.trim() || null
        };

        this.cuponService.crearCupon(payload).subscribe({
            next: () => {
                this.notificationService.show('info', 'Cupón creado exitosamente');
                this.showForm = false;
                this.loadCupones();
            },
            error: (err: any) => {
                this.notificationService.show('error', `Error al crear cupón: ${err.error}`);
            }
        });
    }

    getTipoLabel(tipo: number): string {
        return tipo === 1 ? 'Porcentaje' : 'Dinero';
    }

    getDescuentoDisplay(cupon: any): string {
        return cupon.tipoDescuento === 1 ? `${cupon.montoDescuento}%` : `$${cupon.montoDescuento.toFixed(2)}`;
    }

    isExpired(fecha: string): boolean {
        return new Date(fecha) < new Date();
    }
}
