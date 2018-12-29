import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { NgForm } from "@angular/forms";

import { NtwkNode } from "../model/ntwkNode.model";
import { NodesRepository } from "../model/ntwkNodes.repository";
import { IPValidator } from "./ipvalidator.directive"

@Component({
    moduleId: module.id,
    templateUrl: "nodeEditor.component.html"
})
export class NodeEditorComponent implements OnInit {
    editing: boolean = false;
    node: NtwkNode = null;
    parentID: number = null;
    types:string[] = [];

    constructor(
        private repository: NodesRepository,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            if(params["id"] == undefined) { //new
                this.node = new NtwkNode(
                    0, -1, null, "", false, "", false, false, false, true
                );
                if(params["parent"] != undefined) {
                    this.parentID = params["parent"];
                }
            }
            else {
                this.editing = true;
                this.repository.findNode(params["id"])
                    .subscribe(n => {
                        this.node = n;
                        if(n.parent != null) {
                            this.parentID = n.parent.id;
                        }
                    });
            }
        });
        this.repository.getTypes().subscribe(types => this.types = types);
    }

    changeType(type:string) {
        this.node.type = this.types.findIndex(t => t == type);
    }

    private backToTree(node:NtwkNode) {
        if(this.parentID == null) {
            this.router.navigateByUrl("/treeView");
        }
        else {
            this.router.navigateByUrl(`/treeView/${node.parent.id}`);
        }
    }

    save(form: NgForm) {
        if(this.node.id == 0) {
            this.repository.createNode(this.node, this.parentID==null ? 0 : this.parentID)
                .subscribe(node =>
                    this.backToTree(node)
                );
        }
        else {
            this.repository.updateNode(this.node).subscribe(_ =>
                this.backToTree(this.node)
            );
        }
    }
}