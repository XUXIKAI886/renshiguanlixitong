// 积分行为规则常量
export const SCORE_BEHAVIORS = {
  // 扣分项目
  DEDUCTIONS: [
    { type: 'late', score: -2, description: '迟到' },
    { type: 'early_leave', score: -3, description: '早退' },
    { type: 'absent', score: -10, description: '旷工' },
    { type: 'phone_usage', score: -1, description: '上班看手机' },
    { type: 'work_slack', score: -5, description: '工作懈怠' },
    { type: 'rule_violation_minor', score: -5, description: '违反规定(轻微)' },
    { type: 'rule_violation_serious', score: -20, description: '违反规定(严重)' },
    { type: 'interview_record', score: -3, description: '约谈记录' },
  ],
  // 加分项目
  ADDITIONS: [
    { type: 'weekend_help', score: 5, description: '周末加班帮忙' },
    { type: 'cleaning', score: 3, description: '主动打扫卫生' },
    { type: 'moving_help', score: 3, description: '协助搬运物品' },
    { type: 'group_activity', score: 5, description: '积极参与集体活动' },
    { type: 'group_task', score: 8, description: '协助完成集体任务' },
    { type: 'suggestion', score: 10, description: '提出合理化建议' },
    { type: 'help_newcomer', score: 5, description: '帮助新员工' },
    { type: 'outstanding_work', score: 10, description: '工作表现突出' },
  ],
};

// 招聘状态常量
export const RECRUITMENT_STATUS = {
  INTERVIEWING: 'interviewing',
  TRIAL: 'trial',
  HIRED: 'hired',
  REJECTED: 'rejected',
} as const;

export const RECRUITMENT_STATUS_LABELS = {
  [RECRUITMENT_STATUS.INTERVIEWING]: '面试中',
  [RECRUITMENT_STATUS.TRIAL]: '试岗中',
  [RECRUITMENT_STATUS.HIRED]: '已录用',
  [RECRUITMENT_STATUS.REJECTED]: '已拒绝',
};

// 员工状态常量
export const WORK_STATUS = {
  ACTIVE: 'active',
  RESIGNED: 'resigned',
  LEAVE: 'leave',
} as const;

export const WORK_STATUS_LABELS = {
  [WORK_STATUS.ACTIVE]: '在职',
  [WORK_STATUS.RESIGNED]: '离职',
  [WORK_STATUS.LEAVE]: '休假',
};

// 性别常量
export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
} as const;

export const GENDER_LABELS = {
  [GENDER.MALE]: '男',
  [GENDER.FEMALE]: '女',
};

// 试岗状况常量
export const TRIAL_STATUS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  AVERAGE: 'average',
  POOR: 'poor',
} as const;

export const TRIAL_STATUS_LABELS = {
  [TRIAL_STATUS.EXCELLENT]: '优秀',
  [TRIAL_STATUS.GOOD]: '良好',
  [TRIAL_STATUS.AVERAGE]: '一般',
  [TRIAL_STATUS.POOR]: '差',
};

// 年度评优等级常量
export const AWARD_LEVELS = {
  SPECIAL: 'special',
  FIRST: 'first',
  SECOND: 'second',
  EXCELLENT: 'excellent',
} as const;

export const AWARD_LEVEL_LABELS = {
  [AWARD_LEVELS.SPECIAL]: '特等奖',
  [AWARD_LEVELS.FIRST]: '一等奖',
  [AWARD_LEVELS.SECOND]: '二等奖',
  [AWARD_LEVELS.EXCELLENT]: '优秀员工',
};

export const AWARD_LEVEL_BONUS = {
  [AWARD_LEVELS.SPECIAL]: 5000,
  [AWARD_LEVELS.FIRST]: 3000,
  [AWARD_LEVELS.SECOND]: 2000,
  [AWARD_LEVELS.EXCELLENT]: 1000,
};

export const AWARD_LEVEL_QUOTA = {
  [AWARD_LEVELS.SPECIAL]: 1,
  [AWARD_LEVELS.FIRST]: 2,
  [AWARD_LEVELS.SECOND]: 3,
  [AWARD_LEVELS.EXCELLENT]: 5,
};

// 部门常量
export const DEPARTMENTS = [
  '销售部',
  '运营部',
  '人事部',
];

// 岗位常量
export const POSITIONS = [
  '销售主管',
  '人事主管',
  '运营主管',
  '销售',
  '助理',
  '客服',
  '美工',
];

// 数据库连接字符串
export const DATABASE_URL = 'mongodb://root:6wtbssl5@dbconn.sealosbja.site:35702/?directConnection=true';

// 分页默认配置
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
};

// 年度评优权重配置
export const EVALUATION_WEIGHTS = {
  SCORE: 0.6,      // 积分权重 60%
  ATTENDANCE: 0.2, // 出勤权重 20%
  PERFORMANCE: 0.2, // 工作表现权重 20%
};
