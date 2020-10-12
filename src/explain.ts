import { omit } from './utils';

export function getWinningPlan(result: any) {
  if (!result) {
    debugger;
    return null;
  }
  result = Array.isArray(result) ? result[0] : result;
  if (!result.queryPlanner || !result.queryPlanner.winningPlan) {
    debugger;
    return null;
  }

  const winningPlan = result.queryPlanner.winningPlan;
  const stages = [];

  let currentStage = winningPlan;
  stages.push(omit(currentStage, ['inputStage']));
  while (currentStage.inputStage !== undefined) {
    currentStage = currentStage.inputStage;
    stages.push(omit(currentStage, ['inputStage']));
  }

  stages.reverse();

  return stages;
}
