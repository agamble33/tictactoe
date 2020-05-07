import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
import { OrderByPipe } from '../../pipes/sort/sort';
import { SafePipe } from '../../pipes/safe/safe';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component( {
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None
} )

export class DashboardComponent implements OnInit {
    public controllerTitle: string;
    public selectedItems: any = {
        controllerName: '',
    };
    public controllerList: any;
    public bredcrumbSelectedSeries: any;
    public isLoading: boolean = false;
    public isLoadFailed: boolean = false;
    public isSelected: boolean = true;
    //isShow: boolean = false;
    

    constructor( private locstr: LocalStorageService, private router: Router,
        public sidebar: SidebarService, private network: NetworkService,
        private commonService: CommonService, private userService: UserService,
        public constants: Constants, private toastService: ToastService ) {

    }

    ngOnInit() {
        this.sidebar.show();
        this.isSelected = false;
      //  this.locstr.set('saveQuoteFlag', false);
        this.getPrevSeletedItems();
        
        // To clear sub options selection         
        if(this.commonService.getCreateQuoteVo().selectedSensorList) {
            this.commonService.removeKeyFromCreateQuoteVo( 'selectedSensorList' );
        }        
        if(this.commonService.getCreateQuoteVo().selectedPanelOptions) {
            this.commonService.removeKeyFromCreateQuoteVo( 'selectedPanelOptions' );
        }        
        if(this.commonService.getCreateQuoteVo().selectedAccessories) {
            this.commonService.removeKeyFromCreateQuoteVo( 'selectedAccessories' );
        }       
        if(this.commonService.getCreateQuoteVo().selectedFlowDirections) {
            this.commonService.removeKeyFromCreateQuoteVo( 'selectedFlowDirections' );
        } 
        if(this.commonService.getCreateQuoteVo().activeFlowDirections) {
            this.commonService.removeKeyFromCreateQuoteVo( 'activeFlowDirections' );
        } 

        // To get fresh list of controller manufacturer
        this.getControllerList();
    }

    /**
     * This function will fetch controller list from API
     * */
    getControllerList() {
        this.isLoading = true;
        this.isLoadFailed = false;
        this.commonService.showLoading( this.constants.PLEASE_WAIT_TEXT );

        this.userService.getController().subscribe(
            res => {
                this.isLoading = false;
                if ( res.status == "success" ) {
                    this.controllerList = res.data;
                    // Added this variable to hold series selection 
                    if ( this.controllerList && this.controllerList.length > 0 ) {
                        for ( let i = 0; i < this.controllerList.length; i++ ) {
                            this.controllerList[i].selectedSeriesId = "";
                        }
                    }
                    // store controller list in local storage
                    if ( !this.commonService.getCreateQuoteVo() || !this.commonService.getCreateQuoteVo().controllerList ) {
                        this.commonService.storeDataInCreateQuoteVo( 'controllerList', this.controllerList );
                    }
                    this.commonService.hideLoading();
                } else {
                    this.isLoadFailed = true;
                    this.commonService.hideLoading();
                }
            },
            error => {
                this.isLoading = false;
                this.isLoadFailed = true;
                this.commonService.hideLoading();                
                let errorResponse; 
                if (error.message == this.constants.ERROR_NETWORK_UNAVAILABLE) {
                    errorResponse = error;
                } else {
                    errorResponse = error.json();
                }              
                if(errorResponse && errorResponse != undefined && errorResponse.statusCode==401) {
                    this.commonService.hideLoading();
                    this.commonService.showAlert( "Error", errorResponse.error, "OK", () => {
                        this.commonService.logout();
                    } );
                } else {
                    // Error message for back-end If data not matched                  
                    if ( error && error != undefined ) {
                        this.toastService.popToast( "error", error.message );
                    }
                }
            }
        );
    }

    /**
     * This function will be called on controller manufacturer selection
     * */
    onControllerSelection( selectedController: any ) {
        this.controllerTitle = selectedController.name;
        this.commonService.storeDataInCreateQuoteVo( 'selectedController', selectedController );
        if ( this.network.isNetworkAvailable() ) {
            this.router.navigate( ['/controllerSeries'] );
        } else {
            this.toastService.popToast("error", this.constants.ERROR_NETWORK_UNAVAILABLE);
        }
    }

    /**
     * This function will be used for displaying previously selected items on breadcrumbs
     * */
    getPrevSeletedItems() {
        this.selectedItems = this.locstr.getObj( 'selectedItems' );
    }

    // this function navigate to direct create new aceesories quote
    gotoAccessories(){
        
        

        
        
        // this flag set to check navigation to accessories page from dashborad or create new quote
        // set true in here and set false in flow-direction component.
        this.locstr.setObj("isCreateNewAccessory", true);
        this.locstr.removeObj('disclaimerAndNotes');
        this.router.navigate( ['/accessories'] );

       // console.log('EREREREREREE--------------------------', this.router)
    }

      // this function navigate to direct create new Quick ship panel quote
      gotoQuickShip(){
        
        
        // this flag set to check navigation to accessories page from dashborad or create new quote
        // set true in here and set false in flow-direction component.
        this.locstr.setObj("isCreateNewAccessory", true);
        this.locstr.removeObj('disclaimerAndNotes');
        this.router.navigate( ['/accessories/QCKSHIP'] );
    }
}


