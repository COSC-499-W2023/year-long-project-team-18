import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { IUser, CognitoService } from '../cognito.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import * as AWS from 'aws-sdk';
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

@Component({
  selector: 'app-video-recorder',
  templateUrl: './video-recorder.component.html',
  styleUrls: ['./video-recorder.component.scss']
})
export class VideoRecorderComponent implements AfterViewInit {

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
    } else {
      console.error('Error: Media stream is not available or does not have video/audio tracks.');
    }
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
    this.uploadToS3();
  }

  private uploadToS3() {
    const recordedBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
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

  download() {
    // Add logic for downloading if needed
    
    const recordedBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
    const timestamp = new Date().toISOString();
    const key = `private/recorded-video-${timestamp}.webm`;

    const params: AWS.S3.PutObjectRequest = {
      Bucket: 'prvcy-storage-ba20e15b50619-staging',
      Key: key,
      // Body: recordedBlob,
      // ContentType: 'video/webm',
    };

    this.s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) {
        console.error('Error generating pre-signed URL:', err);
      } else {
        // Create a download link
        const fileName = `recorded-video-${timestamp}.webm`;
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName;
  
        // Append the link to the body and trigger the download
        document.body.appendChild(downloadLink);
        downloadLink.click();
    }
  });

  }
}
