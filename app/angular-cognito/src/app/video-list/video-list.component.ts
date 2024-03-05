import { Component, OnInit } from '@angular/core';
import { VideoListingService } from '../video-listing.service';
import { CognitoService, IUser } from '../cognito.service';
import { VideoMetadata } from '../video-metadata.model';
import { SNS } from 'aws-sdk';
import { Router } from '@angular/router';

import { videolist } from './videolist';
import { VideoListService } from './videolist.service';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss']
})
export class VideoListComponent implements OnInit {
  videos: VideoMetadata[] = [];
  accountType: string | undefined;
  user: videolist = {username: '', organizationcode: '', email:''};
  IUser: IUser;
  contactList: videolist[] = [];
  email: videolist[] = [];
  selectedContact: any;  
  private sns: SNS;

  constructor(
    private VideoListingService: VideoListingService,
    private cognitoService: CognitoService,
    private VideoListService: VideoListService,
    private router: Router
  ) { this.IUser = {} as IUser; 
      this.sns = new SNS();
    }




  ngOnInit(): void {
    this.cognitoService.getUser()
    .then((IUser: any) => {
      this.IUser = IUser.attributes;
    }).then(()=>{
      this.loadVideos();
      this.loadAccountType();
      this.fetchContactList();
    })

  }

  loadVideos(): void {
    this.VideoListingService.getVideos().subscribe(
      (videos: VideoMetadata[]) => {
        console.log('Videos:', videos);
        this.videos = videos;
      },
      error => {
        console.error('Error fetching videos:', error);
      }
    );
  }

  loadAccountType(): void {
    this.cognitoService.getAccountType().then((accountType) => {
      this.accountType = accountType;
    });
  }

  getVideoUrl(videoKey: string): string {
    return `https://prvcy-storage-ba20e15b50619-staging.s3.amazonaws.com/${videoKey}`;
  }

  // getCaptionsUrl(videoKey: string): string {
  //   //this.user = {username: this.IUser.username, organizationcode: this.IUser['custom:organization']};
  //   const username = this.cognitoService.getUsername();
  //   const captionKey = videoKey.substring(0, videoKey.length - 4) + "-captions.vtt";
  //   const captionFolderKey = username;
  //   return `https://prvcy-storage-ba20e15b50619-staging.s3.amazonaws.com/${captionFolderKey}/${captionKey}`;
  // }
fetchContactList() {
    try {
      console.log(this.IUser.username);
      
      this.user = {username: this.IUser.username, organizationcode: this.IUser['custom:organization'], email: this.IUser.email};
      this.VideoListService.getAll(this.user).subscribe(
        (data: videolist[])=>{
          this.contactList = data;
        }
      )
    } catch (error) {
      console.error('Error fetching usernames from S3:', error);
    }
  }

  sendSelectedVideosToContact(contact: any): void {
    const selectedVideos = this.videos.filter(video => video.isSelected);
  
    if (selectedVideos.length > 0) {
      const sourceKeys = selectedVideos.map(video => video.key);
      console.log('Source Keys:', sourceKeys);
      const sendPromises: Promise<void>[] = [];
  
      sourceKeys.forEach(sourceKey => {
        const sendPromise = this.cognitoService.copyVideoToContactFolder(sourceKey, contact).then(
          () => {
            console.log(`Video successfully sent`);
            return this.sendMessageToUser(contact, 'Your new video has been sent!');
          },
          (error) => {
            console.error(`Error sending video:`, error);
          }
        );
  
        sendPromises.push(sendPromise);
      });
  
      Promise.all(sendPromises).then(() => {
        console.log('All videos sent successfully');
        this.router.navigate(['/dashboard']);
      }).catch(error => {
        console.error('Error sending videos:', error);
      });
    }
  }

  async sendRequest(contact: any, message: string): Promise<void>{
    try{
      this.VideoListService.getEmail({username: '', organizationcode: '', email: ''}).subscribe(
        (data: videolist[])=>{
          this.email = data;
        }
      )
      const params = {
        Message: message,
        Subject: 'New Request Received',
        TopicArn: 'arn:aws:sns:ca-central-1:952490130013:prvcy',
        MessageAttributes: {
          email:{
            DataType: 'String',
            StringValue: this.email[0].email
          }
        }
      };
      await this.sns.publish(params).promise();
      console.log(`Message sent to ${this.email[0].email}`)
    }catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }

  }
  

  async sendMessageToUser(userEmail: string, message: string): Promise<void> {
    try {
      const params = {
        Message: message,
        Subject: 'New Video Sent',
        TopicArn: 'arn:aws:sns:ca-central-1:952490130013:prvcy',
        MessageAttributes: {
          email: {
            DataType: 'String',
            StringValue: userEmail
          }
        }
      };
  
      await this.sns.publish(params).promise();
      
      console.log(`Message sent to ${userEmail}`);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}