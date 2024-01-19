import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { IUser, CognitoService } from '../cognito.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import * as AWS from 'aws-sdk';

@Component({
  selector: 'app-video-recorder',
  templateUrl: './video-recorder.component.html',
  styleUrls: ['./video-recorder.component.scss']
  
})

export class VideoRecorderComponent implements AfterViewInit {

  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;


  loading: boolean;
  user: IUser;
  isAuthenticated: boolean;

  private stream!: MediaStream;
  private kinesisVideoClient: AWS.KinesisVideo | null = null;
  private kinesisVideoStream: MediaStream | null = null;
  private kinesisVideoStreamArn: string | null = null;
  selectedFile: File | null = null;
  private s3: AWS.S3;
  private recordedChunks: Blob[] = [];
  private playbackBlobURL: string | null = null;

  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;

  constructor(private cognitoService: CognitoService, private router: Router) {
    this.loading = false;
    this.user = {} as IUser;
    this.isAuthenticated = true;
    AWS.config.update({
      accessKeyId: environment.aws.accessKeyId,
      secretAccessKey: environment.aws.secretAccessKey,
      sessionToken: environment.aws.sessionToken,
      region: environment.aws.region
    });
    this.s3 = new AWS.S3();
  }

  ngAfterViewInit() {
    let video: HTMLVideoElement = this.video.nativeElement;
    video.muted = false;
    video.controls = true;
    video.autoplay = false;

    AWS.config.update({
      accessKeyId: environment.aws.accessKeyId,
      secretAccessKey: environment.aws.secretAccessKey,
      sessionToken : environment.aws.sessionToken,
      region: environment.aws.region
    });

    this.kinesisVideoClient = new AWS.KinesisVideo();
    this.createKinesisVideoStream();
  }

  createKinesisVideoStream() {
    const params = {
      StreamName: 'prvcy_stream',
    };
    this.kinesisVideoClient!.describeStream(params, (err: AWS.AWSError, data: AWS.KinesisVideo.DescribeStreamOutput) => {
      if (err) {
        console.error('Error describing Kinesis Video stream:', err);
      } else {
        console.log('Kinesis Video stream described successfully:', data);

        this.kinesisVideoStreamArn = data.StreamInfo?.StreamARN ?? null;

        this.startRecording();
      }
    });
  }

  toggleControls() {
    let video: HTMLVideoElement = this.video.nativeElement;
    video.muted = !video.muted;
    video.controls = !video.controls;
    video.autoplay = !video.autoplay;
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
    let stream = this.stream;
    stream.getAudioTracks().forEach(track => track.stop());
    stream.getVideoTracks().forEach(track => track.stop());
    const recordedBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
    this.playbackBlobURL = URL.createObjectURL(recordedBlob);
    //this.playback();
    //this.uploadToS3();
  }

  private uploadToS3() {
    console.log('Recorded Chunks:', this.recordedChunks);
    const recordedBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
    console.log('Blob size:', recordedBlob.size);
    const timestamp = new Date().toISOString();
    const key = `private/recorded-video-${timestamp}.webm`;
    this.recordedChunks = [];
    const params: AWS.S3.PutObjectRequest = {
      Bucket: 'prvcy-storage-ba20e15b50619-staging',
      Key: key,
      Body: recordedBlob,
      ContentType: 'video/webm',
    };

    this.s3.upload(params, (err, data) => {
      if (err) {
        console.error('Error uploading to S3:', err);
      } else {
        console.log('Upload to S3 successful:', data);
      }
    });
  }
  successCallback(stream: MediaStream) {
    this.stream = stream;
  
    if (this.stream && this.stream.getVideoTracks().length > 0 && this.stream.getAudioTracks().length > 0) {
      let video: HTMLVideoElement = this.video.nativeElement;
      video.srcObject = stream;
      this.toggleControls();
  
      this.kinesisVideoStream = new MediaStream();
  
      const videoTracks = this.stream.getVideoTracks();
      const audioTracks = this.stream.getAudioTracks();
  
      if (videoTracks.length > 0) {
        this.kinesisVideoStream.addTrack(videoTracks[0]);
      }
  
      if (audioTracks.length > 0) {
        this.kinesisVideoStream.addTrack(audioTracks[0]);
      }

      const mediaRecorder = new MediaRecorder(this.kinesisVideoStream);
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
  
      mediaRecorder.onstop = () => {
        console.log('Recording stopped. Recorded chunks:', this.recordedChunks);
      };
  
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 5000);
    } else {
      console.error('Error: Media stream is not available or does not have video/audio tracks.');
    }
  }
  download() {
    const recordedBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
    const downloadLink = document.createElement('a');
    const url = URL.createObjectURL(recordedBlob);

    downloadLink.href = url;
    downloadLink.download = 'recorded-video.webm';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    URL.revokeObjectURL(url);

  }

  playback(){

    console.log("TEST");

    let video: HTMLVideoElement = this.video.nativeElement;
    video.src = 'assets/test-video.mp4';
    video.load();
    video.play().catch(error => {
      console.error('Error attempting to play the video:', error);
    })

      /*
     if(this.playbackBlobURL){
      console.log("Playback started"); //Testing
      let video: HTMLVideoElement = this.video.nativeElement;
      video.src = this.playbackBlobURL;
      video.load();
      video.controls = true;
      video.play().catch(err => console.error('Error playing back the video:', err));
      } else {
        console.error("Playback URL not available");
      }
      */

      /*
      if (this.recordedChunks.length > 0) {
        const recordedBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.playbackBlobURL = URL.createObjectURL(recordedBlob);
      
        const video: HTMLVideoElement = this.videoElement.nativeElement;
        video.src = this.playbackBlobURL;
        video.load();
        video.play().catch(err => console.error('Error playing back the video:', err));
      } else {
        console.error("No recorded video available for playback");
      }
      */
    
  }

}