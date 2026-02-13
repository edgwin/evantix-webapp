import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Template, TemplateService } from '../../../services/template.service';

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

  categories = [
    { value: 'all', label: 'Todos' },
    { value: 'boda', label: 'Boda' },
    { value: 'xv', label: 'XV Años' },
    { value: 'bautizo', label: 'Bautizo' },
    { value: 'general', label: 'General' }
  ];

  constructor(private templateService: TemplateService) {}

  ngOnInit(): void {
    this.templates = this.templateService.getTemplates();
    this.filterByEventType();
    
    const currentTemplate = this.templateService.getCurrentTemplate();
    if (currentTemplate) {
      this.selectedTemplateId = currentTemplate.id;
    }
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
    this.templateService.setTemplate(template.id, this.eventId);
    this.templateSelected.emit(template);
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
