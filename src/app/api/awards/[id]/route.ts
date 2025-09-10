import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import { AnnualAward, Employee } from '@/models';

// 年度评优更新验证模式
const updateAwardSchema = z.object({
  year: z.number().int().min(2020).max(new Date().getFullYear() + 1).optional(),
  employeeId: z.string().min(1, '员工ID不能为空').optional(),
  finalScore: z.number().min(0, '最终得分不能为负数').optional(),
  rank: z.number().int().min(1, '排名不能小于1').optional(),
  awardLevel: z.enum(['special', 'first', 'second', 'excellent'], {
    errorMap: () => ({ message: '奖项等级只能是特等奖、一等奖、二等奖或优秀员工' })
  }).optional(),
  bonusAmount: z.number().int().min(0, '奖金金额不能为负数').optional()
});

// GET - 获取单个年度评优记录
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    const award = await AnnualAward.findById(id);
    if (!award) {
      return NextResponse.json(
        { success: false, error: '年度评优记录不存在' },
        { status: 404 }
      );
    }

    // 获取员工信息
    const employee = await Employee.findOne({ employeeId: award.employeeId });
    const awardWithEmployeeInfo = {
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

    return NextResponse.json({
      success: true,
      data: awardWithEmployeeInfo
    });

  } catch (error) {
    console.error('获取年度评优记录失败:', error);
    return NextResponse.json(
      { success: false, error: '获取年度评优记录失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新年度评优记录
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = updateAwardSchema.parse(body);
    
    // 检查记录是否存在
    const existingAward = await AnnualAward.findById(id);
    if (!existingAward) {
      return NextResponse.json(
        { success: false, error: '年度评优记录不存在' },
        { status: 404 }
      );
    }

    // 如果更新了员工ID，验证员工是否存在
    if (validatedData.employeeId) {
      const employee = await Employee.findOne({ employeeId: validatedData.employeeId });
      if (!employee) {
        return NextResponse.json(
          { success: false, error: '员工不存在' },
          { status: 404 }
        );
      }

      // 检查是否与其他记录冲突
      const conflictAward = await AnnualAward.findOne({
        _id: { $ne: id },
        year: validatedData.year || existingAward.year,
        employeeId: validatedData.employeeId
      });

      if (conflictAward) {
        return NextResponse.json(
          { success: false, error: '该员工在该年度已有评优记录' },
          { status: 400 }
        );
      }
    }

    // 更新记录
    const updatedAward = await AnnualAward.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );

    // 获取员工信息
    const employee = await Employee.findOne({ 
      employeeId: updatedAward.employeeId 
    });
    
    const awardWithEmployeeInfo = {
      ...updatedAward.toObject(),
      employeeId: employee ? {
        _id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        department: employee.department,
        position: employee.position
      } : {
        _id: null,
        employeeId: updatedAward.employeeId,
        name: '未知员工',
        department: '未知',
        position: '未知'
      }
    };

    return NextResponse.json({
      success: true,
      data: awardWithEmployeeInfo,
      message: '年度评优记录更新成功'
    });

  } catch (error) {
    console.error('更新年度评优记录失败:', error);

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
      { success: false, error: '更新年度评优记录失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除年度评优记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    const deletedAward = await AnnualAward.findByIdAndDelete(id);
    if (!deletedAward) {
      return NextResponse.json(
        { success: false, error: '年度评优记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '年度评优记录删除成功'
    });

  } catch (error) {
    console.error('删除年度评优记录失败:', error);
    return NextResponse.json(
      { success: false, error: '删除年度评优记录失败' },
      { status: 500 }
    );
  }
}
