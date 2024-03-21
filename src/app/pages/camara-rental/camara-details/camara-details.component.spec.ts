import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CamaraDetailsComponent } from './camara-details.component';

describe('CamaraDetailsComponent', () => {
  let component: CamaraDetailsComponent;
  let fixture: ComponentFixture<CamaraDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CamaraDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CamaraDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
