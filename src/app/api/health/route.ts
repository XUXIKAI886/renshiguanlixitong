import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Employee, RecruitmentRecord, ScoreRecord, AnnualAward } from '@/models';

// 系统健康检查API
export async function GET() {
  const startTime = Date.now();
  
  try {
    // 数据库连接检查
    await connectDB();
    
    // 基本统计信息
    const [
      employeeCount,
      recruitmentCount,
      scoreCount,
      awardCount
    ] = await Promise.all([
      Employee.countDocuments(),
      RecruitmentRecord.countDocuments(),
      ScoreRecord.countDocuments(),
      AnnualAward.countDocuments()
    ]);

    // 数据库响应时间测试
    const dbStartTime = Date.now();
    await Employee.findOne().limit(1);
    const dbResponseTime = Date.now() - dbStartTime;

    // 系统状态
    const systemStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      database: {
        status: 'connected',
        responseTime: dbResponseTime,
        collections: {
          employees: employeeCount,
          recruitment: recruitmentCount,
          scores: scoreCount,
          awards: awardCount
        }
      },
      memory: process.memoryUsage(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    // 健康检查规则
    const checks = {
      database: dbResponseTime < 1000, // 数据库响应时间 < 1秒
      memory: process.memoryUsage().heapUsed < 500 * 1024 * 1024, // 内存使用 < 500MB
      responseTime: (Date.now() - startTime) < 5000 // 总响应时间 < 5秒
    };

    const isHealthy = Object.values(checks).every(check => check);
    
    if (!isHealthy) {
      systemStatus.status = 'degraded';
    }

    return NextResponse.json({
      success: true,
      data: systemStatus,
      checks
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      success: false,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      }
    }, { status: 503 });
  }
}

// 详细的系统诊断API
export async function POST() {
  const startTime = Date.now();
  
  try {
    await connectDB();

    // 详细的数据库性能测试
    const dbTests = await Promise.all([
      // 测试查询性能
      measureOperation('Employee Query', () => 
        Employee.find().limit(10).lean()
      ),
      measureOperation('Recruitment Query', () => 
        RecruitmentRecord.find().limit(10).lean()
      ),
      measureOperation('Score Query', () => 
        ScoreRecord.find().limit(10).lean()
      ),
      measureOperation('Award Query', () => 
        AnnualAward.find().limit(10).lean()
      ),
      
      // 测试聚合性能
      measureOperation('Employee Aggregation', () => 
        Employee.aggregate([
          { $group: { _id: '$department', count: { $sum: 1 } } }
        ])
      ),
      measureOperation('Score Aggregation', () => 
        ScoreRecord.aggregate([
          { $group: { _id: null, totalScore: { $sum: '$scoreChange' } } }
        ])
      )
    ]);

    // 数据完整性检查
    const integrityChecks = await Promise.all([
      checkDataIntegrity('Employee-Score Consistency', async () => {
        const employees = await Employee.find({}, 'employeeId totalScore').lean();
        const scoreAggregation = await ScoreRecord.aggregate([
          { $group: { _id: '$employeeId', totalScore: { $sum: '$scoreChange' } } }
        ]);
        
        // 检查积分一致性
        let inconsistencies = 0;
        for (const employee of employees) {
          const scoreRecord = scoreAggregation.find(s => s._id.toString() === employee._id.toString());
          const calculatedScore = scoreRecord?.totalScore || 0;
          if (employee.totalScore !== calculatedScore) {
            inconsistencies++;
          }
        }
        
        return { passed: inconsistencies === 0, inconsistencies };
      }),
      
      checkDataIntegrity('Orphaned Records Check', async () => {
        const orphanedScores = await ScoreRecord.countDocuments({
          employeeId: { $nin: await Employee.find({}, '_id').distinct('_id') }
        });
        
        const orphanedAwards = await AnnualAward.countDocuments({
          employeeId: { $nin: await Employee.find({}, '_id').distinct('_id') }
        });
        
        return { 
          passed: orphanedScores === 0 && orphanedAwards === 0, 
          orphanedScores, 
          orphanedAwards 
        };
      })
    ]);

    const diagnostics = {
      timestamp: new Date().toISOString(),
      totalTime: Date.now() - startTime,
      databaseTests: dbTests,
      integrityChecks,
      recommendations: generateRecommendations(dbTests, integrityChecks)
    };

    return NextResponse.json({
      success: true,
      data: diagnostics
    });

  } catch (error) {
    console.error('System diagnostics failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Diagnostics failed',
      responseTime: Date.now() - startTime
    }, { status: 500 });
  }
}

// 辅助函数：测量操作性能
async function measureOperation<T>(name: string, operation: () => Promise<T>) {
  const startTime = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    return {
      name,
      duration,
      status: 'success',
      resultCount: Array.isArray(result) ? result.length : 1
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      name,
      duration,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 辅助函数：检查数据完整性
async function checkDataIntegrity<T>(name: string, check: () => Promise<T>) {
  try {
    const result = await check();
    return {
      name,
      status: 'completed',
      result
    };
  } catch (error) {
    return {
      name,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 生成优化建议
function generateRecommendations(dbTests: any[], integrityChecks: any[]) {
  const recommendations: string[] = [];
  
  // 检查慢查询
  const slowQueries = dbTests.filter(test => test.duration > 1000);
  if (slowQueries.length > 0) {
    recommendations.push(`发现 ${slowQueries.length} 个慢查询，建议优化数据库索引`);
  }
  
  // 检查数据完整性问题
  const integrityIssues = integrityChecks.filter(check => 
    check.result && !check.result.passed
  );
  if (integrityIssues.length > 0) {
    recommendations.push('发现数据完整性问题，建议运行数据修复脚本');
  }
  
  // 内存使用建议
  const memoryUsage = process.memoryUsage();
  if (memoryUsage.heapUsed > 200 * 1024 * 1024) {
    recommendations.push('内存使用较高，建议监控内存泄漏');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('系统运行良好，无需特别优化');
  }
  
  return recommendations;
}
