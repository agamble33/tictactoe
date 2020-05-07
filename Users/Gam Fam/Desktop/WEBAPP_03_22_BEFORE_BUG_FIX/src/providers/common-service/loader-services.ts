import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class LoaderService {
    public status: BehaviorSubject<boolean> = new BehaviorSubject<boolean>( false );

    display( value: boolean ) {
       // console.log("loader value.....", value);
        this.status.next( value );
    }
}