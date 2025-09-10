'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageContainer } from '@/components/layout';
import EmployeeForm from '@/components/forms/EmployeeForm';
import EmployeeList from '@/components/forms/EmployeeList';
import { Employee } from '@/types';

interface PaginatedResponse {
  employees: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filters, setFilters] = useState<any>({});

  // 获取员工列表
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchKeyword && { keyword: searchKeyword }),
        ...(filters.department && { department: filters.department }),
        ...(filters.position && { position: filters.position }),
        ...(filters.workStatus && { workStatus: filters.workStatus }),
      });

      const response = await fetch(`/api/employees?${params}`);
      const data = await response.json();

      if (data.success) {
        setEmployees(data.data.employees);
        setPagination(data.data.pagination);
      } else {
        toast.error(data.error || '获取员工列表失败');
      }
    } catch (error) {
      console.error('获取员工列表失败:', error);
      toast.error('获取员工列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 创建员工
  const handleCreate = async (data: any) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('员工创建成功');
        setIsFormOpen(false);
        fetchEmployees();
      } else {
        toast.error(result.error || '创建失败');
      }
    } catch (error) {
      console.error('创建员工失败:', error);
      toast.error('创建员工失败');
    }
  };

  // 更新员工
  const handleUpdate = async (data: any) => {
    if (!editingEmployee?._id) return;

    try {
      const response = await fetch(`/api/employees/${editingEmployee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('员工信息更新成功');
        setIsFormOpen(false);
        setEditingEmployee(null);
        fetchEmployees();
      } else {
        toast.error(result.error || '更新失败');
      }
    } catch (error) {
      console.error('更新员工信息失败:', error);
      toast.error('更新员工信息失败');
    }
  };

  // 删除员工
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('员工删除成功');
        fetchEmployees();
      } else {
        toast.error(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除员工失败:', error);
      toast.error('删除员工失败');
    }
  };

  // 处理编辑
  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  // 处理新增
  const handleAdd = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  // 处理搜索
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // 处理筛选
  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // 关闭表单
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  // 初始加载和依赖更新
  useEffect(() => {
    fetchEmployees();
  }, [pagination.page, searchKeyword, filters]);

  return (
    <PageContainer
      title="员工信息管理"
      description="管理员工档案、在职状况、部门岗位等信息"
    >
      <EmployeeList
        employees={employees}
        total={pagination.total}
        page={pagination.page}
        limit={pagination.limit}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        isLoading={isLoading}
      />

      {/* 表单弹窗 */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? '编辑员工信息' : '新增员工'}
            </DialogTitle>
          </DialogHeader>
          <EmployeeForm
            initialData={editingEmployee || undefined}
            onSubmit={editingEmployee ? handleUpdate : handleCreate}
            onCancel={handleCloseForm}
            mode={editingEmployee ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
