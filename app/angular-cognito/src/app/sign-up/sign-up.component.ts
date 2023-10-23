import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { IUser, CognitoService} from '../cognito.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {

  loading: boolean;
  isConfirm: boolean;
  user: IUser;

  constructor(private router: Router, private cognitoService: CognitoService){
    this.loading = false;
    this.isConfirm = false;
    this.user = {} as IUser;
  }

  public signUp(): void {
    this.loading = true;
    this.cognitoService.signUp(this.user)
      .then(() => {
        this.loading = false;
        this.isConfirm = true;
      })
      .catch((error) => {
        console.error('Sign Up Error:', error);
        this.loading = false;
      });
  }
  
  
  public confirmSignUp(): void {
    this.loading = true;
  
    this.cognitoService.confirmSignUp(this.user)
      .then((confirmationResult) => {
        // Confirmation was successful
        console.log('Confirmation result:', confirmationResult);
        this.router.navigate(['/signIn']);
      })
      .catch((error) => {
        console.error('Confirm Sign Up Error:', error);
        this.loading = false;
      });
  }
  public resendConfirmationCode(): void {
    this.loading = true;
  
    this.cognitoService.resendConfirmationCode(this.user)
      .then(() => {
        console.log('Code resent successfully');
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error resending code:', error);
        this.loading = false;
      });
  }
  
  
  

}
