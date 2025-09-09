import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DondeCuandoComponent } from './donde-cuando.component';

describe('DondeCuandoComponent', () => {
  let component: DondeCuandoComponent;
  let fixture: ComponentFixture<DondeCuandoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DondeCuandoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DondeCuandoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
