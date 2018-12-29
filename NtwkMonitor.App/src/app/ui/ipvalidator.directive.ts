import {
    ReactiveFormsModule,
    NG_VALIDATORS,
    FormsModule,
    FormGroup,
    FormControl,
    ValidatorFn,
    Validator
} from '@angular/forms';
import { Directive } from '@angular/core';

@Directive({
    selector: '[ipvalidator][ngModel]',
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: IPValidator,
            multi: true
        }
    ]
})

export class IPValidator implements Validator {
    validator: ValidatorFn;

    constructor() {
        this.validator = this.ipValidator();
    }

    validate(c: FormControl) {
        return this.validator(c);
    }

    ipValidator(): ValidatorFn {
        return (c: FormControl) => {
            let isValid = this.validateIPAddress(c.value);
            if (isValid) {
                return null;
            } else {
                return {
                    ipvalidator: {
                        valid: false
                    }
                };
            }
        }
    }

    //https://www.guyfromchennai.com/?p=83
    validateIPAddress(ipaddr:string): boolean {
        //Remember, this function will validate only Class C IP.
        //change to other IP Classes as you need
        //field should be "required"
        if(ipaddr == null || ipaddr.length == 0) return true;
        ipaddr = ipaddr.replace( /\s/g, "") //remove spaces for checking
        var re = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/; //regex. check for digits and in
                                              //all 4 quadrants of the IP
        if (re.test(ipaddr)) {
            //split into units with dots "."
            var parts = ipaddr.split(".");
            //if the first unit/quadrant of the IP is zero
            if (parseInt(parts[0]) == 0) {
                return false;
            }
            //if the fourth unit/quadrant of the IP is zero
            if (parseInt(parts[3]) == 0) {
                return false;
            }
            //if any part is greater than 255
            for (var i=0; i<parts.length; i++) {
                if (parseInt(parts[i]) > 255){
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }
}