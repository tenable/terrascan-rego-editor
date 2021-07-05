export class RegoVariable {
    constructor(private _name: string, private _type: VariableType, private _childs?: RegoVariable[]) {
        if (!this._childs) {
            this._childs = [];
        }
    }

    get name(): string {
        return this._name;
    }

    get type(): VariableType {
        return this._type;
    }

    get childs(): RegoVariable[] {
        return this._childs!;
    }

    addChild(child: RegoVariable): void {
        this._childs!.push(child);
    }
}

export enum VariableType {
    object,
    array,
    string,
    number,
    boolean
}