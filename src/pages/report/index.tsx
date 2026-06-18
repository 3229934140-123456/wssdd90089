import React, { useState } from 'react';
import { View, Text, Textarea, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import ChannelTag from '@/components/ChannelTag';
import { reportChannelOptions } from '@/data/mockChannels';
import { ReportRecord, ChannelType } from '@/types/rumor';
import classnames from 'classnames';

const mockReports: ReportRecord[] = [
  {
    id: 'rep001',
    content: '小区业主群里有人发"自来水致癌"的消息，好多人在转',
    channel: 'group',
    channelDetail: '阳光花园3栋业主群',
    reportedAt: '2026-06-18 09:20',
    status: 'resolved'
  },
  {
    id: 'rep002',
    content: '朋友圈看到有人发西瓜打甜味剂的视频',
    channel: 'moment',
    channelDetail: '',
    reportedAt: '2026-06-16 20:15',
    status: 'reviewed'
  },
  {
    id: 'rep003',
    content: '家里老人在养生群看到"大蒜防新冠"的消息，还转发给了很多亲戚',
    channel: 'group',
    channelDetail: '快乐养生大家庭群',
    reportedAt: '2026-06-15 14:30',
    status: 'pending'
  }
];

const statusText = {
  pending: '处理中',
  reviewed: '已核实',
  resolved: '已处理'
};

const ReportPage: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<ChannelType | ''>('');
  const [channelDetail, setChannelDetail] = useState('');
  const [content, setContent] = useState('');
  const [reports, setReports] = useState<ReportRecord[]>(mockReports);

  const canSubmit = selectedChannel && content.trim();

  const handleSubmit = () => {
    if (!canSubmit) {
      Taro.showToast({ title: '请填写必要信息', icon: 'none' });
      return;
    }
    console.log('[线索上报] 提交：', { channel: selectedChannel, channelDetail, content });
    const newReport: ReportRecord = {
      id: `rep${Date.now()}`,
      content: content.trim(),
      channel: selectedChannel as ChannelType,
      channelDetail: channelDetail.trim(),
      reportedAt: new Date().toLocaleString('zh-CN'),
      status: 'pending'
    };
    setReports([newReport, ...reports]);
    setSelectedChannel('');
    setChannelDetail('');
    setContent('');
    Taro.showToast({ title: '感谢您的反馈！', icon: 'success' });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.heroCard}>
        <Text className={styles.heroTitle}>您的线索，守护社区</Text>
        <Text className={styles.heroSubtitle}>
          匿名上报可疑消息来源，帮助社区管理员及时发现{"\n"}
          进入小区业主群的谣言，守护邻里安全。
        </Text>
        <View className={styles.heroStats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{reports.length}</Text>
            <Text className={styles.statLabel}>本小区线索</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>
              {reports.filter(r => r.status === 'resolved').length}
            </Text>
            <Text className={styles.statLabel}>已处理</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>100%</Text>
            <Text className={styles.statLabel}>匿名保护</Text>
          </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>补充谣言传播渠道</Text>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            您是在哪里看到的？
            <Text className={styles.formLabelTip}>（帮助社区管理员判断传播范围）</Text>
          </Text>
          <View className={styles.channelOptions}>
            {reportChannelOptions.map((opt, idx) => (
              <View
                key={idx}
                className={classnames(
                  styles.channelOption,
                  selectedChannel === opt.value && opt.label === reportChannelOptions.find(o => o.value === opt.value)?.label
                    ? styles.active
                    : ''
                )}
                onClick={() => setSelectedChannel(opt.value)}
              >
                {opt.label}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            具体是哪个群/账号？
            <Text className={styles.formLabelTip}>（可选，方便管理员精准介入）</Text>
          </Text>
          <Input
            className={styles.inputField}
            placeholder="如：阳光花园业主群、快乐家族群等"
            value={channelDetail}
            onInput={(e) => setChannelDetail(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            消息大概说了什么？
          </Text>
          <Textarea
            className={styles.textareaField}
            placeholder="简单描述一下消息内容，比如：说自来水加了工业消毒剂致癌，让大家买桶装水…"
            value={content}
            onInput={(e) => setContent(e.detail.value)}
            maxlength={300}
            autoHeight
          />
        </View>

        <View className={styles.anonymousBox}>
          <Text className={styles.anonymousText}>
            <strong>🔒 全程匿名提交</strong>
            {"\n"}不会记录您的任何身份信息
          </Text>
          <View className={styles.toggleSwitch} />
        </View>

        <Button
          className={classnames(styles.submitButton, !canSubmit ? styles.disabled : '')}
          onClick={handleSubmit}
        >
          匿名提交线索
        </Button>
      </View>

      <View className={styles.historySection}>
        <Text className={styles.sectionTitle}>本小区上报动态</Text>

        {reports.length > 0 ? (
          <View className={styles.historyList}>
            {reports.map((rep) => (
              <View key={rep.id} className={styles.historyCard}>
                <View className={styles.historyTop}>
                  <Text className={styles.historyContent}>{rep.content}</Text>
                  <Text className={classnames(styles.statusBadge, styles[rep.status])}>
                    {statusText[rep.status]}
                  </Text>
                </View>
                <View className={styles.historyMeta}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx' }}>
                    <ChannelTag type={rep.channel} />
                    {rep.channelDetail && (
                      <Text className={styles.historyChannel}>· {rep.channelDetail}</Text>
                    )}
                  </View>
                  <Text className={styles.historyTime}>{rep.reportedAt}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>📋</View>
            <Text className={styles.emptyTitle}>暂无上报记录</Text>
            <Text className={styles.emptyDesc}>
              您提交的第一条线索会出现在这里，{"\n"}
              每一条线索都在让社区变得更安全 💚
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ReportPage;
