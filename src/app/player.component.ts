import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { finalize, mergeMap, scan, tap } from 'rxjs/operators';
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
    public readonly diService: DirectoryIndexService,
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
            src: this.diService.randomFile(this.availableFiles).url,
          })) as VIDEO[];
        },
      });
  }

  randomUnplayedFile(): FILE_LOCATION {
    const unplayed = this.availableFiles.filter(
      (o) => !this.playedSources.includes(o.url),
    );
    return this.diService.randomFile(unplayed);
  }

  randomSameDirFile(src: string): FILE_LOCATION {
    const path = src
      .substring(this.url.length)
      .split('/')
      .slice(0, -1)
      .join('/');
    const sameDirFiles = this.availableFiles.filter((o) =>
      o.url.includes(path),
    );
    return this.diService.randomFile(sameDirFiles);
  }

  onVideoLoadedmetadata(video: VIDEO, el: HTMLVideoElement, index: number) {
    video.el = el;
    video.el.muted = true;
    video.el.play();
    video.index = index;
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
    /* istanbul ignore next */
    const other: VIDEO = this.videos[this.selectedIndex == 0 ? 1 : 0];

    if (selected.el) {
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
          other.src = this.randomSameDirFile(selected.el.src).url;
          break;
        case 's':
          selected.el.playbackRate = selected.el.playbackRate === 1 ? 0.24 : 1;
          break;
        case 'r':
          selected.src = this.randomUnplayedFile().url;
          selected.el.currentTime = 0;
          break;
        case 'c':
          selected.cmode = !selected.cmode;
          break;
        case 'm':
          selected.el.muted = !selected.el.muted;
          break;

        case 'f':
          /* istanbul ignore next */
          if (!document.fullscreenElement) {
            selected.el.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
          break;
        /* istanbul ignore next */
        default:
          break;
      }
    }
  }
}
