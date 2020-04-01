import { Component, OnInit, Input, Output, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { Router, RouterStateSnapshot } from '@angular/router';
/*-------------------------------- Providers ---------------------------------*/
import { UserService } from '../../providers/user-service/user.service';
import { CommonService } from '../../providers/common-service/common.service';
import { Constants } from '../../providers/app-settings-service/app-constant.service';
import { ToastService } from '../../providers/common-service/toaster-service';
import { Broadcaster } from '../../providers/broadcast-service/broadcast.service';
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';
import { ManageOrgUserService } from '../../providers/manage-org-user-service/manage-org-user.service';

 type EmailObj = {value: string, display: string};

@Component({
    selector: 'app-share-quoteH2',
    templateUrl: './share-quoteH2.component.html',
    styleUrls: ['./share-quoteH2.component.scss']
})
export class ShareQuoteH2Component implements OnInit {

    @Input() selectedObj;
    @Input() message;
    @Output() okCall;
    @Output() callBack;
    firstButton: any;
    secondButton: any;
    public formSubmitted: boolean;
    isLoadFailed: boolean = false;
    isLoading: boolean = false;
    public webServiceError;
    public emailErrorCount;
    public ccEmailErrorCount;
    public isSaveDarftBtnClicked;
    quoteType: any;
    selectedQuoteType: any;
    loggedInUserData: any;
    isQuoteGenerated: boolean = false;
    subscription;
    public emailPattern = /^(?!\.)[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    public purposes: EmailObj[] = [
    {value : 'quotes@h2tronics.com', display : 'Finalized Quote Please Process'},
    {value : 'info@h2tronics.com', display : 'General Inquiries'},
    {value : 'tech@h2tronics.com', display : 'Technical hardware question about Quote'},
    {value : 'orders@h2tronics.com', display : 'New Purchase Order'}

     ];
    public email = {
        'to': [],
        //'to': [{ value: 'quotes@H2tronics.com', display: 'quotes@H2tronics.com' }],
        'cc': [],
        'subject': '',
        'body': '',
        'imagename': '',
        'imagelink': '',
        'quote': {
            'QuotationType': {}
        },
        'customerName': '',
        'projectName': '',
        'quoteNo': '',
        'logo': '',
        'preparedBy': '',
        'quotetionObjArray': '',
        'totalAmount': '',
        'totalNetAmount': '',
        'totalTerritoryAmount': '',
        'is_specific_organization': '',
        'salesRep': '',
        'quoteType': 'hdhdhh'
    };

    userData;
    

    constructor(private locstr: LocalStorageService, public activeModal: NgbActiveModal,
        private broadcaster: Broadcaster, private modalService: NgbModal,
        public constants: Constants,private manageOrgUserService: ManageOrgUserService,
        private router: Router, private userService: UserService, private toastService: ToastService,
        private commonService: CommonService, private elem: ElementRef, private renderer: Renderer2) {

    }

    ngOnInit() {

        this.quoteType = [
            {id: 1, name: "List Price Only", type: "q1"},
            {id: 3, name: "Total List Price Only", type: "q3"},
            {id: 5, name: "List and Territory Cost", type: "q5"},
            {id: 6, name: "No Price Listed", type: "q6" }
        ]
        //get data of user
        this.userData = this.userService.getUser();

       

        var shareQuoteVo;
        this.isQuoteGenerated = true;
        shareQuoteVo = Object.assign({}, this.selectedObj);
        console.log('CHECK ----------------------', shareQuoteVo);
        this.email = {
            'to':  [{ value: 'quotes@H2tronics.com', display: 'quotes@H2tronics.com' }],
            //'to':  //[(this.selectedValue)],   [{ value: 'quotes@H2tronics.com', display: 'quotes@H2tronics.com' }],
            'cc': [],
            'subject': 'Quote # ' + shareQuoteVo.quoteNo,
            'body': `Please see the attached quote.\n
             Sincerely, ${this.userData.name}\n
             Organization: ${this.userData.organizationName}\n
             Email: ${this.userData.email}\n
             Phone Number: ${this.userData.contactNo}`,
            'imagename': shareQuoteVo.imagename,
            'imagelink': shareQuoteVo.imagelink,
            'quote': shareQuoteVo.quote,
            'customerName': shareQuoteVo.customerName,
            'projectName': shareQuoteVo.projectName,
            'quoteNo': shareQuoteVo.quoteNo,
            'logo': shareQuoteVo.logo,
            'preparedBy': shareQuoteVo.preparedBy,
            'quotetionObjArray': shareQuoteVo.quotetionObjArray,
            'totalAmount': shareQuoteVo.totalAmount,
            'totalNetAmount': shareQuoteVo.totalNetAmount, 
            'totalTerritoryAmount': shareQuoteVo.totalTerritoryAmount,
            'is_specific_organization': shareQuoteVo.is_specific_organization,
            'salesRep': shareQuoteVo.salesRep,
            'quoteType':   shareQuoteVo.quoteType,
        };

        this.subscription = this.broadcaster.on<any>('QUOTE_GENERATED_WITH_SHARED_QUOTE_TYPE')
            .subscribe(message => {
                this.isQuoteGenerated = true;
                shareQuoteVo = message;
                this.email.imagename = shareQuoteVo.imagename;
                this.email.imagelink = shareQuoteVo.imagelink;
                this.email.quote = shareQuoteVo.quote;
                this.email.customerName = shareQuoteVo.customerName;
                this.email.projectName = shareQuoteVo.projectName;
                this.email.quoteNo = shareQuoteVo.quoteNo;
                this.email.logo = shareQuoteVo.logo;
                this.email.preparedBy = shareQuoteVo.preparedBy;
                this.email.quotetionObjArray = shareQuoteVo.quotetionObjArray;
                this.email.totalAmount = shareQuoteVo.totalAmount;
                this.email.totalNetAmount = shareQuoteVo.totalNetAmount;
                this.email.totalTerritoryAmount = shareQuoteVo.totalTerritoryAmount;
                this.email.is_specific_organization = shareQuoteVo.is_specific_organization;
                this.email.salesRep = shareQuoteVo.salesRep;
                this.email.quote.QuotationType = shareQuoteVo.quoteType;
            });


            if(this.userService.getUser()){
                this.loggedInUserData = this.userService.getUser();
                if(this.loggedInUserData.role != 'ORG_ADMIN'){
                    if(shareQuoteVo.is_specific_organization){
                        this.quoteType = [
                                            {id: 1, name: "List Price Only", type: "q1"},
                                            {id: 3, name: "Total List Price Only", type: "q3"},
                                            {id: 5, name: "List and Territory Cost", type: "q5"},
                                            { id: 6, name: "No Price Listed", type: "q6" }
                                        ]
                        this.email.quoteType = this.quoteType[0];
                        return; // stop executing the rest of the code
                    }

        if (this.userService.getUser()) {
            this.loggedInUserData = this.userService.getUser();
            if (this.loggedInUserData.role != 'ORG_ADMIN') {
                if (shareQuoteVo.is_specific_organization) {
                    this.quoteType = [
                        { id: 1, name: "List Price Only", type: "q1" },
                        { id: 3, name: "Total List Price Only", type: "q3" },
                        { id: 5, name: "List and Territory Cost", type: "q5" },
                        { id: 6, name: "No Price Listed", type: "q6" }
                    ]
                    this.email.quoteType = this.quoteType[0];
                } else {
                    this.getUserQuoteType();

                }
                // this.getQuotationTypeByOrganization(this.loggedInUserData.organizationId) // shows every price list
                this.getUserQuoteType();
            }
    }

    onPurposeChange(selectedValue) {
        const foundPurpose = this.purposes.find(purpose => purpose.value === selectedValue);

        if(foundPurpose) {
            const toEmail = { value: foundPurpose.value, display: foundPurpose.value, readonly: true }
            this.email.to.splice(0, 1, toEmail);
        }
      
      }


    //   //compareWith(item1, item2) {
    //       return item1.id === item2.id;
    //   //}

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    cancel() {
        this.activeModal.dismiss('Cross click');
        if (this.locstr.get('shareQuoteFromViewQuote') === 'true') {
            this.router.navigate(['/viewQuotes']);
        } else {
            this.broadcaster.broadcast('RECALL_CONFIGURE_QUOTE', "After sending an email recall configure quote");
        }
    }

    ok(callBack) {
        this.activeModal.close('Close click');
        this.okCall(callBack);
        if (this.locstr.get('shareQuoteFromViewQuote') === 'true') {
            this.router.navigate(['/viewQuotes']);
        } else {
            this.broadcaster.broadcast('RECALL_CONFIGURE_QUOTE', "After sending an email recall configure quote");
        }
    }


    validateToEmail() {
        let parentElement = this.elem.nativeElement.querySelectorAll('.ng2-tags-container');
        this.emailErrorCount = 0;
        /*const splittedEmails = this.email.to.split(',');
        if (splittedEmails.length > 0) {

        }*/
        this.email.to.filter((element, index) => {

            if (this.emailPattern.test(element.value)) {
                element.isValidEmail = true;
                this.renderer.removeClass(parentElement[0].children[index], 'error');

            } else {
                element.isValidEmail = false;
                this.emailErrorCount++;
                this.renderer.addClass(parentElement[0].children[index], 'error');
            }
        });
    }

    validateCCEmail() {
        let parentElement = this.elem.nativeElement.querySelectorAll('.ng2-tags-container');
        this.ccEmailErrorCount = 0;
        this.email.cc.filter((element, index) => {
            if (element) {
                if (this.emailPattern.test(element.value)) {
                    element.isValidEmail = true;
                    this.renderer.removeClass(parentElement[1].children[index], 'error');
                } else {
                    element.isValidEmail = false;
                    this.ccEmailErrorCount++;
                    this.renderer.addClass(parentElement[1].children[index], 'error');
                }
            } else {
                this.ccEmailErrorCount = 0;
            }
        });
    }

    /**
 * Function to send email
 * */
sendEmail(form: NgForm) {
    this.formSubmitted = true;
    if (form.valid && this.emailErrorCount == 0 && this.ccEmailErrorCount == 0 ) {
        this.isLoading = true;
        this.isLoadFailed = false;
        this.email.body = this.email.body.replace(/\n/g, '<br>');
        if(this.email.quote.QuotationType.type == 'q6') {
            this.email.quote.price = '';
            this.email.totalAmount = '0';
        }
        //console.log('FORM EMAIL ====', this.email);
        this.userService.sendEmailDetails(this.email).subscribe(
            res => {
                this.isLoading = false;
                this.ok(res);
                this.formSubmitted = false;
            
                }, error => {
                    this.isLoading = false;
                   
                    let errorResponse;
                    

                    if (error.message == this.constants.ERROR_NETWORK_UNAVAILABLE) {
                        errorResponse = error;
                    } else {
                        errorResponse = error.json();
                    }
                    if (errorResponse && errorResponse != undefined && errorResponse.statusCode == 401) {
                        this.activeModal.close('Close click');
                        this.commonService.hideLoading();
                        this.commonService.showAlert("Error", errorResponse.error, "OK", () => {
                            this.commonService.logout();
                        });
                    } else {
                        // Error message for back-end If data not matched
                        if (error && error != undefined) {
                            if (error._body) {
                                let errorMsg = JSON.parse(error._body);
                                this.webServiceError = errorMsg.message;
                            } else {
                                this.webServiceError = error.message;
                            }
                        } else {
                            this.webServiceError = 'User update failed. Please try again.'
                        }
                    }
                });

        }
    }

    /*
    * This function get quote associated with this user
    * for initially binding to dropdown.
    */
    getUserQuoteType() {
        // this.isLoading = true;
        // this.commonService.showLoading( this.constants.PLEASE_WAIT_TEXT );
        this.userService.getUserAssociatedQuoteTypes().subscribe(
            res => {
                //this.commonService.hideLoading();

                this.quoteType = res.data;
                const foundQuoteType = this.quoteType.find(quote => quote.type == "q6");
                if (!foundQuoteType) {
                    this.quoteType.push({ name: "No Price Listed", type: "q6", id: 6, deleted_at: null, created_at: null, updated_at: null });
                }
               

                let quoteTypeOptionLength = this.quoteType.length;
                /* If options has only one value then the value will selected defaultly */
                if (quoteTypeOptionLength == 1) {
                    this.email.quoteType = this.quoteType[0];
                }
                let storageQuoteType;
                if (this.commonService.getCreateQuoteVo()) {
                    storageQuoteType = this.commonService.getCreateQuoteVo().projectDetails.quoteType;
                    if (this.quoteType && this.quoteType.length > 0) {
                        let foundQuote = this.quoteType.find(x => x.id == storageQuoteType.id);
                        if (!foundQuote) {
                            this.quoteType.push(storageQuoteType);
                            this.email.quoteType = storageQuoteType;
                        }
                    }
                }

                this.isLoading = false;
            }, error => {
                //  this.commonService.hideLoading();
               // console.log("error", error);
                this.isLoading = false;
                if (error && error != undefined) {
                    this.webServiceError = error.message;
                    this.toastService.popToast("error", this.webServiceError);
                } else {
                    this.toastService.popToast("error", this.webServiceError);
                }
            }
        )
    }


    saveDarftBtnClicked() {
        this.isSaveDarftBtnClicked = true;
    }

    getQuotationTypeByOrganization(organization_id: any) {
        this.isLoading = true;
        this.manageOrgUserService.getQuotationTypeByOrganization(organization_id).subscribe(
            res => {
                this.isLoading = false;
                this.quoteType = res.data;
                const foundQuoteType = this.quoteType.find(quote => quote.type == "q6");
                if (!foundQuoteType) {
                    this.quoteType.push({ name: "No Price Listed", type: "q6", id: 6 });
                }
               
                let quoteTypeOptionLength = this.quoteType.length;
                let storageQuote;
                if (this.commonService.getCreateQuoteVo()) {
                    storageQuote = this.commonService.getCreateQuoteVo().projectDetails.quoteType;
                    if (this.quoteType && this.quoteType.length > 0) {
                        var self = this;
                        this.quoteType.filter(function (x) {
                            if (x.id == storageQuote.id) {
                                self.email.quoteType = x;
                            }
                        });
                    }
                }
                /* If options has only one value then the value will selected defaultly */
                if (quoteTypeOptionLength == 1) {
                    this.email.quoteType = this.quoteType[0];
                }
            },
            error => {
                this.isLoading = false;
                // Error message for back-end If data not matched                  
                if (error && error != undefined) {
                    if (error._body) {
                        let errorMsg = JSON.parse(error._body);
                        this.webServiceError = errorMsg.message;
                    } else {
                        this.webServiceError = error.message;
                    }
                } else {
                    this.webServiceError = 'get quotation type failed. Please try again.'
                }
            });
    }

    onQuoteSelect(event) {
        var self = this;
        setTimeout(() => {
            self.broadcaster.broadcast('ON_SHARE_CHANGED_PRICING_OPTION', self.email.quoteType);
        }, 1000);
        this.isQuoteGenerated = false;
    }

}

