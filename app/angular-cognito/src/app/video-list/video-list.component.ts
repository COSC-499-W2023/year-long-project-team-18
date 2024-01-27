import { Component, OnInit } from '@angular/core';
import { VideoListingService } from '../video-listing.service';
import { CognitoService, IUser } from '../cognito.service';
import { VideoMetadata } from '../video-metadata.model';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss']
})
export class VideoListComponent implements OnInit {
  videos: VideoMetadata[] = [];
  accountType: string | undefined;
  contactList: any[] = [];
  selectedContact: any;  

  constructor(
    private VideoListingService: VideoListingService,
    private cognitoService: CognitoService
  ) { }

  ngOnInit(): void {
    this.loadVideos();
    this.loadAccountType();
    this.fetchContactList();
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

  async fetchContactList() {
    try {
      const usernames = await this.cognitoService.getContactListFromS3();
      const ownUsername = await this.cognitoService.getUsername();
      const filteredUsernames = usernames.filter(username => username !== ownUsername);
      
      this.contactList = filteredUsernames;
    } catch (error) {
      console.error('Error fetching usernames from S3:', error);
    }
  }

  sendSelectedVideosToContact(contact: any): void {
    const selectedVideos = this.videos.filter(video => video.isSelected);
  
    if (selectedVideos.length > 0) {
      const sourceKeys = selectedVideos.map(video => video.key);
      console.log('Source Keys:', sourceKeys);
  
      sourceKeys.forEach(sourceKey => {
        this.cognitoService.copyVideoToContactFolder(sourceKey, contact).then(
          () => {
            console.log(`Video successfully sent to ${contact}`);
          },
          (error) => {
            console.error(`Error sending video to ${contact}:`, error);
          }
        );
      });
    }
  }
}