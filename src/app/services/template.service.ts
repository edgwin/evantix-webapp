import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TemplateTheme {
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    background: string;
    backgroundAlt: string;
    text: string;
    textLight: string;
    accent: string;
    overlay: string;
    shadow: string;
  };
  fonts: {
    title: string;
    body: string;
  };
  borderRadius: string;
  iconStyle: 'classic' | 'modern' | 'minimal' | 'vintage';
  icons: {
    indicaciones: string;
    hospedaje: string;    
  };
  backgroundImage: string;
  marbleBackground: string;
}

export interface Template {
  id: string;
  name: string;
  category: 'boda' | 'xv' | 'bautizo' | 'graduacion' | 'cumpleanos' | 'religioso' | 'aniversario' | 'general';
  style: 'moderno' | 'vintage' | 'elegante' | 'romantico' | 'minimalista';
  theme: TemplateTheme;
  preview?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private currentTemplateSubject = new BehaviorSubject<Template | null>(null);
  public currentTemplate$: Observable<Template | null> = this.currentTemplateSubject.asObservable();

  constructor() {}

  setTemplate(template: Template): void {
    this.currentTemplateSubject.next(template);
    this.applyTemplateToDOM(template);
  }

  getCurrentTemplate(): Template | null {
    return this.currentTemplateSubject.getValue();
  }

  applyTemplateFromData(templateData: Template): void {
    if (templateData) {
      this.currentTemplateSubject.next(templateData);
      this.applyTemplateToDOM(templateData);
    }
  }

  applyTemplateToDOM(template: Template): void {
    const root = document.documentElement;
    const { colors, fonts, borderRadius } = template.theme;

    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--shadow-color', colors.shadow);
    root.style.setProperty('--primary-color-dark', colors.primaryDark);
    root.style.setProperty('--bg-color', colors.background);
    root.style.setProperty('--bg-alt-color', colors.backgroundAlt);
    root.style.setProperty('--text-color', colors.text);
    root.style.setProperty('--text-light-color', colors.textLight);
    root.style.setProperty('--accent-color', colors.accent);
    root.style.setProperty('--overlay-color', colors.overlay);

    root.style.setProperty('--title-font', fonts.title);
    root.style.setProperty('--body-font', fonts.body);

    root.style.setProperty('--border-radius', borderRadius);
  }

  getIconForSection(section: keyof TemplateTheme['icons']): string {
    const template = this.getCurrentTemplate();
    if (template && template.theme.icons[section]) {
      return template.theme.icons[section];
    }
    switch(section) {
      case 'indicaciones': return '../../../../assets/Indicaciones.png';
      case 'hospedaje': return '../../../../assets/Hospedaje.png';      
      default: return '';
    }
  }

  getBackgroundImage(): string {
    const template = this.getCurrentTemplate();
    if (template && template.theme.backgroundImage) {
      return template.theme.backgroundImage;
    }
    return '../../../../assets/background.jpg';
  }

  getMarbleBackground(): string {
    const template = this.getCurrentTemplate();
    if (template && template.theme.marbleBackground) {
      return template.theme.marbleBackground;
    }
    return 'assets/backgrounds/marble-pink.svg';
  }
}
