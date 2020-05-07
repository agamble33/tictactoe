import { Component, OnInit, ViewEncapsulation, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

/*-------------------- Providers ----------------------------*/
import { CommonService } from '../../providers/common-service/common.service';
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';
import { SidebarService } from '../../providers/sidebar.service';
import { Broadcaster } from '../../providers/broadcast-service/broadcast.service';
import { Constants } from '../../providers/app-settings-service/app-constant.service';
import { UserService } from '../../providers/user-service/user.service';
import { ToastService } from '../../providers/common-service/toaster-service';

@Component({
    selector: 'app-create-quote',
    templateUrl: './create-quote.component.html',
    styleUrls: ['./create-quote.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class CreateQuoteComponent implements OnInit {
    @ViewChild('customerForm') customerForm;
    public headerHeight;
    public pageHeight;
    public customerData = {
        customerName: '',
        projectName: '',
        salesRep: '',
        quoteType: ''
    };
    protected getCustomerData;
    public formSubmitted: boolean = false;
    public quoteType: any;
    public isLoading: any;
    public webServiceError: string;
    public loggedinUserData: any;
    public salesRepList: any;

    constructor(private locstr: LocalStorageService, public sidebar: SidebarService,
        private commonService: CommonService,
        private router: Router, private broadcaster: Broadcaster,
        public constants: Constants, private userService: UserService,
        private toastService: ToastService) {
        /*let windowInnerHeight = window.innerHeight;
        let windowHeight = this.locstr.getObj( 'windowInnerHeight' );
        this.headerHeight = ( 98 * windowHeight ) / 900;
        this.pageHeight = windowHeight - 68;*/

    }

    ngOnInit() {
        this.sidebar.show();
        this.locstr.set('saveQuoteFlag', false);
        // this object will be stored in local storage to track & hold data
        if (this.commonService.getCreateQuoteVo() && this.commonService.getCreateQuoteVo().projectDetails) {
            if (this.router.url === '/createQuote') {
                this.customerData.customerName = '';
                this.customerData.projectName = '';
            } else {
                this.customerData = this.commonService.getCreateQuoteVo().projectDetails;
            }
        } else {
            this.commonService.storeDataInCreateQuoteVo('projectDetails', {});
        }

        //Cleared local data
        let id = null;
        this.locstr.set('quoteId', null);
        this.locstr.set('quoteNo', '');
        this.locstr.set('finalCost', 0);
        this.locstr.setObj('parts', null);
        this.locstr.setArray('corrosionItems', []);
        this.locstr.setArray('prominentItems', []);
        this.locstr.setArray('analogItems', []);
        this.locstr.set('shareQuoteFromViewQuote', false);
        this.locstr.set('shareQuoteH2FromViewQuote', false);
        this.locstr.set('fromViewQuoteOnlyView', false);
        this.locstr.set('isEditViewedQuote', false);
        if (this.commonService.getCreateQuoteVo() && (this.commonService.getCreateQuoteVo() && this.commonService.getCreateQuoteVo().isEditSavedQuote) || (this.commonService.getCreateQuoteVo() && this.commonService.getCreateQuoteVo().isEditDraftQuote)) {
            this.commonService.getCreateQuoteVo().id = null;
            this.commonService.storeDataInCreateQuoteVo('isEditDraftQuote', false);
            this.commonService.storeDataInCreateQuoteVo('isEditSavedQuote', false);
        }
        this.getUserQuoteType();
        this.loggedinUserData = this.userService.getUser();
        this.getUserList();
    }

    /**
     * This listener will detect if form is dirty and will show prompt while browser refresh
     * */
    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHander(event) {
        if (this.customerForm && this.customerForm.dirty) {
            // form dirty, show discard prompt
            return false;
        }
        return true;
    }

    /*
    * This function get quote associated with this user
    * for initially binding to dropdown.
    */
    getUserQuoteType() {
        this.isLoading = true;
        this.commonService.showLoading(this.constants.PLEASE_WAIT_TEXT);
        this.userService.getUserAssociatedQuoteTypes().subscribe(
            res => {
                this.commonService.hideLoading();
                this.quoteType = res.data;
                const foundQuoteType = this.quoteType.find(quote => quote.type == "q6");
                if (!foundQuoteType) {
                    this.quoteType.push({ name: "No Price Listed", type: "q6", id: 6, deleted_at: null, created_at: null, updated_at: null });
                }
                //console.log('====&&&&&&& RES', res.data);
                let quoteTypeOptionLength = this.quoteType.length;
                /* If options has only one value then the value will selected defaultly */
                if (quoteTypeOptionLength == 1) {
                    this.customerData.quoteType = this.quoteType[0];
                }
                this.isLoading = false;
            }, error => {
                this.commonService.hideLoading();
                // console.log("error",error);
                this.isLoading = false;
                if (error && error != undefined) {
                    //       let errorMsg;
                    //        errorMsg = JSON.parse( errorMsg._body );
                    this.webServiceError = error.message;
                    this.toastService.popToast("error", this.webServiceError);
                } else {
                    this.toastService.popToast("error", this.webServiceError);
                }
            }
        )
    }

    /**
     * Get users list to show as sales representatives
     */
    getUserList() {
        this.isLoading = true;
        this.commonService.showLoading(this.constants.PLEASE_WAIT_TEXT);
        this.userService.getSalesRepListWithLoggedInUser(this.loggedinUserData.organizationId).subscribe(
            res => {
                this.commonService.hideLoading();
                this.salesRepList = res.data.rows;
                let salesRepListLength = this.salesRepList.length;
                /* If options has only one value then the value will selected defaultly */
                if (salesRepListLength == 1) {
                    this.customerData.salesRep = this.salesRepList[0];
                }
                this.isLoading = false;
            }, error => {
                this.commonService.hideLoading();
                this.isLoading = false;
                if (error && error != undefined) {
                    //       let errorMsg;
                    //        errorMsg = JSON.parse( errorMsg._body );
                    this.webServiceError = error.message;
                    this.toastService.popToast("error", this.webServiceError);
                } else {
                    this.toastService.popToast("error", this.webServiceError);
                }
            }
        )
    }

    /**
     * This function will login to user
     * param1: login form
     * */
    onClickNext = (form: NgForm) => {
        this.formSubmitted = true;
        console.log('this.customerData===>>>>>', this.customerData  )
        if (form.valid) {
            this.formSubmitted = false;
            this.broadcaster.broadcast('UPDATE_HEADER', this.customerData);
            this.router.navigate(['/dashboard']);
            // store entered details locally
            if (this.commonService.getCreateQuoteVo() && this.commonService.getCreateQuoteVo().projectDetails) {
                this.commonService.storeDataInCreateQuoteVo('projectDetails', this.customerData);
            } else {
                this.commonService.storeDataInCreateQuoteVo('projectDetails', {});
            }
        }
    }

}

