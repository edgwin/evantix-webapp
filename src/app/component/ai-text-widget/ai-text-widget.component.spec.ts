import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiTextWidgetComponent } from './ai-text-widget.component';

describe('AiTextWidgetComponent', () => {
  let component: AiTextWidgetComponent;
  let fixture: ComponentFixture<AiTextWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiTextWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AiTextWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
