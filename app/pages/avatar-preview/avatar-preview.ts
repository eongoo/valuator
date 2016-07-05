import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

/*
  Generated class for the AvatarPreviewPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/avatar-preview/avatar-preview.html',
})
export class AvatarPreviewPage {
  guest: any;
  loaded: boolean;
  constructor(public params: NavParams, public viewCtrl: ViewController) {
    this.guest = this.params.get('guest');  
    this.loaded = false;
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  avatarLoaded() {
    console.log('Loaded');
    this.loaded = true;
  }
}
