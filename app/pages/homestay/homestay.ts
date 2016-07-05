import {Component} from '@angular/core';
import {Modal, Alert, NavController, Config, Storage, LocalStorage} from 'ionic-angular';
import {LoginPage} from '../login/login';
import {EvaluateDetailsPage} from '../evaluate-details/evaluate-details';
import {PhotoAlbumPage} from '../photo-album/photo-album';
import {GuestCommentPage} from '../guest-comment/guest-comment';
import {HomeService} from '../../providers/home-service/home-service';
import {DepartureFeedbackPage} from '../departure-feedback/departure-feedback';
import {AvatarPreviewPage} from '../avatar-preview/avatar-preview';

@Component({
  templateUrl: 'build/pages/homestay/homestay.html',
  providers: [HomeService]
})
export class HomestayPage {
  group: any;
  local: any;
  constructor(public nav: NavController,
              public config: Config,
              public homeService: HomeService) {
    this.nav = nav;
    this.initializePage();
    this.group = [];
    this.local = new Storage(LocalStorage);
  }

  initializePage() {
    if(this.config.get('HASH')) {
      this.homeService.load(0)
      .then(data => {
        this.group = data;
        if(this.group.error) {
          this.presentAlert(this.group.error.message);
          this.group = [];
        } else {
          this.group.hasPic = true;
          this.getPicsStatus();
        }
      });
    } else {
      console.error('HASH does not exist.');
    }
  }

  getPicsStatus(){
    if(this.group && this.group.guests && this.group.guests.length) {
      let count = this.group.guests.length;
      this.group.guests.forEach((guest)=>{
        if(guest.pics.length == 0) {
          count -= 1;
        }
      });
      if(count == 0) {
        this.group.hasPic = false;
      }
    }
  }

  openEvaluateDetailsPage(guest) {// scored: true-> 第二次评价 false->第一次评价
    this.nav.push(EvaluateDetailsPage, {guest: guest, group: this.group});  
  }

  openPhotoAlbumPage(guest) {
    this.nav.push(PhotoAlbumPage, {guest: guest, group: this.group});
  }

  openGuestCommentPage(guest) {
    this.nav.push(GuestCommentPage, {guest: guest, group: this.group});
  }

  openDepartureFeedbackPage(guest) {
    this.nav.push(DepartureFeedbackPage, {guest: guest, group: this.group});  
  }

  logout() {
    let confirm = Alert.create({
      title: 'Are you sure you want to logout?',
      message: '',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
          }
        },
        {
          text: 'Logout',
          handler: () => {
            this.local.clear()
            .then((data) => {
              this.nav.setRoot(LoginPage);
            });
          }
        }
      ]
    });
    this.nav.present(confirm);
  }

  presentAlert(message) {
    let alert = Alert.create({
      title: 'Error.',
      subTitle: message,
      buttons: ['Dismiss']
    });
    this.nav.present(alert);
  }

  previewAvatar(guest) {
      if(guest._id && guest._id.photo && guest._id.photo.length) {
        guest.avatar = guest._id.photo[0].replace(/s\.(png|jpg)/g, 'm\.$1');
      } else {
        guest.avatar = ''
      }
      let modal = Modal.create(AvatarPreviewPage, {guest: guest});
      this.nav.present(modal);
  }
}
