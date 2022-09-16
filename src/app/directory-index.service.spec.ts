import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { DirectoryIndexService } from './directory-index.service';

describe('DirectoryIndexService', () => {
  let service: DirectoryIndexService;
  let httpTestingController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DirectoryIndexService],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(DirectoryIndexService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parse', () => {
    it('should fail with error if no url parameter provided', () => {
      expect(() => service.parse('')).toThrowError();
    });

    it('should remove trailing / on url parameter', () => {
      service.parse('http://fake.url/').subscribe({
        next: (result) => {
          expect(result).toEqual([]);
        },
      });
      const req = httpTestingController.expectOne('http://fake.url');
      expect(req.request.method).toEqual('GET');
      req.flush('');
    });

    it('should return [] if request fails', () => {
      service.parse('http://fake.url/').subscribe({
        next: (result) => {
          expect(result).toEqual([]);
        },
      });
      const req = httpTestingController.expectOne('http://fake.url');
      expect(req.request.method).toEqual('GET');
      req.error(new ProgressEvent('error'));
    });

    it('should return [] if request does not contain parseable data', () => {
      service.parse('http://fake.url/').subscribe({
        next: (result) => {
          expect(result).toEqual([]);
        },
      });
      const req = httpTestingController.expectOne('http://fake.url');
      expect(req.request.method).toEqual('GET');
      req.flush('');
    });

    it('should return array of urls for parsed files', () => {
      service.parse('http://fake.url/').subscribe({
        next: (result) => {
          expect(result.length).toEqual(4);
          expect(result).toEqual([
            { name: 'movie-A.mp4', url: 'http://fake.url/movie-A.mp4' },
            { name: 'movie-B.mp4', url: 'http://fake.url/movie-B.mp4' },
            { name: 'movie-C.mp4', url: 'http://fake.url/movie-C.mp4' },
            { name: 'movie-D.mp4', url: 'http://fake.url/movie-D.mp4' },
          ]);
        },
      });
      const req = httpTestingController.expectOne('http://fake.url');
      expect(req.request.method).toEqual('GET');
      req.flush(`
        <a href="./movie-A.mp4">movie-A.mp4</a>
        <a href="./movie-B.mp4">movie-B.mp4</a>
        <a href="./movie-C.mp4">movie-C.mp4</a>
        <a href="./movie-D.mp4">movie-D.mp4</a>
        <a href="./folder-A/">folder-A</a>
      `);
    });

    afterEach(() => {
      httpTestingController.verify();
    });
  });
});
