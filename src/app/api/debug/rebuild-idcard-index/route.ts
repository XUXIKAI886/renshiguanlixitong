import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';

// POST - 彻底重建身份证号索引
export async function POST() {
  try {
    await connectDB();
    
    console.log('=== 开始彻底重建身份证号索引 ===');
    
    // 获取集合引用
    const collection = RecruitmentRecord.collection;
    
    // 1. 获取现有索引
    const existingIndexes = await collection.getIndexes();
    console.log('现有索引:', Object.keys(existingIndexes));
    
    // 2. 删除所有身份证号相关的索引
    const idCardIndexes = ['idCard_1', 'idCard_sparse_unique'];
    const deletionResults = [];
    
    for (const indexName of idCardIndexes) {
      try {
        await collection.dropIndex(indexName);
        deletionResults.push({ index: indexName, deleted: true });
        console.log(`成功删除索引: ${indexName}`);
      } catch (error) {
        deletionResults.push({ index: indexName, deleted: false, error: error.message });
        console.log(`删除索引 ${indexName} 时出错（可能不存在）:`, error.message);
      }
    }
    
    // 3. 等待一段时间确保索引删除完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. 创建正确的稀疏唯一索引
    console.log('=== 创建新的稀疏唯一索引 ===');
    const createResult = await collection.createIndex(
      { idCard: 1 }, 
      { 
        unique: true, 
        sparse: true,
        name: 'idCard_unique_sparse_v2',
        background: true // 后台创建，不阻塞其他操作
      }
    );
    console.log('索引创建结果:', createResult);
    
    // 5. 验证新索引的配置
    const newIndexes = await collection.getIndexes();
    const idCardIndex = Object.keys(newIndexes).find(key => key.includes('idCard'));
    const idCardIndexDetails = idCardIndex ? newIndexes[idCardIndex] : null;
    
    console.log('新身份证号索引详情:', idCardIndexDetails);
    
    // 6. 验证数据状态
    const nullIdCardCount = await RecruitmentRecord.countDocuments({ idCard: null });
    console.log('数据库中idCard为null的记录数:', nullIdCardCount);
    
    return NextResponse.json({
      success: true,
      message: '身份证号索引彻底重建完成',
      data: {
        deletionResults,
        newIndexCreated: createResult,
        newIndexDetails: idCardIndexDetails,
        nullIdCardRecords: nullIdCardCount
      }
    });
    
  } catch (error) {
    console.error('重建索引失败:', error);
    return NextResponse.json(
      { success: false, error: '重建索引失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET - 检查索引详细信息
export async function GET() {
  try {
    await connectDB();
    
    const collection = RecruitmentRecord.collection;
    
    // 获取所有索引的详细信息
    const indexesInfo = await collection.indexInformation({ full: true });
    
    // 查找身份证号相关索引
    const idCardIndexes = indexesInfo.filter(idx => 
      idx.key && idx.key.idCard !== undefined
    );
    
    return NextResponse.json({
      success: true,
      data: {
        allIndexes: indexesInfo,
        idCardIndexes: idCardIndexes
      }
    });
    
  } catch (error) {
    console.error('检查索引详情失败:', error);
    return NextResponse.json(
      { success: false, error: '检查失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
