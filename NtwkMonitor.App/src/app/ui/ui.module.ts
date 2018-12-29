import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { ModelModule } from "../model/model.module";
import { MenuComponent } from "./menu.component";
import { FilteredViewComponent } from "./filteredView.component";
import { TreeViewComponent } from "./treeView.component";
import { AboutViewComponent } from "./aboutView.component"
import { NodeEditorComponent } from "./nodeEditor.component";
import { IPValidator } from "./ipvalidator.directive"

@NgModule({
    imports: [ModelModule, BrowserModule, FormsModule, RouterModule],
    declarations: [
        FilteredViewComponent,
        TreeViewComponent,
        AboutViewComponent,
        NodeEditorComponent,
        MenuComponent,
        IPValidator
    ],
    exports: [FilteredViewComponent,
        TreeViewComponent,
        NodeEditorComponent,
        AboutViewComponent
    ]
})
export class UIModule {}