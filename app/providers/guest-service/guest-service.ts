import {Injectable} from '@angular/core';
import {Config} from 'ionic-angular';
import {Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class GuestService {
  api: string;
  hash: string;

  constructor(public http: Http, public config: Config) {
    this.api = this.config.get('APIURL'); 
    this.hash = this.config.get('HASH'); 
  }

  getDiyData(id) {
    return new Promise(resolve => {
      this.http.get(this.api + 'diy_data/get?_id=' + id)
        .map(res => res.json())
        .subscribe(data => {
            resolve(data);
          },
          err => resolve({error:{message:'Network error, please try again later.'}})
        );
    });
  }

  getDiyModel(id) {
    return new Promise(resolve => {
      this.http.get(this.api + 'diy_model/get?_id=' + id)
        .map(res => res.json())
        .subscribe(data => {
            resolve(data);
          },
          err => resolve({error:{message:'Network error, please try again later.'}})
        );
    });
  }

  addDiyData(guest, group, model, data, isRescore) {
    let body = "rmodel=guest&gmodel=yxbg&gid=" + group +"&rid=" + guest + "&diy_model=" + model; 
    for(let d in data) {
      body += "&data[" + d + "]=" + data[d];
    }

    let callurl = this.api + "yxbg/guest_up?_id=" + group + "&hash=" + this.hash + "&guest_id=" + guest;
    if(isRescore) {
      callurl += "&rescore=%_id%";
    } else {
      callurl += "&score=%_id%";
    }
    body += "&callurl=" + encodeURIComponent(callurl);

    let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
    let options = new RequestOptions({ headers: headers });

    return new Promise(resolve => {
      this.http.post(this.api + 'diy_data/add', body, options)
        .map(res => res.json())
        .subscribe(data => {
            resolve(data);
          },
          err => resolve({error:{message:'Network error, please try again later.'}})
        );
    });
  }

  updateDiyData(diyDataId, data) {
    let body = "_id=" + diyDataId;
    for(let d in data) {
      body += "&data[" + d + "]=" + data[d];
    }
    let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
    let options = new RequestOptions({ headers: headers });

    return new Promise(resolve => {
      this.http.post(this.api + 'diy_data/up', body, options)
        .map(res => res.json())
        .subscribe(data => {
            resolve(data);
          },
          err => resolve({error:{message:'Network error, please try again later.'}})
        );
    });
  }
}

