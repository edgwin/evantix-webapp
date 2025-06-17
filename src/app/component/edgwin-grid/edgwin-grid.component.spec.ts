import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdgwinGridComponent } from './edgwin-grid.component';

describe('EdgwinGridComponent', () => {
  let component: EdgwinGridComponent;
  let fixture: ComponentFixture<EdgwinGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EdgwinGridComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EdgwinGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
