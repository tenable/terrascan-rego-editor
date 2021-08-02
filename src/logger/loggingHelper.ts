import { RegoLogger } from "./regoLogger";

export class LogUtils {
    private static logger: RegoLogger;

    static setLoggerObject(logUtils: RegoLogger) {
        this.logger = logUtils;
    }

    static logMessage(message: string) {
        this.logger.log(message);
    }
}