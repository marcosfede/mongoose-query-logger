export type $FIXME = any;
export type QueryPlanner = any;

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
  queryPlanners: QueryPlanner[];
}
export type ExplainLogger = (result: ExplainLoggerArgs) => void;

// all middlewares enabled by default
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
  // 'remove', # note https://mongoosejs.com/docs/middleware.html#aggregate
  // insertMany,
  'aggregate',
];
export type TargetMethod = ValuesOf<typeof TARGET_METHODS>;

// query middlewares
export const QUERY_MIDDLEWARE = [
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
];
export type QueryMiddleware = ValuesOf<typeof QUERY_MIDDLEWARE>;

// aggregate middleware is handled differently...
export const AGGREGATE_MIDDLEWARE = ['aggregate'];
export type AggregateMiddleware = 'aggregate';

// count middleware is handled differently...
export const COUNT_MIDDLEWARE = [
  'count',
  'countDocuments',
  'estimatedDocumentCount',
];
export type CountMiddleware = ValuesOf<typeof COUNT_MIDDLEWARE>;

// explain middleware enabled by default
export const EXPLAIN_METHODS = [
  'find',
  'findOne',
  // 'count',
  // 'countDocuments',
  // 'estimatedDocumentCount',
  'aggregate',
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
