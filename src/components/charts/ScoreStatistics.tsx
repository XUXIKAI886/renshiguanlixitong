'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Badge } from '@/components/ui/basic/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface StatisticsData {
  employeeRanking: Array<{
    _id: string;
    employeeId: string;
    name: string;
    department?: string;
    position?: string;
    totalScore: number;
  }>;
  behaviorStats: Array<{
    _id: string;
    totalScore: number;
    count: number;
    avgScore: number;
  }>;
  monthlyTrend: Array<{
    month: number;
    monthName: string;
    addition: number;
    deduction: number;
    additionCount: number;
    deductionCount: number;
  }>;
  departmentComparison: Array<{
    _id: string;
    totalScore: number;
    avgScore: number;
    employeeCount: number;
  }>;
  overallStats: {
    totalRecords: number;
    totalPositiveScore: number;
    totalNegativeScore: number;
    avgScore: number;
  };
}

export function ScoreStatistics() {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/scores/statistics?year=${selectedYear}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [selectedYear]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">暂无统计数据</p>
        </CardContent>
      </Card>
    );
  }

  // 图表颜色配置
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // 准备部门对比数据
  const departmentChartData = data.departmentComparison.map(dept => ({
    name: dept._id,
    totalScore: dept.totalScore,
    avgScore: Math.round(dept.avgScore * 10) / 10,
    employeeCount: dept.employeeCount
  }));

  // 准备行为统计数据
  const behaviorChartData = data.behaviorStats.slice(0, 10).map(behavior => ({
    name: behavior._id,
    count: behavior.count,
    totalScore: behavior.totalScore
  }));

  return (
    <div className="space-y-6">
      {/* 年份选择 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">积分统计分析</h2>
        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <SelectItem key={year} value={year.toString()}>
                  {year}年
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 月度积分趋势 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              月度积分趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthName" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    value, 
                    name === 'addition' ? '加分' : '扣分'
                  ]}
                />
                <Bar dataKey="addition" fill="#10B981" name="加分" />
                <Bar dataKey="deduction" fill="#EF4444" name="扣分" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 部门积分对比 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              部门积分对比
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    value, 
                    name === 'totalScore' ? '总积分' : '平均积分'
                  ]}
                />
                <Bar dataKey="totalScore" fill="#3B82F6" name="总积分" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 行为类型统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              行为类型统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={behaviorChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {behaviorChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 积分分布统计 */}
        <Card>
          <CardHeader>
            <CardTitle>积分分布统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    +{data.overallStats.totalPositiveScore}
                  </div>
                  <div className="text-sm text-green-600">总加分</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {data.overallStats.totalNegativeScore}
                  </div>
                  <div className="text-sm text-red-600">总扣分</div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {data.overallStats.avgScore.toFixed(1)}
                </div>
                <div className="text-sm text-blue-600">平均分值</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {data.overallStats.totalRecords}
                </div>
                <div className="text-sm text-gray-600">总记录数</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 部门详细信息 */}
      <Card>
        <CardHeader>
          <CardTitle>部门详细统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.departmentComparison.map((dept) => (
              <div key={dept._id} className="p-4 border rounded-lg">
                <div className="font-medium text-lg mb-2">{dept._id}</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">员工数量:</span>
                    <Badge variant="outline">{dept.employeeCount}人</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">总积分:</span>
                    <Badge variant={dept.totalScore >= 0 ? "default" : "destructive"}>
                      {dept.totalScore >= 0 ? '+' : ''}{dept.totalScore}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">平均积分:</span>
                    <Badge variant="secondary">
                      {dept.avgScore.toFixed(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
