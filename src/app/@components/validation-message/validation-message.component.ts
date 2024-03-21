/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

import { Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'ngx-validation-message',
    styleUrls: ['./validation-message.component.scss'],
    template: `
             <p class="caption status-danger"
                *ngIf="showMinLength"> Min {{ label }} length is {{ minLength }} </p>
             <p class="caption status-danger"
                *ngIf="showMaxLength"> Max {{ label }} length is {{ maxLength }} </p>
             <p class="caption status-danger" *ngIf="showPattern"> Incorrect {{ label }} </p>
             <p class="caption status-danger" *ngIf="showPasswordPattern"> Your Password should be a minimum of 8 alphanumeric characters including 1 upper case & 1 special character</p>
             <p class="caption status-danger" *ngIf="showRequired"> {{ label }} is required</p>
             <p class="caption status-danger" *ngIf="showMin && getType()">Min value of {{ label }} is {{min | date}}</p>
             <p class="caption status-danger" *ngIf="showMin && !getType()">Min value of {{ label }} is {{min}}</p>
             <p class="caption status-danger" *ngIf="showMax">Max value of {{ label }} is {{ max }}</p>
             <p class="caption status-danger" *ngIf="showDataExists && !(days?.length)">Data Already exists with this data.</p>
             <p class="caption status-danger" *ngIf="showDataExists && (days?.length > 0)">{{days}} Already exists with this data.</p>
             <p class="caption status-danger" *ngIf="showAltMobileError">Mobile and Alternate moblile no should not be same.</p>
             <p class="caption status-danger" *ngIf="showPairValidError">Minmum should be less than Maximum.</p>
             <p class="caption status-danger" *ngIf="showMinValidError">Minimum Value also required.</p>
             <p class="caption status-danger" *ngIf="showMaxValidError">Maximum Value also required.</p>
             <p class="caption status-danger" *ngIf="showAmtPattern"> {{ label }} must be greater than zero</p>
  `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NgxValidationMessageComponent),
            multi: true,
        },
    ],
})
export class NgxValidationMessageComponent {
    @Input()
    label: string = '';

    @Input()
    showRequired?: boolean;

    @Input()
    min?: number;

    @Input()
    showMin?: boolean;

    @Input()
    max?: number;

    @Input()
    showMax: boolean;

    @Input()
    minLength?: number;

    @Input()
    showMinLength?: boolean;

    @Input()
    maxLength?: number;

    @Input()
    showMaxLength?: boolean;

    @Input()
    showPattern?: boolean;

    @Input()
    showPasswordPattern?: boolean;

    @Input()
    showDataExists?: boolean;

    @Input()
    showAltMobileError?: boolean;
    
    @Input()
    showPairValidError?: boolean;

    @Input()
    showMinValidError?: boolean;

    @Input()
    showMaxValidError?: boolean;

    @Input()
    days?: string[];

     @Input()
    showAmtPattern?: boolean;

    private isDate: boolean = false;

    getType(): any {        
        if ((this.min as any) instanceof Date) {
            this.isDate = true;
        }
        return this.isDate;
    }
}
