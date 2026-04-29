import assert from 'node:assert/strict';
import { resolveEmployeeResignationDate } from '../src/utils/employee-status';

const selectedResignationDate = new Date('2026-04-20T00:00:00.000Z');

const createdResignationDate = resolveEmployeeResignationDate({
  currentWorkStatus: 'active',
  nextWorkStatus: 'resigned',
  requestedResignationDate: selectedResignationDate,
});

assert.equal(
  createdResignationDate?.toISOString(),
  selectedResignationDate.toISOString(),
  '首次设置离职时，应写入用户选择的离职日期'
);

const existingResignationDate = new Date('2026-04-13T00:00:00.000Z');

const preservedResignationDate = resolveEmployeeResignationDate({
  currentWorkStatus: 'resigned',
  nextWorkStatus: 'resigned',
  existingResignationDate,
  requestedResignationDate: new Date('2026-04-20T00:00:00.000Z'),
});

assert.equal(
  preservedResignationDate?.toISOString(),
  existingResignationDate.toISOString(),
  '已离职员工后续编辑时，不应覆盖已有离职日期'
);

const clearedResignationDate = resolveEmployeeResignationDate({
  currentWorkStatus: 'resigned',
  nextWorkStatus: 'active',
  existingResignationDate,
});

assert.equal(
  clearedResignationDate,
  undefined,
  '员工状态恢复为在职时，应清空离职日期'
);

console.log('员工离职日期回归测试通过');
