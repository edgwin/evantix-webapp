import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FestejadosComponent } from './festejados.component';

describe('FestejadosComponent', () => {
  let component: FestejadosComponent;
  let fixture: ComponentFixture<FestejadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FestejadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FestejadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
