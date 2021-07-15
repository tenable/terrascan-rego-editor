export class RegoVariable {
    constructor(private _name: string, private _type: VariableType, public isRoot: boolean, private _parent?:RegoVariable | null, private _children?: RegoVariable[]) {
        if (!this._children) {
            this._children = [];
        }
    }

    get name(): string {
        return this._name;
    }

    get type(): VariableType {
        return this._type;
    }

    get children(): RegoVariable[] {
        return this._children!;
    }
    
    get parent() : RegoVariable {
        return this._parent!;
    }
    
    set value(parent : RegoVariable) {
        this._parent = parent;
    }
    

    addChild(child: RegoVariable): void {
        this._children!.push(child);
    }
}

export enum VariableType {
    object,
    array,
    string,
    number,
    boolean
}