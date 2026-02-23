import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Template, TemplateService } from '../../../services/template.service';
import { InvitationService } from '../../../services/invitation.service';

@Component({
  selector: 'app-template-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template-selector.component.html',
  styleUrls: ['./template-selector.component.css']
})
export class TemplateSelectorComponent implements OnInit {
  @Input() eventId: string = '';
  @Input() eventType: string = 'boda';
  @Output() templateSelected = new EventEmitter<Template>();

  templates: Template[] = [];
  filteredTemplates: Template[] = [];
  selectedCategory: string = 'all';
  selectedTemplateId: string | null = null;
  isOpen: boolean = false;
  loading: boolean = true;

  categories = [
    { value: 'all', label: 'Todos' },
    { value: 'boda', label: 'Boda' },
    { value: 'xv', label: 'XV Años' },
    { value: 'bautizo', label: 'Bautizo' },
    { value: 'general', label: 'General' }
  ];

  constructor(
    private templateService: TemplateService,
    private invitationService: InvitationService
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    this.loading = true;
    this.invitationService.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.filterByEventType();
        
        const currentTemplate = this.templateService.getCurrentTemplate();
        if (currentTemplate) {
          this.selectedTemplateId = currentTemplate.id;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading templates:', err);
        this.loading = false;
      }
    });
  }

  private filterByEventType(): void {
    if (this.eventType) {
      const categoryMap: { [key: string]: string } = {
        'Boda': 'boda',
        'XV': 'xv',
        'Bautizo': 'bautizo'
      };
      const mappedCategory = categoryMap[this.eventType] || 'all';
      this.selectedCategory = mappedCategory;
    }
    this.filterTemplates();
  }

  filterTemplates(): void {
    this.filteredTemplates = this.selectedCategory === 'all' 
      ? this.templates 
      : this.templates.filter(t => t.category === this.selectedCategory || t.category === 'general');
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.filterTemplates();
  }

  selectTemplate(template: Template): void {
    this.selectedTemplateId = template.id;
    this.templateService.setTemplate(template);
    
    this.invitationService.updateEventTemplate(this.eventId, template.id).subscribe({
      next: () => {
        this.templateSelected.emit(template);
      },
      error: (err) => {
        console.error('Error updating template:', err);
        this.templateSelected.emit(template);
      }
    });
  }

  previewTemplate(template: Template): void {
    this.templateService.applyTemplateToDOM(template);
  }

  toggleSelector(): void {
    this.isOpen = !this.isOpen;
  }

  getStyleLabel(style: string): string {
    const labels: { [key: string]: string } = {
      'moderno': 'Moderno',
      'vintage': 'Vintage',
      'elegante': 'Elegante',
      'romantico': 'Romántico',
      'minimalista': 'Minimalista'
    };
    return labels[style] || style;
  }
}
