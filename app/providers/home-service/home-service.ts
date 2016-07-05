import {Injectable} from '@angular/core';
import {Config} from 'ionic-angular';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class HomeService {
  data: any = null;
  api: string;
  hash: string;

  constructor(public http: Http, public config: Config) {
    this.api = this.config.get('APIURL'); 
    this.hash = this.config.get('HASH'); 
  }

  load(reload) {
    if (this.data && !reload) {
      return Promise.resolve(this.data);
    }

    return new Promise(resolve => {
      this.http.get(this.api + 'yxbg/find_team?hash=' + this.hash)
      .map(res => res.json())
      .subscribe(
        data => {
          this.data = data;
          resolve(this.data);
        },
        err => resolve({error:{message:'Network error, please try again later.'}})
      );
    });
  }

  absent(guestId, groupId) {
    return new Promise(resolve => {
      this.http.get(this.api + 'yxbg/guest_absent?hash=' + this.hash + '&_id=' + groupId + '&guest_id=' + guestId)
      .map(res => res.json())
      .subscribe(
        data => {
          resolve(data);
        },
        err => resolve({error:{message:'Network error, please try again later.'}})
      );
    });
  }
}

