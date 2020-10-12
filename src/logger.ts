const chalk = require('chalk');

import { getWinningPlan } from './explain';

const log = console.log;

export default function defaultLoggingFunction(
  operation: string,
  collectionName: string,
  executionTimeMS: number,
  filter: Object | null,
  options: any,
  update: Object | null,
  additionalLogProperties: any,
  explain: any
) {
  let logProperties: any = {};

  if (update) {
    logProperties.update = update;
  }

  if (additionalLogProperties) {
    logProperties = logProperties
      ? { ...logProperties, additionalLogProperties }
      : { additionalLogProperties };
  }

  const queryString = `${collectionName}.${operation}(${JSON.stringify(
    filter
  )}${options ? ', ' + JSON.stringify(options) : ''})`;

  log();

  log(`mongoose: ${logTimeMS(executionTimeMS)} ms ${queryString}`);
  if (explain) {
    const stages = getWinningPlan(explain);
    const plan = logQueryExplain(stages);
    if (plan) {
      log(plan);
    }
  }

  log();
}

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
