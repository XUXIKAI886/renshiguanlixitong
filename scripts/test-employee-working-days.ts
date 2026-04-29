import assert from 'node:assert/strict';
import { resolveEmployeeWorkingDays } from '../src/utils/employee-status';

const regularDate = new Date('2026-03-23T00:00:00.000Z');
const resignationDate = new Date('2026-04-13T03:10:12.493Z');

const frozenWorkingDays = resolveEmployeeWorkingDays({
  regularDate,
  existingWorkingDays: 11,
  currentWorkStatus: 'active',
  nextWorkStatus: 'resigned',
  referenceDate: resignationDate,
});

assert.equal(
  frozenWorkingDays,
  21,
  '员工从在职切换为离职时，应冻结为离职当天的最终在职天数'
);

const preservedWorkingDays = resolveEmployeeWorkingDays({
  regularDate,
  existingWorkingDays: 21,
  currentWorkStatus: 'resigned',
  nextWorkStatus: 'resigned',
  referenceDate: new Date('2026-05-01T00:00:00.000Z'),
});

assert.equal(
  preservedWorkingDays,
  21,
  '已经离职的员工再次更新资料时，不应改写已冻结的在职天数'
);

const recalculatedWorkingDays = resolveEmployeeWorkingDays({
  regularDate: new Date('2026-03-09T00:00:00.000Z'),
  existingWorkingDays: 51,
  currentWorkStatus: 'resigned',
  nextWorkStatus: 'resigned',
  referenceDate: new Date('2026-04-27T00:00:00.000Z'),
  recalculateForResignationDateChange: true,
});

assert.equal(
  recalculatedWorkingDays,
  49,
  '已离职员工修改离职日期时，应按新的离职日期重新计算在职天数'
);

console.log('员工离职在职天数回归测试通过');
