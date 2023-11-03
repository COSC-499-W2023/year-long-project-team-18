
import {describe, expect, test} from '@jest/globals';
import { AppComponent } from './app.component';
import { Amplify, Auth } from "aws-amplify";
import { createComponent } from '@angular/core';


describe('AppComponent', () => {
    let component: AppComponent;
    test('app is created',()=>{
        expect(component)
    });

});