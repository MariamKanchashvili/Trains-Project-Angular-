import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomAlerts } from './custom-alerts';

describe('CustomAlerts', () => {
  let component: CustomAlerts;
  let fixture: ComponentFixture<CustomAlerts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomAlerts],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomAlerts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
