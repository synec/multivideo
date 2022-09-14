import { TestBed } from '@angular/core/testing';

import { DirectoryIndexService } from './directory-index.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DirectoryIndexService', () => {
  let service: DirectoryIndexService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DirectoryIndexService],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(DirectoryIndexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
