import { Component, OnInit, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component( {
    selector: 'save-discard-confirm-modal',
    templateUrl: './save-discard-confirm-modal.component.html',
    styleUrls: ['./save-discard-confirm-modal.component.scss']
} )

export class SaveDiscardConfirmComponent implements OnInit {

    @Input() title;
    @Input() message;
    @Output() okCall;
    @Output() cancelCall;
    @Output() crossBtnCall;
    firstButton:any;
    secondButton:any;
    protected isConfirm: boolean;

    closeResult: string;

    constructor( public activeModal: NgbActiveModal, private modalService: NgbModal ) {

    }

    ngOnInit() {

    }

    cancel() {
        this.activeModal.dismiss( 'Cancel click' );
        this.cancelCall();
    }

    ok() {
        var amodel = this.activeModal;
        this.activeModal.close( 'Ok click' );
        this.okCall();
    }
    
    crossBtnClick() {
        this.activeModal.dismiss( 'Cross click' );
        this.crossBtnCall();
    }

}
