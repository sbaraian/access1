import { TestBed } from '@angular/core/testing';

import { BodyStyleService } from './body-style.service';

describe('BodyStyleService', () => {
  let service: BodyStyleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BodyStyleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
