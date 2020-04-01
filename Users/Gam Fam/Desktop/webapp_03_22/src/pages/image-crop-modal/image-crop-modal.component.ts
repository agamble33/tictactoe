import { Component, OnInit, Input, Output,ViewEncapsulation, ViewChild  } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {ImageCropperComponent, CropperSettings, Bounds} from 'ng2-img-cropper';
import { Broadcaster } from '../../providers/broadcast-service/broadcast.service';
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';
@Component( {
    selector: 'app-image-crop-modal',
    templateUrl: './image-crop-modal.component.html',
    styleUrls: ['./image-crop-modal.component.scss']
} )

export class ImageCropComponent implements OnInit {

    @Input() message;
    @Output() okCall;
 
    data:any;
    public fileData;
    public isfileOpen: boolean;
    secondButton:any;
    
    @ViewChild('cropper', undefined)
    cropper:ImageCropperComponent;  

    constructor( public activeModal: NgbActiveModal, private broadcaster: Broadcaster,public locstr: LocalStorageService, private modalService: NgbModal, public cropperSettings: CropperSettings ) {
        this.cropperSettings = new CropperSettings();
        this.cropperSettings.noFileInput = true;
        this.data = {};
    }

    ngOnInit() {
        this.isfileOpen = false;
    }
    
    /** 
     * Function to cancel modal
     **/
    cancel() {
        this.activeModal.dismiss( 'Cross click' );
      //If user selected image and click on cancel then we set cropper obj as a new obj
        this.isfileOpen = false;
        this.cropperSettings = new CropperSettings();
        this.cropperSettings.noFileInput = true;
        this.data = {};
    }
    
    /** 
     * Function called on ok button click of modal
     * browsed image stored on local storage
     **/
    ok(file:any) {
        this.locstr.setObj('croppedImage',file);
        var amodel = this.activeModal;
        this.activeModal.close( 'Close click' );
        this.okCall();
    }

    /**
     * Function to browse image 
     **/
    fileChangeListener($event) {
        var image:any = new Image();
        var file:File = $event.target.files[0];
        var myReader:FileReader = new FileReader();
        var that = this;
        this.isfileOpen = true;
        myReader.onloadend = function (loadEvent:any) {
            image.src = loadEvent.target.result;
            that.cropper.setImage(image);
        };
        myReader.readAsDataURL(file);
    }
}
