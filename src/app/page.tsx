'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageContainer } from '@/components/layout';
import {
  Users,
  UserPlus,
  Award,
  BarChart3,
  TrendingUp,
  Target,
  ArrowRight,
  Activity,
  Database,
  Zap
} from 'lucide-react';

const moduleCards = [
  {
    title: '招聘记录管理系统',
    description: '管理面试记录、试岗情况、招聘状态等信息，提供数据统计和分析功能',
    icon: UserPlus,
    href: '/recruitment',
    color: 'bg-blue-500',
    features: ['面试记录管理', '试岗状态跟踪', '招聘数据统计', '月度趋势分析'],
  },
  {
    title: '员工贡献评估系统',
    description: '管理员工信息、积分评估、年度评优等功能，激励员工积极性',
    icon: Award,
    href: '/employees',
    color: 'bg-green-500',
    features: ['员工档案管理', '积分评估系统', '年度评优管理', '数据可视化'],
  },
];

// 静态配置（图标和颜色）
const quickStatsConfig = [
  {
    key: 'totalInterviews',
    title: '总面试人数',
    unit: '人',
    icon: UserPlus,
    color: 'text-blue-600',
  },
  {
    key: 'activeEmployees',
    title: '在职员工',
    unit: '人',
    icon: Users,
    color: 'text-green-600',
  },
  {
    key: 'averageScore',
    title: '平均积分',
    unit: '分',
    icon: BarChart3,
    color: 'text-purple-600',
  },
  {
    key: 'trialPassRate',
    title: '试岗通过率',
    unit: '%',
    icon: Target,
    color: 'text-orange-600',
  },
];

export default function HomePage() {
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchSystemHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const result = await response.json();
        if (result.success) {
          setSystemHealth(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch system health:', error);
      } finally {
        setHealthLoading(false);
      }
    };

    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        const result = await response.json();
        if (result.success) {
          setDashboardStats(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchSystemHealth();
    fetchDashboardStats();

    // 每30秒刷新一次系统状态和统计数据
    const interval = setInterval(() => {
      fetchSystemHealth();
      fetchDashboardStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <PageContainer
      title="系统主页"
      description="欢迎使用呈尚策划人事管理系统"
    >
      {/* 快速统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStatsConfig.map((statConfig) => {
          const Icon = statConfig.icon;
          const statData = dashboardStats?.[statConfig.key];

          return (
            <Card key={statConfig.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {statConfig.title}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-bold">
                        {statsLoading ? '...' : (statData?.value || '0')}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        {statConfig.unit}
                      </span>
                    </div>
                    {!statsLoading && statData && (
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className={`h-3 w-3 ${
                          statData.isPositive ? 'text-green-500' : 'text-red-500'
                        }`} />
                        <span className={`text-xs ${
                          statData.isPositive ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {statData.trend}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${statConfig.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 系统健康状态 */}
      {!healthLoading && systemHealth && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              系统状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  systemHealth.status === 'healthy' ? 'bg-green-100 text-green-600' :
                  systemHealth.status === 'degraded' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">系统状态</p>
                  <Badge variant={
                    systemHealth.status === 'healthy' ? 'default' :
                    systemHealth.status === 'degraded' ? 'secondary' : 'destructive'
                  }>
                    {systemHealth.status === 'healthy' ? '正常' :
                     systemHealth.status === 'degraded' ? '降级' : '异常'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">数据库</p>
                  <p className="text-xs text-muted-foreground">
                    响应时间: {systemHealth.database?.responseTime}ms
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">数据统计</p>
                  <p className="text-xs text-muted-foreground">
                    员工: {systemHealth.database?.collections?.employees || 0} |
                    积分: {systemHealth.database?.collections?.scores || 0}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 核心模块卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {moduleCards.map((module) => {
          const Icon = module.icon;
          return (
            <Card key={module.title} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${module.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {module.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1 group-hover:bg-primary/90">
                      <Link href={module.href}>
                        进入系统
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 系统价值介绍 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>系统价值</CardTitle>
          <CardDescription>
            数字化人事管理，提升企业运营效率
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <UserPlus className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-lg">招聘记录管理系统</h4>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><strong className="text-foreground">目的：</strong>规范招聘流程，提升人才筛选效率</p>
                <p><strong className="text-foreground">核心价值：</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>标准化面试流程，减少主观判断偏差</li>
                  <li>数据化试岗管理，量化员工适岗能力</li>
                  <li>招聘漏斗分析，优化人才获取渠道</li>
                  <li>降低招聘成本，提高人岗匹配度</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Award className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-lg">员工贡献评估系统</h4>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><strong className="text-foreground">目的：</strong>激发员工潜能，构建公平激励机制</p>
                <p><strong className="text-foreground">核心价值：</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>量化工作贡献，建立透明评价体系</li>
                  <li>积分制管理，实时反馈员工表现</li>
                  <li>年度评优机制，树立榜样激励团队</li>
                  <li>数据驱动决策，优化人力资源配置</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
