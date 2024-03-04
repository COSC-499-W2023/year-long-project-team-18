import { Component, OnInit } from '@angular/core';
import { CognitoService, IUser } from '../cognito.service';
import { VideoListingService } from '../video-listing.service';
import { VideoMetadata } from '../video-metadata.model';

@Component({
  selector: 'app-video-sharing',
  templateUrl: './share-video.component.html',
  styleUrls: ['./share-video.component.scss']
})

export class ShareVideoComponent implements OnInit {
  contactList: any[] = [];
  selectedContact: any;  
  recentRecordedVideo: string = '';
  recentVideo: VideoMetadata | null = null;

  constructor(

    private VideoListingService: VideoListingService,
    private cognitoService: CognitoService
  ) { }

  ngOnInit() {
    this.fetchContactList();
    this.loadMostRecentVideo();
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
  

  loadMostRecentVideo(): void {
    this.VideoListingService.getVideos().subscribe(
      (videos: VideoMetadata[]) => {
        console.log('Videos:', videos);
        videos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.recentVideo = videos[0];
      },
      error => {
        console.error('Error fetching videos:', error);
      }
    );
  }
  

  getVideoUrl(videoKey: string): string {
    return `https://prvcy-storage-ba20e15b50619-staging.s3.amazonaws.com/${videoKey}`;
  }

  getCaptionsUrl(videoKey: string): string {
    const array = videoKey.split("/");
    const videoKeyFile = array[1].substring(0, array[1].length - 4) + "-captions.vtt";
    const videoKeyFolder = array[0] + "-captions";
    return `https://prvcy-storage-ba20e15b50619-staging.s3.amazonaws.com/${videoKeyFolder}/${videoKeyFile}`;
  }

  sendVideoToContact(contact: any) {
    if (this.recentVideo) {
      const sourceKey = this.recentVideo.key;
      console.log('Source Key:', sourceKey);
    
      this.cognitoService.copyVideoToContactFolder(sourceKey, contact).then(
        () => {
          console.log(`Video successfully sent to ${contact}`);
        },
        (error) => {
          console.error(`Error sending video to ${contact}:`, error);
        }
      );
    }
  }  
}