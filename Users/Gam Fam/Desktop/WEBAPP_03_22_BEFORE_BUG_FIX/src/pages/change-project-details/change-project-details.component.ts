import { Component, OnInit, Input, Output, ViewChild } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';

/*-------------------------------- Providers ---------------------------------*/
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';
import { UserService } from "../../providers/user-service/user.service";
import { CommonService } from '../../providers/common-service/common.service';
import { Broadcaster } from '../../providers/broadcast-service/broadcast.service';
import { Constants } from '../../providers/app-settings-service/app-constant.service';
import { ToastService } from '../../providers/common-service/toaster-service';

@Component( {
    selector: 'change-project-details',
    templateUrl: './change-project-details.component.html',
    styleUrls: ['./change-project-details.component.scss']
} )
export class ChangeProjectDetailsComponent implements OnInit {

    @Input() selectedObj;
    @Input() message;
    @Output() okCall;
    @Output() callBack;
    
    @ViewChild( 'customerForm' ) customerForm;
    public headerHeight;
    public pageHeight;
    public formSubmitted: boolean;
    isLoadFailed: boolean = false;
    isLoading: boolean = false;
    public webServiceError;
    firstButton:any;
    secondButton:any;
    salesRepList: any;
    loggedinUserData:any;

    constructor( public activeModal: NgbActiveModal, private modalService: NgbModal, private locstr: LocalStorageService,
         private userService: UserService, private toastService: ToastService, private commonService: CommonService, private broadcaster: Broadcaster, public constants: Constants ) {
            
    }

    ngOnInit() {
        if(this.userService.getUser()){
            this.loggedinUserData = this.userService.getUser();
        }
        this.getUserList();
    }

    cancel() {
        this.activeModal.dismiss( 'Cross click' );
    }

    ok( callBack ) {
        var amodel = this.activeModal;
        this.activeModal.close( 'Close click' );
        this.okCall( callBack );
    }

    /**
     * name
     */
    public onClickNext(from:NgForm) {
        
    }

    /**
     * Function to copy saved quote
     **/
    copyQuote(){
     
        this.userService.copyQuote( this.selectedObj ).subscribe(
            res => {
                if ( res.status == "success" ) {
                    this.ok(res);
                }
            },
            error => {
                this.commonService.hideLoading();
              //  let errorResponse = error.json();                
                if(error && error != undefined) {                        
                    if(error.statusCode==401) {
                        this.commonService.showAlert( "Error", error.error, "OK", () => {
                            this.commonService.logout();
                        } );
                    } else {
                        this.toastService.popToast( "error", error.message );
                    }
                }
        } );
    }

    /**
     * Get users list to show as sales representatives
     */
    getUserList(){
        // this.commonService.showLoading( this.constants.PLEASE_WAIT_TEXT );
         this.userService.getUsersList(this.loggedinUserData.organizationId).subscribe(
             res => {
                // this.commonService.hideLoading();              
                 this.salesRepList = res.data.rows;
                 let salesRepListLength = this.salesRepList.length;
                 /* If options has only one value then the value will selected defaultly */
                 if(salesRepListLength == 1) {
                     this.selectedObj.salesRep = this.salesRepList[0];
                 }else{
                    for(let i=0; i< this.salesRepList.length; i++){
                        if(this.selectedObj.salesRep && (this.selectedObj.salesRep.id == this.salesRepList[i].id)){
                            this.selectedObj.salesRep = this.salesRepList[i];
                        }
                    }
                }
            },error => {
                // this.commonService.hideLoading();
                 if ( error && error != undefined ) {
              //       let errorMsg;
             //        errorMsg = JSON.parse( errorMsg._body );
                     this.webServiceError = error.message;
                     this.toastService.popToast( "error", this.webServiceError );
                 } else {
                     this.toastService.popToast( "error", this.webServiceError );
                 }
             } 
         )
     }

}
