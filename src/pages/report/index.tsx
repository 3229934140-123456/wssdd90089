import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Textarea, Input, Button } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import ChannelTag from '@/components/ChannelTag';
import { reportChannelOptions } from '@/data/mockChannels';
import { ReportRecord, ChannelType } from '@/types/rumor';
import classnames from 'classnames';

const STORAGE_KEY_REPORTS = 'local_report_records';
const STORAGE_KEY_CONTEXT = 'current_report_context';

const defaultMockReports: ReportRecord[] = [
  {
    id: 'rep001',
    content: '小区业主群里有人发"自来水致癌"的消息，好多人在转',
    channel: 'group',
    channelLabel: '小区业主群',
    channelDetail: '阳光花园3栋业主群',
    reportedAt: '2026-06-18 09:20',
    status: 'resolved',
    relatedRumorId: 'r001',
    relatedRumorTitle: '某地自来水致癌？别信！',
    sourceType: 'text',
    sourceDetail: '文字识别内容：自来水喝了会致癌？'
  },
  {
    id: 'rep002',
    content: '朋友圈看到有人发西瓜打甜味剂的视频',
    channel: 'moment',
    channelLabel: '微信朋友圈',
    channelDetail: '',
    reportedAt: '2026-06-16 20:15',
    status: 'reviewed',
    relatedRumorId: 'r005',
    relatedRumorTitle: '西瓜打了甜味剂？别再传了',
    sourceType: 'link',
    sourceDetail: '抖音短视频链接：https://v.douyin.com/xxxxxxx'
  },
  {
    id: 'rep003',
    content: '家里老人在养生群看到"大蒜防新冠"的消息，还转发给了很多亲戚',
    channel: 'group',
    channelLabel: '亲友家庭群',
    channelDetail: '快乐养生大家庭群',
    reportedAt: '2026-06-15 14:30',
    status: 'pending',
    relatedRumorId: 'r002',
    relatedRumorTitle: '吃大蒜能防新冠？不靠谱',
    sourceType: 'image',
    sourceDetail: '截图OCR识别：【医生推荐】每天三瓣蒜 胜过打疫苗'
  }
];

const statusText = {
  pending: '处理中',
  reviewed: '已核实',
  resolved: '已处理'
};

const loadReportsFromStorage = (): ReportRecord[] => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY_REPORTS);
    if (data && Array.isArray(data) && data.length > 0) {
      return data as ReportRecord[];
    }
  } catch (e) {
    console.warn('[线索上报] 读取本地存储失败', e);
  }
  return defaultMockReports;
};

const parseQuery = (query: string): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!query) return result;
  query.split('&').forEach(pair => {
    const [k, v] = pair.split('=');
    if (k && v !== undefined) {
      try { result[k] = decodeURIComponent(v); }
      catch (e) { result[k] = v; }
    }
  });
  return result;
};

const sourceTypeMap: Record<string, { label: string; color: string; bg: string }> = {
  text: { label: '文字识别来源', color: '#2BA471', bg: '#e6fff3' },
  image: { label: '截图识别来源', color: '#1890FF', bg: '#e6f4ff' },
  link: { label: '链接识别来源', color: '#722ED1', bg: '#f4efff' },
  manual: { label: '手动上报', color: '#8C8C8C', bg: '#f5f5f5' }
};

