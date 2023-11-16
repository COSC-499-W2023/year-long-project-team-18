import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef
} from '@angular/core';

import videojs from 'video.js';
import * as RecordRTC from 'recordrtc';
import * as Record from 'videojs-record/dist/videojs.record.js';

@Component({
  selector: 'app-video-recorder',
  templateUrl: './video-recorder.component.html',
  styleUrls: ['./video-recorder.component.scss']
})
export class VideoRecorderComponent implements OnInit, OnDestroy {

  idx = 'clip1';
  private config: any;
  private player: any;
  private plugin: any;

  constructor(elementRef: ElementRef) {
    this.player = false;
    this.plugin = Record;

    this.config = {
      controls: true,
      autoplay: false,
      fluid: false,
      loop: false,
      width: 320,
      height: 240,
      bigPlayButton: false,
      controlBar: {
        volumePanel: false
      },
      plugins: {
        record: {
          audio: true,
          video: true,
          debug: true
        }
      }
    };
  }

  ngOnInit() {}

  ngAfterViewInit() {
    let el = 'video_' + this.idx;
    const element = document.getElementById(el)!;

    this.player = videojs(element, this.config, () => {
      console.log('player ready! id:', el);

      // Check if the 'version' property exists on the videojs object
      if ('version' in this.player) {
        const msg = 'Using video.js ' + this.player.version() +
          ' with videojs-record ' + videojs.getPluginVersion('record') +
          ' and recordrtc ' + RecordRTC.version;
        videojs.log(msg);
      } else {
        console.warn('Unable to determine videojs version');
      }

      this.player.on('deviceReady', () => {
        console.log('device is ready!');
      });

      this.player.on('startRecord', () => {
        console.log('started recording!');
      });

      this.player.on('finishRecord', () => {
        console.log('finished recording: ', this.player.recordedData);
        this.player.record().saveAs({'video': 'my-video-file-name.webm'});
      });

      this.player.on('error', (element: any, error: any) => {
        console.warn(error);
      });

      this.player.on('deviceError', () => {
        console.error('device error:', this.player.deviceErrorCode);
      });
    });
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
      this.player = false;
    }
  }
}
