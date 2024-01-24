// sign-up.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { IUser, CognitoService } from '../cognito.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {

  loading: boolean;
  user: IUser;
  hide = true;

  constructor(private router: Router, private cognitoService: CognitoService) {
    this.loading = false;
    this.user = {} as IUser;
  }

  email = new FormControl('', [Validators.required, Validators.email]);
  StrongPasswordRegx: RegExp =
  /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d).{8,}$/;

  password = new FormControl('', {
    validators: [Validators.required, Validators.pattern(this.StrongPasswordRegx)],
  })

  getPasswordErrorMessage(){
    if(this.password.hasError('required')){
      return 'You must enter a value';
    }
    return this.password.hasError('pattern') ? 'Password must contain an uppercase, lowercase and special character':'';
  }

  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }

    return this.email.hasError('email') ? 'Not a valid email' : '';
  }

  public signUp(organization: string): void {
    this.loading = true;

    if (organization == null) {
      this.user['custom:organization'] = 'default';
    }

    this.cognitoService.signUp(this.user)
      .then(() => {
        // Create user folder in S3 when sign-up is successful
        this.createS3UserFolder();
        this.router.navigate(['/signIn']);
      })
      .catch((error) => {
        console.error('Sign Up Error:', error);
        this.loading = false;
      });
  }

  private createS3UserFolder(): void {
    this.cognitoService.getUsername()
      .then(username => {
        console.log('Username:', username);

        if (!username) {
          console.error('User information not available for creating a folder.');
          return;
        }

        const folderKey = `${username}/`;

        // Check if the folder already exists
        this.cognitoService.checkS3UserFolder(folderKey)
          .then(folderExists => {
            if (!folderExists) {
              // Create the folder in S3
              this.cognitoService.createS3UserFolder(folderKey)
                .then(() => console.log('User folder created successfully in S3'))
                .catch(err => console.error('Error creating user folder in S3:', err));
            }
          })
          .catch(err => console.error('Error checking user folder in S3:', err));
      })
      .catch(error => {
        console.error('Error getting username:', error);
      });
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
