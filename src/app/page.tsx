'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  Award,
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


export default function HomePage() {
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(true);

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

    fetchSystemHealth();

    // 每30秒刷新一次系统状态
    const interval = setInterval(() => {
      fetchSystemHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* 欢迎横幅 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 mb-8 shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">欢迎使用呈尚策划人事管理系统</h1>
            <p className="text-blue-100 text-lg">数字化人事管理，提升企业运营效率</p>
          </div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-24 w-24 rounded-full bg-white/5"></div>
        </div>


        {/* 系统健康状态 */}
        {!healthLoading && systemHealth && (
          <Card className="mb-8 border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  系统状态监控
                </span>
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
                  <Database className="h-4 w-4" />
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
              <Card key={module.title} className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  module.color === 'bg-blue-500' ? 'from-blue-500/5 to-blue-600/10' : 'from-green-500/5 to-green-600/10'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${
                      module.color === 'bg-blue-500' ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'
                    } text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                        {module.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      {module.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                          <div className={`h-2 w-2 rounded-full ${
                            module.color === 'bg-blue-500' ? 'bg-blue-500' : 'bg-green-500'
                          } group-hover:scale-125 transition-transform duration-300`} />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button asChild className={`flex-1 ${
                        module.color === 'bg-blue-500' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                      } text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}>
                        <Link href={module.href} className="flex items-center justify-center">
                          进入系统
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
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
        <Card className="mt-8 border-0 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/10"></div>
          <CardContent className="relative z-10 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 border border-blue-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    招聘记录管理系统
                  </h4>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p className="font-medium">
                    <span className="text-blue-600 font-bold">目的：</span>规范招聘流程，提升人才筛选效率
                  </p>
                  <div>
                    <p className="font-medium mb-3">
                      <span className="text-blue-600 font-bold">核心价值：</span>
                    </p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <span>标准化面试流程，减少主观判断偏差</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <span>数据化试岗管理，量化员工适岗能力</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <span>招聘漏斗分析，优化人才获取渠道</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <span>降低招聘成本，提高人岗匹配度</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="group p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 border border-green-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <Award className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-xl text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                    员工贡献评估系统
                  </h4>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p className="font-medium">
                    <span className="text-green-600 font-bold">目的：</span>激发员工潜能，构建公平激励机制
                  </p>
                  <div>
                    <p className="font-medium mb-3">
                      <span className="text-green-600 font-bold">核心价值：</span>
                    </p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        <span>量化工作贡献，建立透明评价体系</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        <span>积分制管理，实时反馈员工表现</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        <span>年度评优机制，树立榜样激励团队</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        <span>数据驱动决策，优化人力资源配置</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
