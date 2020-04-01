import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import {Idle, DEFAULT_INTERRUPTSOURCES} from '@ng-idle/core';
import {Keepalive} from '@ng-idle/keepalive';
import { Router } from '@angular/router';


import { LocalStorageService } from '../providers/local-storage-service/local-storage.service';
import { CommonService } from '../providers/common-service/common.service';
import { UploadAwsService } from '../providers/uploadAwsService/uploadAwsService';
/*-------------------- Providers ----------------------------*/
import { LoaderService } from '../providers/common-service/loader-services';

@Component( {
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
} )
export class AppComponent {
    showLoader: boolean;
    config:any;
    idleState = 'Not started.';
     timedOut = false;
     lastPing?: Date = null;
    constructor(
        private idle: Idle,
        private keepalive: Keepalive,
        private loaderService: LoaderService,
        private locstr: LocalStorageService,
        private commonService: CommonService,
        private router: Router,
        public uploadAwsService: UploadAwsService ) {
       this.initializeApp();
       this.uploadAwsService.initializeAWS();
       this.initializeAutologout();
    }

    initializeApp() {
        this.loaderService.status.subscribe(( val: boolean ) => {
            this.showLoader = val;
        } );
    }

    initializeAutologout() {
        // sets an idle timeout of 10 seconds, for testing purposes.
    this.idle.setIdle(60);
    // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    this.idle.setTimeout(600);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.idle.onIdleEnd.subscribe(() => this.idleState = 'No longer idle.');
    this.idle.onTimeout.subscribe(() => {
    //   this.idleState = 'Timed out!';
    //   this.timedOut = true;
      this.logout();
    });
    // this.idle.onIdleStart.subscribe(() => this.idleState = 'You\'ve gone idle!');
    // this.idle.onTimeoutWarning.subscribe((countdown) => this.idleState = 'You will time out in ' + countdown + ' seconds!');

    // // sets the ping interval to 15 seconds
    // this.keepalive.interval(15);

    // this.keepalive.onPing.subscribe(() => this.lastPing = new Date());

    this.reset();
    }
    reset() {
        this.idle.watch();
        this.idleState = 'Started.';
        this.timedOut = false;
      }

      logout() {
        this.locstr.clearAllLocalStorage();
        // to clear data stored in provider
        this.commonService.clearCreateQuoteVo();

        /* Following local storage used to maintain previuos data for view quote page 
            It will clear data once user logout
        */
        this.locstr.setObj('viweQuote', false);
        this.locstr.setObj('viweQuoteFilterData', {});

        this.router.navigate(['/']);
      }
}
 
