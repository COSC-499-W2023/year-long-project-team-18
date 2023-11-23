import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { CognitoService, IUser } from '../cognito.service';
import { Router } from '@angular/router';
import * as AWS from 'aws-sdk';
import videojs from 'video.js';
import Record from 'videojs-record/dist/videojs.record.js';
import 'src/app/videojs-record';
import { KinesisVideo, KinesisVideoClient } from '@aws-sdk/client-kinesis-video';

@Component({
  selector: 'app-video-recorder',
  templateUrl: './video-recorder.component.html',
  styleUrls: ['./video-recorder.component.scss']
})
export class VideoRecorderComponent implements OnInit, OnDestroy {

  private config: any;
  private player: any;
  private kinesisVideoClient: KinesisVideo = new KinesisVideo({ region: 'ca-central' });

  constructor(private cognitoService: CognitoService, private router: Router) {
    this.kinesisVideoClient = new KinesisVideo({});
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

  ngOnInit(): void {
    this.checkAuthenticationStatus();
    this.initializeKinesisVideoClient();
  }

  checkAuthenticationStatus() {
    this.cognitoService.isAuthenticated().then(isAuthenticated => {
      if (isAuthenticated) {
        console.log('User is authenticated');
      } else {
        console.log('User is not authenticated');
        this.router.navigate(['/signIn']);
      }
    }).catch(error => {
      console.error('Authentication status check error:', error);
    });
  }

  ngAfterViewInit() {
    const element = document.getElementById('my-video');

    if (element) {
      this.player = videojs(element, this.config, () => {
        console.log('Video.js player is ready!');
      });

      this.player.on('error', (element: any, error: any) => {
        console.error('Video.js error:', error);
      });this.bindKinesisVideoClientToPlayer(element);
  } else {
    console.error('Video element not found!');
  }
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
    //this.releaseKinesisVideoResources();
  }


  startRecording() {
    if (this.player && this.player.record) {
      this.player.record().start();
      console.log('Recording started!');
    } else {
      console.error('Recording not available or player not ready.');
    }
    this.startStreamingToKinesis();
  }

  stopRecording() {
    if (this.player && this.player.record) {
      this.player.record().stop();
      console.log('Recording stopped!');
    } else {
      console.error('Recording not available or player not ready.');
    }
    this.stopStreamingToKinesis();
  }

  saveRecording() {
    if (this.player && this.player.record) {
      this.player.record().saveAs({'video': 'my-video-file-name.webm'});
      console.log('Recording saved!');
    } else {
      console.error('Recording not available or player not ready.');
    }
    this.saveRecordingToKinesis();
  }
  
bindKinesisVideoClientToPlayer(videoElement: any) {
    //Incomplete
  }
  private initializeKinesisVideoClient() {
    const streamName = 'prvcy_stream';
    const region = 'ca-central';
    this.kinesisVideoClient = new KinesisVideo({ region });
  }
  
  private startStreamingToKinesis(){

    //arn:aws:kinesis:ca-central-1:952490130013:stream/prvcy_stream  ARN Number

  }


  private stopStreamingToKinesis() {
    if (this.player && this.player.record && this.player.record().getEngine()) {
      const kinesisVideoProducer = this.player.record().getEngine().getKinesisVideoProducer();
      if (kinesisVideoProducer) {
        kinesisVideoProducer.stop();
      }
    }
  }
  
  private saveRecordingToKinesis() {
    if (this.player && this.player.record) {
      this.player.record().saveAs({
        'video': 'my-video-file-name.webm'
      });
      this.stopStreamingToKinesis();
    }
  }
}
