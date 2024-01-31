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

<<<<<<< Updated upstream
  isEmailValid(): boolean {
    return this.emailFormControl.valid;
=======
  password = new FormControl('', {
    validators: [Validators.required, Validators.pattern(this.StrongPasswordRegx), Validators.minLength(8)],
  })

  getPasswordErrorMessage(){
    if(this.password.hasError('required')){
      return 'You must enter a value';
    }if(this.password.hasError('minlength')){
      return 'Must be 8 characters';
    }
    return this.password.hasError('pattern') ? 'Password must contain an uppercase, number and special character':'';
>>>>>>> Stashed changes
  }

  public signUp(username: string, organization: string): void {
    this.loading = true;
  
    if (organization == null) {
      this.user['custom:organization'] = 'default';
    }
    this.user.username = username;
  
    this.cognitoService.signUp(this.user)
      .then(() => {
<<<<<<< Updated upstream
        this.createS3UserFolder(username);
        this.router.navigate(['/signIn']);
=======
        this.createS3UserFolder(this.user.username);
        this.router.navigate(['/signIn']).then(()=>{
          this.snackBar.open("Successfully registered", "Dismiss",{duration: 5000})
        })
>>>>>>> Stashed changes
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