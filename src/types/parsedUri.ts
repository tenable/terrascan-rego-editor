export class ParsedUri {
    constructor(private _filePath: string, private _folderPath: string,  private _fileName: string) {}

    get filePath(): string {
        return this._filePath;
    }

    get folderPath(): string {
        return this._folderPath;
    }

    get fileName(): string {
        return this._fileName;
    } 
}
