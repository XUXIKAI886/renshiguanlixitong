import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';

// POST - 创建正确的部分索引
export async function POST() {
  try {
    await connectDB();
    
    console.log('=== 开始创建部分索引解决身份证号冲突 ===');
    
    const collection = RecruitmentRecord.collection;
    
    // 1. 删除现有的身份证号索引
    const idCardIndexes = ['idCard_1', 'idCard_sparse_unique', 'idCard_unique_sparse_v2'];
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
    
    // 2. 等待索引删除完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. 创建部分索引：只对非空身份证号创建唯一索引
    console.log('=== 创建部分唯一索引 ===');
    const createResult = await collection.createIndex(
      { idCard: 1 }, 
      { 
        unique: true,
        partialFilterExpression: { 
          idCard: { $type: "string", $ne: "" } 
        },
        name: 'idCard_partial_unique',
        background: true
      }
    );
    console.log('部分索引创建结果:', createResult);
    
    // 4. 验证索引配置
    const indexInfo = await collection.indexInformation({ full: true });
    const partialIndex = indexInfo.find(idx => idx.name === 'idCard_partial_unique');
    console.log('新部分索引详情:', partialIndex);
    
    // 5. 数据状态检查
    const nullIdCardCount = await RecruitmentRecord.countDocuments({ idCard: null });
    const emptyIdCardCount = await RecruitmentRecord.countDocuments({ idCard: "" });
    const validIdCardCount = await RecruitmentRecord.countDocuments({ 
      idCard: { $ne: null, $ne: "" } 
    });
    
    console.log('数据统计:');
    console.log('- null身份证记录:', nullIdCardCount);
    console.log('- 空字符串身份证记录:', emptyIdCardCount);
    console.log('- 有效身份证记录:', validIdCardCount);
    
    return NextResponse.json({
      success: true,
      message: '部分索引创建成功，身份证号冲突问题已解决',
      data: {
        deletionResults,
        newIndexCreated: createResult,
        partialIndexDetails: partialIndex,
        dataStats: {
          nullRecords: nullIdCardCount,
          emptyRecords: emptyIdCardCount,
          validRecords: validIdCardCount
        }
      }
    });
    
  } catch (error) {
    console.error('创建部分索引失败:', error);
    return NextResponse.json(
      { success: false, error: '创建部分索引失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET - 检查当前索引状态
export async function GET() {
  try {
    await connectDB();
    
    const collection = RecruitmentRecord.collection;
    const indexInfo = await collection.indexInformation({ full: true });
    
    // 查找身份证号相关索引
    const idCardIndexes = indexInfo.filter(idx => 
      idx.key && idx.key.idCard !== undefined
    );
    
    // 数据统计
    const stats = {
      total: await RecruitmentRecord.countDocuments({}),
      nullIdCard: await RecruitmentRecord.countDocuments({ idCard: null }),
      emptyIdCard: await RecruitmentRecord.countDocuments({ idCard: "" }),
      validIdCard: await RecruitmentRecord.countDocuments({ 
        idCard: { $ne: null, $ne: "" } 
      })
    };
    
    return NextResponse.json({
      success: true,
      data: {
        allIndexes: indexInfo.length,
        idCardIndexes,
        dataStats: stats
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
