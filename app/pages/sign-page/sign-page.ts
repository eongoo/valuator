import {Component} from '@angular/core';
import {Alert, Toast, NavController, NavParams, Config} from 'ionic-angular';
import {UploadService} from '../../providers/upload-service/upload-service';
declare var jQuery: any;

@Component({
  templateUrl: 'build/pages/sign-page/sign-page.html',
  providers: [UploadService]
})

export class SignPage {
  group: any;
  guest: any;
  isHomestay: boolean;
  isMentor: boolean;
  isHandling: boolean;
  response: any;
  constructor(public nav: NavController, 
              public navParams: NavParams, 
              public config: Config, 
              public uploadService: UploadService) {
    this.initSignature(this);
    this.group = navParams.get('group'); 
    this.guest = navParams.get('guest'); 
    this.isHomestay = false;
    this.isMentor = false;
    this.isHandling = false;
    if(this.config.get('HOMESTAY')) {
      this.isHomestay = true;
    }
    if(this.config.get('MENTOR')) {
      this.isMentor = true;
    }
  }

  initSignature(that) {
    setTimeout(()=>{
		  jQuery('#signature').jSignature();
		  jQuery('#signature').on('change', ()=>{
        jQuery('.done').removeAttr('hidden').show();
        jQuery('.skip').hide();
        jQuery('.reset').removeAttr('hidden');
        jQuery('.tips').hide();
      })
    }, 500);
  }

  resetSignature() {
		  jQuery('#signature').jSignature('reset');
      jQuery('.done').hide();
      jQuery('.skip').show();
      if(this.group) {
			  this.group.sign = '';
      } else if (this.guest) {
			  this.guest.sign = '';
      }
  }

  getSignature() {
			let datapair = jQuery('#signature').jSignature("getData", "svgbase64");
      if(this.isMentor) {
			  this.group.sign = "data:" + datapair[0] + "," + datapair[1];
      } else if(this.isHomestay) {
			  this.guest.sign = "data:" + datapair[0] + "," + datapair[1];
      }
  }

  openHomestayPage(event) {
    if(this.isHandling) {
      return;
    }
    this.isHandling = true;
    this.getSignature();
    //总是提交不管是否签字
    this.uploadService.replaceGuestSign(this.guest, this.group._id)
    .then((data) => {
      this.response = data;
      if(this.response.error) {
        this.presentAlert(this.response.error.message);
      } else {
        this.guest.status = 3;
        this.guest.step = 5;
        if(this.guest.sign) {//签字了要表示感谢
          this.presentToast();
        } else {
          this.nav.popToRoot();
        }
      }
      this.isHandling = false;
    });
  }

  openMentorPage(event) {
    if(this.isHandling) {
      return;
    }
    this.isHandling = true;
    this.getSignature();
    this.group.status = 3;
    this.uploadService.replaceSign(this.group)
    .then((data) => {
      this.response = data;
      if(this.response.error) {
        this.presentAlert(this.response.error.message);
      } else {
        if(this.group.sign) {
          this.presentToast();
        } else {
          this.nav.popToRoot();
        }
      }
      this.isHandling = false;
    });
  }

  presentAlert(message) {
    let alert = Alert.create({
      title: 'Error.',
      subTitle: message,
      enableBackdropDismiss: true,
      buttons: ['Dismiss']
    });
    this.nav.present(alert);
  }

  presentToast() {
    let toast = Toast.create({
      message: 'Thanks',
      duration: 2000,
      position: 'top'
    });

    toast.onDismiss(() => {
      this.nav.popToRoot();
    });

    this.nav.present(toast);
  }
}
