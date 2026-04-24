import { Component, OnInit, HostListener } from '@angular/core';
import { InvitationService } from '../../services/invitation.service';
import { InvitadoService } from '../../services/invitado.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-fotos-invitados',
  templateUrl: './fotos-invitados.component.html',
  styleUrls: ['./fotos-invitados.component.css'],
  standalone: false
})
export class FotosInvitadosComponent implements OnInit {

  // Event selector
  paidEvents: any[] = [];
  selectedEventId: string = '';
  selectedEventName: string = '';
  loadingEvents: boolean = true;
  isAdmin: boolean = false;

  // Photos
  fotos: any[] = [];
  loadingFotos: boolean = false;

  // Selection for batch download / delete
  selectedIds: Set<string> = new Set();
  selectionMode: boolean = false;

  // Lightbox
  lightboxImage: string | null = null;
  lightboxIndex: number = -1;

  // Zip download state
  downloading: boolean = false;
  downloadProgress: number = 0;

  constructor(
    private invitationService: InvitationService,
    private invitadoService: InvitadoService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const localUser = localStorage.getItem('loggedUser');
    if (localUser) {
      const user = JSON.parse(localUser);
      this.isAdmin = user?.role?.toUpperCase() === 'ADMIN';
      this.loadPaidEvents(user.userId);
    }
  }

  loadPaidEvents(userId: string) {
    this.loadingEvents = true;
    const SECTION = 'MuroFotos';
    const obs = this.isAdmin
      ? this.invitadoService.getAllPaidEvents(SECTION)
      : this.invitadoService.getPaidEvents(userId, SECTION);

    obs.subscribe({
      next: (events: any[]) => {
        this.paidEvents = events;
        this.loadingEvents = false;
        if (events.length === 1) {
          this.selectedEventId = events[0].id;
          this.selectedEventName = events[0].nombre;
          this.loadFotos();
        }
      },
      error: () => {
        this.notificationService.show('error', 'Error al cargar eventos');
        this.loadingEvents = false;
      }
    });
  }

  onEventChange() {
    const evt = this.paidEvents.find(e => e.id === this.selectedEventId);
    this.selectedEventName = evt?.nombre || '';
    this.fotos = [];
    this.selectedIds.clear();
    this.selectionMode = false;
    if (this.selectedEventId) this.loadFotos();
  }

  loadFotos() {
    if (!this.selectedEventId) return;
    this.loadingFotos = true;
    this.invitationService.getAllFotosInvitadosAdmin(this.selectedEventId).subscribe({
      next: (res) => {
        this.fotos = res || [];
        this.loadingFotos = false;
      },
      error: () => {
        this.notificationService.show('error', 'Error al cargar fotos');
        this.loadingFotos = false;
      }
    });
  }

  // ─── Selection ────────────────────────────────────────────────────────────

  toggleSelectionMode() {
    this.selectionMode = !this.selectionMode;
    if (!this.selectionMode) this.selectedIds.clear();
  }

  toggleSelect(id: string, event: MouseEvent) {
    event.stopPropagation();
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  selectAll() {
    this.fotos.forEach(f => this.selectedIds.add(f.id));
  }

  clearSelection() {
    this.selectedIds.clear();
  }

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  get selectedCount(): number {
    return this.selectedIds.size;
  }

  // ─── Lightbox ─────────────────────────────────────────────────────────────

  openLightbox(index: number) {
    if (this.selectionMode) return;
    this.lightboxIndex = index;
    this.lightboxImage = this.fotos[index]?.imagen;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightboxImage = null;
    this.lightboxIndex = -1;
    document.body.style.overflow = '';
  }

  prevImage() {
    if (this.lightboxIndex > 0) {
      this.lightboxIndex--;
      this.lightboxImage = this.fotos[this.lightboxIndex]?.imagen;
    }
  }

  nextImage() {
    if (this.lightboxIndex < this.fotos.length - 1) {
      this.lightboxIndex++;
      this.lightboxImage = this.fotos[this.lightboxIndex]?.imagen;
    }
  }

  onLightboxBackdrop(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('fi-lightbox')) {
      this.closeLightbox();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!this.lightboxImage) return;
    if (event.key === 'Escape') this.closeLightbox();
    if (event.key === 'ArrowLeft') this.prevImage();
    if (event.key === 'ArrowRight') this.nextImage();
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  deleteFoto(id: string, event: MouseEvent) {
    event.stopPropagation();
    if (!confirm('¿Eliminar esta foto permanentemente?')) return;
    this.invitationService.deleteFotoInvitadoAdmin(id).subscribe({
      next: () => {
        this.fotos = this.fotos.filter(f => f.id !== id);
        this.selectedIds.delete(id);
        this.notificationService.show('success', 'Foto eliminada');
      },
      error: () => this.notificationService.show('error', 'Error al eliminar la foto')
    });
  }

  deleteSelected() {
    if (!this.selectedIds.size) return;
    if (!confirm(`¿Eliminar ${this.selectedIds.size} foto(s) permanentemente?`)) return;
    const ids = [...this.selectedIds];
    let completed = 0;
    ids.forEach(id => {
      this.invitationService.deleteFotoInvitadoAdmin(id).subscribe({
        next: () => {
          completed++;
          this.fotos = this.fotos.filter(f => f.id !== id);
          this.selectedIds.delete(id);
          if (completed === ids.length) {
            this.notificationService.show('success', `${ids.length} foto(s) eliminada(s)`);
          }
        },
        error: () => this.notificationService.show('error', `Error al eliminar foto ${id}`)
      });
    });
  }

  // ─── Download ZIP ─────────────────────────────────────────────────────────

  downloadZip() {
    const toDownloadIds = this.selectedIds.size > 0
      ? [...this.selectedIds]
      : [];  // empty = backend takes all

    const count = this.selectedIds.size > 0 ? this.selectedIds.size : this.fotos.length;
    if (!count) {
      this.notificationService.show('warning', 'No hay fotos para descargar');
      return;
    }

    this.downloading = true;
    this.downloadProgress = 0;
    this.notificationService.show('info', `Preparando ${count} foto(s)... Esto puede tomar unos segundos.`);

    this.invitationService.downloadFotosZip(this.selectedEventId, toDownloadIds).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fotos-${this.selectedEventName || 'invitados'}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        this.downloading = false;
        this.notificationService.show('success', `✅ ${count} foto(s) descargada(s)`);
      },
      error: () => {
        this.downloading = false;
        this.notificationService.show('error', 'Error al generar el archivo ZIP');
      }
    });
  }
}
