import { QueryPlanner } from './types';
import { omit, findPropRecursively } from './utils';

export function getWinningPlan(queryPlanner: any) {
  if (!queryPlanner || !queryPlanner.winningPlan) {
    console.error('no queryPlanner');
    return null;
  }

  const winningPlan = queryPlanner.winningPlan;
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

export function findQueryPlanners(stages: QueryPlanner[]) {
  const planners = [];

  stages.forEach(stage => {
    const plan = findPropRecursively(stage, 'queryPlanner');
    if (plan) {
      planners.push(plan);
    }
  });

  return planners;
}
