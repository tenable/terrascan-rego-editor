/*
    Copyright (C) 2022 Tenable, Inc.
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
        http://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

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
