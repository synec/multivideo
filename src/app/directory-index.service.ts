import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { groupBy } from 'lodash-es';
import { catchError, merge, Observable, of, switchMap } from 'rxjs';

export type FILE_LOCATION = {
  url: string;
  name: string;
};

export const IGNORE_PATHS = [
  '@eaDir/',
  '.DS_Store',
  './../',
  './..',
  '..',
  '.',
  '../',
];

@Injectable()
export class DirectoryIndexService {
  constructor(private http: HttpClient) {}

  parse(
    url: string,
    ignore = IGNORE_PATHS,
    fileExtension = 'mp4',
  ): Observable<FILE_LOCATION[]> {
    if (!url) {
      throw new Error('url must be provided');
    }
    if (url.endsWith('/')) url = url.slice(0, -1);
    return this.http
      .get(url, {
        responseType: 'text',
      })
      .pipe(
        catchError(() => []),
        switchMap((res: string) => {
          const regex = new RegExp('<a href="(.*)">(.*)</a>', 'gi');
          const matches = Array.from<string[]>(res.matchAll(regex));

          const entries: FILE_LOCATION[] = matches
            .filter(([, , name]) => !ignore.includes(name))
            .filter(
              ([, , name]) =>
                name.endsWith(fileExtension) || name.endsWith('/'),
            )
            .map((o) => {
              const [, href, name] = o;
              let path = href;
              if (path.startsWith('./')) path = path.substring(2);
              return {
                name,
                url: [url, path].join('/'),
              };
            });

          if (!entries.length) {
            return [];
          }

          const { directories, files } = groupBy(entries, (entry) =>
            entry.url.endsWith('/') ? 'directories' : 'files',
          );

          const directories$ = (directories ?? []).map((d) =>
            this.parse(`${d.url}`),
          );

          return merge(of(files ?? []), ...directories$);
        }),
      );
  }
}
