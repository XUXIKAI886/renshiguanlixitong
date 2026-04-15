import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';
import { normalizeRecruitmentRecord } from '@/utils/recruitment';

// GET - 获取招聘统计数据
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year + 1, 0, 1);

    const rawRecords = await RecruitmentRecord.find({})
      .sort({ interviewDate: -1 })
      .lean();
    const records = rawRecords.map((record) => normalizeRecruitmentRecord(record));

    const yearlyInterviewRecords = records.filter(record => {
      const interviewDate = new Date(record.interviewDate);
      return interviewDate >= yearStart && interviewDate < yearEnd;
    });

    const trialDayRecords = yearlyInterviewRecords.filter(record => typeof record.trialDays === 'number' && record.trialDays > 0);
    const avgTrialDays = trialDayRecords.length > 0
      ? trialDayRecords.reduce((sum, record) => sum + (record.trialDays || 0), 0) / trialDayRecords.length
      : 0;

    const trialRelevantRecords = yearlyInterviewRecords.filter(record =>
      ['trialing', 'regularized'].includes(record.recruitmentStatus)
    );
    const regularizedCount = yearlyInterviewRecords.filter(record => record.recruitmentStatus === 'regularized').length;
    const regularizationRate = trialRelevantRecords.length > 0
      ? (regularizedCount / trialRelevantRecords.length) * 100
      : 0;

    const basicStats = {
      totalCandidates: yearlyInterviewRecords.length,
      pendingDecisionCount: yearlyInterviewRecords.filter(record => record.recruitmentStatus === 'pending_decision').length,
      pendingArrivalCount: yearlyInterviewRecords.filter(record => record.recruitmentStatus === 'pending_arrival').length,
      noShowCount: yearlyInterviewRecords.filter(record => record.recruitmentStatus === 'no_show').length,
      trialingCount: yearlyInterviewRecords.filter(record => record.recruitmentStatus === 'trialing').length,
      regularizedCount,
      rejectedCount: yearlyInterviewRecords.filter(record => record.recruitmentStatus === 'rejected').length,
      regularizationRate,
      avgTrialDays
    };

    const monthlyTrend = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const monthRecords = yearlyInterviewRecords.filter(record =>
        new Date(record.interviewDate).getMonth() + 1 === month
      );

      return {
        month: `${month}月`,
        total: monthRecords.length,
        pendingDecision: monthRecords.filter(record => record.recruitmentStatus === 'pending_decision').length,
        pendingArrival: monthRecords.filter(record => record.recruitmentStatus === 'pending_arrival').length,
        noShow: monthRecords.filter(record => record.recruitmentStatus === 'no_show').length,
        trialing: monthRecords.filter(record => record.recruitmentStatus === 'trialing').length,
        regularized: monthRecords.filter(record => record.recruitmentStatus === 'regularized').length,
        rejected: monthRecords.filter(record => record.recruitmentStatus === 'rejected').length,
      };
    });

    const statusDistribution = [
      { value: 'pending_decision', status: '待定', count: basicStats.pendingDecisionCount },
      { value: 'pending_arrival', status: '可试岗待到岗', count: basicStats.pendingArrivalCount },
      { value: 'no_show', status: '未到岗', count: basicStats.noShowCount },
      { value: 'trialing', status: '试岗中', count: basicStats.trialingCount },
      { value: 'regularized', status: '已转正', count: basicStats.regularizedCount },
      { value: 'rejected', status: '已拒绝', count: basicStats.rejectedCount },
    ].filter(item => item.count > 0);

    const regularizationTrend = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const arrived = yearlyInterviewRecords.filter(record =>
        record.arrivalDate &&
        new Date(record.arrivalDate).getFullYear() === year &&
        new Date(record.arrivalDate).getMonth() + 1 === month
      ).length;
      const regularized = yearlyInterviewRecords.filter(record =>
        record.regularizedDate &&
        new Date(record.regularizedDate).getFullYear() === year &&
        new Date(record.regularizedDate).getMonth() + 1 === month
      ).length;

      return {
        month: `${month}月`,
        arrived,
        regularized,
        regularizationRate: arrived > 0 ? Math.round((regularized / arrived) * 100) : 0,
      };
    });

    const channelMap = new Map<string, { total: number; regularized: number }>();
    yearlyInterviewRecords.forEach(record => {
      const channel = record.recruitmentChannel || '未填写';
      const current = channelMap.get(channel) || { total: 0, regularized: 0 };
      current.total += 1;
      if (record.recruitmentStatus === 'regularized') {
        current.regularized += 1;
      }
      channelMap.set(channel, current);
    });

    const channelAnalysis = Array.from(channelMap.entries())
      .map(([channel, value]) => ({
        channel,
        total: value.total,
        regularized: value.regularized,
        regularizationRate: value.total > 0
          ? Math.round((value.regularized / value.total) * 10000) / 100
          : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      success: true,
      data: {
        basicStats,
        monthlyTrend,
        statusDistribution,
        regularizationTrend,
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
