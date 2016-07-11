import {Component} from '@angular/core';
import {NavController, Alert, Toast, NavParams, Config} from 'ionic-angular';
import {UploadService} from '../../providers/upload-service/upload-service';
import {SignPage} from '../../pages/sign-page/sign-page';
//declare var loadImage: any;
declare var EXIF: any;

@Component({
  templateUrl: 'build/pages/evaluate-group/evaluate-group.html',
  providers: [UploadService]
})
export class EvaluateGroupPage{
  group: any;
  response: any;
  allowTypes: string[];
  maxSize: number;
  maxWidth: number;
  maxCount: number;
  photoToBeDeleting: any;
  hasPhotoIncomplete: boolean;

  constructor(private nav: NavController, public navParams:NavParams, public uploadService: UploadService) {
    this.group = navParams.get('item'); 
    /*
    this.group.pics = [];
    if(this.group) {
      this.note = this.group.experience;
      if(this.group.photo && this.group.photo.length) {
        this.group.pics = this.group.photo;
      }
    }
    */
    this.allowTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];
    this.maxSize = 10 * 1024 * 1024;
    this.maxWidth = 1280;
    this.maxCount = 100;
    this.photoToBeDeleting = [];
    this.hasPhotoIncomplete = true;
    this.doesAllPhotoCompleted();
  }

  ionViewDidLeave() {
    this.group.pics = this.group.pics.concat(this.photoToBeDeleting);
  }

  addPhoto(input) {
    var reader = [];  // create empt array for readers
    for (var i = 0; i < input.files.length; i++) {
      this.hasPhotoIncomplete = true;
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
            this.photoToBeDeleting.push(this.group.pics[index]);
            this.group.pics.splice(index, 1);
            this.doesAllPhotoCompleted();
            /*
            if(this.group.pics[index].data) {
              this.group.pics.splice(index, 1);
            } else {
              this.uploadService.removeOnePhotoForMentor(this.group.pics[index]._id)
              .then((data) => {
                this.response = data;
                if(this.response.err) {
                  this.presentAlert(this.response.err.message);  
                } else {
                  this.group.pics.splice(index, 1);
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
      this.group.comment = input.value.replace(/^ +/, '');
    }
  }

  openSignPage(event) {
    this.uploadService.replacePhotoAndComment(this.group)
    .then((data) => {
      if(data) {
        this.response = data;
        if(this.response.err) {
          this.presentAlert(this.response.err.message);
        } else {
          this.photoToBeDeleting = [];
          if(this.group.status < 2) {
            this.group.status = 2;
            this.presentToast();
          } else {
            this.doOpenSignPage();
          }
        }
      } 
    });
  }

  doOpenSignPage(){
    if(this.group.status == 3) {
      this.nav.popToRoot(); 
    } else {
      this.nav.push(SignPage, {group:this.group});
    }
  }

  reUploadPhoto(index) {
    let photo = this.group.pics[index]; 
    photo.err = false;
    this.hasPhotoIncomplete = true;
    this.doUploadPhoto(photo);
  }

  doesAllPhotoCompleted() {
    let photoCount = this.group.pics.length;
    this.group.pics.forEach((photo) =>{
      if(photo._id || photo.err) {
          photoCount -= 1;
      } 
    }); 
    if(photoCount == 0) {
      this.hasPhotoIncomplete = false;
    }
  }

  doUploadPhoto(photo) {
    this.uploadService.uploadImages(photo.path)
    .then((data) => {
        this.response = data;
        if(this.response.url) {
          photo.data = data;
          photo._id = photo.data.url.replace(/[^\d]/g,'');
          photo.err = false;
        } else {
          photo.err = true;
        }
        this.doesAllPhotoCompleted();
    });
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

      if (_self.group.pics.length < _self.maxCount) {
        let dataURL = canvas.toDataURL('image/jpeg', 0.8);
        let photo = {_id:'', data:'', path:dataURL};
        _self.group.pics.push(photo);
        _self.doUploadPhoto(photo);
      }
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
      this.doOpenSignPage();
    });

    this.nav.present(toast);
  }
}
