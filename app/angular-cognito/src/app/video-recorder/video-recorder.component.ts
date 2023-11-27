import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CognitoService, IUser } from '../cognito.service';
import { Router } from '@angular/router';
import videojs from 'video.js';
import 'videojs-record/dist/videojs.record.js';

@Component({
  selector: 'app-video-recorder',
  templateUrl: './video-recorder.component.html',
  styleUrls: ['./video-recorder.component.scss']
})
export class VideoRecorderComponent implements AfterViewInit, OnInit, OnDestroy {

  config: any;
 player: any;

  constructor(private cognitoService: CognitoService, private router: Router) {
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
          debug: true,
          maxRecordingLength:0,
        }
      }
    };
  }

  ngOnInit(): void {
    this.checkAuthenticationStatus();
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
  
      this.player.on('error', (error: any) => {
        console.error('Video.js error:', error);
      });
      this.player.record();
    } else {
      console.error('Video element not found!');
    }
  }
  

  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
  }


  startRecording() {
    if (this.player && this.player.record) {
      if (!this.player.record().isRecording()) {
        this.player.record().start();
        console.log('Recording started!');
      } else {
        console.warn('Recording is already in progress.');
      }
    } else {
      console.error('Recording not available or player not ready.');
    }
  }
  
  stopRecording() {
    if (this.player && this.player.record) {
      if (this.player.record().isRecording()) {
        this.player.record().stop();
        console.log('Recording stopped!');
      } else {
        console.warn('No recording in progress.');
      }
    } else {
      console.error('Recording not available or player not ready.');
    }
  }
  
  saveRecording() {
    if (this.player && this.player.record) {
      const isRecording = this.player.record().isRecording();
      if (isRecording) {
        this.player.record().saveAs({ 'video': 'my-video-file-name.webm' });
        console.log('Recording saved!');
      } else {
        console.warn('No recording to save.');
      }
    } else {
      console.error('Recording not available or player not ready.');
    }
  }
}