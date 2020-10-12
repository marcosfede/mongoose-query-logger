import defaultLoggingFunction from './logger';

export interface LogExecutionTimeConfig {
  loggerFunction?: LoggerFunction;
  explain?: boolean;
}

type LoggerFunction = (
  operation: string,
  collectionName: string,
  executionTimeMS: number,
  filter: Object | null,
  options: any,
  update: Object | null,
  additionalLogProperties: any,
  explainResult: any
) => void;

let loggerFunction: LoggerFunction = defaultLoggingFunction;
let explainQueries = false;

const targetMethods = [
  'find',
  'findOne',
  'count',
  'countDocuments',
  'estimatedDocumentCount',
  'aggregate',
  'findOneAndUpdate',
  'findOneAndRemove',
  'findOneAndDelete',
  'deleteOne',
  'deleteMany',
  'remove',
];

const explainMethods = [
  'find',
  'findOne',
  'count',
  'countDocuments',
  'estimatedDocumentCount',
  'aggregate',
];

export function queryLogger(
  targetSchema: any,
  config: LogExecutionTimeConfig = {}
) {
  // expose a method (i.e User.find().additionalLogProperties('something')) to log additional information
  targetSchema.query.additionalLogProperties = function(
    additionalProperties: Object | string | number | boolean
  ) {
    this.__additionalProperties = additionalProperties;
    return this;
  };

  if (config.loggerFunction) {
    loggerFunction = config.loggerFunction;
  }
  if (config.explain) {
    explainQueries = true;
  }

  targetMethods.forEach(method => {
    targetSchema.pre(method, preQueryHook);
    targetSchema.post(method, postQueryHook);
  });
}

function preQueryHook() {
  // @ts-ignore
  this.__startTime = Date.now();
}

function postQueryHook() {
  // @ts-ignore
  const target = this;

  if (target.__startTime === null) {
    return;
  }
  if (!target._collection) {
    return;
  }

  if (explainQueries && explainMethods.includes(target.op)) {
    target._collection[target.op](
      target._conditions,
      {
        explain: true,
        ...target.options,
      },
      (error, result) => {
        if (error) {
          console.error('error: ', error);
        }
        loggerFunction(
          target.op,
          target._collection.collectionName,
          Date.now() - target.__startTime,
          target._conditions,
          target._options,
          target._update,
          target.__additionalProperties,
          error ? null : result
        );
      }
    );
  } else {
    loggerFunction(
      target.op,
      target._collection.collectionName,
      Date.now() - target.__startTime,
      target._conditions,
      target._options,
      target._update,
      target.__additionalProperties,
      null
    );
  }
}
