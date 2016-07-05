import {Component} from '@angular/core';
import {NavController, NavParams, Config, Toast, Alert} from 'ionic-angular';
import {UploadService} from '../../providers/upload-service/upload-service';
import {GuestCommentPage} from '../../pages/guest-comment/guest-comment';
import {SignPage} from '../../pages/sign-page/sign-page';
declare var EXIF: any;

@Component({
  templateUrl: 'build/pages/photo-album/photo-album.html',
  providers: [UploadService]
})
export class PhotoAlbumPage{
  guest: any;
  group: any;
  response: any;
  allowTypes: string[];
  maxSize: number;
  maxWidth: number;
  maxCount: number;
  photoToBeDeleting: any;

  constructor(private nav: NavController, public navParams:NavParams, public uploadService: UploadService) {
    this.guest = navParams.get('guest'); 
    this.group = navParams.get('group'); 
    this.allowTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];
    this.maxSize = 10 * 1024 * 1024;
    this.maxWidth = 1280;
    this.maxCount = 100;
    this.photoToBeDeleting = [];
  }

  ionViewDidLeave() {
    this.guest.pics = this.guest.pics.concat(this.photoToBeDeleting);
  }

  addPhoto(input) {
    var reader = [];  // create empt array for readers
    for (var i = 0; i < input.files.length; i++) {
      reader.push(new FileReader());

      if (this.allowTypes.indexOf(input.files[i].type) === -1) {
        console.warn('The file type (' + input.files[i].type+ ') is not allowed.');
        continue;
      }

      if (input.files[i].size > this.maxSize) {
        console.warn('The file size (' + input.files[i].size+ ') is too large to upload.');
        continue;
      }

      if (input.files[i]) {
        reader[i].readAsDataURL(input.files[i]);
      }

      reader[i].addEventListener("load", (event)=>{
        var image = new Image();
        image.src = event.target.result;
        image.addEventListener("load", (e)=>{
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');
          var w = Math.min(this.maxWidth, image.width);
          var h = image.height * (w / image.width);
          this.getOrientation(this, image, w, h, canvas, ctx);
        }, false);
      }, false);

    }
  }

  removePhoto(index) {
    let alert = Alert.create({
      title: 'Confirm delete',
      message: 'Do you want to delete this photo?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.photoToBeDeleting.push(this.guest.pics[index]);
            this.guest.pics.splice(index, 1);
            /*
            if(this.guest.pics[index].data) {
              this.guest.pics.splice(index, 1);
            } else {
              this.uploadService.removeOnePhotoForGuest(this.guest, this.group._id, this.guest.pics[index]._id)
              .then((data) => {
                this.response = data;
                if(this.response.error) {
                  this.presentAlert('Error', this.response.error.message, 'Dismiss');  
                } else {
                  this.guest.pics.splice(index, 1);
                }
              });
            }
            */
          }
        }
      ]
    });
    this.nav.present(alert);
  }

  handleInput(input) {
    if(input.value) {
      this.guest.pics_comment = input.value.replace(/^ +/, '');
    }
  }

  submitPhotoAlbum(event) {
    if(this.guest.pics_comment && this.guest.pics.length) {
      this.uploadService.replaceGuestPhotoAndComment(this.guest, this.group._id)
      .then((data) => {
        if(data) {
          this.response = data;
          if(this.response.error) {
            this.presentAlert('Error', this.response.error.message, 'Dismiss');
          } else {
            this.photoToBeDeleting = [];
            this.group.hasPic = true;
            if(this.guest.step >= 3) {
              this.doRedirect();
            } else {//第一次上传，表示感谢
              this.guest.step = 3;
              this.presentToast();
            }
          }
        } 
      });
    } else {
      console.error('98:app/pages/photo-album/photo-album.ts');
    }
    //this.nav.push(GuestCommentPage, {item:this.guest});//debug
  }

  getOrientation(_self, image, w, h, canvas, ctx) {
    EXIF.getData(image, function() {
      var orientation = EXIF.getTag(this, "Orientation");
      canvas.width = w;
      canvas.height = h;
      if (orientation > 4) {
        canvas.width = h;
        canvas.height = w;
      }
      switch (orientation) {
        case 2:
          // horizontal flip
          ctx.translate(w, 0)
          ctx.scale(-1, 1)
        break
        case 3:
          // 180° rotate left
          ctx.translate(w, h)
          ctx.rotate(Math.PI)
        break
        case 4:
          // vertical flip
          ctx.translate(0, h)
          ctx.scale(1, -1)
        break
        case 5:
          // vertical flip + 90 rotate right
          ctx.rotate(0.5 * Math.PI)
          ctx.scale(1, -1)
        break
        case 6:
          // 90° rotate right
          ctx.rotate(0.5 * Math.PI)
          ctx.translate(0, -h)
        break
        case 7:
          // horizontal flip + 90 rotate right
          ctx.rotate(0.5 * Math.PI)
          ctx.translate(w, -h)
          ctx.scale(-1, 1)
        break
        case 8:
          // 90° rotate left
          ctx.rotate(-0.5 * Math.PI)
          ctx.translate(-w, 0)
        break
      }
      //ctx.rotate(0.5 * Math.PI);
      //ctx.translate(0, -h);
      ctx.drawImage(image, 0, 0, w, h);

      if (_self.guest.pics.length < _self.maxCount) {
        let dataURL = canvas.toDataURL('image/jpeg', 0.8);
        let photo = {_id:'', data:'', path:dataURL};
        _self.guest.pics.push(photo);
        _self.doUploadPhoto(dataURL, photo);
      }
    });
  }

  doUploadPhoto(dataURL, photo) {
    this.uploadService.uploadImages(dataURL)
    .then(data =>{
        photo.data = data;
        photo._id = photo.data.url.replace(/[^\d]/g,'');
    });
  }

  openGuestCommentPage() {
    this.nav.push(GuestCommentPage, {guest: this.guest, group: this.group});
  }

  openSignPage() {
    this.nav.push(SignPage, {group: this.group, guest: this.guest});
  }

  presentAlert(title, message, button) {
    let alert = Alert.create({
      title: title,
      subTitle: message,
      buttons: [button]
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
      this.doRedirect();
    });
    this.nav.present(toast);
  }

  doRedirect() {
    switch(this.guest.step) {
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
