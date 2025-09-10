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
  idCard: z.string().regex(/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, '请输入有效的身份证号').optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码').optional(),
  trialDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  hasTrial: z.boolean().optional(),
  trialDays: z.number().min(1, '试岗天数至少1天').max(90, '试岗天数最多90天').optional(),
  trialStatus: z.enum(['excellent', 'good', 'average', 'poor']).optional(),
  resignationReason: z.string().max(500, '备注内容最多500字').optional(),
  recruitmentStatus: z.enum(['interviewing', 'trial', 'hired', 'rejected']).optional(),
});

// GET - 获取单个招聘记录
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // 验证ID格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: '无效的记录ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // 验证数据
    const validatedData = updateRecruitmentRecordSchema.parse(body);

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

    // 更新记录
    const updatedRecord = await RecruitmentRecord.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );

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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

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
