// 性能监控工具

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = process.env.NODE_ENV === 'development';

  // 开始计时
  start(name: string): void {
    if (!this.enabled) return;
    
    this.metrics.set(name, {
      name,
      startTime: performance.now()
    });
  }

  // 结束计时
  end(name: string): number | null {
    if (!this.enabled) return null;
    
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;

    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  // 测量函数执行时间
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) return fn();
    
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  // 测量同步函数执行时间
  measureSync<T>(name: string, fn: () => T): T {
    if (!this.enabled) return fn();
    
    this.start(name);
    try {
      const result = fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  // 获取所有指标
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
  }

  // 清除所有指标
  clear(): void {
    this.metrics.clear();
  }

  // 获取平均响应时间
  getAverageTime(name: string): number | null {
    const metrics = this.getMetrics().filter(m => m.name === name);
    if (metrics.length === 0) return null;
    
    const total = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / metrics.length;
  }
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();

// 装饰器：自动测量API响应时间
export function measureApiTime(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  
  descriptor.value = async function (...args: any[]) {
    const apiName = `API: ${propertyName}`;
    return performanceMonitor.measure(apiName, () => method.apply(this, args));
  };
  
  return descriptor;
}

// React Hook：测量组件渲染时间
export function usePerformanceMonitor(componentName: string) {
  const startTime = performance.now();
  
  return {
    markRenderComplete: () => {
      const duration = performance.now() - startTime;
      console.log(`🎨 ${componentName} render: ${duration.toFixed(2)}ms`);
    }
  };
}

// 内存使用监控
export function logMemoryUsage(label: string = 'Memory Usage') {
  if (typeof window === 'undefined') return;
  
  // @ts-ignore
  if (performance.memory) {
    // @ts-ignore
    const memory = performance.memory;
    console.log(`💾 ${label}:`, {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    });
  }
}

// 网络请求监控
export async function monitoredFetch(url: string, options?: RequestInit): Promise<Response> {
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, options);
    const duration = performance.now() - startTime;
    
    console.log(`🌐 ${options?.method || 'GET'} ${url}: ${duration.toFixed(2)}ms (${response.status})`);
    
    return response;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`🌐 ${options?.method || 'GET'} ${url}: ${duration.toFixed(2)}ms (ERROR)`, error);
    throw error;
  }
}

// 数据库查询性能监控（用于API路由）
export function withDbPerformanceMonitor<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  queryName: string
) {
  return async (...args: T): Promise<R> => {
    return performanceMonitor.measure(`DB: ${queryName}`, () => fn(...args));
  };
}

// 批量操作性能监控
export async function monitorBatchOperation<T>(
  items: T[],
  operation: (item: T) => Promise<any>,
  batchSize: number = 10,
  operationName: string = 'Batch Operation'
): Promise<any[]> {
  const results: any[] = [];
  const totalBatches = Math.ceil(items.length / batchSize);
  
  console.log(`🔄 Starting ${operationName}: ${items.length} items in ${totalBatches} batches`);
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    
    const batchResults = await performanceMonitor.measure(
      `${operationName} - Batch ${batchNumber}`,
      () => Promise.all(batch.map(operation))
    );
    
    results.push(...batchResults);
  }
  
  console.log(`✅ ${operationName} completed: ${results.length} items processed`);
  return results;
}
