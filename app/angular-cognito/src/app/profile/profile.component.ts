import { Component, OnInit } from '@angular/core';
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

import { IUser, CognitoService } from '../cognito.service';
import { ProfileUpdateService } from './profile-update-service';
import { profile } from './profile';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {

  loading: boolean;
  user: IUser;
  profile: profile = {organizationcode:'', username:''};


  constructor(private cognitoService: CognitoService, private profileUpdateService: ProfileUpdateService) {
    this.loading = false;
    this.user = {} as IUser;
  }

  public ngOnInit(): void {
    this.cognitoService.getUser()
    .then((user: any) => {
      this.user = user.attributes;
      console.log(this.user);
    });
  }

  updateDb(org: string){

    this.cognitoService.getUser()
    .then((user: any) => {

      user['custom:organization'] = org
      this.cognitoService.updateUser(this.user);
      this.profileUpdateService
      .update({organizationcode: org, username: user.username}).subscribe(
        (res)=>{
          console.log("Success")  
        }
      );
      
    });

  }

  public update(): void {
    this.loading = true;
    this.cognitoService.updateUser(this.user)
    .then(() => {
      this.loading = false;
    }).catch(() => {
      this.loading = false;
    });
  }

}