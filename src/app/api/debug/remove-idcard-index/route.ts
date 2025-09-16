import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';

// POST - 完全移除身份证号唯一索引，改为应用层检查
export async function POST() {
  try {
    await connectDB();
    
    console.log('=== 移除身份证号唯一索引，改为应用层检查 ===');
    
    const collection = RecruitmentRecord.collection;
    
    // 1. 获取现有索引
    const existingIndexes = await collection.getIndexes();
    console.log('现有索引:', Object.keys(existingIndexes));
    
    // 2. 删除所有身份证号相关的唯一索引
    const idCardIndexes = ['idCard_1', 'idCard_sparse_unique', 'idCard_unique_sparse_v2', 'idCard_partial_unique'];
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
    
    // 3. 创建非唯一的普通索引，提高查询性能（可选）
    console.log('=== 创建非唯一索引提高查询性能 ===');
    const normalIndexResult = await collection.createIndex(
      { idCard: 1 }, 
      { 
        name: 'idCard_normal',
        background: true
      }
    );
    console.log('普通索引创建结果:', normalIndexResult);
    
    // 4. 验证最终索引状态
    const finalIndexes = await collection.getIndexes();
    console.log('最终索引状态:', Object.keys(finalIndexes));
    
    // 5. 数据统计
    const stats = {
      total: await RecruitmentRecord.countDocuments({}),
      nullIdCard: await RecruitmentRecord.countDocuments({ idCard: null }),
      emptyIdCard: await RecruitmentRecord.countDocuments({ idCard: "" }),
      validIdCard: await RecruitmentRecord.countDocuments({ 
        idCard: { $ne: null, $ne: "" } 
      })
    };
    
    console.log('数据统计:', stats);
    
    return NextResponse.json({
      success: true,
      message: '身份证号唯一索引已移除，改为应用层检查，支持多个空身份证号',
      data: {
        deletionResults,
        normalIndexCreated: normalIndexResult,
        finalIndexes: Object.keys(finalIndexes),
        dataStats: stats
      }
    });
    
  } catch (error) {
    console.error('移除索引失败:', error);
    return NextResponse.json(
      { success: false, error: '移除索引失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET - 检查当前状态
export async function GET() {
  try {
    await connectDB();
    
    const collection = RecruitmentRecord.collection;
    const allIndexes = await collection.getIndexes();
    
    // 查找身份证号相关索引
    const idCardIndexes = Object.keys(allIndexes).filter(name => 
      name.includes('idCard')
    );
    
    return NextResponse.json({
      success: true,
      data: {
        allIndexes: Object.keys(allIndexes),
        idCardIndexes,
        indexDetails: idCardIndexes.reduce((acc, name) => {
          acc[name] = allIndexes[name];
          return acc;
        }, {})
      }
    });
    
  } catch (error) {
    console.error('检查索引状态失败:', error);
    return NextResponse.json(
      { success: false, error: '检查失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
