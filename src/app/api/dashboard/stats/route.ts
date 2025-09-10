import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Employee, RecruitmentRecord, ScoreRecord, AnnualAward } from '@/models';

// GET - 获取主页仪表盘统计数据
export async function GET() {
  try {
    await connectDB();

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // 获取本月开始和结束时间
    const monthStart = new Date(currentYear, currentMonth - 1, 1);
    const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // 获取上月开始和结束时间（用于计算趋势）
    const lastMonthStart = new Date(currentYear, currentMonth - 2, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth - 1, 0, 23, 59, 59);

    // 1. 总面试人数（招聘总人数）
    const [totalInterviews, lastMonthTotalInterviews] = await Promise.all([
      RecruitmentRecord.countDocuments({}),
      RecruitmentRecord.countDocuments({
        createdAt: { $lte: lastMonthEnd }
      })
    ]);

    // 计算总面试人数趋势（本月新增）
    const newInterviewsThisMonth = totalInterviews - lastMonthTotalInterviews;
    const interviewTrend = newInterviewsThisMonth > 0 ? `+${newInterviewsThisMonth}` : '0';

    // 2. 在职员工数量
    const [currentActiveEmployees, lastMonthActiveEmployees] = await Promise.all([
      Employee.countDocuments({ workStatus: 'active' }),
      // 假设上月在职员工数（这里简化处理，实际可能需要历史数据表）
      Employee.countDocuments({ 
        workStatus: 'active',
        createdAt: { $lte: lastMonthEnd }
      })
    ]);

    // 计算员工数量趋势
    const employeeTrend = lastMonthActiveEmployees > 0 
      ? ((currentActiveEmployees - lastMonthActiveEmployees) / lastMonthActiveEmployees * 100).toFixed(1)
      : currentActiveEmployees > 0 ? '100.0' : '0.0';

    // 3. 平均积分
    const [currentAvgScore, lastMonthAvgScore] = await Promise.all([
      Employee.aggregate([
        { $match: { workStatus: 'active' } },
        { $group: { _id: null, avgScore: { $avg: '$totalScore' } } }
      ]),
      Employee.aggregate([
        { 
          $match: { 
            workStatus: 'active',
            createdAt: { $lte: lastMonthEnd }
          } 
        },
        { $group: { _id: null, avgScore: { $avg: '$totalScore' } } }
      ])
    ]);

    const currentAvg = currentAvgScore[0]?.avgScore || 0;
    const lastAvg = lastMonthAvgScore[0]?.avgScore || 0;
    
    // 计算平均积分趋势
    const scoreTrend = lastAvg > 0 
      ? ((currentAvg - lastAvg) / lastAvg * 100).toFixed(1)
      : currentAvg > 0 ? '100.0' : '0.0';

    // 4. 试岗通过率
    const [currentTrialStats, lastMonthTrialStats] = await Promise.all([
      RecruitmentRecord.aggregate([
        {
          $match: {
            trialStartDate: { $gte: monthStart, $lte: monthEnd },
            trialStatus: { $in: ['passed', 'failed'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            passed: {
              $sum: { $cond: [{ $eq: ['$trialStatus', 'passed'] }, 1, 0] }
            }
          }
        }
      ]),
      RecruitmentRecord.aggregate([
        {
          $match: {
            trialStartDate: { $gte: lastMonthStart, $lte: lastMonthEnd },
            trialStatus: { $in: ['passed', 'failed'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            passed: {
              $sum: { $cond: [{ $eq: ['$trialStatus', 'passed'] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    const currentPassRate = currentTrialStats[0] 
      ? (currentTrialStats[0].passed / currentTrialStats[0].total * 100)
      : 0;
    
    const lastPassRate = lastMonthTrialStats[0] 
      ? (lastMonthTrialStats[0].passed / lastMonthTrialStats[0].total * 100)
      : 0;

    // 计算试岗通过率趋势
    const trialTrend = lastPassRate > 0 
      ? ((currentPassRate - lastPassRate) / lastPassRate * 100).toFixed(1)
      : currentPassRate > 0 ? '100.0' : '0.0';

    // 构建返回数据
    const stats = {
      totalInterviews: {
        value: totalInterviews.toString(),
        trend: `本月+${newInterviewsThisMonth}`,
        isPositive: newInterviewsThisMonth >= 0
      },
      activeEmployees: {
        value: currentActiveEmployees.toString(),
        trend: `${employeeTrend}%`,
        isPositive: parseFloat(employeeTrend) >= 0
      },
      averageScore: {
        value: Math.round(currentAvg).toString(),
        trend: `${scoreTrend}%`,
        isPositive: parseFloat(scoreTrend) >= 0
      },
      trialPassRate: {
        value: Math.round(currentPassRate).toString(),
        trend: `${trialTrend}%`,
        isPositive: parseFloat(trialTrend) >= 0
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('获取仪表盘统计数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
