import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';
import { normalizeRecruitmentRecord } from '@/utils/recruitment';

// GET - 获取招聘概览统计数据
export async function GET() {
  try {
    await connectDB();

    const rawRecords = await RecruitmentRecord.find({})
      .sort({ interviewDate: -1 })
      .lean();
    const records = rawRecords.map((record) => normalizeRecruitmentRecord(record));

    const totalRecruitment = records.length;
    const pendingArrivalCount = records.filter(record => record.recruitmentStatus === 'pending_arrival').length;
    const noShowCount = records.filter(record => record.recruitmentStatus === 'no_show').length;

    const trialDayRecords = records.filter(record => typeof record.trialDays === 'number' && record.trialDays > 0);
    const avgTrialDays = trialDayRecords.length > 0
      ? trialDayRecords.reduce((sum, record) => sum + (record.trialDays || 0), 0) / trialDayRecords.length
      : 0;

    const overviewStats = {
      totalRecruitment: {
        value: totalRecruitment,
        label: '招聘总人数'
      },
      pendingArrivalCount: {
        value: pendingArrivalCount,
        label: '待到岗人数'
      },
      noShowCount: {
        value: noShowCount,
        label: '未到岗人数'
      },
      avgTrialDays: {
        value: Math.round(avgTrialDays * 10) / 10,
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
