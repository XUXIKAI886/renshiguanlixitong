import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecruitmentRecord } from '@/models';

// GET - 检查数据库索引配置
export async function GET() {
  try {
    await connectDB();
    
    console.log('=== 检查招聘记录集合的索引 ===');
    
    // 获取集合的所有索引
    const indexes = await RecruitmentRecord.collection.getIndexes();
    
    console.log('当前集合索引:', indexes);
    
    // 检查特定字段的索引信息
    const indexInfo = Object.keys(indexes).map(key => {
      const index = indexes[key];
      return {
        name: key,
        fields: index.key || index,
        unique: index.unique || false,
        sparse: index.sparse || false
      };
    });
    
    return NextResponse.json({
      success: true,
      data: {
        collection: 'recruitmentrecords',
        totalIndexes: Object.keys(indexes).length,
        indexes: indexInfo,
        rawIndexes: indexes
      }
    });
    
  } catch (error) {
    console.error('检查索引失败:', error);
    return NextResponse.json(
      { success: false, error: '检查索引失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
