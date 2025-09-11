'use client';

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';

// 月度招聘趋势图
interface MonthlyTrendProps {
  data: Array<{
    month: string;
    total: number;
    hired: number;
    rejected: number;
    interviewing: number;
    trial: number;
  }>;
}

export function MonthlyTrendChart({ data }: MonthlyTrendProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>月度招聘趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="total"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
              name="总面试人数"
            />
            <Area
              type="monotone"
              dataKey="hired"
              stackId="2"
              stroke="#82ca9d"
              fill="#82ca9d"
              name="已录用"
            />
            <Area
              type="monotone"
              dataKey="trial"
              stackId="2"
              stroke="#ffc658"
              fill="#ffc658"
              name="试岗中"
            />
            <Area
              type="monotone"
              dataKey="interviewing"
              stackId="2"
              stroke="#ff7300"
              fill="#ff7300"
              name="面试中"
            />
            <Area
              type="monotone"
              dataKey="rejected"
              stackId="2"
              stroke="#ff0000"
              fill="#ff0000"
              name="已拒绝"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// 状态分布饼图
interface StatusDistributionProps {
  data: Array<{
    status: string;
    count: number;
    value: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function StatusDistributionChart({ data }: StatusDistributionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>招聘状态分布</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ status, count, percent }) => 
                `${status}: ${count} (${(percent * 100).toFixed(1)}%)`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// 试岗通过率趋势图
interface TrialPassRateProps {
  data: Array<{
    month: string;
    total: number;
    passed: number;
    passRate: number;
  }>;
}

export function TrialPassRateChart({ data }: TrialPassRateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>试岗通过率趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="total" fill="#8884d8" name="试岗总人数" />
            <Bar yAxisId="left" dataKey="passed" fill="#82ca9d" name="通过人数" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="passRate"
              stroke="#ff7300"
              strokeWidth={2}
              name="通过率(%)"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// 招聘渠道分析图
interface ChannelAnalysisProps {
  data: Array<{
    channel: string;
    total: number;
    hired: number;
    hireRate: number;
  }>;
}

export function ChannelAnalysisChart({ data }: ChannelAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>招聘渠道分析</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="channel" type="category" width={80} />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" name="总面试人数" />
            <Bar dataKey="hired" fill="#82ca9d" name="录用人数" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// 关键指标卡片
interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  suffix?: string;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  suffix = '' 
}: MetricCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return '↗';
      case 'decrease':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon && <div className="text-2xl">{icon}</div>}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">
                {value}{suffix}
              </p>
              {change !== undefined && (
                <p className={`text-xs ${getChangeColor()}`}>
                  {getChangeIcon()} {Math.abs(change)}% 较上月
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
