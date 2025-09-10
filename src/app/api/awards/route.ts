import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import { AnnualAward, Employee, ScoreRecord } from '@/models';

// 年度评优创建验证模式
const createAwardSchema = z.object({
  year: z.number().int().min(2020).max(new Date().getFullYear() + 1),
  employeeId: z.string().min(1, '员工ID不能为空'),
  finalScore: z.number().min(0, '最终得分不能为负数'),
  rank: z.number().int().min(1, '排名不能小于1'),
  awardLevel: z.enum(['special', 'first', 'second', 'excellent'], {
    errorMap: () => ({ message: '奖项等级只能是特等奖、一等奖、二等奖或优秀员工' })
  }),
  bonusAmount: z.number().int().min(0, '奖金金额不能为负数')
});

// GET - 获取年度评优列表
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const year = searchParams.get('year');
    const awardLevel = searchParams.get('awardLevel');
    const department = searchParams.get('department');
    const sortBy = searchParams.get('sortBy') || 'rank';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // 构建查询条件
    const query: any = {};
    if (year) query.year = parseInt(year);
    if (awardLevel) query.awardLevel = awardLevel;

    // 计算分页
    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // 查询数据
    const [awards, total] = await Promise.all([
      AnnualAward.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      AnnualAward.countDocuments(query)
    ]);

    // 手动关联员工信息
    const awardsWithEmployeeInfo = await Promise.all(
      awards.map(async (award) => {
        const employee = await Employee.findOne({ employeeId: award.employeeId });
        return {
          ...award.toObject(),
          employeeId: employee ? {
            _id: employee._id,
            employeeId: employee.employeeId,
            name: employee.name,
            department: employee.department,
            position: employee.position
          } : {
            _id: null,
            employeeId: award.employeeId,
            name: '未知员工',
            department: '未知',
            position: '未知'
          }
        };
      })
    );

    // 如果有部门筛选，在这里过滤
    const filteredAwards = department 
      ? awardsWithEmployeeInfo.filter(award => 
          award.employeeId && award.employeeId.department === department
        )
      : awardsWithEmployeeInfo;

    return NextResponse.json({
      success: true,
      data: {
        awards: filteredAwards,
        pagination: {
          page,
          limit,
          total: department ? filteredAwards.length : total,
          totalPages: Math.ceil((department ? filteredAwards.length : total) / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取年度评优列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取年度评优列表失败' },
      { status: 500 }
    );
  }
}

// POST - 创建年度评优记录
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // 验证请求数据
    const validatedData = createAwardSchema.parse(body);
    
    // 验证员工是否存在
    const employee = await Employee.findOne({ employeeId: validatedData.employeeId });
    if (!employee) {
      return NextResponse.json(
        { success: false, error: '员工不存在' },
        { status: 404 }
      );
    }

    // 检查是否已存在该年度该员工的记录
    const existingAward = await AnnualAward.findOne({
      year: validatedData.year,
      employeeId: validatedData.employeeId
    });

    if (existingAward) {
      return NextResponse.json(
        { success: false, error: '该员工在该年度已有评优记录' },
        { status: 400 }
      );
    }

    // 创建年度评优记录
    const award = new AnnualAward(validatedData);
    await award.save();

    // 返回创建的记录（包含员工信息）
    const awardWithEmployeeInfo = {
      ...award.toObject(),
      employeeId: {
        _id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        department: employee.department,
        position: employee.position
      }
    };

    return NextResponse.json({
      success: true,
      data: awardWithEmployeeInfo,
      message: '年度评优记录创建成功'
    }, { status: 201 });

  } catch (error) {
    console.error('创建年度评优记录失败:', error);

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

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: '该员工在该年度已有评优记录' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '创建年度评优记录失败' },
      { status: 500 }
    );
  }
}
