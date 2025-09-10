'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout';
import { 
  MetricCard,
  MonthlyTrendChart,
  StatusDistributionChart,
  TrialPassRateChart,
  ChannelAnalysisChart
} from '@/components/charts/RecruitmentCharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, UserCheck, UserX, Clock } from 'lucide-react';

interface DashboardData {
  basicStats: {
    totalCandidates: number;
    hiredCount: number;
    rejectedCount: number;
    interviewingCount: number;
    trialCount: number;
    hireRate: number;
    avgTrialDays: number;
  };
  monthlyTrend: Array<{
    month: string;
    total: number;
    hired: number;
    rejected: number;
    interviewing: number;
    trial: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    value: string;
  }>;
  trialPassRateTrend: Array<{
    month: string;
    total: number;
    passed: number;
    passRate: number;
  }>;
  channelAnalysis: Array<{
    channel: string;
    total: number;
    hired: number;
    hireRate: number;
  }>;
}

export default function RecruitmentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // 获取仪表盘数据
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/recruitment/stats?year=${selectedYear}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error || '获取仪表盘数据失败');
      }
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      toast.error('获取仪表盘数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // 年份变更
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  // 初始加载和年份变更时重新获取数据
  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear]);

  // 生成年份选项
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (isLoading && !data) {
    return (
      <PageContainer
        title="招聘仪表盘"
        description="招聘数据统计分析与可视化展示"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>加载中...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="招聘仪表盘"
      description="招聘数据统计分析与可视化展示"
    >
      <div className="space-y-6">
        {/* 控制栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="选择年份" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}年
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
        </div>

        {data && (
          <>
            {/* 关键指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="总面试人数"
                value={data.basicStats.totalCandidates}
                icon={<Users />}
                suffix="人"
              />
              <MetricCard
                title="录用人数"
                value={data.basicStats.hiredCount}
                icon={<UserCheck />}
                suffix="人"
                changeType="increase"
              />
              <MetricCard
                title="录用率"
                value={data.basicStats.hireRate.toFixed(1)}
                icon={<UserCheck />}
                suffix="%"
                changeType="increase"
              />
              <MetricCard
                title="平均试岗天数"
                value={data.basicStats.avgTrialDays.toFixed(1)}
                icon={<Clock />}
                suffix="天"
                changeType="neutral"
              />
            </div>

            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 月度趋势图 */}
              <div className="lg:col-span-2">
                <MonthlyTrendChart data={data.monthlyTrend} />
              </div>

              {/* 状态分布图 */}
              <StatusDistributionChart data={data.statusDistribution} />

              {/* 试岗通过率趋势 */}
              <TrialPassRateChart data={data.trialPassRateTrend} />

              {/* 招聘渠道分析 */}
              <div className="lg:col-span-2">
                <ChannelAnalysisChart data={data.channelAnalysis} />
              </div>
            </div>

            {/* 数据摘要 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">面试状态</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>面试中:</span>
                    <span className="font-medium">{data.basicStats.interviewingCount}人</span>
                  </div>
                  <div className="flex justify-between">
                    <span>试岗中:</span>
                    <span className="font-medium">{data.basicStats.trialCount}人</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">录用情况</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>已录用:</span>
                    <span className="font-medium">{data.basicStats.hiredCount}人</span>
                  </div>
                  <div className="flex justify-between">
                    <span>录用率:</span>
                    <span className="font-medium">{data.basicStats.hireRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">拒绝情况</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>已拒绝:</span>
                    <span className="font-medium">{data.basicStats.rejectedCount}人</span>
                  </div>
                  <div className="flex justify-between">
                    <span>拒绝率:</span>
                    <span className="font-medium">
                      {((data.basicStats.rejectedCount / data.basicStats.totalCandidates) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
