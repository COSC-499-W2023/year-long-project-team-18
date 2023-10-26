import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {Amplify, Auth } from 'aws-amplify';

import { environment } from '../environments/environment';

export interface IUser {
  email: string;
  username: string;
  password: string;
  showPassword: boolean;
  code: string;
  given_name: string;
  family_name: string;
  birthdate: string;
  'custom:account_type': string;
}



@Injectable({
  providedIn: 'root'
})
export class CognitoService {
  private authenticationSubject: BehaviorSubject<any>;
  

  constructor() {
    Amplify.configure({
      Auth: environment.cognito
    });

    this.authenticationSubject = new BehaviorSubject<boolean>(false);

   }

   public signIn(user: IUser): Promise<any> {
    return Auth.signIn(user.email, user.password)
    .then(() => {
      this.authenticationSubject.next(true);
    });
  }

  public signUp(user: IUser): Promise<any>{
    return Auth.signUp({
      username: user.username,
      password: user.password,
      attributes: {
        email: user.email,
        given_name: user.given_name,
        family_name: user.family_name,
        birthdate: user.birthdate,
        'custom:account_type': user['custom:account_type']
      }
    });
  }
  

   public confirmSignUp(user: IUser): Promise<any>{
    return Auth.confirmSignUp(user.email, user.code);
   }

   public signOut(): Promise<any>{
    return Auth.signOut().then(()=>{
      this.authenticationSubject.next(false);
    });
   }

   public isAuthenticated(): Promise<boolean>{
    if(this,this.authenticationSubject.value){
      return Promise.resolve(true);
    }else{
      return this.getUser().then((user: any) =>{
        if(user){
          return true;
        }else{
          return false;
        }
      }).catch(()=>{
        return false;
      });
    }
   }

public resendConfirmationCode(user:IUser): Promise<any> {
  return Auth.resendSignUp(user.email);
}


   public getUser(): Promise<any>{
    return Auth.currentUserInfo();
   }

   public updateUser(user: IUser): Promise<any>{
    return Auth.currentUserPoolUser().then((cognitoUser: any)=>{
      return Auth.updateUserAttributes(cognitoUser, user);
    })
   }

}
