import jsPDF from 'jspdf';

// 证书数据接口
export interface CertificateData {
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  awardLevel: string;
  year: number;
  rank: number;
  finalScore: number;
  bonusAmount: number;
  issueDate: string;
}

// 奖项等级配置
const AWARD_CONFIGS = {
  special: {
    title: '特等奖',
    color: '#FFD700', // 金色
    description: '年度最佳员工',
    icon: '🏆'
  },
  first: {
    title: '一等奖',
    color: '#C0C0C0', // 银色
    description: '年度优秀员工',
    icon: '🥇'
  },
  second: {
    title: '二等奖',
    color: '#CD7F32', // 铜色
    description: '年度表现优异员工',
    icon: '🥈'
  },
  excellent: {
    title: '优秀员工',
    color: '#4CAF50', // 绿色
    description: '年度优秀员工',
    icon: '⭐'
  }
};

// 使用Canvas API直接绘制证书
function drawCertificateOnCanvas(data: CertificateData): HTMLCanvasElement {
  const awardConfig = AWARD_CONFIGS[data.awardLevel as keyof typeof AWARD_CONFIGS];

  // 创建canvas (A4横向尺寸，300 DPI)
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // A4横向尺寸：297mm x 210mm，转换为像素 (300 DPI)
  const width = Math.round(297 * 300 / 25.4); // 3508px
  const height = Math.round(210 * 300 / 25.4); // 2480px

  canvas.width = width;
  canvas.height = height;

  // 设置高质量渲染
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 背景色
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 外边框
  const borderMargin = 40;
  ctx.strokeStyle = awardConfig.color;
  ctx.lineWidth = 8;
  ctx.strokeRect(borderMargin, borderMargin, width - 2 * borderMargin, height - 2 * borderMargin);

  // 内边框和背景
  const innerMargin = 60;
  ctx.fillStyle = awardConfig.bgColor;
  ctx.fillRect(innerMargin, innerMargin, width - 2 * innerMargin, height - 2 * innerMargin);
  ctx.strokeStyle = awardConfig.color;
  ctx.lineWidth = 3;
  ctx.strokeRect(innerMargin, innerMargin, width - 2 * innerMargin, height - 2 * innerMargin);

  // 设置文本对齐
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let currentY = 300;

  // 标题 "获奖证书"
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 120px Arial, "Microsoft YaHei", sans-serif';
  ctx.fillText('获奖证书', width / 2, currentY);
  currentY += 150;

  // 副标题
  ctx.fillStyle = '#666666';
  ctx.font = '48px Arial, "Microsoft YaHei", sans-serif';
  ctx.fillText('呈尚策划人事管理系统', width / 2, currentY);
  currentY += 120;

  // 奖项标题
  ctx.fillStyle = awardConfig.color;
  ctx.font = 'bold 90px Arial, "Microsoft YaHei", sans-serif';
  ctx.fillText(`${awardConfig.icon} ${awardConfig.title}`, width / 2, currentY);
  currentY += 140;

  // 获奖者姓名
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 80px Arial, "Microsoft YaHei", sans-serif';
  ctx.fillText(`${data.employeeName} 同志`, width / 2, currentY);
  currentY += 100;

  // 获奖描述
  ctx.fillStyle = '#333333';
  ctx.font = '50px Arial, "Microsoft YaHei", sans-serif';
  ctx.fillText(`在${data.year}年度工作中表现优异，获得${awardConfig.description}称号`, width / 2, currentY);
  currentY += 120;

  // 详细信息
  ctx.fillStyle = '#666666';
  ctx.font = '40px Arial, "Microsoft YaHei", sans-serif';

  const details = [
    `员工编号：${data.employeeId}`,
    `所属部门：${data.department}`,
    `岗位职务：${data.position}`,
    `年度排名：第${data.rank}名`,
    `综合得分：${data.finalScore}分`,
    `奖励金额：¥${data.bonusAmount.toLocaleString()}`
  ];

  details.forEach((detail, index) => {
    ctx.fillText(detail, width / 2, currentY + (index * 60));
  });

  currentY += details.length * 60 + 120;

  // 底部信息
  ctx.fillStyle = '#333333';
  ctx.font = '40px Arial, "Microsoft YaHei", sans-serif';

  // 颁发日期 (左对齐)
  ctx.textAlign = 'left';
  ctx.fillText(`颁发日期：${data.issueDate}`, 200, currentY);

  // 公司名称 (右对齐)
  ctx.textAlign = 'right';
  ctx.font = 'bold 50px Arial, "Microsoft YaHei", sans-serif';
  ctx.fillText('呈尚策划有限公司', width - 300, currentY);

  // 印章 (圆形)
  const sealX = width - 150;
  const sealY = currentY;
  const sealRadius = 80;

  ctx.strokeStyle = '#DC143C';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealRadius, 0, 2 * Math.PI);
  ctx.stroke();

  // 印章文字
  ctx.fillStyle = '#DC143C';
  ctx.font = 'bold 24px Arial, "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('公司', sealX, sealY - 15);
  ctx.fillText('印章', sealX, sealY + 15);

  return canvas;
}

// 生成证书PDF
export async function generateCertificatePDF(data: CertificateData): Promise<jsPDF> {
  try {
    // 使用Canvas绘制证书
    const canvas = drawCertificateOnCanvas(data);

    // 创建PDF文档 (A4横向)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 将canvas添加到PDF
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);

    return pdf;
  } catch (error) {
    console.error('证书生成失败:', error);
    throw new Error('证书生成失败，请重试');
  }
}

// 下载证书
export async function downloadCertificate(data: CertificateData): Promise<void> {
  try {
    const pdf = await generateCertificatePDF(data);
    const fileName = `${data.year}年度${AWARD_CONFIGS[data.awardLevel as keyof typeof AWARD_CONFIGS].title}_${data.employeeName}_获奖证书.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('证书生成失败:', error);
    throw new Error('证书生成失败，请重试');
  }
}

// 预览证书 (返回base64数据URL)
export async function previewCertificate(data: CertificateData): Promise<string> {
  try {
    const pdf = await generateCertificatePDF(data);
    return pdf.output('datauristring');
  } catch (error) {
    console.error('证书预览失败:', error);
    throw new Error('证书预览失败，请重试');
  }
}

// 批量生成证书
export async function generateBatchCertificates(
  certificates: CertificateData[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const zip = await import('jszip');
  const JSZip = zip.default;

  const zipFile = new JSZip();

  for (let i = 0; i < certificates.length; i++) {
    const data = certificates[i];
    const pdf = await generateCertificatePDF(data);
    const pdfBlob = pdf.output('blob');

    const fileName = `${data.year}年度${AWARD_CONFIGS[data.awardLevel as keyof typeof AWARD_CONFIGS].title}_${data.employeeName}_获奖证书.pdf`;
    zipFile.file(fileName, pdfBlob);

    if (onProgress) {
      onProgress(i + 1, certificates.length);
    }
  }

  const zipBlob = await zipFile.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${certificates[0]?.year || new Date().getFullYear()}年度获奖证书.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
