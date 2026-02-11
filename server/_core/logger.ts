import { ENV } from './env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    data?: unknown;
    timestamp: Date;
}

class Logger {
    private isDevelopment = !ENV.isProduction;

    private log(level: LogLevel, message: string, data?: unknown): void {
        const entry: LogEntry = {
            level,
            message,
            data,
            timestamp: new Date(),
        };

        // Em desenvolvimento, usar console
        if (this.isDevelopment) {
            const logMethod = level === 'error' ? console.error :
                level === 'warn' ? console.warn :
                    console.log;

            if (data !== undefined) {
                logMethod(`[${level.toUpperCase()}] ${message}`, data);
            } else {
                logMethod(`[${level.toUpperCase()}] ${message}`);
            }
        } else {
            // Em produção, apenas erros e warnings
            if (level === 'error' || level === 'warn') {
                const logMethod = level === 'error' ? console.error : console.warn;
                logMethod(JSON.stringify(entry));
            }
        }
    }

    debug(message: string, data?: unknown): void {
        this.log('debug', message, data);
    }

    info(message: string, data?: unknown): void {
        this.log('info', message, data);
    }

    warn(message: string, data?: unknown): void {
        this.log('warn', message, data);
    }

    error(message: string, data?: unknown): void {
        this.log('error', message, data);
    }
}

export const logger = new Logger();
