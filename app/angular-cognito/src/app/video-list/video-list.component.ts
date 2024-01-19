// video-list.component.ts
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

  constructor(
    private videoListingService: VideoListingService,
    private cognitoService: CognitoService
  ) { }

  ngOnInit(): void {
    this.loadVideos();
    this.loadAccountType();
  }

  loadVideos(): void {
    this.videoListingService.getVideos().subscribe(
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
}
