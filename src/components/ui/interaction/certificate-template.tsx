import React from 'react';
import { CertificateData } from '@/utils/certificate';

interface CertificateTemplateProps {
  data: CertificateData;
}

// 奖项等级配置
const AWARD_CONFIGS = {
  special: {
    title: '特等奖',
    color: '#FFD700',
    bgColor: '#FFFEF7',
    textColor: '#B45309',
    description: '年度最佳员工',
    icon: '🏆'
  },
  first: {
    title: '一等奖',
    color: '#E53E3E',
    bgColor: '#FEF2F2',
    textColor: '#B91C1C',
    description: '年度优秀员工',
    icon: '🥇'
  },
  second: {
    title: '二等奖',
    color: '#3182CE',
    bgColor: '#EBF8FF',
    textColor: '#1E40AF',
    description: '年度表现优异员工',
    icon: '🥈'
  },
  excellent: {
    title: '优秀员工',
    color: '#4CAF50',
    bgColor: '#F8FFF8',
    textColor: '#166534',
    description: '年度优秀员工',
    icon: '⭐'
  }
};

export default function CertificateTemplate({ data }: CertificateTemplateProps) {
  const awardConfig = AWARD_CONFIGS[data.awardLevel as keyof typeof AWARD_CONFIGS];

  return (
    <div 
      id="certificate-template"
      style={{
        width: '297mm',
        height: '210mm',
        padding: '20mm',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* 外边框 */}
      <div style={{
        position: 'absolute',
        top: '10mm',
        left: '10mm',
        right: '10mm',
        bottom: '10mm',
        border: `3px solid ${awardConfig.color}`,
        borderRadius: '8px'
      }} />
      
      {/* 内边框 */}
      <div style={{
        position: 'absolute',
        top: '15mm',
        left: '15mm',
        right: '15mm',
        bottom: '15mm',
        border: `1px solid ${awardConfig.color}`,
        borderRadius: '4px',
        backgroundColor: awardConfig.bgColor
      }} />

      {/* 证书内容 */}
      <div style={{
        textAlign: 'center',
        zIndex: 10,
        width: '100%',
        maxWidth: '240mm'
      }}>
        {/* 标题 */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: awardConfig.textColor,
          margin: '0 0 10px 0',
          letterSpacing: '8px'
        }}>
          获奖证书
        </h1>

        {/* 副标题 */}
        <p style={{
          fontSize: '18px',
          color: awardConfig.textColor,
          opacity: 0.8,
          margin: '0 0 30px 0',
          letterSpacing: '2px'
        }}>
          呈尚策划人事管理系统
        </p>

        {/* 奖项标题 */}
        <div style={{
          fontSize: '36px',
          color: awardConfig.color,
          fontWeight: 'bold',
          margin: '0 0 40px 0',
          letterSpacing: '4px'
        }}>
          <span style={{ fontSize: '40px', marginRight: '10px' }}>
            {awardConfig.icon}
          </span>
          {awardConfig.title}
        </div>

        {/* 获奖者姓名 */}
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: awardConfig.textColor,
          margin: '0 0 20px 0',
          letterSpacing: '2px'
        }}>
          {data.employeeName} 同志
        </div>

        {/* 获奖描述 */}
        <p style={{
          fontSize: '20px',
          color: awardConfig.textColor,
          margin: '0 0 30px 0',
          lineHeight: '1.6',
          letterSpacing: '1px'
        }}>
          在{data.year}年度工作中表现优异，获得{awardConfig.description}称号
        </p>

        {/* 详细信息 */}
        <div style={{
          fontSize: '16px',
          color: awardConfig.textColor,
          opacity: 0.9,
          lineHeight: '2',
          margin: '0 0 40px 0'
        }}>
          <div>员工编号：{data.employeeId}</div>
          <div>所属部门：{data.department}</div>
          <div>岗位职务：{data.position}</div>
          <div>年度排名：第{data.rank}名</div>
          <div>综合得分：{data.finalScore}分</div>
          <div>奖励金额：¥{data.bonusAmount.toLocaleString()}</div>
        </div>

        {/* 底部信息 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          marginTop: '50px'
        }}>
          {/* 颁发日期 */}
          <div style={{
            fontSize: '16px',
            color: awardConfig.textColor,
            opacity: 0.8
          }}>
            颁发日期：{data.issueDate}
          </div>

          {/* 公司信息和印章 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: awardConfig.textColor
            }}>
              呈尚策划有限公司
            </div>
            
            {/* 模拟印章 */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '3px solid #DC143C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#DC143C',
              fontWeight: 'bold',
              backgroundColor: 'rgba(220, 20, 60, 0.1)'
            }}>
              公司<br />印章
            </div>
          </div>
        </div>
      </div>

      {/* 装饰元素 */}
      <div style={{
        position: 'absolute',
        top: '25mm',
        left: '25mm',
        width: '20px',
        height: '20px',
        backgroundColor: awardConfig.color,
        borderRadius: '50%',
        opacity: 0.3
      }} />
      
      <div style={{
        position: 'absolute',
        top: '25mm',
        right: '25mm',
        width: '20px',
        height: '20px',
        backgroundColor: awardConfig.color,
        borderRadius: '50%',
        opacity: 0.3
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '25mm',
        left: '25mm',
        width: '20px',
        height: '20px',
        backgroundColor: awardConfig.color,
        borderRadius: '50%',
        opacity: 0.3
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '25mm',
        right: '25mm',
        width: '20px',
        height: '20px',
        backgroundColor: awardConfig.color,
        borderRadius: '50%',
        opacity: 0.3
      }} />
    </div>
  );
}
