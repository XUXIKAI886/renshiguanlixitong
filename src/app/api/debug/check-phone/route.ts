import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';

// GET - 检查手机号是否已存在
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    
    if (!phone) {
      return NextResponse.json({
        success: false,
        error: '请提供手机号参数'
      }, { status: 400 });
    }
    
    console.log('=== 检查手机号是否存在 ===');
    console.log('查询手机号:', phone);
    
    // 查找是否存在该手机号的记录
    const existingRecords = await RecruitmentRecord.find({ phone }).lean();
    
    console.log('找到的记录数量:', existingRecords.length);
    console.log('记录详情:', existingRecords);
    
    return NextResponse.json({
      success: true,
      data: {
        phone,
        exists: existingRecords.length > 0,
        count: existingRecords.length,
        records: existingRecords.map(record => ({
          _id: record._id,
          candidateName: record.candidateName,
          phone: record.phone,
          idCard: record.idCard,
          interviewDate: record.interviewDate,
          recruitmentStatus: record.recruitmentStatus,
          createdAt: record.createdAt
        }))
      }
    });
    
  } catch (error) {
    console.error('检查手机号失败:', error);
    return NextResponse.json(
      { success: false, error: '检查手机号失败' },
      { status: 500 }
    );
  }
}
