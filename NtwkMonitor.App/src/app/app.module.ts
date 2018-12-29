import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";

import { UIModule } from "./ui/ui.module";
import { FilteredViewComponent } from "./ui/filteredView.component";
import { TreeViewComponent } from "./ui/treeView.component";
import { AboutViewComponent } from "./ui/aboutView.component";
import { NodeEditorComponent } from "./ui/nodeEditor.component";

import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, UIModule,
    RouterModule.forRoot([
      {
        path: "filteredView", component: FilteredViewComponent,
      },
      {
        path: "treeView", component: TreeViewComponent,
      },
      {
        path: "treeView/:id", component: TreeViewComponent,
      },
      {
        path: "about", component: AboutViewComponent,
      },
      {
        path: "nodeEditor/addToRoot", component: NodeEditorComponent,
      },
      {
        path: "nodeEditor/addTo/:parent", component: NodeEditorComponent,
      },
      {
        path: "nodeEditor/:id", component: NodeEditorComponent,
      },
      { path: "**", redirectTo: "/filteredView" },
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
