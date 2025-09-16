import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';

// POST - 清理null身份证号记录的重复问题
export async function POST() {
  try {
    await connectDB();
    
    console.log('=== 开始清理null身份证号记录 ===');
    
    // 1. 查找所有idCard为null的记录
    const nullIdCardRecords = await RecruitmentRecord.find({ 
      $or: [
        { idCard: null },
        { idCard: '' },
        { idCard: { $exists: false } }
      ]
    }).sort({ createdAt: 1 }); // 按创建时间排序
    
    console.log('找到的null身份证号记录数:', nullIdCardRecords.length);
    
    if (nullIdCardRecords.length <= 1) {
      return NextResponse.json({
        success: true,
        message: '没有重复的null身份证号记录，无需清理',
        data: {
          nullRecordsCount: nullIdCardRecords.length
        }
      });
    }
    
    // 2. 保留第一条记录，删除其余的null记录
    const recordsToKeep = nullIdCardRecords[0]; // 保留最早的记录
    const recordsToDelete = nullIdCardRecords.slice(1); // 删除其余的
    
    console.log('将保留记录:', {
      _id: recordsToKeep._id,
      candidateName: recordsToKeep.candidateName,
      phone: recordsToKeep.phone,
      createdAt: recordsToKeep.createdAt
    });
    
    console.log('将删除的记录数:', recordsToDelete.length);
    
    // 3. 删除重复的记录
    const idsToDelete = recordsToDelete.map(record => record._id);
    const deleteResult = await RecruitmentRecord.deleteMany({
      _id: { $in: idsToDelete }
    });
    
    console.log('删除结果:', deleteResult);
    
    return NextResponse.json({
      success: true,
      message: `清理完成，删除了 ${deleteResult.deletedCount} 条重复的null身份证号记录`,
      data: {
        originalCount: nullIdCardRecords.length,
        deletedCount: deleteResult.deletedCount,
        remainingCount: 1,
        keptRecord: {
          _id: recordsToKeep._id,
          candidateName: recordsToKeep.candidateName,
          phone: recordsToKeep.phone,
          createdAt: recordsToKeep.createdAt
        },
        deletedRecords: recordsToDelete.map(record => ({
          _id: record._id,
          candidateName: record.candidateName,
          phone: record.phone,
          createdAt: record.createdAt
        }))
      }
    });
    
  } catch (error) {
    console.error('清理null身份证号记录失败:', error);
    return NextResponse.json(
      { success: false, error: '清理失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET - 检查null身份证号记录的情况
export async function GET() {
  try {
    await connectDB();
    
    // 查找所有idCard为null的记录
    const nullIdCardRecords = await RecruitmentRecord.find({ 
      $or: [
        { idCard: null },
        { idCard: '' },
        { idCard: { $exists: false } }
      ]
    }).sort({ createdAt: 1 });
    
    const recordSummary = nullIdCardRecords.map(record => ({
      _id: record._id,
      candidateName: record.candidateName,
      phone: record.phone,
      idCard: record.idCard,
      createdAt: record.createdAt
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        totalNullRecords: nullIdCardRecords.length,
        hasDuplicates: nullIdCardRecords.length > 1,
        records: recordSummary
      }
    });
    
  } catch (error) {
    console.error('检查null身份证号记录失败:', error);
    return NextResponse.json(
      { success: false, error: '检查失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
