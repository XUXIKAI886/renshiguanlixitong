import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';

// POST - 统一处理所有空身份证号记录（空字符串和null）
export async function POST() {
  try {
    await connectDB();
    
    console.log('=== 开始统一处理空身份证号记录 ===');
    
    // 1. 查找所有空身份证号记录（包括空字符串、null、undefined）
    const emptyIdCardRecords = await RecruitmentRecord.find({ 
      $or: [
        { idCard: null },
        { idCard: '' },
        { idCard: { $exists: false } }
      ]
    }).sort({ createdAt: 1 }); // 按创建时间排序，保留最早的
    
    console.log('找到的空身份证号记录:', emptyIdCardRecords.map(record => ({
      _id: record._id,
      candidateName: record.candidateName,
      phone: record.phone,
      idCard: record.idCard,
      idCardType: typeof record.idCard,
      createdAt: record.createdAt
    })));
    
    if (emptyIdCardRecords.length <= 1) {
      return NextResponse.json({
        success: true,
        message: '没有重复的空身份证号记录，无需处理',
        data: {
          emptyRecordsCount: emptyIdCardRecords.length
        }
      });
    }
    
    // 2. 删除除第一条记录外的所有空身份证号记录
    const recordsToDelete = emptyIdCardRecords.slice(1);
    const idsToDelete = recordsToDelete.map(record => record._id);
    
    console.log('将删除的记录:', recordsToDelete.map(record => ({
      _id: record._id,
      candidateName: record.candidateName,
      phone: record.phone,
      idCard: record.idCard
    })));
    
    const deleteResult = await RecruitmentRecord.deleteMany({
      _id: { $in: idsToDelete }
    });
    
    // 3. 确保保留的记录的身份证号为null
    const keptRecord = emptyIdCardRecords[0];
    await RecruitmentRecord.updateOne(
      { _id: keptRecord._id },
      { $set: { idCard: null } }
    );
    
    console.log('删除结果:', deleteResult);
    console.log('保留记录已统一设置为null');
    
    return NextResponse.json({
      success: true,
      message: `处理完成，删除了 ${deleteResult.deletedCount} 条重复记录，保留1条并统一为null`,
      data: {
        originalCount: emptyIdCardRecords.length,
        deletedCount: deleteResult.deletedCount,
        keptRecord: {
          _id: keptRecord._id,
          candidateName: keptRecord.candidateName,
          phone: keptRecord.phone,
          idCard: 'null (已统一)',
          createdAt: keptRecord.createdAt
        },
        deletedRecords: recordsToDelete.map(record => ({
          _id: record._id,
          candidateName: record.candidateName,
          phone: record.phone,
          idCard: record.idCard
        }))
      }
    });
    
  } catch (error) {
    console.error('处理空身份证号记录失败:', error);
    return NextResponse.json(
      { success: false, error: '处理失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET - 检查空身份证号记录的情况（包括不同类型）
export async function GET() {
  try {
    await connectDB();
    
    // 分别查找不同类型的空身份证号
    const nullRecords = await RecruitmentRecord.find({ idCard: null });
    const emptyStringRecords = await RecruitmentRecord.find({ idCard: '' });
    const undefinedRecords = await RecruitmentRecord.find({ idCard: { $exists: false } });
    
    const summary = {
      nullRecords: nullRecords.map(r => ({ _id: r._id, candidateName: r.candidateName, phone: r.phone, idCard: r.idCard })),
      emptyStringRecords: emptyStringRecords.map(r => ({ _id: r._id, candidateName: r.candidateName, phone: r.phone, idCard: r.idCard })),
      undefinedRecords: undefinedRecords.map(r => ({ _id: r._id, candidateName: r.candidateName, phone: r.phone, idCard: r.idCard })),
      totalEmptyRecords: nullRecords.length + emptyStringRecords.length + undefinedRecords.length
    };
    
    return NextResponse.json({
      success: true,
      data: summary
    });
    
  } catch (error) {
    console.error('检查空身份证号记录失败:', error);
    return NextResponse.json(
      { success: false, error: '检查失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
