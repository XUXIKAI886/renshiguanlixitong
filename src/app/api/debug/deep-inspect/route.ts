import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';

// GET - 深度检查数据库状态
export async function GET() {
  try {
    await connectDB();
    
    console.log('=== 深度检查数据库状态 ===');
    
    const collection = RecruitmentRecord.collection;
    
    // 1. 获取所有索引的完整信息
    const indexInfo = await collection.indexInformation({ full: true });
    console.log('完整索引信息:', JSON.stringify(indexInfo, null, 2));
    
    // 2. 获取集合的统计信息
    const stats = await collection.stats();
    console.log('集合统计:', stats);
    
    // 3. 查找所有记录（包括身份证号情况）
    const allRecords = await RecruitmentRecord.find({}).select('candidateName idCard phone').lean();
    console.log('所有记录的身份证号状态:');
    allRecords.forEach((record, index) => {
      console.log(`${index + 1}. ${record.candidateName}: idCard="${record.idCard}", type=${typeof record.idCard}`);
    });
    
    // 4. 统计不同类型的身份证号
    const nullCount = await RecruitmentRecord.countDocuments({ idCard: null });
    const emptyCount = await RecruitmentRecord.countDocuments({ idCard: "" });
    const undefinedCount = await RecruitmentRecord.countDocuments({ idCard: { $exists: false } });
    const validCount = await RecruitmentRecord.countDocuments({ 
      idCard: { $ne: null, $ne: "", $exists: true } 
    });
    
    // 5. 检查模型定义的索引
    const modelIndexes = RecruitmentRecord.schema.indexes();
    console.log('模型定义的索引:', modelIndexes);
    
    // 6. 检查具体的身份证号值
    const distinctIdCards = await collection.distinct('idCard');
    console.log('数据库中不同的身份证号值:', distinctIdCards);
    
    return NextResponse.json({
      success: true,
      data: {
        // 索引信息
        allIndexes: indexInfo,
        indexCount: indexInfo.length,
        idCardIndexes: indexInfo.filter(idx => 
          JSON.stringify(idx.key).includes('idCard') || idx.name?.includes('idCard')
        ),
        
        // 数据统计
        totalRecords: allRecords.length,
        dataBreakdown: {
          null: nullCount,
          empty: emptyCount,
          undefined: undefinedCount,
          valid: validCount
        },
        
        // 详细数据
        allRecordsDetails: allRecords.map(r => ({
          name: r.candidateName,
          idCard: r.idCard,
          idCardType: typeof r.idCard,
          phone: r.phone
        })),
        
        // 模型配置
        modelIndexes: modelIndexes,
        
        // 不同值
        distinctIdCardValues: distinctIdCards,
        
        // 集合统计
        collectionStats: {
          count: stats.count,
          size: stats.size,
          avgObjSize: stats.avgObjSize,
          indexSizes: stats.indexSizes
        }
      }
    });
    
  } catch (error) {
    console.error('深度检查失败:', error);
    return NextResponse.json(
      { success: false, error: '深度检查失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
