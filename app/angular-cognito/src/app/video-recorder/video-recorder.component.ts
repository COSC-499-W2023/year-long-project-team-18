import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core';
import { IUser, CognitoService } from '../cognito.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import * as AWS from 'aws-sdk';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-video-recorder',
  templateUrl: './video-recorder.component.html',
  styleUrls: ['./video-recorder.component.scss'],
})

export class VideoRecorderComponent implements AfterViewInit, OnDestroy {

  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;

  playbackDisabled: boolean = true;
  submitDisabled: boolean = true;
  recordAgain: boolean = true;
  recordHidden: boolean = false;
  loading: boolean;
  user: IUser;
  isAuthenticated: boolean;

  videoName: string = '';
  isSubmitDisabled: boolean = true;

  private stream!: MediaStream;
  private kinesisVideoClient: AWS.KinesisVideo | null = null;
  private kinesisVideoStream: MediaStream | null = null;
  private kinesisVideoStreamArn: string | null = null;
  selectedFile: File | null = null;
  private s3: AWS.S3;
  private recordedChunks: Blob[] = [];
  private mediaRecorder: MediaRecorder | null = null;

  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;

  constructor(private cognitoService: CognitoService, private router: Router, public dialog: MatDialog) {
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
      sessionToken: environment.aws.sessionToken,
      region: environment.aws.region
    });
  
    this.kinesisVideoClient = new AWS.KinesisVideo();
    this.createKinesisVideoStream();
  }
  ngOnDestroy() {
    this.stopCamera();
  }

  private stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
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
    this.recordHidden = true;
    let mediaConstraints: MediaStreamConstraints = {
      video: {
        width: { min: 1280 },
        height: { min: 720 },
      },
      audio: true,
    };

    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then((stream: MediaStream) => this.successCallback(stream))
      .catch((error) => this.errorCallback(error));
  }

  startRecordingButtonClicked() {
    this.playbackDisabled = true;
    this.submitDisabled = true;
    this.startRecording();
  }

  stopRecording() {
    this.recordHidden = false;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    let stream = this.stream;
    stream.getAudioTracks().forEach(track => track.stop());
    stream.getVideoTracks().forEach(track => track.stop());
    const recordedBlob = new Blob(this.recordedChunks, { type: 'video/webm' });

    this.recordedChunks = [];
    this.mediaRecorder = null;
    this.playbackDisabled = false;
    this.submitDisabled = false;
    this.recordAgain = false;
  }

  private uploadToS3(videoName: string, format: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.cognitoService.getUsername()
        .then(username => {
          console.log('Username:', username);
  
          if (!username) {
            console.error('User information not available for creating a folder.');
            reject('User information not available for creating a folder.');
            return;
          }
  
          const folderKey = `${username}/`;
  
          this.s3.headObject({ Bucket: 'prvcy-storage-ba20e15b50619-staging', Key: folderKey }, (err, metadata) => {
            if (err && err.code === 'NotFound') {
              this.s3.putObject({ Bucket: 'prvcy-storage-ba20e15b50619-staging', Key: folderKey }, (folderErr, folderData) => {
                if (folderErr) {
                  console.error('Error creating user folder in S3:', folderErr);
                  reject('Error creating user folder in S3.');
                } else {
                  console.log('User folder created successfully in S3:', folderData);
                  this.uploadVideo(username, videoName, format, resolve, reject);
                }
              });
            } else if (!err) {
              this.uploadVideo(username, videoName, format, resolve, reject);
            } else {
              console.error('Error checking user folder in S3:', err);
              reject('Error checking user folder in S3.');
            }
          });
        })
        .catch(error => {
          console.error('Error getting username:', error);
          reject('Error getting username.');
        });
    });
  }

  private uploadVideo(username: string, videoName: string, format: string, resolve: () => void, reject: (error: string) => void) {
    if (!videoName.trim()) {
      console.error('Video name cannot be empty');
      reject('Video name cannot be empty.');
      return;
    }
  
    const key = `${username}/${videoName}.${format}`;
  
    const recordedBlob = new Blob(this.recordedChunks, { type: `video/${format}` });
    this.recordedChunks = [];
  
    const params: AWS.S3.PutObjectRequest = {
      Bucket: 'prvcy-storage-ba20e15b50619-staging',
      Key: key,
      Body: recordedBlob,
      ContentType: `video/${format}`,
    };
  
    this.s3.upload(params, (uploadErr, data) => {
      if (uploadErr) {
        console.error('Error uploading to S3:', uploadErr);
        reject('Error uploading to S3.');
      } else {
        console.log('Upload to S3 successful:', data);
        this.transcriptionCreation(username, videoName, key);
        resolve();
      }
    });
  }

  async transcriptionCreation(username: string, videoName: string, key: string) {
    try {
      await this.transcribeUpload(username, videoName, key);
      await this.checkTranscription(`${videoName}-captions`);
      this.router.navigate(['/share-video']);
    } catch (err) {
      console.log(err);
    }
  }
 
  private transcribeUpload(username: string, videoName: string, mediaFileKey: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const { TranscribeClient, StartTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");
    const region = environment.aws.region;
    const credentials = {
      accessKeyId: environment.aws.accessKeyId,
      secretAccessKey: environment.aws.secretAccessKey,
      sessionToken: environment.aws.sessionToken
    };
    const transcribeConfig = {
      region,
      credentials
    };
    const input = {
      TranscriptionJobName: `${videoName}-captions`,
      LanguageCode: "en-US",
      Media: {
        MediaFileUri: `s3://prvcy-storage-ba20e15b50619-staging/${mediaFileKey}`
      },
      OutputBucketName: 'prvcy-storage-ba20e15b50619-staging',
      OutputKey: `${username}-captions/${videoName}-captions.vtt`
    };
    async function startTranscriptionRequest() {
      
      const transcribeClient = new TranscribeClient(transcribeConfig);
      const transcribeCommand = new StartTranscriptionJobCommand(input);
      console.log(`s3://prvcy-storage-ba20e15b50619-staging/${mediaFileKey}`);
      try {
        const transcribeResponse = await transcribeClient.send(transcribeCommand);
        console.log("Transcription job created, the details:");
        console.log(transcribeResponse.TranscriptionJob);
        resolve();
      } catch(err) {
        console.log(err);
        reject('Unable to create transcription job.');
      }
    }
    startTranscriptionRequest();
    }) 
  }

  checkTranscription(transcriptionJobName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const { TranscribeClient, GetTranscriptionJobCommand, GetTranscriptionJobResponse } = require("@aws-sdk/client-transcribe");
      const region = environment.aws.region;
      const credentials = {
        accessKeyId: environment.aws.accessKeyId,
        secretAccessKey: environment.aws.secretAccessKey,
        sessionToken: environment.aws.sessionToken
      };
      const transcribeConfig = {
        region,
        credentials
      };
      const input = {
        TranscriptionJobName: transcriptionJobName
      }
      console.log(input);
      var done = false;
      async function check() {
        const transcribeClient = new TranscribeClient(transcribeConfig);
        while (!done) {
          var transcribeCommand = new GetTranscriptionJobCommand(input);
          var transcribeResponse = await transcribeClient.send(transcribeCommand);
          try {
            if (transcribeResponse.TranscriptionJob.TranscriptionJobStatus === undefined) {
              done = false;
            } else if (transcribeResponse.TranscriptionJob.TranscriptionJobStatus == "IN_PROGRESS") {
              done = false;
            } else if (transcribeResponse.TranscriptionJob.TranscriptionJobStatus == "FAILED") {
              done = true;
              reject('Transcription job failed. No captions will be generated.');
            } else if (transcribeResponse.TranscriptionJob.TranscriptionJobStatus == "COMPLETED") {
              done = true;
              console.log('Transcription job finished, moving onto the next page.')
              resolve();
            }
          } catch (err) {
            console.log(err);
            continue;
          } 
        }
      }
      check();  
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

      this.mediaRecorder = new MediaRecorder(this.kinesisVideoStream);
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        console.log('Recording stopped. Recorded chunks:', this.recordedChunks);
      };

      this.mediaRecorder.start();
      setTimeout(() => this.mediaRecorder?.stop(), 100000);
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

  async submitVideo() {
    if (this.recordedChunks.length === 0) {
      console.error('No recorded video to submit');
      return;
    }
    if (this.videoName.trim() === '') {
      console.error('Video name cannot be empty');
      return;
    }

    try {
      await this.uploadToS3(this.videoName.trim(), 'mp4');
      this.videoName = '';
      this.isSubmitDisabled = true;
    } catch (error) {
      console.error('Error during S3 upload:', error);
    }
  }

  onVideoNameChange() {
    this.isSubmitDisabled = this.videoName.trim() === '';
  }

  addCommentToVideo(){

  }

  playback(){
    if (this.recordedChunks.length > 0) {
      const recordedBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
      const playbackBlobURL = URL.createObjectURL(recordedBlob);
      let newvideo: HTMLVideoElement = this.video.nativeElement;
      window.open(playbackBlobURL, '_blank');
    }
    else {
      console.error("No recorded video available for playback");
    } 
  }

  animal: string | undefined;
  name: string | undefined;

  openDialog(): void {
    this.dialog.open(DialogOverviewExampleDialog);
  }

}

export class DialogOverviewExampleDialog {
  
}