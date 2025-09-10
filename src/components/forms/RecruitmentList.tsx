'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { IdCardDisplay } from '@/components/ui/id-card-display';
import { PasswordVerification } from '@/components/ui/password-verification';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  Download,
  Users,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import { RecruitmentRecord } from '@/types';
import { GENDER_LABELS, TRIAL_STATUS_LABELS, RECRUITMENT_STATUS_LABELS } from '@/constants';
import { formatDate } from '@/utils';
import { exportToExcel, formatRecruitmentDataForExport } from '@/utils/export';
import { toast } from 'sonner';

interface RecruitmentListProps {
  records: RecruitmentRecord[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSearch: (keyword: string) => void;
  onFilter: (filters: any) => void;
  onEdit: (record: RecruitmentRecord) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  isLoading?: boolean;
}

// 状态颜色映射
const statusColors = {
  interviewing: 'bg-blue-100 text-blue-800',
  trial: 'bg-yellow-100 text-yellow-800',
  hired: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function RecruitmentList({
  records,
  total,
  page,
  limit,
  onPageChange,
  onSearch,
  onFilter,
  onEdit,
  onDelete,
  onAdd,
  isLoading = false
}: RecruitmentListProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // 密码验证相关状态
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'edit' | 'delete';
    record: RecruitmentRecord;
  } | null>(null);

  const totalPages = Math.ceil(total / limit);

  // 获取概览统计数据
  const fetchOverviewStats = async () => {
    try {
      const response = await fetch('/api/recruitment/overview');
      const result = await response.json();
      if (result.success) {
        setOverviewStats(result.data);
      }
    } catch (error) {
      console.error('获取概览统计失败:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const handleSearch = () => {
    onSearch(searchKeyword);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    onFilter({ status });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 处理编辑操作
  const handleEditClick = (record: RecruitmentRecord) => {
    setPendingAction({ type: 'edit', record });
    setShowPasswordDialog(true);
  };

  // 处理删除操作
  const handleDeleteClick = (record: RecruitmentRecord) => {
    setPendingAction({ type: 'delete', record });
    setShowPasswordDialog(true);
  };

  // 密码验证成功后执行操作
  const handlePasswordSuccess = () => {
    if (pendingAction) {
      if (pendingAction.type === 'edit') {
        onEdit(pendingAction.record);
      } else if (pendingAction.type === 'delete') {
        onDelete(pendingAction.record._id!);
      }
      setPendingAction(null);
    }
  };

  // 关闭密码对话框
  const handlePasswordClose = () => {
    setShowPasswordDialog(false);
    setPendingAction(null);
  };

  const handleExport = () => {
    try {
      const formattedData = formatRecruitmentDataForExport(records);
      const success = exportToExcel(
        formattedData,
        `招聘记录_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}`,
        '招聘记录'
      );

      if (success) {
        toast.success('招聘记录导出成功');
      } else {
        toast.error('导出失败，请重试');
      }
    } catch (error) {
      console.error('导出失败:', error);
      toast.error('导出失败，请重试');
    }
  };

  // 统计卡片配置
  const statsConfig = [
    {
      key: 'totalRecruitment',
      title: '招聘总人数',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      key: 'trialRate',
      title: '试岗率',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      key: 'trialResignationRate',
      title: '试岗离职率',
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      key: 'avgTrialDays',
      title: '平均试岗天数',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 统计概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((statConfig) => {
          const Icon = statConfig.icon;
          const statData = overviewStats?.[statConfig.key];

          return (
            <Card key={statConfig.key}>
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
                      {statData?.unit && (
                        <span className="text-sm text-muted-foreground">
                          {statData.unit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${statConfig.bgColor} ${statConfig.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 头部操作栏 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>招聘记录管理</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出Excel
              </Button>
              <Button onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                新增记录
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="搜索姓名、手机号或身份证号..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* 筛选器 */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.entries(RECRUITMENT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                更多筛选
              </Button>

              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
          </div>

          {/* 扩展筛选器 */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">面试开始日期</label>
                  <Input type="date" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">面试结束日期</label>
                  <Input type="date" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">性别</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      {Object.entries(GENDER_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowFilters(false)}>
                  取消
                </Button>
                <Button>应用筛选</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 数据表格 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>性别</TableHead>
                  <TableHead>身份证号</TableHead>
                  <TableHead>电话</TableHead>
                  <TableHead>面试日期</TableHead>
                  <TableHead>是否试岗</TableHead>
                  <TableHead>试岗日期</TableHead>
                  <TableHead>试岗天数</TableHead>
                  <TableHead>试岗状态</TableHead>
                  <TableHead>备注内容</TableHead>
                  <TableHead>招聘状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">
                        {record.candidateName}
                      </TableCell>
                      <TableCell>
                        {GENDER_LABELS[record.gender]}
                      </TableCell>
                      <TableCell>
                        <IdCardDisplay idCard={record.idCard} />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.phone}
                      </TableCell>
                      <TableCell>
                        {formatDate(record.interviewDate)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={record.hasTrial ? "default" : "outline"}>
                          {record.hasTrial ? "是" : "否"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.trialDate ? formatDate(record.trialDate) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {record.trialDays ? `${record.trialDays} 天` : '-'}
                      </TableCell>
                      <TableCell>
                        {record.trialStatus ? (
                          <Badge variant="secondary">
                            {TRIAL_STATUS_LABELS[record.trialStatus]}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="max-w-32 truncate" title={record.resignationReason}>
                        {record.resignationReason || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[record.recruitmentStatus]}>
                          {RECRUITMENT_STATUS_LABELS[record.recruitmentStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.createdAt ? formatDate(record.createdAt) : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(record)}>
                              <Edit className="h-4 w-4 mr-2" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(record)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            共 {total} 条记录，第 {page} 页，共 {totalPages} 页
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 密码验证对话框 */}
      <PasswordVerification
        isOpen={showPasswordDialog}
        onClose={handlePasswordClose}
        onSuccess={handlePasswordSuccess}
        title={pendingAction?.type === 'edit' ? '编辑验证' : '删除验证'}
        description={
          pendingAction?.type === 'edit'
            ? '为保护数据安全，请输入编辑密码'
            : '为保护数据安全，请输入删除密码'
        }
      />
    </div>
  );
}
