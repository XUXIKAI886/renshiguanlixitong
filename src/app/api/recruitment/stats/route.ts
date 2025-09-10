import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';

// GET - 获取招聘统计数据
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // 获取基础统计数据
    const basicStats = await RecruitmentRecord.getStatistics();

    // 获取月度趋势数据
    const monthlyTrend = await getMonthlyTrend(year);

    // 获取状态分布
    const statusDistribution = await getStatusDistribution();

    // 获取试岗通过率趋势
    const trialPassRateTrend = await getTrialPassRateTrend(year);

    // 获取招聘渠道分析
    const channelAnalysis = await getChannelAnalysis();

    return NextResponse.json({
      success: true,
      data: {
        basicStats,
        monthlyTrend,
        statusDistribution,
        trialPassRateTrend,
        channelAnalysis,
      }
    });

  } catch (error) {
    console.error('获取招聘统计数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}

// 获取月度招聘趋势
async function getMonthlyTrend(year: number) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  const monthlyData = await RecruitmentRecord.aggregate([
    {
      $match: {
        interviewDate: {
          $gte: startDate,
          $lt: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$interviewDate' },
          status: '$recruitmentStatus'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.month',
        total: { $sum: '$count' },
        hired: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', 'hired'] }, '$count', 0]
          }
        },
        rejected: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', 'rejected'] }, '$count', 0]
          }
        },
        interviewing: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', 'interviewing'] }, '$count', 0]
          }
        },
        trial: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', 'trial'] }, '$count', 0]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 填充缺失的月份数据
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const result = months.map(month => {
    const data = monthlyData.find(item => item._id === month);
    return {
      month: `${month}月`,
      total: data?.total || 0,
      hired: data?.hired || 0,
      rejected: data?.rejected || 0,
      interviewing: data?.interviewing || 0,
      trial: data?.trial || 0,
    };
  });

  return result;
}

// 获取状态分布
async function getStatusDistribution() {
  const distribution = await RecruitmentRecord.aggregate([
    {
      $group: {
        _id: '$recruitmentStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  const statusLabels = {
    interviewing: '面试中',
    trial: '试岗中',
    hired: '已录用',
    rejected: '已拒绝'
  };

  return distribution.map(item => ({
    status: statusLabels[item._id as keyof typeof statusLabels] || item._id,
    count: item.count,
    value: item._id
  }));
}

// 获取试岗通过率趋势
async function getTrialPassRateTrend(year: number) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  const trialData = await RecruitmentRecord.aggregate([
    {
      $match: {
        hasTrial: true,
        trialDate: {
          $gte: startDate,
          $lt: endDate
        }
      }
    },
    {
      $group: {
        _id: { $month: '$trialDate' },
        total: { $sum: 1 },
        passed: {
          $sum: {
            $cond: [
              { $in: ['$trialStatus', ['excellent', 'good']] },
              1,
              0
            ]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const result = months.map(month => {
    const data = trialData.find(item => item._id === month);
    const total = data?.total || 0;
    const passed = data?.passed || 0;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return {
      month: `${month}月`,
      total,
      passed,
      passRate,
    };
  });

  return result;
}

// 获取招聘渠道分析
async function getChannelAnalysis() {
  const channelData = await RecruitmentRecord.aggregate([
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$recruitmentChannel', ''] },
            '未填写',
            '$recruitmentChannel'
          ]
        },
        total: { $sum: 1 },
        hired: {
          $sum: {
            $cond: [{ $eq: ['$recruitmentStatus', 'hired'] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        channel: '$_id',
        total: 1,
        hired: 1,
        hireRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$hired', '$total'] }, 100] }
          ]
        }
      }
    },
    { $sort: { total: -1 } }
  ]);

  return channelData.map(item => ({
    channel: item.channel || '未填写',
    total: item.total,
    hired: item.hired,
    hireRate: Math.round(item.hireRate * 100) / 100,
  }));
}
