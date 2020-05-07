import { Component, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

/*--------------------- npm Providers---------------------------*/
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

/*----------------- Providers---------------------*/
import { Constants } from '../app-settings-service/app-constant.service';
import { LoaderService } from '../common-service/loader-services';
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';

/*------------------Pages---------------------*/
import { ModalComponent } from '../../pages/modal/modal.component';
import { ImageCropComponent } from '../../pages/image-crop-modal/image-crop-modal.component';
import { PanelDiscardConfirmComponent } from '../../pages/panel-discard-confirm-modal/panel-discard-confirm-modal.component';
import { FlowDiscardConfirmComponent } from '../../pages/flow-discard-confirm-modal/flow-discard-confirm-modal.component';
import { SensorDiscardConfirmComponent } from '../../pages/sensor-discard-confirm-modal/sensor-discard-confirm-modal.component';
import { AccessoryDiscardConfirmComponent } from '../../pages/accessory-discard-confirm-modal/accessory-discard-confirm-modal.component';
import { DraftDiscardConfirmComponent } from '../../pages/draft-discard-confirm-modal/draft-discard-confirm-modal.component';
import { SaveDiscardConfirmComponent } from '../../pages/save-discard-confirm-modal/save-discard-confirm-modal.component';

@Injectable()
export class CommonService {
    public loader: any;
    public modalRef: any;
    private setControllerTitle: any;
    private createQuoteVo: any;

    constructor(private constants: Constants, private loaderService: LoaderService, private modalService: NgbModal, private locstr: LocalStorageService, private router: Router) {

    }

    /**
     * Function to show confirm pop-up
     * @param titleText - Header text
     * @param messageText - Message to show
     * @param cancelText - Cancel button text
     * @param okText - Ok button text
     * @param callBack - Ok button callBack 
     */
    showConfirm(titleText: string, messageText: string, cancelText: string, okText: string, callBack: any) {
        const modalRef = this.modalService.open(ModalComponent);
        modalRef.componentInstance.title = titleText;
        modalRef.componentInstance.message = messageText;
        modalRef.componentInstance.firstButton = cancelText;
        modalRef.componentInstance.secondButton = okText;

        modalRef.componentInstance.okCall = callBack;
    }

    /**
     * Function to show Alert pop-up
     * @param titleText - Header text
     * @param messageText - Message to show
     * @param okText - Ok button text
     * @param callBack - Ok button callBack 
     */
    showAlert(titleText: string, messageText: string, okText: string, callBack: any) {
        const modalRef = this.modalService.open(ModalComponent);
        modalRef.componentInstance.title = titleText;
        modalRef.componentInstance.message = messageText;
        modalRef.componentInstance.secondButton = okText;
        modalRef.componentInstance.okCall = callBack;
    }

    /**
     * Function to show confirm pop-up
     * @param titleText - Header text
     * @param messageText - Message to show
     * @param cancelText - Cancel button text
     * @param okText - Ok button text
     * @param callBack - Ok button callBack 
     */
    showDiscardConfirm(titleText: string, messageText: string, cancelText: string, okText: string, callBack: any) {
        let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false
        };
        const modalRef = this.modalService.open(ModalComponent, ngbModalOptions);
        modalRef.componentInstance.title = titleText;
        modalRef.componentInstance.message = messageText;
        modalRef.componentInstance.firstButton = cancelText;
        modalRef.componentInstance.secondButton = okText;
        modalRef.componentInstance.okCall = callBack;
    }

    /**
     * Function to show confirm pop-up
     * @param titleText - Header text
     * @param messageText - Message to show
     * @param cancelText - Cancel button text
     * @param okText - Ok button text
     * @param callBack - Ok button callBack 
     */
    showDiscardConfirmAsSaveFinal(yesCallback, discardCallback, crossBtnCallback) {
        let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false
        };
        const modalRef = this.modalService.open(SaveDiscardConfirmComponent, ngbModalOptions);
        modalRef.componentInstance.title = "Warning";
        modalRef.componentInstance.message = "Do you want to save this as a Final ?";
        modalRef.componentInstance.firstButton = "Discard";
        modalRef.componentInstance.secondButton = "Yes";

        modalRef.componentInstance.okCall = yesCallback;
        modalRef.componentInstance.cancelCall = discardCallback;
        modalRef.componentInstance.crossBtnCall = crossBtnCallback;
    }

    /**
     * Function to show confirm pop-up
     * @param titleText - Header text
     * @param messageText - Message to show
     * @param cancelText - Cancel button text
     * @param okText - Ok button text
     * @param callBack - Ok button callBack 
     */
    showDiscardConfirmAsDraft(yesCallback, discardCallback, crossBtnCallback) {
        let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false
        };
        const modalRef = this.modalService.open(DraftDiscardConfirmComponent, ngbModalOptions);
        modalRef.componentInstance.title = "Warning";
        modalRef.componentInstance.message = "Do you want to save this as a draft ?";
        modalRef.componentInstance.firstButton = "Discard";
        modalRef.componentInstance.secondButton = "Yes";

        modalRef.componentInstance.okCall = yesCallback;
        modalRef.componentInstance.cancelCall = discardCallback;
        modalRef.componentInstance.crossBtnCall = crossBtnCallback;
    }

    /**
     * Function to show confirm pop-up
     * @param titleText - Header text
     * @param messageText - Message to show
     * @param cancelText - Cancel button text
     * @param okText - Ok button text
     * @param callBack - Ok button callBack 
     */
    showFlowDiscardConfirm(yesCallback, discardCallback, crossBtnCallback) {
        let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false
        };
        const modalRef = this.modalService.open(FlowDiscardConfirmComponent, ngbModalOptions);
        modalRef.componentInstance.title = "Warning";
        modalRef.componentInstance.message = "Do you want to save this as a draft ?";
        modalRef.componentInstance.firstButton = "Discard";
        modalRef.componentInstance.secondButton = "Yes";

        modalRef.componentInstance.okCall = yesCallback;
        modalRef.componentInstance.cancelCall = discardCallback;
        modalRef.componentInstance.crossBtnCall = crossBtnCallback;
    }

    /**
     * Function to show confirm pop-up
     * @param titleText - Header text
     * @param messageText - Message to show
     * @param cancelText - Cancel button text
     * @param okText - Ok button text
     * @param callBack - Ok button callBack 
     */
    showAccessoryDiscardConfirm(yesCallback, discardCallback, crossBtnCallback) {
        let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false
        };
        const modalRef = this.modalService.open(AccessoryDiscardConfirmComponent, ngbModalOptions);
        modalRef.componentInstance.title = "Warning";
        modalRef.componentInstance.message = "Do you want to save this as a draft ?";
        modalRef.componentInstance.firstButton = "Discard";
        modalRef.componentInstance.secondButton = "Yes";

        modalRef.componentInstance.okCall = yesCallback;
        modalRef.componentInstance.cancelCall = discardCallback;
        modalRef.componentInstance.crossBtnCall = crossBtnCallback;
    }

    /**
     * Function to show confirm pop-up
     * @param titleText - Header text
     * @param messageText - Message to show
     * @param cancelText - Cancel button text
     * @param okText - Ok button text
     * @param callBack - Ok button callBack 
     */
    showPanelDiscardConfirm(yesCallback, discardCallback, crossBtnCallback) {
        let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false
        };
        const modalRef = this.modalService.open(PanelDiscardConfirmComponent, ngbModalOptions);
        modalRef.componentInstance.title = "Warning";
        modalRef.componentInstance.message = "Do you want to save this as a draft ?";
        modalRef.componentInstance.firstButton = "Discard";
        modalRef.componentInstance.secondButton = "Yes";

        modalRef.componentInstance.okCall = yesCallback;
        modalRef.componentInstance.cancelCall = discardCallback;
        modalRef.componentInstance.crossBtnCall = crossBtnCallback;
    }

    /**
     * Function to show confirm pop-up
     * @param titleText - Header text
     * @param messageText - Message to show
     * @param cancelText - Cancel button text
     * @param okText - Ok button text
     * @param callBack - Ok button callBack 
     */
    showSensorDiscardConfirm(yesCallback, discardCallback, crossBtnCallback) {
        let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false
        };
        const modalRef = this.modalService.open(SensorDiscardConfirmComponent, ngbModalOptions);
        modalRef.componentInstance.title = "Warning";
        modalRef.componentInstance.message = "Do you want to save this as a draft ?";
        modalRef.componentInstance.firstButton = "Discard";
        modalRef.componentInstance.secondButton = "Yes";

        modalRef.componentInstance.okCall = yesCallback;
        modalRef.componentInstance.cancelCall = discardCallback;
        modalRef.componentInstance.crossBtnCall = crossBtnCallback;
    }

    /**
     * Function to open modal on add organization
     * @param cancelText - Cancel button text
     * @param okText - Ok button text
     * @param callBack - Ok button callBack 
     */
    openComponentModal(component: any, obj: any, cancelText: string, okText: string, customClassName: string, callBack: any) {
        let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false,
            windowClass: customClassName
        };
        const modalRef = this.modalService.open(component, ngbModalOptions);
        modalRef.componentInstance.selectedObj = obj;
        modalRef.componentInstance.firstButton = cancelText;
        modalRef.componentInstance.secondButton = okText;
        modalRef.componentInstance.okCall = callBack;
    }

    /**
     * Function to open profile image crop
     * @param okText - Ok button text
     * @param callBack - Ok button callBack 
     */
    profileImageCrop(okText: string, callBack: any) {
        const modalRef = this.modalService.open(ImageCropComponent);
        modalRef.componentInstance.secondButton = okText;
        modalRef.componentInstance.okCall = callBack;
    }

	/**
     * Function to Form in Modal
     * @param ModalComponent - Modal HTML
     */
    formModal(ModalComponent) {
        const modalRef = this.modalService.open(ModalComponent);
    }

    formImgModal(ImageCropComponent) {
        const modalRef = this.modalService.open(ImageCropComponent);
    }
    /**
     * Function to show loader
     * @param text
     */
    public showLoading = message => {
        this.loaderService.display(true);
    }

    /**
     * Function to hide loader
     */
    public hideLoading = () => {
        this.loaderService.display(false);
    }

    /**
      * Function to check if loader undefined or not
      */
    isLoaderUndefined(): boolean {
        return (this.loader == null || this.loader == undefined);
    }

    /**
      * Function to hide/show password
      * @param: inputType
      * @param: showPassword
      * @param: callback
      */
    public hideShowPassword = (inputType: string, showPassword: boolean, callback: any) => {
        if (inputType == 'password') {
            showPassword = true;
            inputType = 'text';
            callback(showPassword, inputType);
        }
        else {
            showPassword = false;
            inputType = 'password';
            callback(showPassword, inputType);
        }
    };

    setModalRef(ref): any {
        this.modalRef = ref;
    }

    /**
     * Store controller and series 
     * */
    setCreateQuoteVo = (createQuoteObj: any) => {
        this.createQuoteVo = createQuoteObj;
        this.locstr.setObj('createQuoteVo', this.createQuoteVo);
    }

    /**
     * To get CreateQuoteVo which will have all data of flow 
     * */
    getCreateQuoteVo() {
        if (this.createQuoteVo) {
            return this.createQuoteVo;
        } else {
            return this.locstr.getObj('createQuoteVo');
        }
    }

    /**
     * To clear CreateQuoteVo  
     * */
    clearCreateQuoteVo() {
        this.createQuoteVo = {};
        this.locstr.removeObj('createQuoteVo');
    }

    /**
     * To store controller list in local storage
     * */
    storeDataInCreateQuoteVo(key: string, value: any) {
        // store controller list locally to map on refresh
        if (this.getCreateQuoteVo() && this.getCreateQuoteVo()[key]) {
            console.log('if  getCreateQuoteVo===>>>', this.getCreateQuoteVo(), 'key==>>>', key)
            let createQuoteVo = this.getCreateQuoteVo();
            createQuoteVo[key] = value;
            this.setCreateQuoteVo(createQuoteVo);
        } else {
            console.log('else  getCreateQuoteVo===>>>', this.getCreateQuoteVo(), 'key==>>>', key)
            let createQuoteVo: any;
            if (this.getCreateQuoteVo()) {
                createQuoteVo = this.getCreateQuoteVo();
                createQuoteVo[key] = value;
            } else {
                createQuoteVo = {};
                createQuoteVo[key] = value;
            }
            this.setCreateQuoteVo(createQuoteVo);
        }
    }


    /**
     * Remove key from createQuoteVo
     * */
    removeKeyFromCreateQuoteVo(key: string) {
        if (this.getCreateQuoteVo() && this.getCreateQuoteVo()[key]) {
            let createQuoteVo = this.getCreateQuoteVo();
            delete createQuoteVo[key];
            this.setCreateQuoteVo(createQuoteVo);
        }
    }

    /**
     * This function will check if nextState is belongs to create quote route
     * */
    isCreateQuoteRoute(nextState) {
        if ((nextState == '/createQuote') || (nextState == '/dashboard') || (nextState == '/controllerSeries') || (nextState == '/controllerSensorSelection')
            || (nextState == '/panelOptions') || (nextState == '/flowDirection') || (nextState == '/accessories') || (nextState == '/configuredQuote')) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Clear create route locally stored data
     * */
    clearCreateRouteData() {
        // controller list selected
        this.locstr.removeObj('selectedItems');
        // clear create quote object
        this.clearCreateQuoteVo();
    }

    /**
     * logout the app
     * */
    logout() {
        this.locstr.clearAllLocalStorage();
        // to clear data stored in provider
        this.clearCreateQuoteVo();
        this.router.navigate(['/']);
    }

    /**
     * This function will sort array of object by key 
     * */
    sortArrayByKey(array: Array<any>, key: string) {
        if (array) {
            return array.sort(function (a, b) {
                // only for undefined 
                if (typeof (a.id) === 'undefined') return 1;
                if (typeof (b.id) === 'undefined') return 0;

                a = (a.id || null);
                b = (b.id || null);

                return (a > b) ? 1 : ((a < b) ? -1 : 0);
            });
        }
    }

    /**
 * Function to perform common error handling
 * @param error
 */
    handleError = (errorResponse: Response | any) => {

        //   let error = errorResponse.json();
        let error;

        if (errorResponse.message == this.constants.ERROR_NETWORK_UNAVAILABLE) {
            error = errorResponse;
        } else {
            error = errorResponse.json();
        }

        if (error && error.statusCode == 401) {
            setTimeout(() => {
                //this.event.publish('user:logout');
                this.locstr.removeObj('accessToken');
                this.locstr.clearAllLocalStorage();
                this.router.navigate(['/']);
            }, 500);
            this.showAlert("Error", this.constants.ERROR_MSG_UNAUTHORIZED, "OK", () => {
                // Ok click code will be here
            });
        } else {
            if (error && error.message && (error.statusCode != 0)) {
                if (error.message == this.constants.ERROR_NETWORK_UNAVAILABLE) {
                    return Observable.throw(error);
                } else {
                    var err: any;
                    err = error;
                    if (error && err) {
                        if (error.code == 401) {
                            setTimeout(() => {
                                //this.event.publish('user:logout');
                                //logout user 
                                this.locstr.clearAllLocalStorage();
                                this.router.navigate(['/']);
                            }, 500);
                        } else {
                            return Observable.throw(err);
                        }
                    } else {
                        this.showAlert("Error", this.constants.ERROR_MSG_UNABLE_TO_CONNECT, "OK", () => {
                            // Ok click code will be here
                        });
                    }
                }
            } else {
                var errorMsg: string = this.constants.ERROR_MSG_UNABLE_TO_CONNECT;
                if (error && !error.message && (error.statusCode == 0)) {
                    errorMsg = this.constants.UNABLE_TO_CONNECT_SERVER_MSG;
                }
                this.showAlert("Error", errorMsg, "OK", () => {
                    // Ok click code will be here
                });
            }
        }
        return Observable.throw(err);
    }
}   