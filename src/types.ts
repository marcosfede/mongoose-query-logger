export type $FIXME = any;

class NativeError extends global.Error {}

type ValuesOf<T extends readonly any[]> = T[number];

export interface QueryHook<T extends Document = $FIXME> {
  (this: T, next: (err?: NativeError) => void): void;
}

export interface QueryLoggerArgs {
  operation: string;
  collectionName: string;
  executionTimeMS: number;
  filter: Object | null;
  fields: Object | null;
  options: any;
  update: Object | null;
  additionalLogProperties: any;
}
export type QueryLogger = (args: QueryLoggerArgs) => void;

export interface ExplainLoggerArgs {
  explainResult: $FIXME;
}
export type ExplainLogger = (result: ExplainLoggerArgs) => void;

export const TARGET_METHODS = [
  'count',
  'countDocuments',
  'estimatedDocumentCount',
  'find',
  'findOne',
  'findOneAndUpdate',
  'findOneAndRemove',
  'findOneAndDelete',
  'update',
  'updateOne',
  'updateMany',
  'deleteOne',
  'deleteMany',
  // 'aggregate',
  // 'remove', # note https://mongoosejs.com/docs/middleware.html#aggregate
  // insertMany,
];
export type TargetMethod = ValuesOf<typeof TARGET_METHODS>;

export const EXPLAIN_METHODS = [
  'find',
  'findOne',
  // 'count',
  // 'countDocuments',
  // 'estimatedDocumentCount',
  // 'aggregate',
];
export type ExplainMethod = ValuesOf<typeof EXPLAIN_METHODS>;

export interface QueryLoggerOptions {
  queryLogger: QueryLogger;
  explainLogger: ExplainLogger;
  explain: boolean;
  explainMethods: ExplainMethod[];
  targetMethods: TargetMethod[];
  additionalLogProperties: boolean;
}
