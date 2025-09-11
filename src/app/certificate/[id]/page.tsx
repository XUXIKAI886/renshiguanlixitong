'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/basic/button';
import { Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AwardData {
  _id: string;
  year: number;
  employeeId: {
    _id: string;
    employeeId: string;
    name: string;
    department: string;
    position: string;
  };
  finalScore: number;
  rank: number;
  awardLevel: string;
  bonusAmount: number;
  createdAt: string;
}

// 奖项等级配置
const AWARD_CONFIGS = {
  special: {
    title: '特等奖',
    color: '#FFD700',
    bgColor: 'from-yellow-50 to-yellow-100',
    description: '年度最佳员工',
    icon: '🏆'
  },
  first: {
    title: '一等奖',
    color: '#C0C0C0',
    bgColor: 'from-gray-50 to-gray-100',
    description: '年度优秀员工',
    icon: '🥇'
  },
  second: {
    title: '二等奖',
    color: '#CD7F32',
    bgColor: 'from-orange-50 to-orange-100',
    description: '年度表现优异员工',
    icon: '🥈'
  },
  excellent: {
    title: '优秀员工',
    color: '#4CAF50',
    bgColor: 'from-green-50 to-green-100',
    description: '年度优秀员工',
    icon: '⭐'
  }
};

export default function CertificatePage() {
  const params = useParams();
  const [award, setAward] = useState<AwardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAward = async () => {
      try {
        const response = await fetch(`/api/awards/${params.id}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setAward(result.data);
          } else {
            console.error('API返回错误:', result.error);
          }
        } else {
          console.error('API请求失败:', response.status);
        }
      } catch (error) {
        console.error('获取获奖记录失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchAward();
    }
  }, [params.id]);

  const handleDownload = async () => {
    try {
      // 方案1: 尝试使用现代浏览器的截图API
      if ('getDisplayMedia' in navigator.mediaDevices) {
        // 提示用户使用浏览器的打印功能
        const userChoice = confirm(
          '建议使用以下方式保存证书：\n\n' +
          '1. 点击"确定"打开打印预览，然后选择"保存为PDF"\n' +
          '2. 点击"取消"，然后右键点击证书区域选择"保存图片"\n\n' +
          '是否打开打印预览？'
        );

        if (userChoice) {
          // 打开打印预览
          window.print();
        }
        return;
      }

      // 方案2: 降级到html2canvas（可能失败）
      const certificateElement = document.getElementById('certificate');
      if (!certificateElement) return;

      const html2canvas = await import('html2canvas');

      // 尝试使用更兼容的配置
      const canvas = await html2canvas.default(certificateElement, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true,
        foreignObjectRendering: false,
        // 忽略某些CSS属性
        ignoreElements: (element) => {
          const style = window.getComputedStyle(element);
          // 跳过可能包含lab()颜色的元素
          return style.backgroundColor?.includes('lab') ||
                 style.color?.includes('lab') ||
                 element.classList.contains('ignore-screenshot');
        }
      });

      // 创建下载链接
      const link = document.createElement('a');
      const awardConfig = AWARD_CONFIGS[award?.awardLevel as keyof typeof AWARD_CONFIGS];
      link.download = `${award?.year}年度${awardConfig?.title}_${award?.employeeId.name}_获奖证书.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

    } catch (error) {
      console.error('证书下载失败:', error);

      // 最终降级方案
      const fallbackChoice = confirm(
        '自动下载失败，请选择以下方式保存证书：\n\n' +
        '1. 点击"确定"打开打印预览，选择"保存为PDF"\n' +
        '2. 点击"取消"，右键点击证书区域选择"保存图片"\n\n' +
        '是否打开打印预览？'
      );

      if (fallbackChoice) {
        window.print();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载证书...</p>
        </div>
      </div>
    );
  }

  if (!award) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">未找到获奖记录</p>
          <Link href="/awards">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回年度评优
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const awardConfig = AWARD_CONFIGS[award.awardLevel as keyof typeof AWARD_CONFIGS] || AWARD_CONFIGS.excellent;
  const currentDate = new Date().toLocaleDateString('zh-CN');

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* 操作栏 */}
      <div className="max-w-4xl mx-auto mb-6 px-4 print:hidden">
        <div className="flex justify-between items-center">
          <Link href="/awards">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回年度评优
            </Button>
          </Link>
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            下载证书
          </Button>
        </div>
      </div>

      {/* 证书内容 */}
      <div className="max-w-4xl mx-auto">
        <div
          id="certificate"
          className={`bg-gradient-to-br ${awardConfig.bgColor} p-8 mx-4 shadow-2xl relative overflow-hidden`}
          style={{
            width: '800px',
            height: '600px',
            fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif'
          }}
        >
          {/* 装饰边框 */}
          <div
            className="absolute inset-3 border-4 rounded-lg"
            style={{ borderColor: awardConfig.color }}
          ></div>
          <div
            className="absolute inset-6 border-2 rounded"
            style={{ borderColor: awardConfig.color }}
          ></div>

          {/* 装饰元素 */}
          <div
            className="absolute top-4 left-4 w-4 h-4 rounded-full opacity-30"
            style={{ backgroundColor: awardConfig.color }}
          ></div>
          <div
            className="absolute top-4 right-4 w-4 h-4 rounded-full opacity-30"
            style={{ backgroundColor: awardConfig.color }}
          ></div>
          <div
            className="absolute bottom-4 left-4 w-4 h-4 rounded-full opacity-30"
            style={{ backgroundColor: awardConfig.color }}
          ></div>
          <div
            className="absolute bottom-4 right-4 w-4 h-4 rounded-full opacity-30"
            style={{ backgroundColor: awardConfig.color }}
          ></div>

          {/* 证书内容 */}
          <div className="relative z-10 h-full flex flex-col justify-between items-center text-center p-4">
            {/* 上半部分 */}
            <div className="flex flex-col items-center space-y-4">
              {/* 标题 */}
              <h1 className="text-4xl font-bold text-gray-800 tracking-widest">
                获奖证书
              </h1>

              {/* 副标题 */}
              <p className="text-base text-gray-600 tracking-wider">
                呈尚策划2025年度评选
              </p>

              {/* 奖项标题 */}
              <div
                className="text-3xl font-bold tracking-wider flex items-center gap-3"
                style={{ color: awardConfig.color }}
              >
                <span className="text-4xl">{awardConfig.icon}</span>
                {awardConfig.title}
              </div>

              {/* 获奖者姓名 */}
              <div className="text-2xl font-bold text-gray-800 tracking-wider">
                {award.employeeId.name} 同志
              </div>

              {/* 获奖描述 */}
              <p className="text-lg text-gray-700 leading-relaxed max-w-lg">
                在{award.year}年度工作中表现优异，获得{awardConfig.description}称号
              </p>
            </div>

            {/* 中间部分 - 详细信息 */}
            <div className="text-sm text-gray-600 space-y-1 leading-relaxed">
              <div>员工编号：{award.employeeId.employeeId}</div>
              <div>所属部门：{award.employeeId.department}</div>
              <div>岗位职务：{award.employeeId.position}</div>
              <div>年度排名：第{award.rank}名</div>
              <div>综合得分：{award.finalScore}分</div>
              <div>奖励金额：¥{award.bonusAmount.toLocaleString()}</div>
            </div>

            {/* 底部信息 */}
            <div className="flex justify-between items-center w-full">
              {/* 颁发日期 */}
              <div className="text-sm text-gray-700">
                颁发日期：{currentDate}
              </div>

              {/* 公司信息和印章 */}
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-gray-800">
                  呈尚策划有限公司
                </div>

                {/* 模拟印章 */}
                <div className="w-16 h-16 rounded-full border-3 border-red-600 flex items-center justify-center bg-red-50">
                  <div className="text-red-600 font-bold text-xs leading-tight text-center">
                    呈尚<br />策划
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 打印样式 */}
      <style jsx>{`
        @page {
          size: A4 landscape;
          margin: 0.5in;
        }

        @media print {
          /* 隐藏页面其他元素 */
          body * { visibility: hidden; }
          #certificate, #certificate * { visibility: visible; }

          /* 重置页面样式 */
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }

          /* 隐藏操作按钮 */
          .print\\:hidden { display: none !important; }

          /* 证书打印样式 */
          #certificate {
            position: relative !important;
            left: auto !important;
            top: auto !important;
            width: 800px !important;
            height: 600px !important;
            max-width: 800px !important;
            max-height: 600px !important;
            margin: 20px auto !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: 3px solid #eab308 !important;
            page-break-inside: avoid;
            transform: none !important;
            aspect-ratio: 4/3 !important;
            background: #ffffff !important;
            background-image: none !important;
          }

          /* 确保证书内容布局正确 */
          #certificate > div {
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 32px !important;
            box-sizing: border-box !important;
          }

          /* 打印时使用更安全的颜色 */
          #certificate {
            background: #ffffff !important; /* 白色背景 */
            background-image: none !important; /* 移除渐变 */
            background-color: #ffffff !important;
          }

          /* 确保边框显示 */
          [style*="border-color"] {
            border-color: #eab308 !important; /* 金色边框 */
          }

          /* 确保文字清晰 */
          * {
            color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }

          /* 移除所有可能的背景渐变 */
          #certificate * {
            background-image: none !important;
          }

          /* 打印时隐藏装饰元素 */
          #certificate .absolute.rounded-full {
            display: none !important;
          }

          /* 打印时隐藏印章 */
          #certificate .w-16.h-16.rounded-full {
            display: none !important;
          }
        }

        /* 屏幕显示时的样式优化 */
        @media screen {
          #certificate {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
