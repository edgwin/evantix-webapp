import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaModalComponent } from './mapa-modal.component';

describe('MapaModalComponent', () => {
  let component: MapaModalComponent;
  let fixture: ComponentFixture<MapaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapaModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MapaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
