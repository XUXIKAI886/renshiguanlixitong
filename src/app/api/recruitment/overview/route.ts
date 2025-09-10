import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';

// GET - 获取招聘概览统计数据
export async function GET() {
  try {
    await connectDB();

    // 1. 招聘总人数
    const totalRecruitment = await RecruitmentRecord.countDocuments();

    // 2. 面试总人数
    const totalInterviews = await RecruitmentRecord.countDocuments();

    // 3. 试岗人数（hasTrial: true）
    const totalTrials = await RecruitmentRecord.countDocuments({ hasTrial: true });

    // 4. 试岗率（试岗人数 / 面试人数）
    const trialRate = totalInterviews > 0 ? (totalTrials / totalInterviews * 100) : 0;

    // 5. 试岗离职人数（试岗状态为poor或有离职原因的）
    const trialResignations = await RecruitmentRecord.countDocuments({
      hasTrial: true,
      $or: [
        { trialStatus: 'poor' },
        { resignationReason: { $exists: true, $ne: '' } }
      ]
    });

    // 6. 试岗离职率（离职人数 / 试岗人数）
    const trialResignationRate = totalTrials > 0 ? (trialResignations / totalTrials * 100) : 0;

    // 7. 平均试岗天数
    const avgTrialDaysResult = await RecruitmentRecord.aggregate([
      {
        $match: {
          hasTrial: true,
          trialDays: { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$trialDays' }
        }
      }
    ]);

    const avgTrialDays = avgTrialDaysResult[0]?.avgDays || 0;

    // 构建返回数据
    const overviewStats = {
      totalRecruitment: {
        value: totalRecruitment,
        label: '招聘总人数'
      },
      trialRate: {
        value: Math.round(trialRate * 10) / 10, // 保留一位小数
        label: '试岗率',
        unit: '%'
      },
      trialResignationRate: {
        value: Math.round(trialResignationRate * 10) / 10, // 保留一位小数
        label: '试岗离职率',
        unit: '%'
      },
      avgTrialDays: {
        value: Math.round(avgTrialDays * 10) / 10, // 保留一位小数
        label: '平均试岗天数',
        unit: '天'
      }
    };

    return NextResponse.json({
      success: true,
      data: overviewStats
    });

  } catch (error) {
    console.error('获取招聘概览统计数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
