import {Component} from '@angular/core';
import {Loading, Alert, Modal, NavController, Config, Storage, LocalStorage} from 'ionic-angular';
import {MentorPage} from '../mentor/mentor';
import {HomestayPage} from '../homestay/homestay';
import {LoginService} from '../../providers/login-service/login-service';

@Component({
  templateUrl: 'build/pages/login/login.html?7290',
  providers: [LoginService]
})
export class LoginPage {
  loginCode: string;
  loginCode1: string;
  loginCode2: string;
  loginCode3: string;
  loginCode4: string;
  loginCode5: string;
  loginCode6: string;
  firstName: string;
  lastName: string;
  isHandling: boolean;
  loginCodeCorrect: boolean;
  response: any;
  local: any;

  constructor(public nav:NavController, 
              public config:Config,
              public loginService: LoginService) {
    this.nav = nav;
    this.loginCode = "";
    this.loginCode1 = "";
    this.loginCode2 = "";
    this.loginCode3 = "";
    this.loginCode4 = "";
    this.loginCode5 = "";
    this.loginCode6 = "";
    this.firstName = "";
    this.lastName = "";
    this.isHandling = false;
    this.loginCodeCorrect = false;
    this.local = new Storage(LocalStorage);
  }

  handleCodeInput(codeInput) {
    if(this.isHandling) {
      return;
    }
    this.isHandling = true;
    codeInput.value = codeInput.value.replace(/[^\d]/g,'');
    
    if(codeInput.value) {
      this.loginCode1 = codeInput.value.substr(0,1);
      this.loginCode2 = codeInput.value.substr(1,1);
      this.loginCode3 = codeInput.value.substr(2,1);
      this.loginCode4 = codeInput.value.substr(3,1);
      this.loginCode5 = codeInput.value.substr(4,1);
      this.loginCode6 = codeInput.value.substr(5,1);
    } else {
      this.loginCode1 = '';
      this.loginCode2 = '';
      this.loginCode3 = '';
      this.loginCode4 = '';
      this.loginCode5 = '';
      this.loginCode6 = '';
    }
    if (codeInput.value && codeInput.value.length == 6) {
      setTimeout(()=>{
        codeInput.blur(); 
        this.validateLoginCode();
      }, 350);
    } else {
      this.isHandling = false; 
      this.loginCodeCorrect = false; 
    }
  }

  validateLoginCode() {
    let loading = Loading.create({
      content: "loading...",
    });

    this.nav.present(loading);

    this.loginService.validateLoginCode(this.loginCode, '', '')
    .then(data => {
      this.response = data;
      if(this.response.hash){
        this.firstName = this.response.first_name; 
        this.lastName = this.response.last_name; 
        this.loginCodeCorrect = true;
        this.config.set('HASH', this.response.hash);
        this.local.set('HASH', this.response.hash);
      } else {
        this.firstName = ""; 
        this.lastName = ""; 
        this.codeIncorrect('Password error', 'Please try again later');    
        this.loginCodeCorrect = false;
      }
      this.isHandling = false;
      loading.dismiss();
    });
  }

  codeIncorrect(title, message) {
    let alert = Alert.create({
      title: title,
      message: message,
      buttons: ['OK']
    });
    this.nav.present(alert);
  }

  login() {
    if(this.loginCodeCorrect) {
      if(this.firstName && this.lastName) {
        this.loginService.validateLoginCode(this.loginCode, this.firstName, this.lastName)
        .then(data => {
          this.response = data;
          if(this.response.hash) {
            this.config.set('HASH', this.response.hash);
            this.local.set('HASH', this.response.hash);
            this.local.set('AUTHORIZED', true);
            if(this.response.is_homestay) {
              this.config.set('HOMESTAY', true);
              this.config.set('MENTOR', false);
              this.local.set('HOMESTAY', true);
              this.local.set('MENTOR', false);
              this.nav.setRoot(HomestayPage);
            } else {
              this.config.set('HOMESTAY', false);
              this.config.set('MENTOR', true);
              this.local.set('HOMESTAY', false);
              this.local.set('MENTOR', true);
              this.nav.setRoot(MentorPage);
            }
          } else if(this.response.error){
            this.codeIncorrect('Error.', this.response.error.message);    
          }
        });
      } else {
        this.codeIncorrect('Name cannot be empty', '');    
      }
    } else {
      this.codeIncorrect('Password error', 'Please try again later');    
    }
  }
}
