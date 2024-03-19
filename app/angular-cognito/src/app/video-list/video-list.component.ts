import { Component, OnInit } from '@angular/core';
import { VideoListingService } from '../video-listing.service';
import { CognitoService, IUser } from '../cognito.service';
import { VideoMetadata } from '../video-metadata.model';
import { SNS } from 'aws-sdk';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { videolist } from './videolist';
import { VideoListService } from './videolist.service';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss']
})
export class VideoListComponent implements OnInit {
  static fetchContactList() {
    throw new Error('Method not implemented.');
  }
  videos: VideoMetadata[] = [];
  accountType: string | undefined;
  user: videolist = {username: '', organizationcode: ''};
  IUser: IUser;
  contactList: videolist[] = [];
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
    return `https://rekognitionvideofaceblurr-inputimagebucket20b2ba6b-6anfoc4ah759.s3.amazonaws.com/${videoKey}`;
  }

fetchContactList() {
    try {
      console.log(this.IUser.username);
      
      this.user = {username: this.IUser.username, organizationcode: this.IUser['custom:organization']};
      this.VideoListService.getAll(this.user).subscribe(
        (data: videolist[])=>{
          this.contactList = data;
        }
      )
    } catch (error) {
      console.error('Error fetching usernames from S3:', error);
    }
  }

  async sendSelectedVideosToContact(contactUsername: string): Promise<void> {
    const selectedVideos = this.videos.filter(video => video.isSelected);
    if (selectedVideos.length > 0) {
      const senderId = await this.cognitoService.getUsername();
      console.log(senderId);
      const shareRequests$ = selectedVideos.map(video => 
        this.cognitoService.sendShareRequest(senderId, contactUsername, video.key)
      );
  
      forkJoin(shareRequests$).subscribe({
        next: () => {
          console.log('All share requests sent successfully');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error sending share requests:', error);
        }
      });
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