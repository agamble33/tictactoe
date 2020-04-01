import { Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

/*-------------------------------- Providers ----------------------------------*/
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';
import { SidebarService } from '../../providers/sidebar.service';
import { CommonService } from '../../providers/common-service/common.service';
import { Constants } from '../../providers/app-settings-service/app-constant.service';
import { UserService } from '../../providers/user-service/user.service';
import { NetworkService } from '../../providers/network-service/network.service';
import { ToastService } from '../../providers/common-service/toaster-service';

/*------------------------------- pipe -------------------------------------*/
import { SafePipe } from '../../pipes/safe/safe';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component( {
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    encapsulation: ViewEncapsulation.None
} )

export class HomeComponent implements OnInit {
    public homeUrl: any;
    public isSelected: boolean = true;
    public innerHeight: any;
    public isLoading: boolean = false;

    constructor( private locstr: LocalStorageService, private router: Router, public sidebar: SidebarService, private network: NetworkService,
        private commonService: CommonService, private userService: UserService, public constants: Constants, private toastService: ToastService ) {

    }

    ngOnInit() {
        this.sidebar.show();
        this.isSelected = false;
        this.innerHeight = window.innerHeight-68;
        this.isLoading = true;
        this.commonService.showLoading('Please Wait');
        if (this.locstr.getObj('loggedInUser') && this.locstr.getObj('loggedInUser').homeUrl != null && this.network.isNetworkAvailable()){
            this.homeUrl = this.locstr.getObj('loggedInUser').homeUrl; 
            this.commonService.hideLoading();
            this.isLoading = false;  
           // console.log('FUNNYERROR2####----------',this.homeUrl)
        }else{
            this.homeUrl = "assets/images/home-page2.png";
           // console.log('FUNNYERROR3####----------',this.homeUrl)
            this.commonService.hideLoading();
            this.isLoading = false;              
        }  
        this.commonService.storeDataInCreateQuoteVo( 'projectDetails', {} );
    } 
}
