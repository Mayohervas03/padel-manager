import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pistas } from './pistas';

describe('Pistas', () => {
  let component: Pistas;
  let fixture: ComponentFixture<Pistas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pistas],
    }).compileComponents();

    fixture = TestBed.createComponent(Pistas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
