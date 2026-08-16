import { TestBed } from '@angular/core/testing';

import { BookingConfirm } from './booking-confirm';

describe('BookingConfirm', () => {
  let service: BookingConfirm;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingConfirm);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
