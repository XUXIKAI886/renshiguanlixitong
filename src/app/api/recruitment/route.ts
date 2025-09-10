import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';
import { z } from 'zod';

// 招聘记录验证模式
const recruitmentRecordSchema = z.object({
  interviewDate: z.string().transform((str) => new Date(str)),
  candidateName: z.string().min(2, '姓名至少2个字符').max(20, '姓名最多20个字符'),
  gender: z.enum(['male', 'female'], { message: '性别只能是男或女' }),
  idCard: z.string().regex(/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, '请输入有效的身份证号'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码'),
  trialDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  hasTrial: z.boolean(),
  trialDays: z.number().min(1, '试岗天数至少1天').max(90, '试岗天数最多90天').optional(),
  trialStatus: z.enum(['excellent', 'good', 'average', 'poor']).optional(),
  resignationReason: z.string().max(500, '离职原因最多500字').optional(),
  recruitmentStatus: z.enum(['interviewing', 'trial', 'hired', 'rejected']).default('interviewing'),
});

// GET - 获取招聘记录列表
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 构建查询条件
    const query: any = {};
    
    if (status && status !== 'all') {
      query.recruitmentStatus = status;
    }
    
    if (keyword) {
      query.$or = [
        { candidateName: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
        { idCard: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    if (startDate || endDate) {
      query.interviewDate = {};
      if (startDate) query.interviewDate.$gte = new Date(startDate);
      if (endDate) query.interviewDate.$lte = new Date(endDate);
    }

    // 分页查询
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      RecruitmentRecord.find(query)
        .sort({ interviewDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      RecruitmentRecord.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        records,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取招聘记录失败:', error);
    return NextResponse.json(
      { success: false, error: '获取招聘记录失败' },
      { status: 500 }
    );
  }
}

// POST - 创建新的招聘记录
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // 验证数据
    const validatedData = recruitmentRecordSchema.parse(body);

    // 检查身份证号是否已存在
    const existingRecord = await RecruitmentRecord.findOne({ 
      idCard: validatedData.idCard 
    });
    
    if (existingRecord) {
      return NextResponse.json(
        { success: false, error: '该身份证号已存在招聘记录' },
        { status: 400 }
      );
    }

    // 创建新记录
    const newRecord = new RecruitmentRecord(validatedData);
    await newRecord.save();

    return NextResponse.json({
      success: true,
      data: newRecord,
      message: '招聘记录创建成功'
    }, { status: 201 });

  } catch (error) {
    console.error('创建招聘记录失败:', error);
    
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
      return NextResponse.json(
        { success: false, error: '身份证号或手机号已存在' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '创建招聘记录失败' },
      { status: 500 }
    );
  }
}
