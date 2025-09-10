import mongoose, { Schema, Document } from 'mongoose';
import { Employee as IEmployee } from '@/types';
import { generateEmployeeId, calculateWorkingDays } from '@/utils';

// 扩展Document接口
export interface EmployeeDocument extends IEmployee, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 定义Schema
const EmployeeSchema = new Schema<EmployeeDocument>(
  {
    employeeId: {
      type: String,
      required: [true, '员工ID不能为空'],
      unique: true,
      default: generateEmployeeId
    },
    regularDate: {
      type: Date,
      required: [true, '转正日期不能为空'],
      validate: {
        validator: function(value: Date) {
          return value <= new Date();
        },
        message: '转正日期不能晚于当前日期'
      }
    },
    name: {
      type: String,
      required: [true, '员工姓名不能为空'],
      trim: true,
      minlength: [2, '姓名至少2个字符'],
      maxlength: [20, '姓名最多20个字符'],
      validate: {
        validator: function(value: string) {
          return /^[\u4e00-\u9fa5]{2,20}$/.test(value);
        },
        message: '请输入有效的中文姓名'
      }
    },
    gender: {
      type: String,
      required: [true, '性别不能为空'],
      enum: {
        values: ['male', 'female'],
        message: '性别只能是男或女'
      }
    },
    phone: {
      type: String,
      required: [true, '电话号码不能为空'],
      validate: {
        validator: function(value: string) {
          return /^1[3-9]\d{9}$/.test(value);
        },
        message: '请输入有效的手机号码'
      }
    },
    idCard: {
      type: String,
      required: [true, '身份证号不能为空'],
      unique: true,
      validate: {
        validator: function(value: string) {
          return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(value);
        },
        message: '请输入有效的身份证号'
      }
    },
    workingDays: {
      type: Number,
      default: 0,
      min: [0, '在职天数不能为负数']
    },
    workStatus: {
      type: String,
      required: [true, '在职状况不能为空'],
      enum: {
        values: ['active', 'resigned', 'leave'],
        message: '在职状况只能是在职、离职或休假'
      },
      default: 'active'
    },
    department: {
      type: String,
      trim: true,
      enum: {
        values: ['销售部', '运营部', '人事部', '未分配'],
        message: '请选择有效的部门'
      },
      default: '未分配'
    },
    position: {
      type: String,
      trim: true,
      enum: {
        values: [
          '销售主管', '人事主管', '运营主管',
          '销售', '运营', '助理', '客服', '美工', '未分配'
        ],
        message: '请选择有效的岗位'
      },
      default: '未分配'
    },
    totalScore: {
      type: Number,
      default: 0,
      validate: {
        validator: function(value: number) {
          return Number.isInteger(value);
        },
        message: '总积分必须是整数'
      }
    }
  },
  {
    timestamps: true,
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
EmployeeSchema.index({ employeeId: 1 }, { unique: true });
EmployeeSchema.index({ name: 1 });
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ position: 1 });
EmployeeSchema.index({ workStatus: 1 });
EmployeeSchema.index({ totalScore: -1 });
EmployeeSchema.index({ idCard: 1 }, { unique: true });

// 虚拟字段：计算在职天数
EmployeeSchema.virtual('calculatedWorkingDays').get(function() {
  return calculateWorkingDays(this.regularDate);
});

// 中间件：保存前自动更新在职天数
EmployeeSchema.pre('save', function(next) {
  if (this.workStatus === 'active') {
    this.workingDays = calculateWorkingDays(this.regularDate);
  }
  next();
});

// 静态方法：获取部门统计
EmployeeSchema.statics.getDepartmentStatistics = async function() {
  return await this.aggregate([
    { $match: { workStatus: 'active' } },
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 },
        avgScore: { $avg: '$totalScore' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// 静态方法：获取积分排行榜
EmployeeSchema.statics.getScoreRanking = async function(limit: number = 10) {
  return await this.find({ workStatus: 'active' })
    .sort({ totalScore: -1 })
    .limit(limit)
    .select('employeeId name department position totalScore');
};

// 静态方法：获取员工统计数据
EmployeeSchema.statics.getStatistics = async function() {
  const totalCount = await this.countDocuments();
  const activeCount = await this.countDocuments({ workStatus: 'active' });
  const resignedCount = await this.countDocuments({ workStatus: 'resigned' });
  const leaveCount = await this.countDocuments({ workStatus: 'leave' });
  
  const avgScore = await this.aggregate([
    { $match: { workStatus: 'active' } },
    { $group: { _id: null, avgScore: { $avg: '$totalScore' } } }
  ]);
  
  return {
    totalCount,
    activeCount,
    resignedCount,
    leaveCount,
    avgScore: avgScore[0]?.avgScore || 0
  };
};

// 实例方法：更新积分
EmployeeSchema.methods.updateScore = function(scoreChange: number) {
  this.totalScore += scoreChange;
  return this.save();
};

// 防止重复编译
const Employee = mongoose.models.Employee || 
  mongoose.model<EmployeeDocument>('Employee', EmployeeSchema);

export default Employee;
