import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import { AnnualAward, Employee, ScoreRecord } from '@/models';

// 年度评优生成验证模式
const generateAwardSchema = z.object({
  year: z.number().int().min(2020).max(new Date().getFullYear()),
  forceRegenerate: z.boolean().optional().default(false)
});

// POST - 生成年度评优结果
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = generateAwardSchema.parse(body);
    const { year, forceRegenerate } = validatedData;

    // 检查是否已生成该年度评优
    const existingAwards = await AnnualAward.countDocuments({ year });
    if (existingAwards > 0 && !forceRegenerate) {
      return NextResponse.json(
        { 
          success: false, 
          error: `${year}年度评优已生成，如需重新生成请设置forceRegenerate为true` 
        },
        { status: 400 }
      );
    }

    // 获取该年度所有在职员工
    const employees = await Employee.find({ 
      workStatus: 'active',
      hireDate: { $lte: new Date(`${year}-12-31`) }
    }).select('employeeId name department position totalScore hireDate');

    if (employees.length === 0) {
      return NextResponse.json(
        { success: false, error: `${year}年度没有符合条件的员工` },
        { status: 400 }
      );
    }

    // 获取该年度的积分记录，计算每个员工的年度积分
    const yearStart = new Date(`${year}-01-01`);
    const yearEnd = new Date(`${year}-12-31`);

    const yearlyScores = await ScoreRecord.aggregate([
      {
        $match: {
          recordDate: { $gte: yearStart, $lte: yearEnd }
        }
      },
      {
        $group: {
          _id: '$employeeId',
          yearlyScore: { $sum: '$scoreChange' },
          recordCount: { $sum: 1 }
        }
      }
    ]);

    // 构建员工评优数据 - 简化为直接使用总积分排序
    const evaluationData = employees.map(employee => {
      const yearlyScoreData = yearlyScores.find(
        score => score._id === employee.employeeId
      );
      
      // 直接使用员工总积分作为最终得分
      const finalScore = employee.totalScore || 0;

      return {
        employeeId: employee.employeeId,
        finalScore: finalScore,
        yearlyScore: yearlyScoreData?.yearlyScore || 0,
        totalScore: employee.totalScore || 0,
        recordCount: yearlyScoreData?.recordCount || 0
      };
    });

    // 过滤掉得分过低的员工（最终得分低于0分不参与评优）
    const qualifiedData = evaluationData.filter(data => data.finalScore >= 0);

    if (qualifiedData.length === 0) {
      return NextResponse.json(
        { success: false, error: `${year}年度没有符合评优条件的员工（最终得分需≥0分）` },
        { status: 400 }
      );
    }

    // 使用模型的静态方法生成年度评优结果
    const awards = await AnnualAward.generateAnnualAwards(year, qualifiedData);

    // 获取生成的评优结果（包含员工信息）
    const awardsWithEmployeeInfo = await Promise.all(
      awards.map(async (award) => {
        const employee = await Employee.findOne({ employeeId: award.employeeId });
        const evaluationInfo = evaluationData.find(data => data.employeeId === award.employeeId);
        
        return {
          ...award.toObject(),
          employeeId: employee ? {
            _id: employee._id,
            employeeId: employee.employeeId,
            name: employee.name,
            department: employee.department,
            position: employee.position
          } : {
            _id: null,
            employeeId: award.employeeId,
            name: '未知员工',
            department: '未知',
            position: '未知'
          },
          evaluationDetails: {
            yearlyScore: evaluationInfo?.yearlyScore || 0,
            totalScore: evaluationInfo?.totalScore || 0,
            recordCount: evaluationInfo?.recordCount || 0
          }
        };
      })
    );

    // 统计信息
    const statistics = {
      totalEmployees: employees.length,
      qualifiedEmployees: qualifiedData.length,
      awardedEmployees: awards.length,
      totalBonusAmount: awards.reduce((sum, award) => sum + award.bonusAmount, 0),
      awardLevelCounts: {
        special: awards.filter(a => a.awardLevel === 'special').length,
        first: awards.filter(a => a.awardLevel === 'first').length,
        second: awards.filter(a => a.awardLevel === 'second').length,
        excellent: awards.filter(a => a.awardLevel === 'excellent').length
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        awards: awardsWithEmployeeInfo,
        statistics
      },
      message: `${year}年度评优生成成功，共产生${awards.length}个获奖名额`
    });

  } catch (error) {
    console.error('生成年度评优失败:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: '数据验证失败',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '生成年度评优失败' },
      { status: 500 }
    );
  }
}
