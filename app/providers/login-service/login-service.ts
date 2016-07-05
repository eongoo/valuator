import {Injectable} from '@angular/core';
import {Config} from 'ionic-angular';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class LoginService {
  data: any = null;
  api: string;

  constructor(public http: Http, public config: Config) {
    this.api = this.config.get('APIURL') + 'yxbg/login'; 
  }

  validateLoginCode(code, firstName, lastName) {
    return new Promise(resolve => {
      this.http.get(this.api + '?code=' + code + '&first_name=' + firstName + '&last_name=' + lastName)
        .map(res => res.json())
        .subscribe(data => {
            this.data = data;
            resolve(this.data);
          },
          err => resolve({error:{message:'Network error, please try again later.'}})
        );
    });
  }
}

