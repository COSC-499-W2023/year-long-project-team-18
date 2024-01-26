// sign-up.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';

import { IUser, CognitoService } from '../cognito.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {

  loading: boolean;
  user: IUser;

  constructor(private router: Router, private cognitoService: CognitoService) {
    this.loading = false;
    this.user = {} as IUser;
  }

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  isEmailValid(): boolean {
    return this.emailFormControl.valid;
  }

  public signUp(username: string, organization: string): void {
    this.loading = true;
  
    if (organization == null) {
      this.user['custom:organization'] = 'default';
    }
    this.user.username = username;
  
    this.cognitoService.signUp(this.user)
      .then(() => {
        this.createS3UserFolder(username);
        this.router.navigate(['/signIn']);
      })
      .catch((error) => {
        console.error('Sign Up Error:', error);
        this.loading = false;
      });
  }
  
  private createS3UserFolder(username: string): void {
    const folderKey = `${username}/`;
    this.cognitoService.checkS3UserFolder(folderKey)
      .then(folderExists => {
        if (!folderExists) {
          this.cognitoService.createS3UserFolder(folderKey)
            .then(() => console.log('User folder created successfully in S3'))
            .catch(err => console.error('Error creating user folder in S3:', err));
        }
      })
      .catch(err => console.error('Error checking user folder in S3:', err));
  }

  public confirmSignUp(): void {
    this.loading = true;

    this.cognitoService.confirmSignUp(this.user)
      .then((confirmationResult) => {
        console.log('Confirmation result:', confirmationResult);
        this.router.navigate(['/signIn']);
      })
      .catch((error) => {
        console.error('Confirm Sign Up Error:', error);
        this.loading = false;
      });
  }
}
