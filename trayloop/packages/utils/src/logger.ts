type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => {
    if (shouldLog('debug')) console.debug(JSON.stringify({ level: 'debug', message, ...data, timestamp: new Date().toISOString() }));
  },
  info: (message: string, data?: Record<string, unknown>) => {
    if (shouldLog('info')) console.info(JSON.stringify({ level: 'info', message, ...data, timestamp: new Date().toISOString() }));
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    if (shouldLog('warn')) console.warn(JSON.stringify({ level: 'warn', message, ...data, timestamp: new Date().toISOString() }));
  },
  error: (message: string, data?: Record<string, unknown>) => {
    if (shouldLog('error')) console.error(JSON.stringify({ level: 'error', message, ...data, timestamp: new Date().toISOString() }));
  },
};
