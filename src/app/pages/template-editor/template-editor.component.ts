import { Component, OnInit } from '@angular/core';
import { InvitationService } from '../../services/invitation.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-template-editor',
    templateUrl: './template-editor.component.html',
    styleUrls: ['./template-editor.component.css'],
    standalone: false
})
export class TemplateEditorComponent implements OnInit {
  templates: any[] = [];
  loading = true;
  showForm = false;
  editingId: string | null = null;
  saving = false;

  categories = [
    { value: 'boda', label: 'Boda' },
    { value: 'xv', label: 'XV Años' },
    { value: 'bautizo', label: 'Bautizo' },
    { value: 'graduacion', label: 'Graduación' },
    { value: 'cumpleanos', label: 'Cumpleaños' },
    { value: 'religioso', label: 'Religioso' },
    { value: 'aniversario', label: 'Aniversario' },
    { value: 'general', label: 'General' }
  ];

  styles = [
    { value: 'moderno', label: 'Moderno' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'elegante', label: 'Elegante' },
    { value: 'romantico', label: 'Romántico' },
    { value: 'minimalista', label: 'Minimalista' }
  ];

  fontOptions = [
    "'Playfair Display', serif",
    "'Great Vibes', cursive",
    "'Sacramento', cursive",
    "'Dancing Script', cursive",
    "'Cormorant Garamond', serif",
    "'Crimson Text', serif",
    "'Cinzel', serif",
    "'Fredoka One', cursive",
    "'Baloo 2', cursive",
    "'Poppins', sans-serif",
    "'Montserrat', sans-serif",
    "'Lato', sans-serif",
    "'Open Sans', sans-serif",
    "'Raleway', sans-serif",
    "'Quicksand', sans-serif",
    "'Nunito', sans-serif",
    "'Inter', sans-serif",
    "'Work Sans', sans-serif",
    "'Source Sans Pro', sans-serif",
    "'EB Garamond', serif",
    "'Nunito Sans', sans-serif"
  ];

  form: any = this.getEmptyForm();

  constructor(
    private invitationService: InvitationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  getEmptyForm(): any {
    return {
      key: '',
      name: '',
      category: 'general',
      style: 'moderno',
      preview: '',
      theme: {
        colors: {
          primary: '#2a0054',
          primaryDark: '#1a0034',
          shadow: 'rgba(42,0,84,0.3)',
          secondary: '#5e0099',
          background: '#FFFFFF',
          backgroundAlt: '#F5F5F5',
          text: '#1A1A1A',
          textLight: '#999999',
          accent: '#D4AF37',
          overlay: 'rgba(0,0,0,0.5)'
        },
        fonts: {
          title: "'Playfair Display', serif",
          body: "'Montserrat', sans-serif"
        },
        borderRadius: '12px',
        iconStyle: 'classic',
        icons: {
          indicaciones: '../../../../assets/Indicaciones.png',
          hospedaje: '../../../../assets/Hospedaje/Hotel1.png'
        },
        backgroundImage: '',
        marbleBackground: ''
      }
    };
  }

  loadTemplates() {
    this.loading = true;
    this.invitationService.getTemplates().subscribe({
      next: (res: any[]) => {
        this.templates = res;
        this.loading = false;
      },
      error: () => {
        this.notificationService.show('error', 'Error al cargar templates');
        this.loading = false;
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.editingId = null;
      this.form = this.getEmptyForm();
    }
  }

  autoGenerateKey() {
    if (this.form.name) {
      this.form.key = this.form.name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
    }
  }

  editTemplate(template: any) {
    this.editingId = template.id;
    this.form = {
      key: template.key,
      name: template.name,
      category: template.category,
      style: template.style,
      preview: template.preview || '',
      theme: JSON.parse(JSON.stringify(template.theme))
    };
    this.showForm = true;
  }

  deleteTemplate(template: any) {
    if (!confirm(`¿Estás seguro de eliminar el template "${template.name}"?`)) return;

    this.invitationService.deleteTemplate(template.id).subscribe({
      next: () => {
        this.notificationService.show('info', 'Template eliminado');
        this.loadTemplates();
      },
      error: (err: any) => {
        const msg = err.status === 409
          ? err.error?.message || 'El template está en uso y no se puede eliminar'
          : 'Error al eliminar template';
        this.notificationService.show('error', msg);
      }
    });
  }

  isFormValid(): boolean {
    return !!(this.form.name?.trim() && this.form.key?.trim() && this.form.category && this.form.style);
  }

  saveTemplate() {
    if (!this.isFormValid() || this.saving) return;
    this.saving = true;

    const payload = { ...this.form };

    if (this.editingId) {
      this.invitationService.updateTemplate(this.editingId, payload).subscribe({
        next: () => {
          this.notificationService.show('info', 'Template actualizado');
          this.showForm = false;
          this.editingId = null;
          this.saving = false;
          this.loadTemplates();
        },
        error: () => {
          this.notificationService.show('error', 'Error al actualizar template');
          this.saving = false;
        }
      });
    } else {
      this.invitationService.createTemplate(payload).subscribe({
        next: () => {
          this.notificationService.show('info', 'Template creado exitosamente');
          this.showForm = false;
          this.saving = false;
          this.loadTemplates();
        },
        error: () => {
          this.notificationService.show('error', 'Error al crear template');
          this.saving = false;
        }
      });
    }
  }

  getCategoryLabel(value: string): string {
    return this.categories.find(c => c.value === value)?.label || value;
  }

  getStyleLabel(value: string): string {
    return this.styles.find(s => s.value === value)?.label || value;
  }
}
