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

  fetchContactList() {
    this.cognitoService.getUsernames().then(
      (usernames: string[]) => {
        this.contactList = usernames;
      },
      (error) => {
        console.error('Error fetching usernames:', error);
      }
    );
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

  sendVideoToContact(contact: any) {
  }
}
