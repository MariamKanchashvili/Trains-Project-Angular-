import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendEmail } from './resend-email';

describe('ResendEmail', () => {
  let component: ResendEmail;
  let fixture: ComponentFixture<ResendEmail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResendEmail],
    }).compileComponents();

    fixture = TestBed.createComponent(ResendEmail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
