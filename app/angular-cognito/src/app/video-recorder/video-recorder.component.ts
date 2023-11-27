import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import { IUser, CognitoService } from '../cognito.service';
import { Router } from '@angular/router';
import AWS, { S3 } from 'aws-sdk';
import { CognitoIdentityCredentials } from 'aws-sdk';

@Component({
  selector: 'app-video-recorder',
  templateUrl: './video-recorder.component.html',
  styleUrls: ['./video-recorder.component.scss']
})
export class VideoRecorderComponent implements AfterViewInit {

  private stream!: MediaStream;
  private recordRTC: any;
  

  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;


  constructor(private cognitoService: CognitoService, private router: Router) {}
  ngAfterViewInit() {
    let video: HTMLVideoElement = this.video.nativeElement;
    video.muted = false;
    video.controls = true;
    video.autoplay = false;
  }

  toggleControls() {
    let video: HTMLVideoElement = this.video.nativeElement;
    video.muted = !video.muted;
    video.controls = !video.controls;
    video.autoplay = !video.autoplay;
  }

  successCallback(stream: MediaStream) {
    this.stream = stream;
    if (this.stream) {
      let options = {
        type: 'video',
        mimeType: 'video/webm',
        bitsPerSecond: 500000,
      };

      this.recordRTC = new RecordRTC(this.stream, {
        type: 'video',
        mimeType: 'video/webm',
        bitsPerSecond: 5000000,
      });
      this.recordRTC.startRecording();
  
      let video: HTMLVideoElement = this.video.nativeElement;
      video.srcObject = stream;
      this.toggleControls();
    } else {
      console.error('Error: Media stream is not available.');
    }
  }

  processVideo(audioVideoWebMURL: any) {
    let video: HTMLVideoElement = this.video.nativeElement;
    let recordRTC = this.recordRTC;
    video.src = audioVideoWebMURL;
    this.toggleControls();
    var recordedBlob = recordRTC.getBlob();
  }
  
  errorCallback(error: any) {
    console.error('Error accessing media devices:', error);
  }

  startRecording() {
    let mediaConstraints: MediaStreamConstraints = {
      video: {
        width: { min: 1280 },
        height: { min: 720 },
      },
      audio: true,
    };
  
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallback.bind(this))
      .catch(this.errorCallback.bind(this));
  }
  

  stopRecording() {
    let recordRTC = this.recordRTC;
    recordRTC.stopRecording(this.processVideo.bind(this));
    let stream = this.stream;
    stream.getAudioTracks().forEach(track => track.stop());
    stream.getVideoTracks().forEach(track => track.stop());
  }

  download() {
    this.recordRTC.save('video.webm');
  }

  saveToS3() {
    if (this.recordRTC) {
      const recordedBlob = this.recordRTC.getBlob();

      const bucketName = 'prvcy';
      const key = `videos/${Date.now()}_recorded_video.webm`;

      const identityPoolId = 'ca-central-1:4fb80f2f-1e09-4c97-9ac7-d9490489e35e';
      const region = 'ca-central-1';

      const credentials = new CognitoIdentityCredentials({
        IdentityPoolId: identityPoolId,
      });

      AWS.config.credentials = credentials;

      const s3 = new AWS.S3({
        region: region,
      });

      const params = {
        Bucket: bucketName,
        Key: key,
        Body: recordedBlob,
        ContentType: 'video/webm',
      };

      s3.upload(params, (err: Error | null, data: S3.ManagedUpload.SendData) => {
        if (err) {
          console.error('Error uploading to S3:', err);
        } else {
          console.log('Upload successful. Object URL:', data.Location);
        }
      });
      
    } else {
      console.error('No recording to save.');
    }
  }
}