const ReportPage: React.FC = () => {
  const router = useRouter();
  const [selectedChannelKey, setSelectedChannelKey] = useState<string>('');
  const [channelDetail, setChannelDetail] = useState('');
  const [content, setContent] = useState('');
  const [reports, setReports] = useState<ReportRecord[]>(defaultMockReports);
  const [relatedRumor, setRelatedRumor] = useState<{ id: string; title: string; content?: string } | null>(null);
  const [sourceType, setSourceType] = useState<string>('');
  const [sourceDetail, setSourceDetail] = useState<string>('');
  const [contextApplied, setContextApplied] = useState(false);
  const [viewMode, setViewMode] = useState<'time' | 'rumor'>('rumor');

  const applyReportContext = () => {
    const params: Record<string, string> = { ...router.params } as Record<string, string>;
    try {
      const ctx = Taro.getStorageSync(STORAGE_KEY_CONTEXT);
      if (ctx && typeof ctx === 'string') {
        const ctxParsed = parseQuery(ctx);
        Object.assign(params, ctxParsed);
      }
    } catch (e) {}

    if (Object.keys(params).length === 0) return false;

    let hasChanges = false;
    if (params.sourceType && params.sourceType !== sourceType) {
      setSourceType(params.sourceType);
      hasChanges = true;
    }
    if (params.sourceDetail && params.sourceDetail !== sourceDetail) {
      setSourceDetail(params.sourceDetail);
      hasChanges = true;
    }

    if ((params.rumorId || params.rumorTitle) && !relatedRumor) {
      setRelatedRumor({
        id: params.rumorId || '',
        title: params.rumorTitle || '',
        content: params.rumorContent || ''
      });
      if (params.rumorContent && !content) {
        setContent(params.rumorContent);
        hasChanges = true;
      } else if (params.rumorTitle && !content) {
        setContent(`谣言内容与"${params.rumorTitle}"相关，在群里/网上被大量转发。`);
        hasChanges = true;
      }
      hasChanges = true;
    }
    return hasChanges;
  };

  useEffect(() => {
    applyReportContext();
    setContextApplied(true);
  }, []);

  useDidShow(() => {
    const stored = loadReportsFromStorage();
    setReports(stored);
    applyReportContext();
  });

  const selectedOption = reportChannelOptions.find(o => o.key === selectedChannelKey);
  const canSubmit = selectedChannelKey && content.trim();

  const persistReports = (nextReports: ReportRecord[]) => {
    try {
      Taro.setStorageSync(STORAGE_KEY_REPORTS, nextReports);
    } catch (e) {
      console.warn('[线索上报] 写入本地存储失败', e);
    }
  };

  const handleClearRelated = () => {
    setRelatedRumor(null);
    setContent('');
    setSourceType('');
    setSourceDetail('');
    try { Taro.removeStorageSync(STORAGE_KEY_CONTEXT); } catch (e) {}
  };

  const currentSourceInfo = sourceTypeMap[sourceType] || null;

  const handleSubmit = () => {
    if (!canSubmit || !selectedOption) {
      Taro.showToast({ title: '请填写必要信息', icon: 'none' });
      return;
    }
    const reportSourceType = (sourceType as ReportRecord['sourceType']) || 'manual';
    const newReport: ReportRecord = {
      id: `rep${Date.now()}`,
      content: content.trim(),
      channel: selectedOption.value as ChannelType,
      channelLabel: selectedOption.label,
      channelDetail: channelDetail.trim(),
      reportedAt: new Date().toLocaleString('zh-CN'),
      status: 'pending',
      relatedRumorId: relatedRumor?.id || undefined,
      relatedRumorTitle: relatedRumor?.title || undefined,
      sourceType: reportSourceType,
      sourceDetail: sourceDetail || undefined
    };
    const nextReports = [newReport, ...reports];
    setReports(nextReports);
    persistReports(nextReports);
    setSelectedChannelKey('');
    setChannelDetail('');
    setContent('');
    setRelatedRumor(null);
    setSourceType('');
    setSourceDetail('');
    try { Taro.removeStorageSync(STORAGE_KEY_CONTEXT); } catch (e) {}
    Taro.showToast({ title: '感谢您的反馈！', icon: 'success' });
  };

  const groupedReports = useMemo(() => {
    const byRumor: Record<string, { title: string; items: ReportRecord[] }> = {};
    const ungrouped: ReportRecord[] = [];
    reports.forEach((rep) => {
      if (rep.relatedRumorId && rep.relatedRumorTitle) {
        const key = rep.relatedRumorId;
        if (!byRumor[key]) {
          byRumor[key] = { title: rep.relatedRumorTitle, items: [] };
        }
        byRumor[key].items.push(rep);
      } else {
        ungrouped.push(rep);
      }
    });
    const groups = Object.entries(byRumor).map(([rid, info]) => {
      const channelSet = new Set<string>();
      info.items.forEach((i) => { if (i.channelLabel) channelSet.add(i.channelLabel); });
      return {
        rumorId: rid,
        rumorTitle: info.title,
        items: info.items,
        reportCount: info.items.length,
        channelCount: channelSet.size,
        channelLabels: Array.from(channelSet)
      };
    });
    groups.sort((a, b) => b.reportCount - a.reportCount);
    return { groups, ungrouped };
  }, [reports]);

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

        {relatedRumor && relatedRumor.title && (
          <View className={styles.relatedRumorBox}>
            <View className={styles.relatedHeader}>
              <Text className={styles.relatedTitle}>🔗 关联的识别结果</Text>
              <Text className={styles.relatedClear} onClick={handleClearRelated}>取消关联</Text>
            </View>
            <View className={styles.relatedContent}>
              <Text className={styles.relatedRumorTitle}>{relatedRumor.title}</Text>
              {relatedRumor.content && (
                <Text className={styles.relatedRumorContent}>
                  识别内容："{relatedRumor.content.length > 60 ? relatedRumor.content.substring(0, 60) + '…' : relatedRumor.content}"
                </Text>
              )}
              {currentSourceInfo && sourceDetail && (
                <View className={styles.relatedSourceRow}>
                  <Text className={styles.relatedSourceTag} style={{ color: currentSourceInfo.color, background: currentSourceInfo.bg }}>
                    {currentSourceInfo.label}
                  </Text>
                  <Text className={styles.relatedSourceDetail}>{sourceDetail.length > 50 ? sourceDetail.substring(0, 50) + '…' : sourceDetail}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            您是在哪里看到的？
            <Text className={styles.formLabelTip}>（帮助社区管理员判断传播范围）</Text>
          </Text>
          <View className={styles.channelOptions}>
            {reportChannelOptions.map((opt) => (
              <View
                key={opt.key}
                className={classnames(
                  styles.channelOption,
                  selectedChannelKey === opt.key ? styles.active : '',
                  opt.key === 'group_owner' && selectedChannelKey === opt.key ? styles.activeOwner : '',
                  opt.key === 'group_family' && selectedChannelKey === opt.key ? styles.activeFamily : ''
                )}
                onClick={() => setSelectedChannelKey(opt.key)}
              >
                {opt.label}
                {opt.key === 'group_owner' && selectedChannelKey === opt.key && <Text className={styles.activeMark}>✓</Text>}
                {opt.key === 'group_family' && selectedChannelKey === opt.key && <Text className={styles.activeMark}>✓</Text>}
                {opt.key !== 'group_owner' && opt.key !== 'group_family' && selectedChannelKey === opt.key && <Text className={styles.activeMark}>✓</Text>}
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
        <View className={styles.historyHeaderRow}>
          <Text className={styles.sectionTitle}>本小区上报动态</Text>
          <View className={styles.viewToggle}>
            <View
              className={classnames(styles.viewToggleItem, viewMode === 'time' ? styles.viewToggleActive : '')}
              onClick={() => setViewMode('time')}
            >
              按时间
            </View>
            <View
              className={classnames(styles.viewToggleItem, viewMode === 'rumor' ? styles.viewToggleActive : '')}
              onClick={() => setViewMode('rumor')}
            >
              按谣言
            </View>
          </View>
        </View>

        {reports.length > 0 ? (
          viewMode === 'time' ? (
            <View className={styles.historyList}>
              {reports.map((rep) => {
                const repSrcInfo = rep.sourceType ? sourceTypeMap[rep.sourceType] : null;
                return (
                  <View key={rep.id} className={styles.historyCard}>
                    <View className={styles.historyTop}>
                      <Text className={styles.historyContent}>{rep.content}</Text>
                      <Text className={classnames(styles.statusBadge, styles[rep.status])}>
                        {statusText[rep.status]}
                      </Text>
                    </View>
                    {rep.relatedRumorTitle && (
                      <View className={styles.historyRelatedRow}>
                        <Text className={styles.historyRelatedLabel}>🔗 关联谣言：</Text>
                        <Text className={styles.historyRelatedTitle}>{rep.relatedRumorTitle}</Text>
                      </View>
                    )}
                    {repSrcInfo && (
                      <View className={styles.historySourceRow}>
                        <Text className={styles.historySourceTag} style={{ color: repSrcInfo.color, background: repSrcInfo.bg }}>
                          {repSrcInfo.label}
                        </Text>
                        {rep.sourceDetail && (
                          <Text className={styles.historySourceDetail}>{rep.sourceDetail.length > 55 ? rep.sourceDetail.substring(0, 55) + '…' : rep.sourceDetail}</Text>
                        )}
                      </View>
                    )}
                    <View className={styles.historyMeta}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx', flexWrap: 'wrap' }}>
                        <ChannelTag type={rep.channel} />
                        {rep.channelLabel && (
                          <Text
                            className={classnames(
                              styles.historyChannelLabel,
                              rep.channelLabel === '小区业主群' ? styles.labelOwner : '',
                              rep.channelLabel === '亲友家庭群' ? styles.labelFamily : ''
                            )}
                          >
                            {rep.channelLabel}
                          </Text>
                        )}
                        {rep.channelDetail && (
                          <Text className={styles.historyChannel}>· {rep.channelDetail}</Text>
                        )}
                      </View>
                      <Text className={styles.historyTime}>{rep.reportedAt}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className={styles.historyList}>
              {groupedReports.groups.map((g) => (
                <View key={g.rumorId} className={styles.groupCard}>
                  <View className={styles.groupHeader}>
                    <View className={styles.groupTitleRow}>
                      <View className={styles.groupIcon}>🔗</View>
                      <View className={styles.groupTitleBox}>
                        <Text className={styles.groupRumorTitle}>{g.rumorTitle}</Text>
                        <View className={styles.groupStats}>
                          <Text className={styles.groupStatNum}>{g.reportCount}</Text>
                          <Text className={styles.groupStatLabel}>条线索</Text>
                          <View className={styles.groupDividerDot} />
                          <Text className={styles.groupStatNum}>{g.channelCount}</Text>
                          <Text className={styles.groupStatLabel}>个渠道</Text>
                        </View>
                      </View>
                    </View>
                    <View className={styles.groupChannelSummary}>
                      {g.channelLabels.slice(0, 4).map((ch, idx) => (
                        <Text key={idx} className={styles.groupChannelTag}>
                          {ch}
                        </Text>
                      ))}
                    </View>
                  </View>
                  {g.items.map((rep) => {
                    const repSrcInfo = rep.sourceType ? sourceTypeMap[rep.sourceType] : null;
                    return (
                      <View key={rep.id} className={styles.historyCard}>
                        <View className={styles.historyTop}>
                          <Text className={styles.historyContent}>{rep.content}</Text>
                          <Text className={classnames(styles.statusBadge, styles[rep.status])}>
                            {statusText[rep.status]}
                          </Text>
                        </View>
                        {repSrcInfo && (
                          <View className={styles.historySourceRow}>
                            <Text className={styles.historySourceTag} style={{ color: repSrcInfo.color, background: repSrcInfo.bg }}>
                              {repSrcInfo.label}
                            </Text>
                            {rep.sourceDetail && (
                              <Text className={styles.historySourceDetail}>{rep.sourceDetail.length > 55 ? rep.sourceDetail.substring(0, 55) + '…' : rep.sourceDetail}</Text>
                            )}
                          </View>
                        )}
                        <View className={styles.historyMeta}>
                          <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx', flexWrap: 'wrap' }}>
                            <ChannelTag type={rep.channel} />
                            {rep.channelLabel && (
                              <Text
                                className={classnames(
                                  styles.historyChannelLabel,
                                  rep.channelLabel === '小区业主群' ? styles.labelOwner : '',
                                  rep.channelLabel === '亲友家庭群' ? styles.labelFamily : ''
                                )}
                              >
                                {rep.channelLabel}
                              </Text>
                            )}
                            {rep.channelDetail && (
                              <Text className={styles.historyChannel}>· {rep.channelDetail}</Text>
                            )}
                          </View>
                          <Text className={styles.historyTime}>{rep.reportedAt}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
              {groupedReports.ungrouped.length > 0 && (
                <View className={styles.groupCard}>
                  <View className={styles.groupHeader}>
                    <View className={styles.groupTitleRow}>
                      <View className={styles.groupIcon}>📝</View>
                      <View className={styles.groupTitleBox}>
                        <Text className={styles.groupRumorTitle}>其他独立线索</Text>
                        <View className={styles.groupStats}>
                          <Text className={styles.groupStatNum}>{groupedReports.ungrouped.length}</Text>
                          <Text className={styles.groupStatLabel}>条未归类线索</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  {groupedReports.ungrouped.map((rep) => {
                    const repSrcInfo = rep.sourceType ? sourceTypeMap[rep.sourceType] : null;
                    return (
                      <View key={rep.id} className={styles.historyCard}>
                        <View className={styles.historyTop}>
                          <Text className={styles.historyContent}>{rep.content}</Text>
                          <Text className={classnames(styles.statusBadge, styles[rep.status])}>
                            {statusText[rep.status]}
                          </Text>
                        </View>
                        {repSrcInfo && (
                          <View className={styles.historySourceRow}>
                            <Text className={styles.historySourceTag} style={{ color: repSrcInfo.color, background: repSrcInfo.bg }}>
                              {repSrcInfo.label}
                            </Text>
                            {rep.sourceDetail && (
                              <Text className={styles.historySourceDetail}>{rep.sourceDetail.length > 55 ? rep.sourceDetail.substring(0, 55) + '…' : rep.sourceDetail}</Text>
                            )}
                          </View>
                        )}
                        <View className={styles.historyMeta}>
                          <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx', flexWrap: 'wrap' }}>
                            <ChannelTag type={rep.channel} />
                            {rep.channelLabel && (
                              <Text
                                className={classnames(
                                  styles.historyChannelLabel,
                                  rep.channelLabel === '小区业主群' ? styles.labelOwner : '',
                                  rep.channelLabel === '亲友家庭群' ? styles.labelFamily : ''
                                )}
                              >
                                {rep.channelLabel}
                              </Text>
                            )}
                            {rep.channelDetail && (
                              <Text className={styles.historyChannel}>· {rep.channelDetail}</Text>
                            )}
                          </View>
                          <Text className={styles.historyTime}>{rep.reportedAt}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )
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
