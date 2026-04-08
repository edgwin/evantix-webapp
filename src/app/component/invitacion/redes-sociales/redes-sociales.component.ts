import { Component, Input, HostListener } from '@angular/core';

import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { TemplateService } from '../../../services/template.service';
import { PopupHtmlComponent } from '../../popup-html/popup-html.component';

@Component({
    selector: 'app-redes-sociales',
    imports: [PopupHtmlComponent],
    templateUrl: './redes-sociales.component.html',
    styleUrl: './redes-sociales.component.css'
})
export class RedesSocialesComponent {
  constructor(private invitationService: InvitationService, private notificationService: NotificationService,
    public templateService: TemplateService) { }

  loading: boolean = false;
  tempRedMap: { [id: string]: string } = {};
  tempUrlMap: { [id: string]: string } = {};
  editingRedId: string | null = null;
  editingUrlId: string | null = null;

  @Input() eventId: string = '';
  @Input() data: any;
  @Input() isReadOnly: boolean = false;
  @Input() maxItems: number = 8;

  // Popup para seleccionar icono
  images: string[] = [];
  showPopup = false;
  selectedItemIndex: number | null = null;

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.invitationService.getAssetImages('RedesSociales').subscribe({
      next: (images) => {
        this.images = images;
      },
      error: (err) => {
        console.error('Error al cargar imágenes de redes sociales:', err);
        this.images = [];
      }
    });
  }

  openPopup(index: number) {
    this.selectedItemIndex = index;
    this.showPopup = true;
  }

  onClosePopup() {
    this.showPopup = false;
  }

  async onImageSelected(img: string) {
    if (this.selectedItemIndex !== null) {
      const itemId = this.data.details[this.selectedItemIndex].id;
      this.updateBackend('SocialNetworkDetail', 'Id', itemId, 'Imagen', img, true);
    }
    this.onClosePopup();
  }

  cargarDatos() {
    this.loading = true;
    if (!this.eventId) return;

    this.invitationService.getSocialNetworks(this.eventId).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.show(
          'error',
          `Hubo un error favor intentar más tarde ${err.message}`
        );
        this.loading = false;
      }
    });
  }

  onClickRed(id: string) {
    this.editingRedId = id;
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempRedMap[id] = item.red;
    }
  }

  restoreRed(item: any, element: HTMLElement) {
    const original = this.tempRedMap[item.id];
    if (original !== undefined) {
      element.innerHTML = original;
    }
    this.editingRedId = null;
    element.blur();
  }

  onClickUrl(id: string) {
    this.editingUrlId = id;
    const item = this.data.details.find((d: { id: string }) => d.id === id);
    if (item) {
      this.tempUrlMap[id] = item.url;
    }
  }

  restoreUrl(item: any, element: HTMLElement) {
    const original = this.tempUrlMap[item.id];
    if (original !== undefined) {
      element.innerHTML = original;
    }
    this.editingUrlId = null;
    element.blur();
  }

  maxRedLength = 30;
  onRedKeyDown(event: KeyboardEvent | any) {
    const el = event.target as HTMLElement;
    const text = el.innerText || '';
    const controlKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
      'ArrowUp', 'ArrowDown', 'Tab'
    ];
    if (text.length >= this.maxRedLength && !controlKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  maxUrlLength = 200;
  onUrlKeyDown(event: KeyboardEvent | any) {
    const el = event.target as HTMLElement;
    const text = el.innerText || '';
    const controlKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
      'ArrowUp', 'ArrowDown', 'Tab'
    ];
    if (text.length >= this.maxUrlLength && !controlKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  nuevaRedSocial() {
    this.invitationService.postNewSocialNetwork(this.eventId).subscribe({
      next: () => {
        this.cargarDatos();
      },
      error: (err) => {
        this.notificationService.show(
          'error',
          `Hubo un error favor intentar más tarde ${err.message}`
        );
        this.loading = false;
      }
    });
  }

  triggerElementDelete(socialNetworkId: string) {
    this.invitationService.deleteSocialNetwork(socialNetworkId).subscribe({
      next: (res) => {
        this.cargarDatos();
        this.invitationService.notifyMutation(this.eventId);
      },
      error: (err) => {
        this.notificationService.show(
          'error',
          `Error al eliminar red social: ${err.message}`
        );
      }
    });
  }

  saveContent(event: Event, eventId: string, field: string) {
    const target = event.target as HTMLElement;
    const newText = target.innerText.replace(/\n/g, '<br>');
    const modifyField = field === "red" ? 'Red' : 'Url';
    const originalMap = field === "red" ? this.tempRedMap : this.tempUrlMap;
    if (newText == originalMap[eventId]) {
      return;
    }
    this.updateBackend('SocialNetworkDetail', 'Id', eventId, modifyField, newText);
  }

  updateBackend(tableName: string, searchField: string, eventId: string, field: string, value: string, loadData: boolean = false) {
    this.invitationService.updateTableField(tableName, searchField, eventId, field, value).subscribe({
      next: () => {
        if (loadData) {
          this.cargarDatos();
        }
      },
      error: (err) => {
        this.notificationService.show(
          'error',
          `Error al actualizar ${field}: ${err.message}`
        );
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.editingRedId) {
      const item = this.data.details.find((d: { id: string }) => d.id === this.editingRedId);
      const element = document.querySelector(`[contenteditable][data-id-red-social="${this.editingRedId}"]`) as HTMLElement;
      if (item && element) {
        this.restoreRed(item, element);
      }
    }
    if (this.editingUrlId) {
      const item = this.data.details.find((d: { id: string }) => d.id === this.editingUrlId);
      const element = document.querySelector(`[contenteditable][data-id-url-social="${this.editingUrlId}"]`) as HTMLElement;
      if (item && element) {
        this.restoreUrl(item, element);
      }
    }
  }
}
