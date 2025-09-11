'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/layout/table';
import { Badge } from '@/components/ui/basic/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/interaction/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/interaction/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/layout/dropdown-menu';
import { IdCardDisplay } from '@/components/ui/form/id-card-display';
import { PasswordVerification } from '@/components/ui/form/password-verification';
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
  Calendar,
  Trophy
} from 'lucide-react';
import { Employee } from '@/types';
import { GENDER_LABELS, WORK_STATUS_LABELS, DEPARTMENTS, POSITIONS } from '@/constants';
import { formatDate, calculateWorkingDays } from '@/utils';
import { exportToExcel, formatEmployeeDataForExport } from '@/utils/export';
import { toast } from 'sonner';

interface EmployeeListProps {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSearch: (keyword: string) => void;
  onFilter: (filters: any) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  isLoading?: boolean;
}

// 状态颜色映射
const statusColors = {
  active: 'bg-green-100 text-green-800',
  resigned: 'bg-red-100 text-red-800',
  leave: 'bg-yellow-100 text-yellow-800',
};

export default function EmployeeList({
  employees,
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
}: EmployeeListProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // 密码验证相关状态
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'edit' | 'delete';
    employee: Employee;
  } | null>(null);

  const totalPages = Math.ceil(total / limit);

  // 获取概览统计数据
  const fetchOverviewStats = async () => {
    try {
      const response = await fetch('/api/employees/overview');
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

  const handleFilter = () => {
    onFilter({
      department: departmentFilter !== 'all' ? departmentFilter : '',
      position: positionFilter !== 'all' ? positionFilter : '',
      workStatus: statusFilter !== 'all' ? statusFilter : '',
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 处理编辑操作
  const handleEditClick = (employee: Employee) => {
    setPendingAction({ type: 'edit', employee });
    setShowPasswordDialog(true);
  };

  // 处理删除操作
  const handleDeleteClick = (employee: Employee) => {
    setPendingAction({ type: 'delete', employee });
    setShowPasswordDialog(true);
  };

  // 密码验证成功后执行操作
  const handlePasswordSuccess = () => {
    if (pendingAction) {
      if (pendingAction.type === 'edit') {
        onEdit(pendingAction.employee);
      } else if (pendingAction.type === 'delete') {
        onDelete(pendingAction.employee._id!);
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
      const formattedData = formatEmployeeDataForExport(employees);
      const success = exportToExcel(
        formattedData,
        `员工信息_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}`,
        '员工信息'
      );

      if (success) {
        toast.success('员工信息导出成功');
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
      key: 'totalEmployees',
      title: '员工总数',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      key: 'activeEmployees',
      title: '在职员工数',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      key: 'avgWorkDays',
      title: '平均在职天数',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      key: 'topScoreEmployee',
      title: '积分最多员工',
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
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
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {statConfig.title}
                    </p>
                    <div className="flex items-baseline gap-1 mt-2">
                      {statConfig.key === 'topScoreEmployee' ? (
                        <div className="space-y-1">
                          {statsLoading ? (
                            <p className="text-lg font-bold">...</p>
                          ) : statData?.value ? (
                            <>
                              <p className="text-lg font-bold">{statData.value.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {statData.value.score}分 | {statData.value.department} | {statData.value.position}
                              </p>
                            </>
                          ) : (
                            <p className="text-lg font-bold">暂无数据</p>
                          )}
                        </div>
                      ) : (
                        <>
                          <p className="text-2xl font-bold">
                            {statsLoading ? '...' : (statData?.value || '0')}
                          </p>
                          {statData?.unit && (
                            <span className="text-sm text-muted-foreground">
                              {statData.unit}
                            </span>
                          )}
                        </>
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
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              员工信息管理
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出Excel
              </Button>
              <Button onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                新增员工
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="搜索姓名、员工ID或手机号..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* 快速筛选器 */}
            <div className="flex gap-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.entries(WORK_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleFilter} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                筛选
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
                  <label className="text-sm font-medium">岗位</label>
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择岗位" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部岗位</SelectItem>
                      {POSITIONS.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">转正开始日期</label>
                  <Input type="date" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">转正结束日期</label>
                  <Input type="date" className="mt-1" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowFilters(false)}>
                  取消
                </Button>
                <Button onClick={handleFilter}>应用筛选</Button>
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
                  <TableHead>员工ID</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>性别</TableHead>
                  <TableHead>手机号码</TableHead>
                  <TableHead>身份证号</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>岗位</TableHead>
                  <TableHead>在职状况</TableHead>
                  <TableHead>在职天数</TableHead>
                  <TableHead>总积分</TableHead>
                  <TableHead>转正日期</TableHead>
                  <TableHead>今日日期</TableHead>
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
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee._id}>
                      <TableCell className="font-medium">
                        {employee.employeeId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {employee.name}
                      </TableCell>
                      <TableCell>
                        {GENDER_LABELS[employee.gender]}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {employee.phone}
                      </TableCell>
                      <TableCell>
                        <IdCardDisplay idCard={employee.idCard} />
                      </TableCell>
                      <TableCell>
                        {employee.department || '未分配'}
                      </TableCell>
                      <TableCell>
                        {employee.position || '未分配'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[employee.workStatus]}>
                          {WORK_STATUS_LABELS[employee.workStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium text-green-600">
                          {employee.workStatus === 'active' 
                            ? calculateWorkingDays(new Date(employee.regularDate))
                            : employee.workingDays} 天
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium text-blue-600">
                          {employee.totalScore}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatDate(employee.regularDate)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(new Date())}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(employee)}>
                              <Edit className="h-4 w-4 mr-2" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(employee)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              设置离职
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
        title={pendingAction?.type === 'edit' ? '编辑验证' : '离职设置验证'}
        description={
          pendingAction?.type === 'edit'
            ? '为保护数据安全，请输入编辑密码'
            : '为保护数据安全，请输入离职设置密码'
        }
      />
    </div>
  );
}
