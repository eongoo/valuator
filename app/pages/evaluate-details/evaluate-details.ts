import {Component} from '@angular/core';
import {Modal, NavController, NavParams, Alert, Toast, Config} from 'ionic-angular';
import {EvaluateGroupPage} from '../evaluate-group/evaluate-group';
import {PhotoAlbumPage} from '../photo-album/photo-album';
import {GuestCommentPage} from '../../pages/guest-comment/guest-comment';
import {GuestService} from '../../providers/guest-service/guest-service';
import {DepartureFeedbackPage} from '../departure-feedback/departure-feedback';
import {SignPage} from '../../pages/sign-page/sign-page';
import {AvatarPreviewPage} from '../avatar-preview/avatar-preview';

@Component({
  templateUrl: 'build/pages/evaluate-details/evaluate-details.html',
  providers: [GuestService]
})

export class EvaluateDetailsPage {
  guest: any;
  group: any;
  response: any;//current score
  score: any;//arrival feedback 
  res: any;//temp
  isTheLastGuestToRate: boolean;
  allFilled: boolean;
  isMentor: boolean;
  isHomestay: boolean;
  error: boolean;

  constructor(private nav: NavController, 
              public navParams: NavParams, 
              public config: Config, 
              public guestService: GuestService) {
    this.guest = navParams.get('guest');
    this.group = navParams.get('group');
    this.isTheLastGuestToRate = navParams.get('flag');
    this.allFilled = false;
    this.score = [];
    this.response = [];
    this.isMentor = this.config.get('MENTOR');
    this.isHomestay = this.config.get('HOMESTAY');
    this.error = false;

    if(this.guest) {
      if(this.guest.score) {
        this.getGuestDiyData();
      } else if (this.group.diy_model) {
        this.getGuestDiyModel();
      } else {
        this.error = true;
        console.error('Parameter error');
      }
    }
  }

  getGuestDiyData() {//diy_data_id
    this.guestService.getDiyData(this.guest.score) 
    .then(data => {
      this.response = data;
      this.calcAllFilled();//enable button or remain default disabled
      if(this.response.error) {
        this.presentAlert(this.response.error.message);
      }
    });
  }

  getGuestDiyModel() {
    this.guestService.getDiyModel(this.group.diy_model) 
    .then(data => {
      this.res = data;
      if(this.res.error) {
        this.presentAlert(this.res.error.message);
        this.response = [];
      } else {
        this.response = {};
        this.response.diy_model = data;
        this.response.data = {};
      }
    });
  }

  calcAllFilled() {
    this.allFilled = true;
    for(let model of this.response.diy_model.model) {
      if(model._tp == 'star' || model._tp == 'textarea') {
        if(!this.response.data[model.name]) {
          this.allFilled = false; 
        }
      }
    }
  }

  setStar(name, star) {
    this.response.data[name] = star; 
    this.calcAllFilled();
  }

  handleInput(name, input) {
    if(input.value) {
      this.response.data[name] = input.value.replace(/^ +/, '');
    }
    this.calcAllFilled();
  }

  submitEvaluate() {
    //status:   //-1:缺席,0:未评分,1:已经评分,2:已经二次评分
    if(this.guest.status > 0) {
      this.guestService.updateDiyData(this.guest.score, this.response.data)
      .then(data => {
        this.res = data;
        if(this.res.error) {
          this.presentAlert(this.res.error.message);
        }else{
          this.doRedirect();
        }
      });
    } else {//add
      this.guestService.addDiyData(this.guest._id._id, this.group._id, this.group.diy_model, this.response.data, false)
      .then(data => {
        this.res = data;
        if(this.res.error) {
          this.presentAlert(this.res.error.message);
        }else{
          if(this.guest.status == 0) {
            this.group.count.score += 1;
          } else if(this.guest.status == -1) {
            this.group.count.absent -= 1;
            this.group.count.score += 1;
          }

          this.guest.score = this.res.call.score;
          this.guest.status = 1;
          this.presentToast();
        }
      });
    }
  }

  openEvaluateGroupPage() {
    this.nav.push(EvaluateGroupPage, {item: this.group});  
  }

  openGuestCommentPage() {
    this.nav.push(GuestCommentPage, {guest: this.guest, group: this.group});
  }

  openPhotoAlbumPage() {
    this.nav.push(PhotoAlbumPage, {guest: this.guest, group: this.group});  
  }

  openDepartureFeedbackPage() {
    this.nav.push(DepartureFeedbackPage, {guest: this.guest, group: this.group});  
  }

  openSignPage() {
    this.nav.push(SignPage, {guest: this.guest, group: this.group});  
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
      message: 'Thanks for your rating',
      duration: 2000,
      position: 'top'
    });

    toast.onDismiss(() => {
      this.doRedirect();
    });

    this.nav.present(toast);
  }

  doRedirect() {
      if(this.isMentor) {
        if(this.isTheLastGuestToRate) {
          this.openEvaluateGroupPage();
        } else {
          this.nav.pop();
        }
      } else if(this.isHomestay){
        switch(this.guest.step) {
          case 0:
            this.guest.step = 1;
            this.nav.pop();
            break;
          case 1: 
            this.openDepartureFeedbackPage();
            break;
          case 2: 
            this.openPhotoAlbumPage(); 
            break;
          case 3: 
            this.openGuestCommentPage(); 
            break;
          case 4:  
            if(this.guest.status == 3) {//签过字
              this.nav.pop();
            } else {
              this.openSignPage(); 
            }
            break;
          default:
            this.nav.pop();
        }
      }
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
