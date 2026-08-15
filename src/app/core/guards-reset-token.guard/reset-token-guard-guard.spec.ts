import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { resetTokenGuardGuard } from './reset-token-guard-guard';

describe('resetTokenGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => resetTokenGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
