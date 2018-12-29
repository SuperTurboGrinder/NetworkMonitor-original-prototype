import { Component, Input } from "@angular/core"
import { Router } from "@angular/router"

import { PersistentViewDataService } from "../model/persistentViewData.service";

@Component({
    selector: "menu",
    moduleId: module.id,
    templateUrl: "menu.component.html"
})
export class MenuComponent {
    @Input() selection:string="";
    treeID:number = null;

    constructor(pvd:PersistentViewDataService) {
        this.treeID = pvd.currentTreeNodeID;
    }
}