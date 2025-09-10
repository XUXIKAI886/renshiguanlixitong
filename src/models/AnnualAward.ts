import mongoose, { Schema, Document } from 'mongoose';
import { AnnualAward as IAnnualAward } from '@/types';

// 扩展Document接口
export interface AnnualAwardDocument extends IAnnualAward, Document {
  _id: string;
  createdAt: Date;
}

// 定义Schema
const AnnualAwardSchema = new Schema<AnnualAwardDocument>(
  {
    year: {
      type: Number,
      required: [true, '年份不能为空'],
      min: [2020, '年份不能早于2020年'],
      max: [new Date().getFullYear() + 1, '年份不能超过明年'],
      validate: {
        validator: function(value: number) {
          return Number.isInteger(value);
        },
        message: '年份必须是整数'
      }
    },
    employeeId: {
      type: String,
      required: [true, '员工ID不能为空'],
      ref: 'Employee'
    },
    finalScore: {
      type: Number,
      required: [true, '最终得分不能为空'],
      min: [0, '最终得分不能为负数'],
      validate: {
        validator: function(value: number) {
          return value >= 0;
        },
        message: '最终得分必须大于等于0'
      }
    },
    rank: {
      type: Number,
      required: [true, '排名不能为空'],
      min: [1, '排名不能小于1'],
      validate: {
        validator: function(value: number) {
          return Number.isInteger(value) && value >= 1;
        },
        message: '排名必须是大于等于1的整数'
      }
    },
    awardLevel: {
      type: String,
      required: [true, '奖项等级不能为空'],
      enum: {
        values: ['special', 'first', 'second', 'excellent'],
        message: '奖项等级只能是特等奖、一等奖、二等奖或优秀员工'
      }
    },
    bonusAmount: {
      type: Number,
      required: [true, '奖金金额不能为空'],
      min: [0, '奖金金额不能为负数'],
      validate: {
        validator: function(value: number) {
          return Number.isInteger(value) && value >= 0;
        },
        message: '奖金金额必须是大于等于0的整数'
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

// 创建复合索引，确保每年每个员工只能有一条记录
AnnualAwardSchema.index({ year: 1, employeeId: 1 }, { unique: true });
AnnualAwardSchema.index({ year: -1 });
AnnualAwardSchema.index({ rank: 1 });
AnnualAwardSchema.index({ awardLevel: 1 });
AnnualAwardSchema.index({ finalScore: -1 });

// 静态方法：获取年度获奖列表
AnnualAwardSchema.statics.getAwardList = async function(year: number) {
  return await this.find({ year })
    .sort({ rank: 1 })
    .populate('employeeId', 'name department position');
};

// 静态方法：获取员工历年获奖记录
AnnualAwardSchema.statics.getEmployeeAwardHistory = async function(employeeId: string) {
  return await this.find({ employeeId })
    .sort({ year: -1 })
    .populate('employeeId', 'name department position');
};

// 静态方法：获取年度统计
AnnualAwardSchema.statics.getYearlyStatistics = async function(year: number) {
  const awardStats = await this.aggregate([
    { $match: { year } },
    {
      $group: {
        _id: '$awardLevel',
        count: { $sum: 1 },
        totalBonus: { $sum: '$bonusAmount' },
        avgScore: { $avg: '$finalScore' }
      }
    }
  ]);
  
  const departmentStats = await this.aggregate([
    { $match: { year } },
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
        count: { $sum: 1 },
        totalBonus: { $sum: '$bonusAmount' },
        avgScore: { $avg: '$finalScore' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  return {
    awardStats,
    departmentStats
  };
};

// 静态方法：生成年度评优结果
AnnualAwardSchema.statics.generateAnnualAwards = async function(
  year: number,
  evaluationData: Array<{
    employeeId: string;
    finalScore: number;
  }>
) {
  // 按分数排序
  const sortedData = evaluationData.sort((a, b) => b.finalScore - a.finalScore);
  
  const awards = [];
  let currentRank = 1;
  
  // 奖项配额
  const quotas = {
    special: 1,
    first: 2,
    second: 3,
    excellent: 5
  };
  
  // 奖金金额
  const bonusAmounts = {
    special: 5000,
    first: 3000,
    second: 2000,
    excellent: 1000
  };
  
  for (const data of sortedData) {
    let awardLevel: string;
    let bonusAmount: number;
    
    if (currentRank <= quotas.special) {
      awardLevel = 'special';
      bonusAmount = bonusAmounts.special;
    } else if (currentRank <= quotas.special + quotas.first) {
      awardLevel = 'first';
      bonusAmount = bonusAmounts.first;
    } else if (currentRank <= quotas.special + quotas.first + quotas.second) {
      awardLevel = 'second';
      bonusAmount = bonusAmounts.second;
    } else if (currentRank <= quotas.special + quotas.first + quotas.second + quotas.excellent) {
      awardLevel = 'excellent';
      bonusAmount = bonusAmounts.excellent;
    } else {
      break; // 超出获奖名额
    }
    
    awards.push({
      year,
      employeeId: data.employeeId,
      finalScore: data.finalScore,
      rank: currentRank,
      awardLevel,
      bonusAmount
    });
    
    currentRank++;
  }
  
  // 删除该年度的旧记录
  await this.deleteMany({ year });
  
  // 插入新记录
  return await this.insertMany(awards);
};

// 静态方法：检查是否已生成年度评优
AnnualAwardSchema.statics.isYearGenerated = async function(year: number) {
  const count = await this.countDocuments({ year });
  return count > 0;
};

// 防止重复编译
const AnnualAward = mongoose.models.AnnualAward || 
  mongoose.model<AnnualAwardDocument>('AnnualAward', AnnualAwardSchema);

export default AnnualAward;
