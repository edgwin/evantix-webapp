import { Component, HostListener, Input, OnInit } from '@angular/core';

import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { TemplateService } from '../../../services/template.service';
import { DisableDownloadDirective } from '../../../directives/disable-download.directive';

@Component({
    selector: 'app-muro-fotos',
    templateUrl: './muro-fotos.component.html',
    styleUrls: ['./muro-fotos.component.css'],
    imports: [DisableDownloadDirective]
})
export class MuroFotosComponent implements OnInit {
    @Input() eventId: string = '';
    @Input() isReadOnly: boolean = false;
    @Input() isGuestView: boolean = false;
    @Input() idInvitacion: string | null = null;
    @Input() maxItems: number = 200;
    @Input() allowUpload: boolean = true;
    @Input() isBeforeEvent: boolean = false;

    fotos: any[] = [];
    loading: boolean = false;
    uploading: boolean = false;

    // Lightbox
    selectedImage: string | null = null;

    // Detecta si el dispositivo es touch (para mostrar botón eliminar siempre visible)
    isTouchDevice: boolean = window.matchMedia('(hover: none)').matches || ('ontouchstart' in window);

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
        return this.isGuestView && this.allowUpload;
    }

    deleteFoto(fotoId: string, event: MouseEvent): void {
        event.stopPropagation(); // evita abrir el lightbox al eliminar
        if (!confirm('¿Eliminar esta foto?')) return;
        this.invitationService.deleteFotoInvitado(fotoId, this.idInvitacion!).subscribe({
            next: () => this.cargarFotos(),
            error: (err: any) => this.notificationService.show('error', 'Error al eliminar foto')
        });
    }

    // ---------- Lightbox ----------
    openFullScreen(imgUrl: string): void {
        if (!imgUrl) return;
        this.selectedImage = imgUrl;
        document.body.style.overflow = 'hidden';
    }

    closeFullScreen(): void {
        this.selectedImage = null;
        document.body.style.overflow = 'auto';
    }

    onLightboxBackdropClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('lightbox-overlay')) {
            this.closeFullScreen();
        }
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.selectedImage) this.closeFullScreen();
    }

    onFileSelected(event: any): void {
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
                // Limpiar el input para permitir subir las mismas fotos si se desea
                event.target.value = '';
            },
            error: (err) => {
                this.uploading = false;
                this.notificationService.show(
                    'error',
                    `Error al subir fotos: ${err.message}`
                );
                event.target.value = '';
            }
        });
    }
}
