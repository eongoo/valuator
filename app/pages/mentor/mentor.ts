import {Component} from '@angular/core';
import {Modal, Alert, NavController, Config, Storage, LocalStorage} from 'ionic-angular';
import {LoginPage} from '../login/login';
import {EvaluateDetailsPage} from '../evaluate-details/evaluate-details';
import {EvaluateGroupPage} from '../evaluate-group/evaluate-group';
import {HomeService} from '../../providers/home-service/home-service';
import {AvatarPreviewPage} from '../avatar-preview/avatar-preview';

@Component({
  templateUrl: 'build/pages/mentor/mentor.html',
  providers: [HomeService]
})
export class MentorPage{
  group: any;
  guests: any;
  diyModel: any;
  response: any;
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
        if(!this.group.pics){
          this.group.pics = [];
        }
        if(this.group.error) {
          this.group = [];
          this.presentAlert(this.group.error.message);
        }
      });
    }
  }

  openEvaluateDetailsPage(guest) {
    let isTheLastGuestToRate: boolean = false;
    if((this.group.count.guest - this.group.count.absent - this.group.count.score == 1) && guest.status <= 0) {
      isTheLastGuestToRate = true;
    }

    this.nav.push(EvaluateDetailsPage, {guest: guest, group: this.group, flag: isTheLastGuestToRate});  
  }

  openEvaluateGroupPage() {
    this.nav.push(EvaluateGroupPage, {item: this.group});  
  }

  doAbsent(guest) {
    let confirm = Alert.create({
      title: 'Is this student absent?',
      message: '',
      buttons: [
        {
          text: 'Nope',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.homeService.absent(guest._id._id, this.group._id)
            .then(data => {
              this.response = data;
              if(this.response.error) {
                this.presentAlert(this.group.error.message);
              } else {
                guest.status = -1;
                this.group.count.absent += 1;
              }

              if(this.group.count.absent + this.group.count.score == this.group.count.guest) {
                /*
                setTimeout(()=>{
                  this.openEvaluateGroupPage();
                }, 200);
                */
              }
            });
          }
        }
      ]
    });
    this.nav.present(confirm);
  }

  logout() {
    let confirm = Alert.create({
      title: 'Are you sure you want to logout?',
      message: '',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Good boy.');
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
