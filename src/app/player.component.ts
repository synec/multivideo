import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { isEqual } from 'lodash-es';
import {
  distinctUntilKeyChanged,
  filter,
  map,
  Observable,
  pairwise,
} from 'rxjs';

import { mergeMap, scan } from 'rxjs/operators';
import {
  DirectoryIndexService,
  FILE_LOCATION,
} from './directory-index.service';

export type SETTINGS = {
  url?: string;
  active?: number;
  count: number;
  [key: string]: unknown;
};

const DEFAULT_SETTINGS: SETTINGS = {
  active: 0,
  count: 2,
};

export type PLAYER = {
  src?: string;
  el?: HTMLVideoElement;
};

@Component({
  selector: 'mvi-player',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [DirectoryIndexService],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnInit {
  settings$: Observable<SETTINGS> = this.ar.queryParams.pipe(
    pairwise(),
    filter(([prv, now]: [Params, Params]) => !isEqual(prv, now)),
    map(
      ([prv, now]: [Params, Params]) =>
        ({ ...DEFAULT_SETTINGS, ...now } as SETTINGS),
    ),
  );

  urlChanged$ = this.settings$.pipe(
    distinctUntilKeyChanged('url'),
    filter((settings) => !!settings.url),
  );

  files$ = this.urlChanged$.pipe(
    mergeMap((settings) => this.diService.parse(settings.url!)),
    scan<FILE_LOCATION[], FILE_LOCATION[]>(
      (a, c) => [...a, ...(c?.length ? c : [])],
      [],
    ),
  );

  constructor(
    private ar: ActivatedRoute,
    private diService: DirectoryIndexService,
  ) {}

  ngOnInit(): void {
    this.files$.subscribe({
      next: (files) => {
        console.log('files', files);
      },
      complete: () => {
        console.warn('DONE');
      },
    });
  }
}
