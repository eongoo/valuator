import {ViewChild, Component} from '@angular/core';
import {ionicBootstrap, Nav, Config, Storage, LocalStorage} from 'ionic-angular';
//import {StatusBar} from 'ionic-native';
import {LoginPage} from './pages/login/login';
import {HomestayPage} from './pages/homestay/homestay';
import {MentorPage} from './pages/mentor/mentor';


@Component({
  templateUrl: 'build/app.html',
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = LoginPage;
  local: any;

  constructor(private config: Config) {
    if(window.location.origin.indexOf('ibeatop') > 0) {
      this.config.set('APIURL', 'https://api.ibeatop.com/v2/');
    } else {
      this.config.set('APIURL', 'http://api.cheesedu.com/v2/');
    }

    this.local = new Storage(LocalStorage);

    this.local.get('HASH')
    .then((value) => {
      if(value) {
        this.config.set('HASH', value);
        this.initializeApp();
      }
    })
  }

  initializeApp() {
    this.local.get('AUTHORIZED')
    .then((value) => {
      if(value == 'true') {
        this.local.get('HOMESTAY')
        .then((value) => {
          if(value == 'true') {
            this.config.set('HOMESTAY', value);
            this.config.set('MENTOR', false);
            this.nav.setRoot(HomestayPage);
          }
        });

        this.local.get('MENTOR')
        .then((value) => {
          if(value == 'true') {
            this.config.set('MENTOR', value);
            this.config.set('HOMESTAY', false);
            this.nav.setRoot(MentorPage);
          }
        });
      }
    })
    /*
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
     // StatusBar.styleDefault();
    });
    */
  }
}

ionicBootstrap(MyApp, [], {
    mode: 'ios', 
    backButtonText: 'Back',
    prodMode: true 
});
