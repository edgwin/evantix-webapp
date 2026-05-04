import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapaModalComponent } from './mapa-modal.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MapaModalComponent', () => {
  let component: MapaModalComponent;
  let fixture: ComponentFixture<MapaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaModalComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MapaModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default center coordinates', () => {
    expect(component.center).toBeDefined();
    expect(component.center.lat).toBeDefined();
    expect(component.center.lng).toBeDefined();
  });

  it('should have null marker initially', () => {
    expect(component.marker).toBeNull();
  });
});
