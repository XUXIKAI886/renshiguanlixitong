import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ScoreRecord, Employee } from '@/models';

// GET - 获取积分统计数据
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // 构建时间查询条件
    const dateQuery: any = {};
    if (startDate || endDate) {
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
    }

    // 1. 获取员工积分排行榜
    const employeeRanking = await Employee.find({ workStatus: 'active' })
      .select('employeeId name department position totalScore')
      .sort({ totalScore: -1 })
      .limit(20);

    // 2. 获取积分行为统计
    const behaviorStats = await ScoreRecord.aggregate([
      ...(Object.keys(dateQuery).length > 0 ? [{ $match: { recordDate: dateQuery } }] : []),
      {
        $group: {
          _id: '$behaviorType',
          totalScore: { $sum: '$scoreChange' },
          count: { $sum: 1 },
          avgScore: { $avg: '$scoreChange' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 3. 获取月度积分趋势
    const monthlyTrend = await ScoreRecord.aggregate([
      {
        $match: {
          recordDate: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$recordDate' },
            type: {
              $cond: [
                { $gt: ['$scoreChange', 0] },
                'addition',
                'deduction'
              ]
            }
          },
          totalScore: { $sum: '$scoreChange' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    // 4. 获取部门积分对比
    const departmentComparison = await Employee.aggregate([
      { $match: { workStatus: 'active', department: { $ne: null } } },
      {
        $group: {
          _id: '$department',
          totalScore: { $sum: '$totalScore' },
          avgScore: { $avg: '$totalScore' },
          employeeCount: { $sum: 1 }
        }
      },
      { $sort: { totalScore: -1 } }
    ]);

    // 5. 获取总体统计
    const overallStats = await ScoreRecord.aggregate([
      ...(Object.keys(dateQuery).length > 0 ? [{ $match: { recordDate: dateQuery } }] : []),
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalPositiveScore: {
            $sum: {
              $cond: [{ $gt: ['$scoreChange', 0] }, '$scoreChange', 0]
            }
          },
          totalNegativeScore: {
            $sum: {
              $cond: [{ $lt: ['$scoreChange', 0] }, '$scoreChange', 0]
            }
          },
          avgScore: { $avg: '$scoreChange' }
        }
      }
    ]);

    // 6. 格式化月度趋势数据
    const formattedMonthlyTrend = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const additionData = monthlyTrend.find(
        item => item._id.month === month && item._id.type === 'addition'
      );
      const deductionData = monthlyTrend.find(
        item => item._id.month === month && item._id.type === 'deduction'
      );

      return {
        month,
        monthName: new Date(year, index).toLocaleDateString('zh-CN', { month: 'short' }),
        addition: additionData?.totalScore || 0,
        deduction: Math.abs(deductionData?.totalScore || 0),
        additionCount: additionData?.count || 0,
        deductionCount: deductionData?.count || 0
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        employeeRanking,
        behaviorStats,
        monthlyTrend: formattedMonthlyTrend,
        departmentComparison,
        overallStats: overallStats[0] || {
          totalRecords: 0,
          totalPositiveScore: 0,
          totalNegativeScore: 0,
          avgScore: 0
        }
      }
    });

  } catch (error) {
    console.error('获取积分统计失败:', error);
    return NextResponse.json(
      { success: false, error: '获取积分统计失败' },
      { status: 500 }
    );
  }
}
