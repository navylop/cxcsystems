import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicidadCitasComponent } from './publicidad-citas.component';

describe('PublicidadCitasComponent', () => {
  let component: PublicidadCitasComponent;
  let fixture: ComponentFixture<PublicidadCitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicidadCitasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PublicidadCitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
