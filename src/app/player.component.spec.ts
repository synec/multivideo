import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { DirectoryIndexService } from './directory-index.service';

import { PlayerComponent, VIDEO } from './player.component';

describe('PlayerComponent', () => {
  let component: PlayerComponent;
  let fixture: ComponentFixture<PlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerComponent, RouterTestingModule],
      providers: [DirectoryIndexService],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerComponent);
    component = fixture.componentInstance;
    component.url = 'http://fake.url';

    spyOn(component.diService, 'parse').and.returnValue(
      of([
        {
          url: 'http://fake.url/movie-A.mp4',
          name: 'movie-A',
        },
        {
          url: 'http://fake.url/movie-B.mp4',
          name: 'movie-B',
        },
      ]),
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onVideoLoadedmetadata', () => {
    it('it should set up the video', async () => {
      await fixture.whenStable();
      const video: VIDEO = {
        src: 'http://fake.url/movie-A.mp4',
        el: undefined,
        index: 99,
      };
      const videoElement = {
        play: jasmine.createSpy('play'),
      } as unknown as HTMLVideoElement;
      component.onVideoLoadedmetadata(video, videoElement, 0);
      expect(video.index).toBe(0);
      expect(video.el).toEqual(videoElement);
      expect(video.el!.play).toHaveBeenCalled();
      expect(component.playedSources).toContain(video.src!);
    });
  });

  describe('onKeyUp', () => {
    beforeEach(async () => {
      await fixture.whenStable();
      component.videos = component.videos.map((o, idx) => ({
        src: o.src,
        el: {
          src: o.src,
          currentTime: 10,
          duration: 100,
          playbackRate: 1.0,
          muted: true,
          focus: jasmine.createSpy('focus'),
          requestFullscreen: jasmine.createSpy('requestFullscreen'),
        } as unknown as HTMLVideoElement,
        index: idx,
      }));
    });

    it('it should update selected index on numeric key', async () => {
      component.onKeyup({ key: '2' } as KeyboardEvent);
      expect(component.selectedIndex).toEqual(1);
    });

    it('it rewind 10 seconds on "q"', () => {
      const selectedVideo = component.videos[component.selectedIndex];
      component.onKeyup({ key: 'q' } as KeyboardEvent);
      expect(selectedVideo.el!.currentTime).toEqual(0);
    });

    it('it go to start on "a"', () => {
      const selectedVideo = component.videos[component.selectedIndex];
      component.onKeyup({ key: 'a' } as KeyboardEvent);
      expect(selectedVideo.el!.currentTime).toEqual(0);
    });

    it('it foward 10 seconds on "e"', () => {
      const selectedVideo = component.videos[component.selectedIndex];
      component.onKeyup({ key: 'e' } as KeyboardEvent);
      expect(selectedVideo.el!.currentTime).toEqual(20);
    });

    it('it jump to 90% of duration on "w"', () => {
      const selectedVideo = component.videos[component.selectedIndex];
      component.onKeyup({ key: 'w' } as KeyboardEvent);
      expect(selectedVideo.el!.currentTime).toEqual(90);
    });

    it('it toggle playback rate between 0.24 and 1 on "s"', () => {
      const selectedVideo = component.videos[component.selectedIndex];
      component.onKeyup({ key: 's' } as KeyboardEvent);
      expect(selectedVideo.el!.playbackRate).toEqual(0.24);
      component.onKeyup({ key: 's' } as KeyboardEvent);
      expect(selectedVideo.el!.playbackRate).toEqual(1);
    });

    it('it should show same video on other player on "v"', () => {
      const selectedVideo = component.videos[component.selectedIndex];
      const otherVideo = component.videos[component.selectedIndex];
      component.onKeyup({ key: 'v' } as KeyboardEvent);
      expect(selectedVideo.src).toEqual(otherVideo.src);
    });

    it('it should show random video fromm same directory on other player on "d"', () => {
      const selectedVideo = component.videos[component.selectedIndex];
      const otherVideo = component.videos[component.selectedIndex];
      component.onKeyup({ key: 'd' } as KeyboardEvent);
      expect(selectedVideo.src).toEqual(otherVideo.src);
    });

    it('it should show random video on selected player on "r"', () => {
      const selectedVideo = component.videos[component.selectedIndex];
      spyOn(component, 'randomUnplayedFile').and.callThrough();
      component.onKeyup({ key: 'r' } as KeyboardEvent);
      expect(selectedVideo.src).toBeDefined();
    });

    it('it toggle cmode selected video on "c"', () => {
      const selectedVideo = component.videos[component.selectedIndex];
      component.onKeyup({ key: 'c' } as KeyboardEvent);
      expect(selectedVideo.cmode).toEqual(true);
      component.onKeyup({ key: 'c' } as KeyboardEvent);
      expect(selectedVideo.cmode).toEqual(false);
    });

    it('it toggle mute state on selected video on "m"', () => {
      const selectedVideo = component.videos[component.selectedIndex];
      component.onKeyup({ key: 'm' } as KeyboardEvent);
      expect(selectedVideo.el!.muted).toEqual(false);
      component.onKeyup({ key: 'm' } as KeyboardEvent);
      expect(selectedVideo.el!.muted).toEqual(true);
    });

    it('it toggle fullscreen state on selected video on "f"', () => {
      const selectedVideo = component.videos[component.selectedIndex];
      component.onKeyup({ key: 'f' } as KeyboardEvent);
      expect(selectedVideo.el!.requestFullscreen).toHaveBeenCalled();
    });
  });
});
