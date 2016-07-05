import {Injectable} from '@angular/core';
import {Config} from 'ionic-angular';
import {Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class UploadService {
  api: string;
  hash: string;
  huodong: string;

  constructor(public http: Http, public config: Config) {
    this.api = this.config.get('APIURL'); 
    this.hash = this.config.get('HASH');
    this.huodong = this.config.get('HUODONGID');
  }

  uploadImages(filedata) {
    let body = "filemeta={}&filedata=" + encodeURIComponent(filedata); 
    let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
    let options = new RequestOptions({ headers: headers });

    return new Promise(resolve => {
      this.http.post(this.api + 'pic/up_tmp', body, options)
      .map(res => res.json())
      .subscribe(data => {
          resolve(data);
        }, 
        err => resolve({error:{message:'Network error, please try again later.'}})
      );
    });
  }

  removeOnePhotoForMentor(id) {
    let body = "hash=" + this.hash + "&pic_del=" + id;  
    let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
    let options = new RequestOptions({ headers: headers });

    return new Promise(resolve => {
      this.http.post(this.api + 'yxbg/comment', body, options)
      .map(res => res.json())
      .subscribe(data => {
          resolve(data);
        }, 
        err => resolve({error:{message:'Network error, please try again later.'}})
      );
    });
  }

  replaceSign(group) {
    let body = "hash=" + this.hash + "&sign=";  
    if(group.sign) {
      body +=  encodeURIComponent(group.sign); 
    }

    let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
    let options = new RequestOptions({ headers: headers });

    return new Promise(resolve => {
      this.http.post(this.api + 'yxbg/sign', body, options)
      .map(res => res.json())
      .subscribe(data => {
          resolve(data);
        }, 
        err => resolve({error:{message:'Network error, please try again later.'}})
      );
    });
  }

  replacePhotoAndComment(group) {
    let body = "hash=" + this.hash + "&comment=";  
    if(group.comment) {
      body += group.comment;
    }
    group.pics.forEach((photo)=>{
      if(photo.data) {
        body += "&pics[" + photo._id + "][path]=" + encodeURIComponent(photo.data.url);
      }else{
        body += "&pics[" + photo._id + "][path]=" + encodeURIComponent(photo.path);
      }
      body += "&pics[" + photo._id + "][_id]=" + photo._id;
    });
    let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
    let options = new RequestOptions({ headers: headers });

    return new Promise(resolve => {
      this.http.post(this.api + 'yxbg/comment', body, options)
      .map(res => res.json())
      .subscribe(data => {
          resolve(data);
        }, 
        err => resolve({error:{message:'Network error, please try again later.'}})
      );
    });
  }

  replaceComment(group) {
    let body = "hash=" + this.hash + "&comment=";  
    if(group.comment) {
      body += group.comment;
    }
    let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
    let options = new RequestOptions({ headers: headers });

    return new Promise(resolve => {
      this.http.post(this.api + 'yxbg/comment', body, options)
      .map(res => res.json())
      .subscribe(data => {
          resolve(data);
        }, 
        err => resolve({error:{message:'Network error, please try again later.'}})
      );
    });
  }

  /*Homestay*/
  removeOnePhotoForGuest(guest, groupId, picId) {
    let body = "hash=" + this.hash + "&pic_del=" + picId + "&_id=" + groupId + "&guest_id=" + guest._id._id;  
    return this.doReplaceGuest(body);
  }

  replaceGuestPhotoAndComment(guest, groupId) {
    let body = "hash=" + this.hash + "&_id=" + groupId + "&guest_id=" + guest._id._id + "&pics_comment=";  
    if(guest.pics_comment) {
      body += guest.pics_comment;
    }
    guest.pics.forEach((photo)=>{
      if(photo.data) {
        body += "&pics[" + photo._id + "][path]=" + encodeURIComponent(photo.data.url);
      }else{
        body += "&pics[" + photo._id + "][path]=" + encodeURIComponent(photo.path);
      }
      body += "&pics[" + photo._id + "][_id]=" + photo._id;
    });
    return this.doReplaceGuest(body);
  }

  replaceGuestComment(guest, groupId) {
    let body = "hash=" + this.hash + "&_id=" + groupId + "&guest_id=" + guest._id._id + "&comment=";  
    if(guest.comment) {
      body += guest.comment;
    }
    return this.doReplaceGuest(body);
  }

  replaceGuestSign(guest, groupId) {
    let body = "hash=" + this.hash + "&_id=" + groupId + "&guest_id=" + guest._id._id;  
    body += "&status=3&sign=";//不管有没有签字，将status 置为 3
    if(guest.sign) {
      body += guest.sign;
    }
    return this.doReplaceGuest(body);
  }

  doReplaceGuest(body){
    let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
    let options = new RequestOptions({ headers: headers });

    return new Promise(resolve => {
      this.http.post(this.api + 'yxbg/guest_comment', body, options)
      .map(res => res.json())
      .subscribe(data => {
          resolve(data);
        }, 
        err => resolve({error:{message:'Network error, please try again later.'}})
      );
    });
  }
}

