import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

/*-------------------------------- Providers ----------------------------------*/
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';
import { SidebarService } from '../../providers/sidebar.service';
import { CommonService } from '../../providers/common-service/common.service';
import { UserService } from '../../providers/user-service/user.service';
import { Constants } from '../../providers/app-settings-service/app-constant.service';
import { ToastService } from '../../providers/common-service/toaster-service';

/*------------------------------- pipe -------------------------------------*/
import { OrderByPipe } from '../../pipes/sort/sort';
import { SafePipe } from '../../pipes/safe/safe';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component( {
    selector: 'app-controller-series',
    templateUrl: './controller-series.component.html',
    styleUrls: ['./controller-series.component.scss'],
    encapsulation: ViewEncapsulation.None
} )

export class ControllerSeriesComponent implements OnInit {
    public pageHeight;
    isSelected: boolean;
    isSeriesSelected: boolean;
    protected controllerSeriesData;
    protected accordion;
    protected selectedController;
    public seriesTitle: string;
    public selectedItems: any;
    public controllerTitle: any;
    public selectedSeriesId;
    private selectedSeriesVo: any;
    public selectedControllerVo: any;

    public seriesController: any = {
        controllerName: '',
        series: ''
    }

    public isTabSelected: boolean;
    public isItemSelected: boolean;

    public isLoading: boolean = false;
    public isLoadFailed: boolean = false;
    images = [
        "https://h2panelbuilder.s3.amazonaws.com/profile/user/Wall.jpeg%3F1551370682567",
        "https://h2panelbuilder.s3.amazonaws.com/profile/user/ProMinent.jpeg%3F1551184553184",
        "https://h2panelbuilder.s3.us-west-2.amazonaws.com/profile/user/Adv.jpeg%3F1554918951672",
        "https://h2panelbuilder.s3-us-west-2.amazonaws.com/profile/user/pulsafeeder+logo.png"
    ];
    // newWalchembuild = [
    //     "W900 Series"


    // ]

    constructor( private locstr: LocalStorageService, public sidebar: SidebarService,
        private commonService: CommonService, private router: Router,
        private userService: UserService, public constants: Constants,
        private toastService: ToastService ) {
        let windowInnerHeight = window.innerHeight;
        let windowHeight = this.locstr.getObj( 'windowInnerHeight' );
        this.pageHeight = windowHeight - 160;

        this.isSeriesSelected = false;
    }

    ngOnInit() {
        this.sidebar.show();
        this.isTabSelected = false;
        this.isItemSelected = false;
       // this.locstr.set('saveQuoteFlag', false);
        // To get list of controller manufacturer
        this.getControllerList();
    //     if (this.selectedController.id == 1) {
    //         this.selectedControll'assets/images/default_manufacturer_logo.png',
    //     }     
    //         {id:1,url:'assets/images/default_manufacturer_logo.png'},
    //         {id:2,url:'assets/images/default_manufacturer_logo.png'},
    //         {id:3,url:'assets/images/default_manufacturer_logo.png'},
              
    //          ]
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
                    this.controllerSeriesData = res.data;
                    console.log('what------',this.controllerSeriesData);
                    // Get selected Controller Title
                    if ( this.commonService.getCreateQuoteVo() && this.commonService.getCreateQuoteVo().selectedController ) {
                        for ( let i = 0; i < this.controllerSeriesData.length; i++ ) {
                            if ( this.commonService.getCreateQuoteVo().selectedController.id === this.controllerSeriesData[i].id ) {
                                this.selectedController = this.controllerSeriesData[i].name;
                                this.selectedControllerVo = this.controllerSeriesData[i];
                                this.selectedControllerVo.selectedSeriesId = this.commonService.getCreateQuoteVo().selectedController.selectedSeriesId;
                                break;
                                
                            }
                        }
                        this.isSeriesSelected = true;
                    }

                    // To Series Selected for mobile view
                    this.accordion = {
                        current: this.selectedController
                    };
                    
                    // Get Selected Series
                    if ( this.commonService.getCreateQuoteVo().selectedControllerSeries ) {
                        this.selectedSeriesId = this.commonService.getCreateQuoteVo().selectedControllerSeries.id;
                        this.isSelected = true;
                        this.selectedSeriesVo = this.commonService.getCreateQuoteVo().selectedControllerSeries;
                    } else {
                        this.selectedSeriesId = '';
                        this.isSelected = false;
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

    selectedTab( controller ) {
        this.isTabSelected = true;
    }


    /**
     * This function will be called on controller selection
     * */
    onControllerManufacturerSelect( selectedController ) {
        this.controllerTitle = selectedController.name;
        this.selectedControllerVo = selectedController;
        this.selectedController = selectedController.name;
        this.isSeriesSelected = true;
        this.accordion = {
            current: this.selectedController
        };
    }

    /**
     * This function will be called on series selection
     * */
    onSeriesSelect( selectedSeries ) {
        this.isSelected = true;
        
        this.seriesTitle = selectedSeries.name;
        this.selectedSeriesId = selectedSeries.id;
        this.selectedSeriesVo = selectedSeries;
    }

    /**
     * This function will be called on next button click
     * */
    onNext() {
        this.selectedItems = this.selectedControllerVo.name;
        this.seriesController.seriesName = this.seriesTitle;
        this.locstr.setObj( 'selectedItems', this.seriesController );
        
        // check if controller selection updated
        if ( this.commonService.getCreateQuoteVo() && this.commonService.getCreateQuoteVo().selectedController ) {
            this.commonService.storeDataInCreateQuoteVo( 'selectedController', this.selectedControllerVo );
        } else {
            this.commonService.storeDataInCreateQuoteVo( 'selectedController', this.selectedControllerVo );
        }

        // check if series selection updated
        if ( this.commonService.getCreateQuoteVo() && this.commonService.getCreateQuoteVo().selectedControllerSeries ) {
            if ( this.selectedSeriesVo.id != this.commonService.getCreateQuoteVo().selectedControllerSeries.id ) {
                this.commonService.storeDataInCreateQuoteVo( 'selectedControllerSeries', this.selectedSeriesVo );
                // series selection changed, remove stored keys
                this.commonService.removeKeyFromCreateQuoteVo( 'selectedSensorList' );
                this.commonService.removeKeyFromCreateQuoteVo( 'selectedPanelOptions' );
                this.commonService.removeKeyFromCreateQuoteVo( 'selectedAccessories' );
                this.commonService.removeKeyFromCreateQuoteVo( 'selectedFlowDirections' );
            }
        } else {
            this.commonService.storeDataInCreateQuoteVo( 'selectedControllerSeries', this.selectedSeriesVo );
        }
        this.router.navigate( ['/controllerSensorSelection'] );
    }
    
    /**
     * coming soon pop-up 
     * */
    commingSoonPopup() {
        this.commonService.showAlert( "Info", this.constants.COMMING_SOON_MSG, "OK", () => {
            // Ok click code will be here
        } );
    }

}
