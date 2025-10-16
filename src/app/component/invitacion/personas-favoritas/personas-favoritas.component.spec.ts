import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonasFavoritasComponent } from './personas-favoritas.component';

describe('PersonasFavoritasComponent', () => {
  let component: PersonasFavoritasComponent;
  let fixture: ComponentFixture<PersonasFavoritasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonasFavoritasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonasFavoritasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
