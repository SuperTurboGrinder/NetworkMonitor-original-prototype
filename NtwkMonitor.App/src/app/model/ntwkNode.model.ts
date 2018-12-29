export class ParentData {
    constructor(
        public id:number,
        public name:string
    ) {}
}

export class NtwkNode {
    constructor(
        public id:number,
        public type:number,
        public parent:ParentData,
        public name:string,
        public isBlackBox:boolean,
        public ipStr:string,
        public isOpenSSH:boolean,
        public isOpenTelnet:boolean,
        public isOpenWeb:boolean,
        public isOpenPing:boolean,
    ) {}
}