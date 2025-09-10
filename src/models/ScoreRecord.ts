import mongoose, { Schema, Document } from 'mongoose';
import { ScoreRecord as IScoreRecord } from '@/types';

// 扩展Document接口
export interface ScoreRecordDocument extends IScoreRecord, Document {
  _id: string;
  createdAt: Date;
}

// 定义Schema
const ScoreRecordSchema = new Schema<ScoreRecordDocument>(
  {
    employeeId: {
      type: String,
      required: [true, '员工ID不能为空']
    },
    recordDate: {
      type: Date,
      required: [true, '记录日期不能为空'],
      default: Date.now,
      validate: {
        validator: function(value: Date) {
          return value <= new Date();
        },
        message: '记录日期不能晚于当前日期'
      }
    },
    behaviorType: {
      type: String,
      required: [true, '行为类型不能为空'],
      trim: true,
      enum: {
        values: [
          // 扣分项目
          'late', 'early_leave', 'absent', 'phone_usage', 'work_slack',
          'rule_violation_minor', 'rule_violation_serious', 'interview_record',
          // 加分项目
          'weekend_help', 'cleaning', 'moving_help', 'group_activity',
          'group_task', 'suggestion', 'help_newcomer', 'outstanding_work'
        ],
        message: '请选择有效的行为类型'
      }
    },
    scoreChange: {
      type: Number,
      required: [true, '分值变化不能为空'],
      validate: {
        validator: function(value: number) {
          return Number.isInteger(value) && value !== 0;
        },
        message: '分值变化必须是非零整数'
      }
    },
    reason: {
      type: String,
      required: [true, '记录原因不能为空'],
      trim: true,
      minlength: [2, '记录原因至少2个字符'],
      maxlength: [500, '记录原因最多500字符']
    },
    recordedBy: {
      type: String,
      required: [true, '记录人不能为空'],
      trim: true
    },
    evidence: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function(value: string) {
          if (!value) return true;
          // 简单的URL验证
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(value);
        },
        message: '证据附件必须是有效的图片URL'
      }
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      }
    }
  }
);

// 创建索引
ScoreRecordSchema.index({ employeeId: 1 });
ScoreRecordSchema.index({ recordDate: -1 });
ScoreRecordSchema.index({ behaviorType: 1 });
ScoreRecordSchema.index({ scoreChange: 1 });
ScoreRecordSchema.index({ employeeId: 1, recordDate: -1 });

// 静态方法：获取员工积分历史
ScoreRecordSchema.statics.getEmployeeScoreHistory = async function(
  employeeId: string, 
  startDate?: Date, 
  endDate?: Date
) {
  const query: any = { employeeId };
  
  if (startDate || endDate) {
    query.recordDate = {};
    if (startDate) query.recordDate.$gte = startDate;
    if (endDate) query.recordDate.$lte = endDate;
  }
  
  return await this.find(query)
    .sort({ recordDate: -1 })
    .populate('employeeId', 'name department position');
};

// 静态方法：获取积分统计
ScoreRecordSchema.statics.getScoreStatistics = async function(
  startDate?: Date,
  endDate?: Date
) {
  const matchStage: any = {};
  
  if (startDate || endDate) {
    matchStage.recordDate = {};
    if (startDate) matchStage.recordDate.$gte = startDate;
    if (endDate) matchStage.recordDate.$lte = endDate;
  }
  
  const pipeline = [];
  
  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }
  
  pipeline.push(
    {
      $group: {
        _id: '$behaviorType',
        totalScore: { $sum: '$scoreChange' },
        count: { $sum: 1 },
        avgScore: { $avg: '$scoreChange' }
      }
    },
    { $sort: { totalScore: -1 } }
  );
  
  return await this.aggregate(pipeline);
};

// 静态方法：获取月度积分趋势
ScoreRecordSchema.statics.getMonthlyTrend = async function(year: number) {
  return await this.aggregate([
    {
      $match: {
        recordDate: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$recordDate' },
          type: {
            $cond: [
              { $gt: ['$scoreChange', 0] },
              'addition',
              'deduction'
            ]
          }
        },
        totalScore: { $sum: '$scoreChange' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.month': 1 } }
  ]);
};

// 静态方法：获取部门积分对比
ScoreRecordSchema.statics.getDepartmentComparison = async function(
  startDate?: Date,
  endDate?: Date
) {
  const matchStage: any = {};
  
  if (startDate || endDate) {
    matchStage.recordDate = {};
    if (startDate) matchStage.recordDate.$gte = startDate;
    if (endDate) matchStage.recordDate.$lte = endDate;
  }
  
  const pipeline = [
    {
      $lookup: {
        from: 'employees',
        localField: 'employeeId',
        foreignField: 'employeeId',
        as: 'employee'
      }
    },
    { $unwind: '$employee' },
    {
      $group: {
        _id: '$employee.department',
        totalScore: { $sum: '$scoreChange' },
        avgScore: { $avg: '$scoreChange' },
        count: { $sum: 1 },
        employeeCount: { $addToSet: '$employeeId' }
      }
    },
    {
      $project: {
        department: '$_id',
        totalScore: 1,
        avgScore: 1,
        recordCount: '$count',
        employeeCount: { $size: '$employeeCount' },
        avgScorePerEmployee: {
          $divide: ['$totalScore', { $size: '$employeeCount' }]
        }
      }
    },
    { $sort: { totalScore: -1 } }
  ];
  
  if (Object.keys(matchStage).length > 0) {
    pipeline.unshift({ $match: matchStage });
  }
  
  return await this.aggregate(pipeline);
};

// 防止重复编译
const ScoreRecord = mongoose.models.ScoreRecord || 
  mongoose.model<ScoreRecordDocument>('ScoreRecord', ScoreRecordSchema);

export default ScoreRecord;
