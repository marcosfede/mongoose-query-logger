import mongoose from 'mongoose';

import { defaultQueryLogger, defaultExplainLogger } from './logger';
import {
  QueryHook,
  QueryLoggerOptions,
  TARGET_METHODS,
  EXPLAIN_METHODS,
  TargetMethod,
  ExplainMethod,
  QueryLogger,
  ExplainLogger,
} from './types';
import { assert } from './utils';

const DEFAULT_OPTIONS: QueryLoggerOptions = {
  targetMethods: TARGET_METHODS,
  explainMethods: EXPLAIN_METHODS,
  queryLogger: defaultQueryLogger,
  explainLogger: defaultExplainLogger,
  explain: true,
  additionalLogProperties: false,
};

export class MongooseQueryLogger {
  private options: QueryLoggerOptions;

  constructor(options: Partial<QueryLoggerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  public setQueryMethods({
    targetMethods,
    explainMethods,
  }: {
    targetMethods?: TargetMethod[];
    explainMethods?: ExplainMethod[];
  } = {}) {
    if (targetMethods) {
      this.options.targetMethods = targetMethods;
    }
    if (explainMethods) {
      this.options.explainMethods = explainMethods;
    }
    return this;
  }

  public setExplain(explain = false) {
    this.options.explain = explain;
    return this;
  }

  public setAdditionalLogProperties(logAdditionalProperties = false) {
    this.options.additionalLogProperties = logAdditionalProperties;
    return this;
  }

  public setQueryLogger(queryLogger: QueryLogger) {
    this.options.queryLogger = queryLogger;
    return this;
  }

  public setExplainLogger(explainLogger: ExplainLogger) {
    this.options.explainLogger = explainLogger;
    return this;
  }

  private getPreQueryHook(): QueryHook {
    return function() {
      this.__startTime = Date.now();
    };
  }

  private getPostQueryHook(): QueryHook {
    const instance = this;

    return function(this, next) {
      try {
        assert(this instanceof mongoose.Query, 'this is not mongoose.Query');
        assert(this.__startTime !== null, 'startTime was null');
        assert(this._collection, 'no this._collection');

        const baseArgs = {
          operation: this.op,
          collectionName: this._collection.collectionName,
          executionTimeMS: Date.now() - this.__startTime,
          filter: this._conditions,
          fields: this._fields,
          options: { ...this._options, ...this.options },
          update: this._update,
          additionalLogProperties: this.__additionalProperties,
        };
        instance.options.queryLogger(baseArgs);

        if (
          instance.options.explain &&
          instance.options.explainMethods.includes(this.op)
        ) {
          this._collection[this.op](
            this._conditions,
            {
              explain: true,
              ...this.options,
            },
            (error, result) => {
              if (error) {
                // TODO: remove
                console.error('error: ', error);
              }
              instance.options.explainLogger({
                ...baseArgs,
                explainResult: error ? null : result,
              });
            }
          );
        }
        // prevent this middleware from stopping the middleware chain
      } catch (e) {
        console.error('Error in post middleware: ', e);
        return next();
      }
    };
  }

  public getPlugin() {
    const instance = this;

    return function(schema: mongoose.Schema) {
      // expose a method to log additional information
      // eg: User.find().additionalLogProperties('something')
      if (instance.options.additionalLogProperties) {
        schema.query.additionalLogProperties = function(
          additionalProperties: Object | string | number | boolean
        ) {
          this.__additionalProperties = additionalProperties;
          return this;
        };
      }

      instance.options.targetMethods.forEach(method => {
        schema.pre(method, instance.getPreQueryHook());
        // @ts-ignore // TODO: FIX
        schema.post(method, instance.getPostQueryHook());
      });
    };
  }
}
