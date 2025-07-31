import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-plan-card',
  templateUrl: './plan-card.component.html',
  styleUrls: ['./plan-card.component.css']
})
export class PlanCardComponent {
  @Input() planTitle: string = '';
  @Input() price: number = 0;
  @Input() features: string[] = [];
  @Input() headerColor: string = '#61b340'; // valor por defecto
  @Input() planSubtitle: string = '';
}

