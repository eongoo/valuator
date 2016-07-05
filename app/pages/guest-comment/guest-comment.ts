import {Component} from '@angular/core';
import {NavController, NavParams, Config, Alert, Toast} from 'ionic-angular';
import {UploadService} from '../../providers/upload-service/upload-service';
import {SignPage} from '../../pages/sign-page/sign-page';

@Component({
  templateUrl: 'build/pages/guest-comment/guest-comment.html',
  providers: [UploadService]
})
export class GuestCommentPage {
  guest: any;
  group: any;
  response: any;
  constructor(private nav: NavController, public navParams:NavParams, public uploadService: UploadService) {
    this.guest = navParams.get('guest'); 
    this.group = navParams.get('group'); 
  }

  handleInput(input) {
    if(input.value) {
      this.guest.comment = input.value.replace(/^ +/, '');
    }
  }

  openSignPage() {
    this.nav.push(SignPage, {group: this.group, guest: this.guest});
  }

  openSignOrHomePage(event) {
    if(this.guest.comment) {
      this.uploadService.replaceGuestComment(this.guest, this.group._id)
      .then((data) => {
        if(data) {
          this.response = data;
          if(this.response.error) {
            this.presentAlert(this.response.error.message);
          } else {
            if(this.guest.step >= 4) {
              if(this.guest.step == 5) {
                this.nav.popToRoot();
              } else {
                this.openSignPage();
              }
            } else {
              this.guest.step = 4;
              this.presentToast();
            }
          }
        } 
      });
    } else {
      console.error('44:app/pages/evaluate-group/evaluate-group.ts');
    }
  }

  presentAlert(message) {
    let alert = Alert.create({
      title: 'Error.',
      subTitle: message,
      buttons: ['Dismiss']
    });
    this.nav.present(alert);
  }

  presentToast() {
    let toast = Toast.create({
      message: 'Thanks.',
      duration: 2000,
      position: 'top'
    });

    toast.onDismiss(() => {
      this.openSignPage();
    });
    this.nav.present(toast);
  }
}
