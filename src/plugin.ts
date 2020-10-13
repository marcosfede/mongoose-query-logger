import { Schema } from 'mongoose';

import { defaultLoggingFunction } from './logger';
import { QueryHook, QueryLoggerOptions } from './types';

const TARGET_METHODS = [
  'count',
  'countDocuments',
  'estimatedDocumentCount',
  'aggregate',
  'find',
  'findOne',
  'findOneAndUpdate',
  'findOneAndRemove',
  'findOneAndDelete',
  'remove',
  'update',
  'updateOne',
  'updateMany',
  'deleteOne',
  'deleteMany',
];

const EXPLAIN_METHODS = [
  'find',
  'findOne',
  'count',
  'countDocuments',
  'estimatedDocumentCount',
  'aggregate',
];

const DEFAULT_OPTIONS: QueryLoggerOptions = {
  targetMethods: TARGET_METHODS,
  explainMethods: EXPLAIN_METHODS,
  loggerFunction: defaultLoggingFunction,
  explain: true,
  additionalLogProperties: false,
};

export class MongooseQueryLogger {
  private options: QueryLoggerOptions;

  constructor(options: Partial<QueryLoggerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  private getPreQueryHook(): QueryHook {
    return function() {
      this.__startTime = Date.now();
    };
  }

  private getPostQueryHook(): QueryHook {
    const instance = this;

    return function(this, next) {
      if (this.__startTime === null) {
        next();
      }
      if (!this._collection) {
        next();
      }

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
            instance.options.loggerFunction({
              operation: this.op,
              collectionName: this._collection.collectionName,
              executionTimeMS: Date.now() - this.__startTime,
              filter: this._conditions,
              options: this._options,
              update: this._update,
              additionalLogProperties: this.__additionalProperties,
              explainResult: error ? null : result,
            });
          }
        );
      } else {
        instance.options.loggerFunction({
          operation: this.op,
          collectionName: this._collection.collectionName,
          executionTimeMS: Date.now() - this.__startTime,
          filter: this._conditions,
          options: this._options,
          update: this._update,
          additionalLogProperties: this.__additionalProperties,
          explainResult: null,
        });
      }
    };
  }

  public getPlugin() {
    const instance = this;

    return function(schema: Schema) {
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
