import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';

// 数据迁移：为现有招聘记录添加应聘岗位字段
export async function POST() {
  try {
    await connectDB();
    
    console.log('=== 开始数据迁移：添加应聘岗位字段 ===');
    
    // 查找所有没有appliedPosition字段或值为null/undefined的记录
    const recordsToUpdate = await RecruitmentRecord.find({
      $or: [
        { appliedPosition: { $exists: false } },
        { appliedPosition: null },
        { appliedPosition: undefined }
      ]
    });
    
    console.log(`找到 ${recordsToUpdate.length} 条需要迁移的记录`);
    
    if (recordsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: '所有记录都已有应聘岗位字段，无需迁移',
        updatedCount: 0
      });
    }
    
    // 批量更新记录，设置默认值为"未分配"
    const updateResult = await RecruitmentRecord.updateMany(
      {
        $or: [
          { appliedPosition: { $exists: false } },
          { appliedPosition: null },
          { appliedPosition: undefined }
        ]
      },
      {
        $set: { appliedPosition: '未分配' }
      }
    );
    
    console.log(`成功更新 ${updateResult.modifiedCount} 条记录`);
    
    // 验证更新结果
    const verifyRecords = await RecruitmentRecord.find({
      _id: { $in: recordsToUpdate.map(r => r._id) }
    });
    
    console.log('=== 验证迁移结果 ===');
    verifyRecords.slice(0, 3).forEach((record, index) => {
      console.log(`记录${index + 1} appliedPosition:`, record.appliedPosition);
    });
    
    return NextResponse.json({
      success: true,
      message: `数据迁移完成，成功更新 ${updateResult.modifiedCount} 条记录`,
      updatedCount: updateResult.modifiedCount,
      totalFound: recordsToUpdate.length
    });
    
  } catch (error) {
    console.error('数据迁移失败:', error);
    return NextResponse.json({
      success: false,
      error: '数据迁移失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
