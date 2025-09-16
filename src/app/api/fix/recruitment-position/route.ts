import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// 强制修复招聘记录的应聘岗位字段
export async function POST() {
  try {
    await connectDB();
    
    console.log('=== 强制修复应聘岗位字段 ===');
    
    // 直接使用MongoDB原生操作
    const db = mongoose.connection.db;
    const collection = db.collection('recruitmentrecords');
    
    // 查找所有记录
    const allRecords = await collection.find({}).toArray();
    console.log('总记录数:', allRecords.length);
    
    // 查找缺少appliedPosition字段的记录
    const recordsWithoutField = allRecords.filter(record => 
      !record.hasOwnProperty('appliedPosition') || 
      record.appliedPosition === null || 
      record.appliedPosition === undefined
    );
    
    console.log('缺少appliedPosition字段的记录数:', recordsWithoutField.length);
    console.log('需要修复的记录ID:', recordsWithoutField.map(r => r._id));
    
    if (recordsWithoutField.length === 0) {
      return NextResponse.json({
        success: true,
        message: '所有记录都已有应聘岗位字段',
        totalRecords: allRecords.length,
        fixedRecords: 0
      });
    }
    
    // 批量更新缺失字段的记录
    const updateResult = await collection.updateMany(
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
    
    console.log('MongoDB原生更新结果:', updateResult);
    
    // 验证修复结果
    const verifyRecords = await collection.find({}).toArray();
    const stillMissingCount = verifyRecords.filter(record => 
      !record.hasOwnProperty('appliedPosition') || 
      record.appliedPosition === null || 
      record.appliedPosition === undefined
    ).length;
    
    console.log('修复后验证:');
    console.log('- 总记录数:', verifyRecords.length);
    console.log('- 仍缺少字段的记录数:', stillMissingCount);
    console.log('- 前3条记录的appliedPosition:', 
      verifyRecords.slice(0, 3).map(r => ({ 
        id: r._id, 
        appliedPosition: r.appliedPosition 
      }))
    );
    
    return NextResponse.json({
      success: true,
      message: `强制修复完成，更新了 ${updateResult.modifiedCount} 条记录`,
      totalRecords: allRecords.length,
      recordsNeedingFix: recordsWithoutField.length,
      actuallyFixed: updateResult.modifiedCount,
      matchedCount: updateResult.matchedCount,
      stillMissing: stillMissingCount
    });
    
  } catch (error) {
    console.error('强制修复失败:', error);
    return NextResponse.json({
      success: false,
      error: '强制修复失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET方法用于查看当前状态
export async function GET() {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    const collection = db.collection('recruitmentrecords');
    
    const allRecords = await collection.find({}).toArray();
    const recordsWithoutField = allRecords.filter(record => 
      !record.hasOwnProperty('appliedPosition') || 
      record.appliedPosition === null || 
      record.appliedPosition === undefined
    );
    
    return NextResponse.json({
      success: true,
      totalRecords: allRecords.length,
      recordsWithoutField: recordsWithoutField.length,
      sampleRecords: allRecords.slice(0, 2).map(r => ({
        _id: r._id,
        candidateName: r.candidateName,
        appliedPosition: r.appliedPosition,
        hasAppliedPositionField: r.hasOwnProperty('appliedPosition')
      }))
    });
    
  } catch (error) {
    console.error('查看状态失败:', error);
    return NextResponse.json({
      success: false,
      error: '查看状态失败'
    }, { status: 500 });
  }
}
