import { Component, OnInit, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';

/*------------------ Models ---------------------*/
import { UserDTO } from '../../models/user-dto';

/*-------------------- Providers ----------------------------*/
import { CommonService } from '../../providers/common-service/common.service';
import { Constants } from '../../providers/app-settings-service/app-constant.service';
import { AuthServices } from '../../providers/auth-service/auth.service';
import { Broadcaster } from "../../providers/broadcast-service/broadcast.service";
import { UserService } from "../../providers/user-service/user.service";
import { ToastService } from '../../providers/common-service/toaster-service';

@Component( {
    selector: 'app-edit-quotation',
    templateUrl: './edit-quotation.component.html',
    styleUrls: ['./edit-quotation.component.scss'],
    encapsulation: ViewEncapsulation.None
} )

export class EditQuotationComponent implements OnInit {
    @ViewChild( 'qutationForm' ) qutationForm;
    quotationData = {
        customerName: '',
        projectName: '',
        salesRep: null,
        quoteType:null
    };

    protected formSubmitted: boolean = false;
    public isEmpty: boolean;
    public textInputType: string;
    public save: string;
    public close: string;
    public titleText: string;
    public saveFlag: boolean = true;
    public webServiceError: string;
    public isInvalid: boolean;
    salesRepList: any;
    loggedinUserData: any;
    quoteType: any;
    subscription;

    constructor( private commonService: CommonService, public activeModal: NgbActiveModal, public constants: Constants,
        private cd: ChangeDetectorRef, private authService: AuthServices, private broadcaster: Broadcaster, private toastService: ToastService, private userService: UserService ) {

    }

    ngOnInit() {
        this.textInputType = 'text';
        this.save = 'Save';
        this.close = 'Cancel';
        this.titleText = 'Change Customer/Poject Name';
        this.isEmpty = false;

        this.formSubmitted = false;
        this.isInvalid = false;
        this.loggedinUserData = this.userService.getUser();
        // Update customer and project in header
        this.broadcaster.on<any>( 'UPDATE_HEADER' )
            .subscribe( message => {
                this.quotationData = message;
            } );

        // On modal init assign saved quotation data
        if ( !this.quotationData || ( this.quotationData.customerName === '' ) ) {
            this.quotationData = Object.assign( {}, this.commonService.getCreateQuoteVo().projectDetails );
        }

        
    }
    
    ngAfterViewInit(){
        this.getUserQuoteType();
        this.getUserList();
        this.cd.detectChanges();
    }

    /**
     * Function for cancel quotation modal
     * */
    cancel() {
        this.activeModal.dismiss( 'Cross click' );
    }

    /**
     * Function for save quotation data
     * */
    saveQuotation = ( form: NgForm ) => {
        this.formSubmitted = true;
        if ( form.valid ) {
            this.formSubmitted = false;
            this.commonService.storeDataInCreateQuoteVo( 'projectDetails', this.quotationData );
            this.broadcaster.broadcast( 'UPDATE_HEADER', this.quotationData );
            this.broadcaster.broadcast( 'ON_HEADER_QUOTE_UPDATE', 'on quotation type change reconfigure quote' );
            this.activeModal.dismiss();
            this.saveFlag = false;
        }
    }
   
    
    /**
     * Get users list to show as sales representatives
     */
    getUserList(){
       // this.commonService.showLoading( this.constants.PLEASE_WAIT_TEXT );
        this.userService.getSalesRepListWithLoggedInUser(this.loggedinUserData.organizationId).subscribe(
            res => {
               // this.commonService.hideLoading();              
                this.salesRepList = res.data.rows;
                let salesRepListLength = this.salesRepList.length;
                /* If options has only one value then the value will selected defaultly */
                if(salesRepListLength == 1) {
                    this.quotationData.salesRep = this.salesRepList[0];
                }else{
                    for(let i=0; i< this.salesRepList.length; i++){
                        if(this.quotationData.salesRep.id == this.salesRepList[i].id){
                            this.quotationData.salesRep = this.salesRepList[i];
                        }
                    }
                }
           },error => {
               // this.commonService.hideLoading();
                //console.log("error",error);
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

    /*
    * This function get quote associated with this user
    * for initially binding to dropdown.
    */
    getUserQuoteType(){
       // this.commonService.showLoading( this.constants.PLEASE_WAIT_TEXT );
        this.userService.getUserAssociatedQuoteTypes().subscribe(
            res => {
              //  this.commonService.hideLoading();              
                this.quoteType = res.data;
                let quoteTypeOptionLength = this.quoteType.length;
                /* If options has only one value then the value will selected defaultly */
                if(quoteTypeOptionLength == 1) {
                    this.quotationData.quoteType = this.quoteType[0];
                }else{
                    for(let i=0; i< this.quoteType.length; i++){
                        if(this.quotationData.quoteType.id == this.quoteType[i].id){
                            this.quotationData.quoteType = this.quoteType[i];
                        }
                    }
                }
           },error => {
               // this.commonService.hideLoading();
               // console.log("error",error);
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
