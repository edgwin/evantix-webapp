import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoEventoComponent } from './nuevo-evento.component';

describe('NuevoEventoComponent', () => {
  let component: NuevoEventoComponent;
  let fixture: ComponentFixture<NuevoEventoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NuevoEventoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevoEventoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
