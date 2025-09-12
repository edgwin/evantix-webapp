import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicacionesComponent } from './indicaciones.component';

describe('IndicacionesComponent', () => {
  let component: IndicacionesComponent;
  let fixture: ComponentFixture<IndicacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicacionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IndicacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
