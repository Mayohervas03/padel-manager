import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PistasComponent } from './pistas';

describe('PistasComponent', () => {
  let component: PistasComponent;
  let fixture: ComponentFixture<PistasComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PistasComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(PistasComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pistas on init', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:8080/api/pistas');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, nombre: 'Pista 1', tipo: 'Indoor', ubicacion: 'Indoor', precio: 10, activo: true }]);
    expect(component.pistas().length).toBe(1);
  });
});
