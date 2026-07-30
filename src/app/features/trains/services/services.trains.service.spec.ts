import { TestBed } from '@angular/core/testing';

import { ServicesTrainsService } from './services.trains.service';

describe('ServicesTrainsService', () => {
  let service: ServicesTrainsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicesTrainsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
