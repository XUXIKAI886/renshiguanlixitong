import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import { Employee } from '@/models';

// 员工创建验证模式
const createEmployeeSchema = z.object({
  regularDate: z.string().min(1, '转正日期不能为空'),
  name: z.string()
    .min(2, '姓名至少2个字符')
    .max(20, '姓名最多20个字符')
    .regex(/^[\u4e00-\u9fa5]{2,20}$/, '请输入有效的中文姓名'),
  gender: z.enum(['male', 'female'], { message: '请选择性别' }),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码'),
  idCard: z.string().regex(
    /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
    '请输入有效的身份证号'
  ),
  workStatus: z.enum(['active', 'resigned', 'leave']).default('active'),
  department: z.enum([
    '销售部', '运营部', '人事部', '未分配'
  ]).default('未分配'),
  position: z.enum([
    '销售主管', '人事主管', '运营主管',
    '销售', '运营', '助理', '客服', '美工', '未分配'
  ]).default('未分配'),
  totalScore: z.number().int().default(0),
});

// GET - 获取员工列表
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const keyword = searchParams.get('keyword') || '';
    const department = searchParams.get('department') || '';
    const position = searchParams.get('position') || '';
    const workStatus = searchParams.get('workStatus') || '';

    // 构建查询条件
    const query: any = {};

    // 关键词搜索（姓名、员工ID、手机号）
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { employeeId: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 部门筛选
    if (department && department !== 'all') {
      query.department = department;
    }

    // 岗位筛选
    if (position && position !== 'all') {
      query.position = position;
    }

    // 在职状况筛选（不设置默认筛选，显示所有员工）
    if (workStatus && workStatus !== 'all') {
      query.workStatus = workStatus;
    }
    // 移除默认筛选逻辑，显示所有状态的员工

    // 计算分页
    const skip = (page - 1) * limit;

    // 查询员工列表
    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 获取总数
    const total = await Employee.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        employees,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取员工列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取员工列表失败' },
      { status: 500 }
    );
  }
}

// POST - 创建新员工
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // 验证请求数据
    const validatedData = createEmployeeSchema.parse(body);

    // 检查身份证号是否已存在
    const existingEmployee = await Employee.findOne({ 
      idCard: validatedData.idCard 
    });

    if (existingEmployee) {
      return NextResponse.json(
        { success: false, error: '该身份证号已存在' },
        { status: 400 }
      );
    }

    // 检查手机号是否已存在
    const existingPhone = await Employee.findOne({ 
      phone: validatedData.phone 
    });

    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: '该手机号已存在' },
        { status: 400 }
      );
    }

    // 创建员工记录
    const employee = new Employee({
      ...validatedData,
      regularDate: new Date(validatedData.regularDate)
    });

    await employee.save();

    return NextResponse.json({
      success: true,
      data: employee,
      message: '员工创建成功'
    }, { status: 201 });

  } catch (error) {
    console.error('创建员工失败:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: '数据验证失败',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = field === 'employeeId' ? '员工ID已存在' :
                     field === 'idCard' ? '身份证号已存在' : '数据重复';
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '创建员工失败' },
      { status: 500 }
    );
  }
}
