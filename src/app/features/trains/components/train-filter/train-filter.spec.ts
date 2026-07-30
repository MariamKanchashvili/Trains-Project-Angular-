import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainFilter } from './train-filter';

describe('TrainFilter', () => {
  let component: TrainFilter;
  let fixture: ComponentFixture<TrainFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(TrainFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
