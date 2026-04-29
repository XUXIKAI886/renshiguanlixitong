import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Employee } from '@/models';
import {
  resolveEmployeeResignationDate,
  resolveEmployeeWorkingDays,
} from '@/utils/employee-status';
import { getZodIssueDetails, isMongoDuplicateKeyError } from '@/utils/api-errors';

// 员工更新验证模式
const updateEmployeeSchema = z.object({
  regularDate: z.string().min(1, '入司日期不能为空').optional(),
  name: z.string()
    .min(2, '姓名至少2个字符')
    .max(20, '姓名最多20个字符')
    .regex(/^[\u4e00-\u9fa5]{2,20}$/, '请输入有效的中文姓名')
    .optional(),
  city: z.enum(['宜昌', '武汉'], { message: '请选择城市' }).optional(),
  gender: z.enum(['male', 'female'], { message: '请选择性别' }).optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码').optional(),
  idCard: z.string().regex(
    /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
    '请输入有效的身份证号'
  ).optional(),
  workStatus: z.enum(['active', 'resigned', 'leave']).optional(),
  resignationDate: z.string().min(1, '离职日期不能为空').optional(),
  department: z.enum([
    '销售部', '运营部', '人事部', '未分配'
  ]).optional(),
  position: z.enum([
    '销售主管', '人事主管', '运营主管',
    '销售', '运营', '助理', '客服', '美工', '未分配'
  ]).optional(),
  totalScore: z.number().int().optional(),
});

// GET - 获取单个员工信息
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
        { success: false, error: '无效的员工ID' },
        { status: 400 }
      );
    }

    // 查找员工
    const employee = await Employee.findById(id);

    if (!employee) {
      return NextResponse.json(
        { success: false, error: '员工不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: employee
    });

  } catch (error) {
    console.error('获取员工信息失败:', error);
    return NextResponse.json(
      { success: false, error: '获取员工信息失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新员工信息
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
        { success: false, error: '无效的员工ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // 验证请求数据
    const validatedData = updateEmployeeSchema.parse(body);

    // 检查员工是否存在
    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return NextResponse.json(
        { success: false, error: '员工不存在' },
        { status: 404 }
      );
    }

    // 检查身份证号冲突（如果要更新身份证号）
    if (validatedData.idCard && validatedData.idCard !== existingEmployee.idCard) {
      const duplicateIdCard = await Employee.findOne({ 
        idCard: validatedData.idCard,
        _id: { $ne: id }
      });

      if (duplicateIdCard) {
        return NextResponse.json(
          { success: false, error: '该身份证号已存在' },
          { status: 400 }
        );
      }
    }

    // 检查手机号冲突（如果要更新手机号）
    if (validatedData.phone && validatedData.phone !== existingEmployee.phone) {
      const duplicatePhone = await Employee.findOne({ 
        phone: validatedData.phone,
        _id: { $ne: id }
      });

      if (duplicatePhone) {
        return NextResponse.json(
          { success: false, error: '该手机号已存在' },
          { status: 400 }
        );
      }
    }

    const { resignationDate: requestedResignationDateValue, ...employeeUpdates } = validatedData;
    const nextWorkStatus = employeeUpdates.workStatus || existingEmployee.workStatus;
    const nextRegularDate = employeeUpdates.regularDate
      ? new Date(employeeUpdates.regularDate)
      : existingEmployee.regularDate;
    const requestedResignationDate = requestedResignationDateValue
      ? new Date(requestedResignationDateValue)
      : undefined;
    const resignationDate = resolveEmployeeResignationDate({
      existingResignationDate: existingEmployee.resignationDate,
      requestedResignationDate,
      currentWorkStatus: existingEmployee.workStatus,
      nextWorkStatus,
    });

    if (
      existingEmployee.workStatus !== 'resigned' &&
      nextWorkStatus === 'resigned' &&
      !resignationDate
    ) {
      return NextResponse.json(
        { success: false, error: '请填写离职日期' },
        { status: 400 }
      );
    }

    if (resignationDate && resignationDate < nextRegularDate) {
      return NextResponse.json(
        { success: false, error: '离职日期不能早于入司日期' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      ...employeeUpdates,
      ...(employeeUpdates.regularDate ? { regularDate: nextRegularDate } : {}),
      ...(resignationDate ? { resignationDate } : {}),
      workingDays: resolveEmployeeWorkingDays({
        regularDate: nextRegularDate,
        existingWorkingDays: existingEmployee.workingDays,
        currentWorkStatus: existingEmployee.workStatus,
        nextWorkStatus,
        referenceDate: resignationDate,
      }),
    };

    // 更新员工信息
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      nextWorkStatus === 'resigned'
        ? updateData
        : {
            $set: updateData,
            $unset: { resignationDate: '' },
          },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedEmployee,
      message: '员工信息更新成功'
    });

  } catch (error) {
    console.error('更新员工信息失败:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: '数据验证失败',
          details: getZodIssueDetails(error)
        },
        { status: 400 }
      );
    }

    if (isMongoDuplicateKeyError(error)) {
      const field = Object.keys(error.keyPattern || {})[0];
      const message = field === 'idCard' ? '身份证号已存在' : '数据重复';
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '更新员工信息失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除员工（软删除，设置为离职状态）
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
        { success: false, error: '无效的员工ID' },
        { status: 400 }
      );
    }

    // 查找员工
    const employee = await Employee.findById(id);

    if (!employee) {
      return NextResponse.json(
        { success: false, error: '员工不存在' },
        { status: 404 }
      );
    }

    // 检查是否为测试数据（李佳佳和王小明），允许硬删除
    const isTestData = employee.employeeId === 'EMP1757403583480' || 
                      employee.employeeId === 'EMP1757403508610';

    if (isTestData) {
      // 硬删除测试数据
      await Employee.findByIdAndDelete(id);
      
      return NextResponse.json({
        success: true,
        message: '测试员工数据已完全删除'
      });
    }

    // 检查员工是否已经离职（普通员工）
    if (employee.workStatus === 'resigned') {
      return NextResponse.json(
        { success: false, error: '员工已经是离职状态' },
        { status: 400 }
      );
    }

    // 软删除：设置为离职状态（普通员工）
    const workingDays = resolveEmployeeWorkingDays({
      regularDate: employee.regularDate,
      existingWorkingDays: employee.workingDays,
      currentWorkStatus: employee.workStatus,
      nextWorkStatus: 'resigned',
      referenceDate: new Date(),
    });

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        workStatus: 'resigned',
        resignationDate: new Date(),
        workingDays,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedEmployee,
      message: '员工已设置为离职状态'
    });

  } catch (error) {
    console.error('删除员工失败:', error);
    return NextResponse.json(
      { success: false, error: '删除员工失败' },
      { status: 500 }
    );
  }
}
