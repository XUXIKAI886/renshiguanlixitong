'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/layout/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Search, Filter, Download, Plus, RefreshCw } from 'lucide-react';
import { TableLoading, EmptyState } from './loading-spinner';

export interface Column<T> {
  key: string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  actions?: {
    add?: {
      label: string;
      onClick: () => void;
    };
    export?: {
      label: string;
      onClick: () => void;
    };
    refresh?: {
      onClick: () => void;
    };
  };
  onSearch?: (keyword: string) => void;
  onFilter?: (filters: Record<string, string>) => void;
  onPageChange?: (page: number) => void;
  emptyText?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  loading = false,
  total = 0,
  page = 1,
  pageSize = 10,
  searchPlaceholder = '搜索...',
  filters = [],
  actions,
  onSearch,
  onFilter,
  onPageChange,
  emptyText = '暂无数据',
  className
}: DataTableProps<T>) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const handleSearch = () => {
    onSearch?.(searchKeyword);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFilter?.(newFilters);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex gap-2">
            {actions?.export && (
              <Button variant="outline" onClick={actions.export.onClick}>
                <Download className="h-4 w-4 mr-2" />
                {actions.export.label}
              </Button>
            )}
            {actions?.refresh && (
              <Button variant="outline" onClick={actions.refresh.onClick}>
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            )}
            {actions?.add && (
              <Button onClick={actions.add.onClick}>
                <Plus className="h-4 w-4 mr-2" />
                {actions.add.label}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {onSearch && (
            <div className="flex-1 flex gap-2">
              <Input
                placeholder={searchPlaceholder}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {filters.length > 0 && (
            <div className="flex gap-2">
              {filters.map((filter) => (
                <Select
                  key={filter.key}
                  value={filterValues[filter.key] || 'all'}
                  onValueChange={(value) => handleFilterChange(filter.key, value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部{filter.label}</SelectItem>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          )}
        </div>

        {/* 统计信息 */}
        {total > 0 && (
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              共 {total} 条记录
            </div>
          </div>
        )}

        {/* 表格 */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead 
                    key={column.key}
                    style={{ width: column.width }}
                    className={column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}
                  >
                    {column.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <TableLoading rows={5} columns={columns.length} />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <EmptyState message={emptyText} />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((record, index) => (
                  <TableRow key={record.id || record._id || index}>
                    {columns.map((column) => (
                      <TableCell 
                        key={column.key}
                        className={column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}
                      >
                        {column.render 
                          ? column.render(record[column.key], record, index)
                          : record[column.key]
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              第 {page} 页，共 {totalPages} 页
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
