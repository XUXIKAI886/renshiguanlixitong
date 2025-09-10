import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Employee } from '@/models';

// GET - 获取员工概览统计数据
export async function GET() {
  try {
    await connectDB();

    // 1. 员工总数（所有状态，与列表显示保持一致）
    const totalEmployees = await Employee.countDocuments();

    // 2. 在职员工数
    const activeEmployees = await Employee.countDocuments({ workStatus: 'active' });

    // 3. 平均在职天数（计算从转正日期到现在的天数）
    const avgWorkDaysResult = await Employee.aggregate([
      {
        $match: {
          workStatus: 'active',
          regularDate: { $exists: true }
        }
      },
      {
        $addFields: {
          workDays: {
            $divide: [
              { $subtract: [new Date(), '$regularDate'] },
              1000 * 60 * 60 * 24 // 转换为天数
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$workDays' }
        }
      }
    ]);

    const avgWorkDays = avgWorkDaysResult[0]?.avgDays || 0;

    // 4. 积分最多员工
    const topScoreEmployee = await Employee.findOne(
      { workStatus: 'active' },
      { name: 1, totalScore: 1, department: 1, position: 1 }
    ).sort({ totalScore: -1 });

    // 构建返回数据
    const overviewStats = {
      totalEmployees: {
        value: totalEmployees,
        label: '员工总数'
      },
      activeEmployees: {
        value: activeEmployees,
        label: '在职员工数'
      },
      avgWorkDays: {
        value: Math.round(avgWorkDays), // 四舍五入到整数天
        label: '平均在职天数',
        unit: '天'
      },
      topScoreEmployee: {
        value: topScoreEmployee ? {
          name: topScoreEmployee.name,
          score: topScoreEmployee.totalScore,
          department: topScoreEmployee.department,
          position: topScoreEmployee.position
        } : null,
        label: '积分最多员工'
      }
    };

    return NextResponse.json({
      success: true,
      data: overviewStats
    });

  } catch (error) {
    console.error('获取员工概览统计数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
