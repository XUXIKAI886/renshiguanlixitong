import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';

// POST - 修复身份证号索引问题
export async function POST() {
  try {
    await connectDB();
    
    console.log('=== 开始修复身份证号索引 ===');
    
    // 获取集合引用
    const collection = RecruitmentRecord.collection;
    
    // 1. 获取现有索引
    const existingIndexes = await collection.getIndexes();
    console.log('现有索引:', existingIndexes);
    
    // 2. 删除现有的身份证号索引（如果存在）
    try {
      await collection.dropIndex('idCard_1');
      console.log('成功删除旧的idCard索引');
    } catch (error) {
      console.log('删除idCard索引时出错（可能不存在）:', error.message);
    }
    
    // 3. 重新创建稀疏唯一索引
    await collection.createIndex(
      { idCard: 1 }, 
      { 
        unique: true, 
        sparse: true,
        name: 'idCard_sparse_unique'
      }
    );
    console.log('成功创建新的稀疏唯一索引');
    
    // 4. 验证索引创建结果
    const newIndexes = await collection.getIndexes();
    console.log('修复后的索引:', newIndexes);
    
    // 5. 统计当前数据库中idCard为null的记录数
    const nullIdCardCount = await RecruitmentRecord.countDocuments({ idCard: null });
    console.log('数据库中idCard为null的记录数:', nullIdCardCount);
    
    return NextResponse.json({
      success: true,
      message: '身份证号索引修复完成',
      data: {
        oldIndexes: existingIndexes,
        newIndexes: newIndexes,
        nullIdCardRecords: nullIdCardCount
      }
    });
    
  } catch (error) {
    console.error('修复索引失败:', error);
    return NextResponse.json(
      { success: false, error: '修复索引失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET - 检查当前索引状态
export async function GET() {
  try {
    await connectDB();
    
    const collection = RecruitmentRecord.collection;
    
    // 获取所有索引
    const indexes = await collection.getIndexes();
    
    // 统计idCard相关数据
    const totalRecords = await RecruitmentRecord.countDocuments();
    const nullIdCardCount = await RecruitmentRecord.countDocuments({ idCard: null });
    const nonNullIdCardCount = await RecruitmentRecord.countDocuments({ 
      idCard: { $ne: null, $exists: true, $ne: '' } 
    });
    
    return NextResponse.json({
      success: true,
      data: {
        indexes,
        statistics: {
          totalRecords,
          nullIdCardCount,
          nonNullIdCardCount
        }
      }
    });
    
  } catch (error) {
    console.error('检查索引状态失败:', error);
    return NextResponse.json(
      { success: false, error: '检查索引状态失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
