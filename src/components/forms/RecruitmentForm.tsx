'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RecruitmentRecord } from '@/types';
import { GENDER_LABELS, TRIAL_STATUS_LABELS, RECRUITMENT_STATUS_LABELS } from '@/constants';

// 表单验证模式
const formSchema = z.object({
  interviewDate: z.string().min(1, '面试日期不能为空'),
  candidateName: z.string().min(2, '姓名至少2个字符').max(20, '姓名最多20个字符'),
  gender: z.enum(['male', 'female'], { message: '请选择性别' }),
  idCard: z.string().regex(/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, '请输入有效的身份证号'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码'),
  trialDate: z.string().optional(),
  hasTrial: z.boolean(),
  trialDays: z.coerce.number().min(1, '试岗天数至少1天').max(90, '试岗天数最多90天').optional(),
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
      idCard: initialData?.idCard || '',
      phone: initialData?.phone || '',
      trialDate: initialData?.trialDate 
        ? format(new Date(initialData.trialDate), 'yyyy-MM-dd')
        : '',
      hasTrial: initialData?.hasTrial || false,
      trialDays: initialData?.trialDays || undefined,
      trialStatus: initialData?.trialStatus || undefined,
      resignationReason: initialData?.resignationReason || '',
      recruitmentStatus: initialData?.recruitmentStatus || 'interviewing',
    },
  });

  const watchHasTrial = form.watch('hasTrial');

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
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
                name="idCard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>身份证号 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入18位身份证号" {...field} />
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
