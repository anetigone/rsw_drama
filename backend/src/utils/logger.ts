enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

class Logger {
  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  info(message: string, meta?: any) {
    console.log(this.formatMessage(LogLevel.INFO, message, meta));
  }

  warn(message: string, meta?: any) {
    console.warn(this.formatMessage(LogLevel.WARN, message, meta));
  }

  error(message: string, error?: Error | any, p0?: string, reason?: unknown) {
    console.error(this.formatMessage(LogLevel.ERROR, message, error?.message || error));
    if (error?.stack) {
      console.error(error.stack);
    }
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }
}

export default new Logger();
