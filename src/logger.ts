// 定义日志级别
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// 日志系统
export class Logger {
  private static instance: Logger;
  private level: LogLevel = LogLevel.INFO;
  
  private constructor() {}
  
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  public setLevel(level: LogLevel) {
    this.level = level;
  }
  
  public debug(message: string, ...args: any[]) {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[Juggl] ${message}`, ...args);
    }
  }
  
  public info(message: string, ...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      console.info(`[Juggl] ${message}`, ...args);
    }
  }
  
  public warn(message: string, ...args: any[]) {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[Juggl] ${message}`, ...args);
    }
  }
  
  public error(message: string, ...args: any[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[Juggl] ${message}`, ...args);
    }
  }
}

// 全局错误处理包装器
export function safeExecute<T>(operation: () => T, fallback: T, errorMessage: string): T {
  try {
    return operation();
  } catch (error) {
    Logger.getInstance().error(`${errorMessage}:`, error);
    return fallback;
  }
} 