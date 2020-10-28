import chalk from 'chalk';

import { getWinningPlan } from './explain';
import { ExplainLoggerArgs, QueryLoggerArgs } from './types';
import { isEmpty } from './utils';

export const defaultQueryLogger = (
  {
    operation,
    collectionName,
    executionTimeMS,
    filter,
    fields,
    options,
    update,
    additionalLogProperties,
  }: QueryLoggerArgs,
  logger = console.log
) => {
  let logProperties: any = {};

  if (update) {
    logProperties.update = update;
  }

  if (additionalLogProperties) {
    logProperties = logProperties
      ? { ...logProperties, additionalLogProperties }
      : { additionalLogProperties };
  }

  const otherArgs = [update, fields, options]
    .map(x => (x && !isEmpty(x) ? JSON.stringify(x) : null))
    .filter(x => x);
  const queryArgs = [JSON.stringify(filter)].concat(otherArgs).join(', ');

  const queryString = `${collectionName}.${operation}(${queryArgs})`;

  logger(`mongoose: ${logTimeMS(executionTimeMS)} ms ${queryString}`);
};

export const defaultExplainLogger = (
  { queryPlanners }: ExplainLoggerArgs,
  logger = console.log
) => {
  queryPlanners.forEach(queryPlanner => {
    const stages = getWinningPlan(queryPlanner);
    const plan = logQueryExplain(stages);
    if (plan) {
      logger(plan);
    }
  });
};

function logTimeMS(executionTimeMS: number) {
  if (executionTimeMS < 100) {
    return chalk.green(executionTimeMS);
  }
  if (executionTimeMS < 1000) {
    return chalk.yellow(executionTimeMS);
  }
  return chalk.red(executionTimeMS);
}

function logQueryExplain(stages): string | null {
  if (!stages || stages.length === 0) {
    return null;
  }

  const firstStage = stages[0];

  if (firstStage.stage === 'IDHACK') {
    return null; // ignore id lookups to avoid flooding
  }

  if (firstStage.stage === 'IXSCAN') {
    return chalk.green(`IXSCAN ${JSON.stringify(firstStage.keyPattern)}`);
  }

  if (firstStage.stage === 'COLLSCAN') {
    return chalk.red(`COLLSCAN: ${JSON.stringify(stages, undefined, 4)}`);
  }

  return chalk.yellow(`Stages: ${JSON.stringify(stages, undefined, 4)}`);
}
