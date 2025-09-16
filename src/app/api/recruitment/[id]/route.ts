import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';
import { z } from 'zod';
import mongoose from 'mongoose';

// 招聘记录更新验证模式
const updateRecruitmentRecordSchema = z.object({
  interviewDate: z.string().transform((str) => new Date(str)).optional(),
  candidateName: z.string().min(2, '姓名至少2个字符').max(20, '姓名最多20个字符').optional(),
  gender: z.enum(['male', 'female'], { message: '性别只能是男或女' }).optional(),
  age: z.union([
    z.number().int('年龄必须是整数').min(16, '年龄不能小于16岁').max(70, '年龄不能大于70岁'),
    z.string().refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 16 && num <= 70 && num.toString() === val;
    }, '年龄必须是16-70之间的整数').transform(val => parseInt(val))
  ]).optional(),
  idCard: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true; // 空值时通过验证
    return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(val);
  }, '请输入有效的身份证号'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码').optional(),
  appliedPosition: z.enum([
    '销售主管', '人事主管', '运营主管',
    '销售', '运营', '助理', '客服', '美工', '未分配'
  ]).optional(),
  trialDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  hasTrial: z.boolean().optional(),
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
  recruitmentStatus: z.enum(['interviewing', 'trial', 'hired', 'rejected']).optional(),
});

// GET - 获取单个招聘记录
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // 验证ID格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: '无效的记录ID' },
        { status: 400 }
      );
    }

    const record = await RecruitmentRecord.findById(id);

    if (!record) {
      return NextResponse.json(
        { success: false, error: '招聘记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record
    });

  } catch (error) {
    console.error('获取招聘记录失败:', error);
    return NextResponse.json(
      { success: false, error: '获取招聘记录失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新招聘记录
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // 验证ID格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: '无效的记录ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    console.log('=== 后端API收到的数据 ===');
    console.log('appliedPosition:', body.appliedPosition);
    console.log('完整请求数据:', body);
    
    // 验证数据
    let validatedData;
    try {
      validatedData = updateRecruitmentRecordSchema.parse(body);
      
      console.log('=== 验证后的数据 ===');
      console.log('appliedPosition:', validatedData.appliedPosition);
      console.log('完整验证数据:', validatedData);
    } catch (validationError) {
      console.error('=== Zod验证失败 ===');
      console.error('验证错误:', validationError);
      throw validationError;
    }

    // 检查记录是否存在
    const existingRecord = await RecruitmentRecord.findById(id);
    if (!existingRecord) {
      return NextResponse.json(
        { success: false, error: '招聘记录不存在' },
        { status: 404 }
      );
    }

    // 如果更新身份证号，检查是否与其他记录冲突
    if (validatedData.idCard && validatedData.idCard !== existingRecord.idCard) {
      const duplicateRecord = await RecruitmentRecord.findOne({ 
        idCard: validatedData.idCard,
        _id: { $ne: id }
      });
      
      if (duplicateRecord) {
        return NextResponse.json(
          { success: false, error: '该身份证号已存在其他招聘记录' },
          { status: 400 }
        );
      }
    }

    console.log('=== 准备更新数据库 ===');
    console.log('更新的数据:', validatedData);
    console.log('更新的记录ID:', id);
    
    // 首先确保记录有appliedPosition字段，如果没有则添加默认值
    await RecruitmentRecord.updateOne(
      { _id: id, appliedPosition: { $exists: false } },
      { $set: { appliedPosition: '未分配' } }
    );
    
    // 更新记录 - 使用$set确保字段被正确更新
    const updatedRecord = await RecruitmentRecord.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true, upsert: false }
    );

    console.log('=== 数据库更新后的结果 ===');
    console.log('updatedRecord存在:', !!updatedRecord);
    console.log('updatedRecord.appliedPosition:', updatedRecord?.appliedPosition);
    console.log('完整更新记录:', updatedRecord);
    
    // 验证数据库中是否真的更新了
    const verifyRecord = await RecruitmentRecord.findById(id);
    console.log('=== 验证数据库记录 ===');
    console.log('verifyRecord.appliedPosition:', verifyRecord?.appliedPosition);
    console.log('验证记录:', verifyRecord);

    return NextResponse.json({
      success: true,
      data: updatedRecord,
      message: '招聘记录更新成功'
    });

  } catch (error) {
    console.error('更新招聘记录失败:', error);
    
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
      { success: false, error: '更新招聘记录失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除招聘记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // 验证ID格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: '无效的记录ID' },
        { status: 400 }
      );
    }

    const deletedRecord = await RecruitmentRecord.findByIdAndDelete(id);

    if (!deletedRecord) {
      return NextResponse.json(
        { success: false, error: '招聘记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '招聘记录删除成功'
    });

  } catch (error) {
    console.error('删除招聘记录失败:', error);
    return NextResponse.json(
      { success: false, error: '删除招聘记录失败' },
      { status: 500 }
    );
  }
}
