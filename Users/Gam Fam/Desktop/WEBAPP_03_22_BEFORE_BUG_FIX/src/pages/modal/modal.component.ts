import { Component, OnInit, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component( {
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss']
} )

export class ModalComponent implements OnInit {

    @Input() title;
    @Input() message;
    @Output() okCall;

    protected isConfirm: boolean;

    closeResult: string;
    firstButton:any;
    secondButton:any;
    
    constructor( public activeModal: NgbActiveModal, private modalService: NgbModal ) {

    }

    ngOnInit() {

    }

    cancel() {
        this.activeModal.dismiss( 'Cancel click' );
    }

    ok() {
        var amodel = this.activeModal;
        this.activeModal.close( 'Ok click' );
        this.okCall();
    }
}
