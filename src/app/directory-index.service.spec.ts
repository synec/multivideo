import { TestBed } from '@angular/core/testing';

import { DirectoryIndexService } from './directory-index.service';

describe('DirectoryIndexService', () => {
  let service: DirectoryIndexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectoryIndexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
