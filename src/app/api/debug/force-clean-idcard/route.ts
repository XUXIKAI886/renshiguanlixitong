import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';

// POST - 强制清理所有身份证号相关索引
export async function POST() {
  try {
    await connectDB();
    
    console.log('=== 强制清理所有身份证号索引 ===');
    
    const collection = RecruitmentRecord.collection;
    
    // 获取当前所有索引
    const allIndexes = await collection.getIndexes();
    console.log('当前所有索引:', Object.keys(allIndexes));
    
    // 查找所有身份证号相关的索引
    const idCardIndexNames = Object.keys(allIndexes).filter(name => 
      name.toLowerCase().includes('idcard') || 
      name.includes('idCard') ||
      allIndexes[name].some(field => field[0] === 'idCard')
    );
    
    console.log('发现的身份证号索引:', idCardIndexNames);
    
    // 强制删除所有身份证号相关索引
    const deletionResults = [];
    for (const indexName of idCardIndexNames) {
      if (indexName === '_id_') continue; // 跳过主键索引
      
      try {
        await collection.dropIndex(indexName);
        deletionResults.push({ index: indexName, deleted: true });
        console.log(`✅ 成功删除索引: ${indexName}`);
      } catch (error) {
        deletionResults.push({ index: indexName, deleted: false, error: error.message });
        console.log(`❌ 删除索引 ${indexName} 失败:`, error.message);
      }
    }
    
    // 等待删除完成
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 创建新的非唯一索引提升查询性能
    try {
      const createResult = await collection.createIndex(
        { idCard: 1 }, 
        { 
          name: 'idCard_performance_only',
          background: true
          // 注意：没有 unique: true
        }
      );
      console.log('✅ 创建性能索引成功:', createResult);
    } catch (error) {
      console.log('❌ 创建性能索引失败:', error.message);
    }
    
    // 验证最终状态
    const finalIndexes = await collection.getIndexes();
    const remainingIdCardIndexes = Object.keys(finalIndexes).filter(name => 
      name.toLowerCase().includes('idcard') || name.includes('idCard')
    );
    
    console.log('最终索引状态:', Object.keys(finalIndexes));
    console.log('剩余身份证号索引:', remainingIdCardIndexes);
    
    // 数据统计
    const stats = {
      total: await RecruitmentRecord.countDocuments({}),
      nullIdCard: await RecruitmentRecord.countDocuments({ idCard: null }),
      emptyIdCard: await RecruitmentRecord.countDocuments({ idCard: "" })
    };
    
    return NextResponse.json({
      success: true,
      message: '强制清理完成，身份证号索引已完全移除',
      data: {
        originalIndexes: Object.keys(allIndexes),
        idCardIndexesFound: idCardIndexNames,
        deletionResults,
        finalIndexes: Object.keys(finalIndexes),
        remainingIdCardIndexes,
        dataStats: stats
      }
    });
    
  } catch (error) {
    console.error('强制清理失败:', error);
    return NextResponse.json(
      { success: false, error: '强制清理失败', details: error instanceof Error ? error.message : String(error) },
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
      name.toLowerCase().includes('idcard') || 
      name.includes('idCard') ||
      allIndexes[name].some?.(field => field[0] === 'idCard')
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
    console.error('检查状态失败:', error);
    return NextResponse.json(
      { success: false, error: '检查失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
