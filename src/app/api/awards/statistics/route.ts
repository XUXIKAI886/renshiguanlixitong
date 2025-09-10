import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { AnnualAward, Employee } from '@/models';

// GET - 获取年度评优统计数据
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const startYear = searchParams.get('startYear');
    const endYear = searchParams.get('endYear');

    // 构建时间查询条件
    let dateQuery: any = {};
    if (year) {
      dateQuery.year = parseInt(year);
    } else if (startYear || endYear) {
      const yearQuery: any = {};
      if (startYear) yearQuery.$gte = parseInt(startYear);
      if (endYear) yearQuery.$lte = parseInt(endYear);
      if (Object.keys(yearQuery).length > 0) {
        dateQuery = { year: yearQuery };
      }
    }

    // 1. 获取年度评优分布统计
    const awardLevelStats = await AnnualAward.aggregate([
      ...(Object.keys(dateQuery).length > 0 ? [{ $match: dateQuery }] : []),
      {
        $group: {
          _id: '$awardLevel',
          count: { $sum: 1 },
          totalBonus: { $sum: '$bonusAmount' },
          avgScore: { $avg: '$finalScore' },
          minScore: { $min: '$finalScore' },
          maxScore: { $max: '$finalScore' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. 获取部门获奖统计
    const departmentStats = await AnnualAward.aggregate([
      ...(Object.keys(dateQuery).length > 0 ? [{ $match: dateQuery }] : []),
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: 'employeeId',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: '$employee.department',
          count: { $sum: 1 },
          totalBonus: { $sum: '$bonusAmount' },
          avgScore: { $avg: '$finalScore' },
          awardLevels: {
            $push: '$awardLevel'
          }
        }
      },
      {
        $addFields: {
          specialCount: {
            $size: {
              $filter: {
                input: '$awardLevels',
                cond: { $eq: ['$$this', 'special'] }
              }
            }
          },
          firstCount: {
            $size: {
              $filter: {
                input: '$awardLevels',
                cond: { $eq: ['$$this', 'first'] }
              }
            }
          },
          secondCount: {
            $size: {
              $filter: {
                input: '$awardLevels',
                cond: { $eq: ['$$this', 'second'] }
              }
            }
          },
          excellentCount: {
            $size: {
              $filter: {
                input: '$awardLevels',
                cond: { $eq: ['$$this', 'excellent'] }
              }
            }
          }
        }
      },
      { $project: { awardLevels: 0 } },
      { $sort: { count: -1 } }
    ]);

    // 3. 获取年度趋势统计
    const yearlyTrend = await AnnualAward.aggregate([
      {
        $group: {
          _id: '$year',
          totalAwards: { $sum: 1 },
          totalBonus: { $sum: '$bonusAmount' },
          avgScore: { $avg: '$finalScore' },
          specialCount: {
            $sum: { $cond: [{ $eq: ['$awardLevel', 'special'] }, 1, 0] }
          },
          firstCount: {
            $sum: { $cond: [{ $eq: ['$awardLevel', 'first'] }, 1, 0] }
          },
          secondCount: {
            $sum: { $cond: [{ $eq: ['$awardLevel', 'second'] }, 1, 0] }
          },
          excellentCount: {
            $sum: { $cond: [{ $eq: ['$awardLevel', 'excellent'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 4. 获取员工获奖排行榜（多年累计）
    const employeeRanking = await AnnualAward.aggregate([
      ...(Object.keys(dateQuery).length > 0 ? [{ $match: dateQuery }] : []),
      {
        $group: {
          _id: '$employeeId',
          totalAwards: { $sum: 1 },
          totalBonus: { $sum: '$bonusAmount' },
          avgScore: { $avg: '$finalScore' },
          bestRank: { $min: '$rank' },
          awards: {
            $push: {
              year: '$year',
              rank: '$rank',
              awardLevel: '$awardLevel',
              finalScore: '$finalScore',
              bonusAmount: '$bonusAmount'
            }
          }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'employeeId',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $project: {
          employeeId: '$_id',
          name: '$employee.name',
          department: '$employee.department',
          position: '$employee.position',
          totalAwards: 1,
          totalBonus: 1,
          avgScore: 1,
          bestRank: 1,
          awards: 1
        }
      },
      { $sort: { totalAwards: -1, totalBonus: -1 } },
      { $limit: 20 }
    ]);

    // 5. 获取总体统计
    const overallStats = await AnnualAward.aggregate([
      ...(Object.keys(dateQuery).length > 0 ? [{ $match: dateQuery }] : []),
      {
        $group: {
          _id: null,
          totalAwards: { $sum: 1 },
          totalBonus: { $sum: '$bonusAmount' },
          avgScore: { $avg: '$finalScore' },
          minScore: { $min: '$finalScore' },
          maxScore: { $max: '$finalScore' }
        }
      }
    ]);

    // 6. 获取已生成评优的年份列表
    const availableYears = await AnnualAward.distinct('year');
    availableYears.sort((a, b) => b - a);

    return NextResponse.json({
      success: true,
      data: {
        awardLevelStats,
        departmentStats,
        yearlyTrend,
        employeeRanking,
        overallStats: overallStats[0] || {
          totalAwards: 0,
          totalBonus: 0,
          avgScore: 0,
          minScore: 0,
          maxScore: 0
        },
        availableYears
      }
    });

  } catch (error) {
    console.error('获取年度评优统计失败:', error);
    return NextResponse.json(
      { success: false, error: '获取年度评优统计失败' },
      { status: 500 }
    );
  }
}
