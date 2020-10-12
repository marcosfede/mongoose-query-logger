type $FIXME = any;

class NativeError extends global.Error {}

export interface QueryHook<T extends Document = $FIXME> {
  (this: T, next: (err?: NativeError) => void): void;
}

export interface LoggerFunctionArgs {
  operation: string;
  collectionName: string;
  executionTimeMS: number;
  filter: Object | null;
  options: any;
  update: Object | null;
  additionalLogProperties: any;
  explainResult: $FIXME;
}
export type LoggerFunction = (args: LoggerFunctionArgs) => void;

export interface QueryLoggerOptions {
  loggerFunction: LoggerFunction;
  explain: boolean;
  explainMethods: string[];
  targetMethods: string[];
  additionalLogProperties: boolean;
}
