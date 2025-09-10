import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import { ScoreRecord, Employee } from '@/models';
import { SCORE_BEHAVIORS } from '@/constants';

// 积分记录更新验证模式
const updateScoreRecordSchema = z.object({
  recordDate: z.string().transform((str) => new Date(str)).optional(),
  behaviorType: z.string().min(1, '行为类型不能为空').optional(),
  reason: z.string().min(2, '记录原因至少2个字符').max(500, '记录原因最多500字符').optional(),
  recordedBy: z.string().min(1, '记录人不能为空').optional(),
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

// GET - 获取单个积分记录
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    const record = await ScoreRecord.findById(id)
      .populate('employeeId', 'name department position');

    if (!record) {
      return NextResponse.json(
        { success: false, error: '积分记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record
    });

  } catch (error) {
    console.error('获取积分记录失败:', error);
    return NextResponse.json(
      { success: false, error: '获取积分记录失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新积分记录
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();

    // 验证请求数据
    const validatedData = updateScoreRecordSchema.parse(body);

    // 查找现有记录
    const existingRecord = await ScoreRecord.findById(id);
    if (!existingRecord) {
      return NextResponse.json(
        { success: false, error: '积分记录不存在' },
        { status: 404 }
      );
    }

    // 如果更新了行为类型，需要重新计算分值
    let updateData = { ...validatedData };
    if (validatedData.behaviorType) {
      const scoreChange = getBehaviorScore(validatedData.behaviorType);
      if (scoreChange === 0) {
        return NextResponse.json(
          { success: false, error: '无效的行为类型' },
          { status: 400 }
        );
      }
      updateData.scoreChange = scoreChange;
    }

    // 更新记录
    const updatedRecord = await ScoreRecord.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('employeeId', 'name department position');

    // 重新计算员工总积分
    await updateEmployeeTotalScore(existingRecord.employeeId);

    return NextResponse.json({
      success: true,
      data: updatedRecord,
      message: '积分记录更新成功'
    });

  } catch (error) {
    console.error('更新积分记录失败:', error);

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
      { success: false, error: '更新积分记录失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除积分记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    // 查找要删除的记录
    const record = await ScoreRecord.findById(id);
    if (!record) {
      return NextResponse.json(
        { success: false, error: '积分记录不存在' },
        { status: 404 }
      );
    }

    // 删除记录
    await ScoreRecord.findByIdAndDelete(id);

    // 重新计算员工总积分
    await updateEmployeeTotalScore(record.employeeId);

    return NextResponse.json({
      success: true,
      message: '积分记录删除成功'
    });

  } catch (error) {
    console.error('删除积分记录失败:', error);
    return NextResponse.json(
      { success: false, error: '删除积分记录失败' },
      { status: 500 }
    );
  }
}
