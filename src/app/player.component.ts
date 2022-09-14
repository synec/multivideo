import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { difference, isEqual, partialRight, random } from 'lodash-es';
import {
  combineLatest,
  distinctUntilKeyChanged,
  filter,
  map,
  Observable,
  of,
  pairwise,
} from 'rxjs';

import {
  finalize,
  first,
  mergeMap,
  scan,
  shareReplay,
  tap,
} from 'rxjs/operators';
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

export type VIDEO = {
  src?: string;
  el?: HTMLVideoElement;
  index: number;
  cmode?: boolean;
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
  @Input()
  url = 'http://raid1.local:8080';

  isLoading = true;

  selectedIndex = 0;

  availableFiles: FILE_LOCATION[] = [];
  playedSources: string[] = [];

  videos: VIDEO[] = [];

  constructor(
    private ar: ActivatedRoute,
    private diService: DirectoryIndexService,
    private elementRef: ElementRef,
  ) {}

  ngOnInit(): void {
    of(this.url)
      .pipe(
        tap(() => (this.isLoading = true)),
        mergeMap((url) =>
          this.diService
            .parse(url)
            .pipe(finalize(() => (this.isLoading = false))),
        ),
        scan<FILE_LOCATION[], FILE_LOCATION[]>((a, c) => [...a, ...c], []),
      )
      .subscribe({
        next: (v) => (this.availableFiles = v),
        complete: () => {
          this.videos = new Array(2).fill({}).map((v, i) => ({
            src: this.randomFile().url,
          })) as VIDEO[];
        },
      });
  }

  randomFile(files = this.availableFiles): FILE_LOCATION {
    return files[Math.floor(random(0, files.length - 1))];
  }

  unplayedFile(): FILE_LOCATION {
    const unplayed = this.availableFiles.filter(
      (o) => !this.playedSources.includes(o.url),
    );
    return this.randomFile(unplayed);
  }

  sameDirFile(src: string): FILE_LOCATION {
    const path = src
      .substring(this.url.length)
      .split('/')
      .slice(0, -1)
      .join('/');
    const unplayed = this.availableFiles.filter((o) => o.url.includes(path));
    return this.randomFile(unplayed);
  }

  onVideoLoadedmetadata(
    video: VIDEO,
    el: HTMLVideoElement,
    index: number,
    event: Event,
  ) {
    video.el = el;
    video.el.muted = true;
    video.el.play();
    this.playedSources.push(video.src!);
  }

  @HostListener('keydown', ['$event'])
  onKeyup(event: KeyboardEvent): void {
    const key = event.key;

    if (['1', '2'].includes(key)) {
      this.selectedIndex = +key - 1;
      this.videos[this.selectedIndex].el?.focus();
      return;
    }

    const selected: VIDEO = this.videos[this.selectedIndex];
    const other: VIDEO = this.videos[this.selectedIndex == 0 ? 1 : 0];

    if (!selected.el) return;

    switch (key.toLocaleLowerCase()) {
      case 'q':
        selected.el.currentTime = selected.el.currentTime - 10;
        break;
      case 'a':
        selected.el.currentTime = 0;
        break;
      case 'w':
        selected.el.currentTime = Math.floor(selected.el.duration * 0.9);
        break;
      case 'e':
        selected.el.currentTime = selected.el.currentTime + 10;
        break;
      case 'v':
        other.src = selected.src;
        break;
      case 'd':
        other.src = this.sameDirFile(selected.el.src).url;
        break;
      case 's':
        selected.el.playbackRate = selected.el.playbackRate === 1 ? 0.24 : 1;
        break;
      case 'r':
        selected.src = this.unplayedFile().url;
        selected.el.currentTime = 0;
        break;
      case 'c':
        selected.cmode = !selected.cmode;
        break;
      case 'm':
        selected.el.muted = !selected.el.muted;
        break;

      case 'f':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          selected.el.requestFullscreen();
        }
        break;
      default:
        break;
    }
  }
}
