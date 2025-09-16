'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Textarea } from '@/components/ui/form/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form/form';
import { RecruitmentRecord } from '@/types';
import { GENDER_LABELS, TRIAL_STATUS_LABELS, RECRUITMENT_STATUS_LABELS, POSITIONS } from '@/constants';

// 表单验证模式
const formSchema = z.object({
  interviewDate: z.string().min(1, '面试日期不能为空'),
  candidateName: z.string().min(2, '姓名至少2个字符').max(20, '姓名最多20个字符'),
  gender: z.enum(['male', 'female'], { message: '请选择性别' }),
  age: z.string().min(1, '年龄不能为空').refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 16 && num <= 70 && num.toString() === val;
  }, '年龄必须是16-70之间的整数'),
  idCard: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true; // 空值时通过验证
    return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(val);
  }, '请输入有效的身份证号'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码'),
  appliedPosition: z.string().default('未分配'),
  trialDate: z.string().optional(),
  hasTrial: z.boolean(),
  trialDays: z.string().optional().refine((val) => {
    if (!val) return true; // 可选字段，空值有效
    const num = parseInt(val);
    return !isNaN(num) && num >= 1 && num <= 90 && num.toString() === val;
  }, '试岗天数必须是1-90之间的整数'),
  trialStatus: z.enum(['excellent', 'good', 'average', 'poor']).optional(),
  resignationReason: z.string().max(500, '备注内容最多500字').optional(),
  recruitmentStatus: z.enum(['interviewing', 'trial', 'hired', 'rejected']),
});

type FormData = z.infer<typeof formSchema>;

interface RecruitmentFormProps {
  initialData?: Partial<RecruitmentRecord>;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export default function RecruitmentForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create'
}: RecruitmentFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interviewDate: initialData?.interviewDate
        ? format(new Date(initialData.interviewDate), 'yyyy-MM-dd')
        : '',
      candidateName: initialData?.candidateName || '',
      gender: initialData?.gender || 'male',
      age: initialData?.age?.toString() || '',
      idCard: initialData?.idCard || '',
      phone: initialData?.phone || '',
      appliedPosition: initialData?.appliedPosition || '未分配',
      trialDate: initialData?.trialDate 
        ? format(new Date(initialData.trialDate), 'yyyy-MM-dd')
        : '',
      hasTrial: initialData?.hasTrial || false,
      trialDays: initialData?.trialDays?.toString() || '',
      trialStatus: initialData?.trialStatus || undefined,
      resignationReason: initialData?.resignationReason || '',
      recruitmentStatus: initialData?.recruitmentStatus || 'interviewing',
    },
  });

  const watchHasTrial = form.watch('hasTrial');

  const handleSubmit = async (data: FormData) => {
    try {
      // 转换数字字段
      const submissionData = {
        ...data,
        age: parseInt(data.age as string),
        trialDays: data.trialDays ? parseInt(data.trialDays as string) : undefined
      };
      
      console.log('=== 前端表单提交数据 ===');
      console.log('appliedPosition:', submissionData.appliedPosition);
      console.log('完整数据:', submissionData);
      
      await onSubmit(submissionData);
    } catch (error) {
      console.error('提交表单失败:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? '新增招聘记录' : '编辑招聘记录'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* 基础信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interviewDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>面试日期 *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="candidateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>应聘姓名 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入应聘者姓名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>性别 *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择性别" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(GENDER_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>年龄 *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="请输入年龄" 
                        min="16" 
                        max="70"
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="idCard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>身份证号</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入18位身份证号（可选）" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>电话号码 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入11位手机号" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appliedPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>应聘岗位</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择应聘岗位" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="未分配">未分配</SelectItem>
                        {POSITIONS.map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 试岗信息 */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hasTrial"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel>是否试岗</FormLabel>
                  </FormItem>
                )}
              />

              {watchHasTrial && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                  <FormField
                    control={form.control}
                    name="trialDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>试岗日期</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trialDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>试岗天数</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1-90天" 
                            min="1" 
                            max="90"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trialStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>试岗状况</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择试岗状况" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(TRIAL_STATUS_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* 状态和备注 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recruitmentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>招聘状态 *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择招聘状态" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(RECRUITMENT_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="resignationReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注内容</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="请填写相关备注信息（最多500字）"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 操作按钮 */}
            <div className="flex justify-end gap-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  取消
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '提交中...' : mode === 'create' ? '创建' : '更新'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
