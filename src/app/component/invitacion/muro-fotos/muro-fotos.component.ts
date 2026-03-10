import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { TemplateService } from '../../../services/template.service';
import { DisableDownloadDirective } from '../../../directives/disable-download.directive';

@Component({
    selector: 'app-muro-fotos',
    templateUrl: './muro-fotos.component.html',
    styleUrls: ['./muro-fotos.component.css'],
    standalone: true,
    imports: [CommonModule, DisableDownloadDirective]
})
export class MuroFotosComponent implements OnInit {
    @Input() eventId: string = '';
    @Input() isReadOnly: boolean = false;
    @Input() isGuestView: boolean = false;
    @Input() idInvitacion: string | null = null;
    @Input() maxItems: number = 200;

    fotos: any[] = [];
    loading: boolean = false;
    uploading: boolean = false;

    constructor(
        private invitationService: InvitationService,
        private notificationService: NotificationService,
        public templateService: TemplateService
    ) { }

    ngOnInit(): void {
        this.cargarFotos();
    }

    cargarFotos(): void {
        if (!this.eventId) return;
        this.loading = true;
        this.invitationService.getFotosInvitados(this.eventId, this.idInvitacion ?? undefined).subscribe({
            next: (res) => {
                this.fotos = res || [];
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
                console.error('Error cargando fotos de invitados:', err);
            }
        });
    }

    get canUpload(): boolean {
        return this.isGuestView;
    }

    deleteFoto(fotoId: string): void {
        if (!confirm('¿Eliminar esta foto?')) return;
        this.invitationService.deleteFotoInvitado(fotoId).subscribe({
            next: () => this.cargarFotos(),
            error: (err: any) => this.notificationService.show('error', 'Error al eliminar foto')
        });
    }

    triggerUpload(): void {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = (event: any) => {
            let files: File[] = Array.from(event.target.files);
            if (!files.length) return;

            const slotsAvailable = this.maxItems - this.fotos.length;

            if (slotsAvailable <= 0) {
                this.notificationService.show(
                    'warning',
                    `Ya se alcanzó el límite máximo de ${this.maxItems} fotos.`
                );
                return;
            }

            if (files.length > slotsAvailable) {
                this.notificationService.show(
                    'warning',
                    `⚠️ Solo se subirán ${slotsAvailable} de las ${files.length} fotos seleccionadas (máximo ${this.maxItems}).`
                );
                files = files.slice(0, slotsAvailable);
            }

            this.uploading = true;
            this.notificationService.show(
                'info',
                `Subiendo ${files.length} foto(s)... Este proceso puede tardar varios minutos.`
            );

            this.invitationService.uploadFotosInvitados(this.eventId, files, this.idInvitacion ?? undefined).subscribe({
                next: (res) => {
                    this.fotos = res || [];
                    this.uploading = false;
                    this.notificationService.show(
                        'success',
                        `¡${files.length} foto(s) subida(s) exitosamente!`
                    );
                },
                error: (err) => {
                    this.uploading = false;
                    this.notificationService.show(
                        'error',
                        `Error al subir fotos: ${err.message}`
                    );
                }
            });
        };
        input.click();
    }
}
