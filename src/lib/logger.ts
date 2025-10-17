import { config } from './config';

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Logger configuration
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile?: boolean;
  filePath?: string;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  level: config.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
};

class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig = defaultConfig) {
    this.config = config;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      return `${baseMessage} ${JSON.stringify(data, null, 2)}`;
    }
    
    return baseMessage;
  }

  private log(level: LogLevel, levelName: string, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(levelName, message, data);

    if (this.config.enableConsole) {
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
      }
    }

    // TODO: Add file logging if needed
    if (this.config.enableFile && this.config.filePath) {
      // Implement file logging
    }
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, data);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data);
  }

  // Specialized logging methods
  api(message: string, data?: any): void {
    this.info(`[API] ${message}`, data);
  }

  db(message: string, data?: any): void {
    this.debug(`[DB] ${message}`, data);
  }

  auth(message: string, data?: any): void {
    this.info(`[AUTH] ${message}`, data);
  }

  performance(message: string, data?: any): void {
    this.debug(`[PERF] ${message}`, data);
  }
}

// Create and export logger instance
export const logger = new Logger();

// Utility function to replace console.log
export function log(level: LogLevel, message: string, data?: any): void {
  switch (level) {
    case LogLevel.ERROR:
      logger.error(message, data);
      break;
    case LogLevel.WARN:
      logger.warn(message, data);
      break;
    case LogLevel.INFO:
      logger.info(message, data);
      break;
    case LogLevel.DEBUG:
      logger.debug(message, data);
      break;
  }
}

// Convenience functions
export const logError = (message: string, data?: any) => log(LogLevel.ERROR, message, data);
export const logWarn = (message: string, data?: any) => log(LogLevel.WARN, message, data);
export const logInfo = (message: string, data?: any) => log(LogLevel.INFO, message, data);
export const logDebug = (message: string, data?: any) => log(LogLevel.DEBUG, message, data); 