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
      let index = 0;
      service.parse('http://fake.url/').subscribe({
        next: (result) => {
          index++;

          if (index === 1) {
            expect(result.length).toEqual(4);
            expect(result).toEqual([
              { name: 'movie-A.mp4', url: 'http://fake.url/movie-A.mp4' },
              { name: 'movie-B.mp4', url: 'http://fake.url/movie-B.mp4' },
              { name: 'movie-C.mp4', url: 'http://fake.url/movie-C.mp4' },
              { name: 'movie-D.mp4', url: 'http://fake.url/movie-D.mp4' },
            ]);
          }

          if (index === 2) {
            expect(result.length).toEqual(4);
            expect(result).toEqual([
              {
                name: 'movie-A.mp4',
                url: 'http://fake.url/folder-A/movie-A.mp4',
              },
              {
                name: 'movie-B.mp4',
                url: 'http://fake.url/folder-A/movie-B.mp4',
              },
              {
                name: 'movie-C.mp4',
                url: 'http://fake.url/folder-A/movie-C.mp4',
              },
              {
                name: 'movie-D.mp4',
                url: 'http://fake.url/folder-A/movie-D.mp4',
              },
            ]);
          }
        },
      });
      const req = httpTestingController.expectOne('http://fake.url');
      expect(req.request.method).toEqual('GET');
      req.flush(`
        <a href="./movie-A.mp4">movie-A.mp4</a>
        <a href="./movie-B.mp4">movie-B.mp4</a>
        <a href="./movie-C.mp4">movie-C.mp4</a>
        <a href="./movie-D.mp4">movie-D.mp4</a>
        <a href="./folder-A/">folder-A/</a>
      `);
      const reqFolder = httpTestingController.expectOne(
        'http://fake.url/folder-A',
      );
      expect(req.request.method).toEqual('GET');
      reqFolder.flush(`
        <a href="./movie-A.mp4">movie-A.mp4</a>
        <a href="./movie-B.mp4">movie-B.mp4</a>
        <a href="./movie-C.mp4">movie-C.mp4</a>
        <a href="./movie-D.mp4">movie-D.mp4</a>
      `);
    });

    afterEach(() => {
      httpTestingController.verify();
    });
  });

  describe('randomFile', () => {
    it('should return a random FILE_LOCATION from an array', () => {
      const rnd = service.randomFile([
        {
          url: 'http://fake.url/movie-A.mp4',
          name: 'movie-A',
        },
        {
          url: 'http://fake.url/movie-A.mp4',
          name: 'movie-A',
        },
      ]);
      expect(rnd.url).toBeInstanceOf(String);
      expect(rnd.name).toBeInstanceOf(String);
    });
  });
});
