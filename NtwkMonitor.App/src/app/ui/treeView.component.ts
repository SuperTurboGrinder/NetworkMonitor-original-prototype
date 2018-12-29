import { Component, OnInit } from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs/Observable"
import "rxjs/Rx";
import "rxjs/operator/mergeMap";

import { NodesRepository, NodesWithPingIndexes } from "../model/ntwkNodes.repository";
import { NtwkNode, ParentData } from "../model/ntwkNode.model";
import { PersistentViewDataService } from "../model/persistentViewData.service"

import { MenuComponent } from "./menu.component";

@Component({
    selector: "treeView",
    moduleId: module.id,
    templateUrl: "treeView.component.html"
})
export class TreeViewComponent implements OnInit {
    currentNode: NtwkNode = null;
    children: NtwkNode[] = [];
    editMode:boolean = false;

    constructor(
        private repository: NodesRepository,
        private pvd: PersistentViewDataService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        let sub = this.route.params.subscribe(params => {
            this.pvd.currentTreeNodeID = null;
            if(params["id"] == undefined) { //root
                this.repository.getCurrentChildrenCache(null)
                    .subscribe(children => this.children = children.nodes);
            }
            else {
                this.repository.findNode(+params.id).flatMap(node => {
                    if(node == undefined) { //back to root
                        return this.repository.getCurrentChildrenCache(null);
                    }
                    this.currentNode = node;
                    this.pvd.currentTreeNodeID = this.currentNode.id;
                    return this.repository.getCurrentChildrenCache(this.currentNode.id);
                }).subscribe(children => this.children = children.nodes);
            }
        });
    }

    numberOfChildren(id:number): Observable<number> {
        return this.repository.numberOfChildren(id);
    }

    isInEditMode():boolean {
        return this.editMode;
    }

    setEditMode(value:boolean) {
        this.editMode = value;
    }

    delete(node:NtwkNode) {
        if(confirm(`Are you sure you want to delete ${node.name}`)) {
            this.repository.removeNode(node.id).subscribe(_ => 
                this.repository.getCurrentChildrenCache(
                    this.currentNode == null ? null : this.currentNode.id
                ).subscribe(children => this.children = children.nodes)
            );
        }
    }
}