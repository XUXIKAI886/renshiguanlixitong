import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import { ScoreRecord, Employee } from '@/models';
import { SCORE_BEHAVIORS } from '@/constants';

// 积分记录验证模式
const scoreRecordSchema = z.object({
  employeeId: z.string().min(1, '员工ID不能为空'),
  recordDate: z.string().transform((str) => new Date(str)),
  behaviorType: z.string().min(1, '行为类型不能为空'),
  reason: z.string().min(2, '记录原因至少2个字符').max(500, '记录原因最多500字符'),
  recordedBy: z.string().min(1, '记录人不能为空').default('管理员'),
  evidence: z.string().optional(),
});

// 获取所有行为类型的分值映射
const getBehaviorScore = (behaviorType: string): number => {
  const allBehaviors = [...SCORE_BEHAVIORS.DEDUCTIONS, ...SCORE_BEHAVIORS.ADDITIONS];
  const behavior = allBehaviors.find(b => b.type === behaviorType);
  return behavior?.score || 0;
};

// 更新员工总积分
const updateEmployeeTotalScore = async (employeeId: string) => {
  try {
    // 计算员工的总积分
    const scoreRecords = await ScoreRecord.find({ employeeId });
    const totalScore = scoreRecords.reduce((sum, record) => sum + record.scoreChange, 0);
    
    // 更新员工记录
    await Employee.findOneAndUpdate(
      { employeeId },
      { totalScore },
      { new: true }
    );
    
    return totalScore;
  } catch (error) {
    console.error('更新员工总积分失败:', error);
    throw error;
  }
};

// GET - 获取积分记录列表
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const employeeId = searchParams.get('employeeId');
    const behaviorType = searchParams.get('behaviorType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'recordDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 构建查询条件
    const query: any = {};
    
    if (employeeId) {
      query.employeeId = employeeId;
    }
    
    if (behaviorType) {
      query.behaviorType = behaviorType;
    }
    
    if (startDate || endDate) {
      query.recordDate = {};
      if (startDate) query.recordDate.$gte = new Date(startDate);
      if (endDate) query.recordDate.$lte = new Date(endDate);
    }

    // 计算分页
    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // 查询数据
    const [records, total] = await Promise.all([
      ScoreRecord.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      ScoreRecord.countDocuments(query)
    ]);

    // 手动关联员工信息
    const recordsWithEmployeeInfo = await Promise.all(
      records.map(async (record) => {
        const employee = await Employee.findOne({ employeeId: record.employeeId });
        return {
          ...record.toObject(),
          employeeId: employee ? {
            _id: employee._id,
            employeeId: employee.employeeId,
            name: employee.name,
            department: employee.department,
            position: employee.position
          } : {
            _id: null,
            employeeId: record.employeeId,
            name: '未知员工',
            department: '未知',
            position: '未知'
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        records: recordsWithEmployeeInfo,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取积分记录失败:', error);
    return NextResponse.json(
      { success: false, error: '获取积分记录失败' },
      { status: 500 }
    );
  }
}

// POST - 创建积分记录
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // 验证请求数据
    const validatedData = scoreRecordSchema.parse(body);
    
    // 验证员工是否存在
    const employee = await Employee.findOne({ employeeId: validatedData.employeeId });
    if (!employee) {
      return NextResponse.json(
        { success: false, error: '员工不存在' },
        { status: 404 }
      );
    }

    // 获取行为类型对应的分值
    const scoreChange = getBehaviorScore(validatedData.behaviorType);
    if (scoreChange === 0) {
      return NextResponse.json(
        { success: false, error: '无效的行为类型' },
        { status: 400 }
      );
    }

    // 创建积分记录
    const scoreRecord = new ScoreRecord({
      ...validatedData,
      scoreChange
    });

    await scoreRecord.save();

    // 更新员工总积分
    await updateEmployeeTotalScore(validatedData.employeeId);

    // 返回创建的记录（包含员工信息）
    const recordWithEmployeeInfo = {
      ...scoreRecord.toObject(),
      employeeId: employee ? {
        _id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        department: employee.department,
        position: employee.position
      } : {
        _id: null,
        employeeId: validatedData.employeeId,
        name: '未知员工',
        department: '未知',
        position: '未知'
      }
    };

    return NextResponse.json({
      success: true,
      data: recordWithEmployeeInfo,
      message: '积分记录创建成功'
    }, { status: 201 });

  } catch (error) {
    console.error('创建积分记录失败:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: '数据验证失败',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '创建积分记录失败' },
      { status: 500 }
    );
  }
}
