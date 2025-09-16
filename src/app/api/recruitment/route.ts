import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';
import { z } from 'zod';

// 招聘记录验证模式
const recruitmentRecordSchema = z.object({
  interviewDate: z.string().transform((str) => new Date(str)),
  candidateName: z.string().min(2, '姓名至少2个字符').max(20, '姓名最多20个字符'),
  gender: z.enum(['male', 'female'], { message: '性别只能是男或女' }),
  age: z.number().int('年龄必须是整数').min(16, '年龄不能小于16岁').max(70, '年龄不能大于70岁'),
  idCard: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true; // 空值时通过验证
    return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(val);
  }, '请输入有效的身份证号'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码'),
  appliedPosition: z.enum([
    '销售主管', '人事主管', '运营主管',
    '销售', '运营', '助理', '客服', '美工', '未分配'
  ]).default('未分配'),
  trialDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  hasTrial: z.boolean(),
  trialDays: z.union([
    z.number().int('试岗天数必须是整数').min(1, '试岗天数至少1天').max(90, '试岗天数最多90天'),
    z.string().refine((val) => {
      if (!val || val.trim() === '') return true; // 空值允许
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 90 && num.toString() === val;
    }, '试岗天数必须是1-90之间的整数').transform(val => val ? parseInt(val) : undefined)
  ]).optional(),
  trialStatus: z.enum(['excellent', 'good', 'average', 'poor']).optional(),
  resignationReason: z.string().max(500, '备注内容最多500字').optional(),
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

    // 确保所有记录都有appliedPosition字段
    console.log('=== 检查并修复appliedPosition字段 ===');
    
    const missingFieldCount = await RecruitmentRecord.countDocuments({
      appliedPosition: { $exists: false }
    });
    console.log('缺少appliedPosition字段的记录数:', missingFieldCount);
    
    if (missingFieldCount > 0) {
      const updateResult = await RecruitmentRecord.updateMany(
        { appliedPosition: { $exists: false } },
        { $set: { appliedPosition: '未分配' } }
      );
      console.log('批量更新结果:', updateResult);
    }
    
    // 再次检查是否还有缺失的记录
    const stillMissingCount = await RecruitmentRecord.countDocuments({
      appliedPosition: { $exists: false }
    });
    console.log('修复后仍缺少字段的记录数:', stillMissingCount);
    
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

    console.log('=== 查询招聘记录列表 ===');
    console.log('记录数量:', records.length);
    if (records.length > 0) {
      console.log('第一条记录的appliedPosition:', records[0]?.appliedPosition);
      console.log('第一条记录完整数据:', records[0]);
    }

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

    // 处理身份证号：将空字符串转换为null，避免MongoDB唯一索引冲突
    if (validatedData.idCard === '' || !validatedData.idCard) {
      validatedData.idCard = null;
    }

    // 检查身份证号是否重复（只有在提供身份证号时才检查）
    if (validatedData.idCard) {
      const existingIdCardRecord = await RecruitmentRecord.findOne({ 
        idCard: validatedData.idCard 
      });
      
      if (existingIdCardRecord) {
        return NextResponse.json(
          { success: false, error: '该身份证号已存在招聘记录' },
          { status: 400 }
        );
      }
    }

    // 检查手机号是否重复
    const existingPhoneRecord = await RecruitmentRecord.findOne({ 
      phone: validatedData.phone 
    });
    
    if (existingPhoneRecord) {
      console.log('=== 手机号重复检查 ===');
      console.log('重复的手机号:', validatedData.phone);
      console.log('已存在的记录:', existingPhoneRecord);
      
      return NextResponse.json(
        { success: false, error: `手机号 ${validatedData.phone} 已存在招聘记录，应聘者：${existingPhoneRecord.candidateName}` },
        { status: 400 }
      );
    }

    console.log('=== 准备创建招聘记录 ===');
    console.log('处理后的身份证号:', validatedData.idCard);
    console.log('完整验证数据:', validatedData);

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
      console.log('=== MongoDB唯一索引冲突 ===');
      console.log('错误详情:', error);
      console.log('keyPattern:', error.keyPattern);
      console.log('keyValue:', error.keyValue);
      
      // 根据具体的字段给出更准确的错误信息
      if (error.keyPattern?.idCard) {
        return NextResponse.json(
          { success: false, error: '身份证号已存在' },
          { status: 400 }
        );
      } else if (error.keyPattern?.phone) {
        return NextResponse.json(
          { success: false, error: '手机号已存在' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: '数据重复，可能是身份证号或手机号已存在' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: '创建招聘记录失败' },
      { status: 500 }
    );
  }
}
