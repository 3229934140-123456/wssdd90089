import React, { useState, useMemo } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import RiskBadge from '@/components/RiskBadge';
import { mockRumors } from '@/data/mockRumors';
import { HistoryItem, Rumor } from '@/types/rumor';
import classnames from 'classnames';

const STORAGE_KEY_HISTORY = 'local_identify_history';
const STORAGE_KEY_REPORTS = 'local_report_records';

const inputTypeMap: Record<HistoryItem['inputType'], { icon: string; label: string; color: string }> = {
  text: { icon: '文', label: '文字', color: '#2BA471' },
  image: { icon: '图', label: '截图', color: '#1890FF' },
  link: { icon: '链', label: '链接', color: '#722ED1' }
};

const MinePage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [reportCount, setReportCount] = useState(0);

  const loadData = () => {
    try {
      const data = Taro.getStorageSync(STORAGE_KEY_HISTORY);
      if (data && Array.isArray(data)) {
        setHistory(data as HistoryItem[]);
      }
    } catch (e) {}
    try {
      const reports = Taro.getStorageSync(STORAGE_KEY_REPORTS);
      if (reports && Array.isArray(reports)) {
        setReportCount(reports.length);
      } else {
        setReportCount(3);
      }
    } catch (e) {
      setReportCount(3);
    }
  };

  useDidShow(() => {
    loadData();
  });

  const displayHistory = history.length > 0
    ? history
    : ([
      { id: 'demo_text', inputType: 'text' as const, inputText: '自来水喝了会致癌？', matchedRumor: 'r001', riskLevel: 'high' as const, checkedAt: '2026-06-18 09:30' },
      { id: 'demo_image', inputType: 'image' as const, matchedRumor: 'r005', riskLevel: 'high' as const, checkedAt: '2026-06-16 14:20' },
      { id: 'demo_link', inputType: 'link' as const, matchedRumor: 'r010', riskLevel: 'low' as const, checkedAt: '2026-06-15 18:45' }
    ] as HistoryItem[]);

  const isRealData = history.length > 0;

  const getHistoryDisplayText = (h: HistoryItem): string => {
    if (h.inputText) return h.inputText;
    if (h.inputLink) return h.inputLink.length > 40 ? h.inputLink.substring(0, 40) + '…' : h.inputLink;
    if (h.ocrTexts && h.ocrTexts.length > 0) return h.ocrTexts[0];
    const rumor = mockRumors.find((r: Rumor) => r.id === h.matchedRumor);
    if (rumor) return rumor.title;
    return `识别的${inputTypeMap[h.inputType].label}内容`;
  };

  const buildResultUrl = (h: HistoryItem): string => {
    const params: string[] = [];
    if (h.matchedRumor) params.push(`id=${h.matchedRumor}`);
    if (h.inputType) params.push(`type=${h.inputType}`);
    if (h.inputText) params.push(`input=${encodeURIComponent(h.inputText)}`);
    if (h.inputLink) params.push(`link=${encodeURIComponent(h.inputLink)}`);
    if (h.inputImage) params.push(`image=${encodeURIComponent(h.inputImage)}`);
    if (h.ocrTexts && h.ocrTexts.length > 0) params.push(`ocr=${encodeURIComponent(h.ocrTexts.join('||'))}`);
    if (h.candidateRumors && h.candidateRumors.length > 0) params.push(`candidates=${encodeURIComponent(h.candidateRumors.join(','))}`);
    return `/pages/result/index?${params.join('&')}`;
  };

  const handleTapHistory = (h: HistoryItem) => {
    console.log('[我的] 点击历史记录：', h.id);
    Taro.navigateTo({ url: buildResultUrl(h) });
  };

  const handleTapMenuItem = (key: string) => {
    console.log('[我的] 点击菜单项：', key);
    Taro.showToast({ title: `${key} 功能开发中`, icon: 'none' });
  };

  const handleClearHistory = () => {
    if (!isRealData) return;
    Taro.showModal({
      title: '确认清除',
      content: '确定要清除所有识别历史吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          try { Taro.removeStorageSync(STORAGE_KEY_HISTORY); } catch (e) {}
          setHistory([]);
          Taro.showToast({ title: '已清除', icon: 'success' });
        }
      }
    });
  };

  const totalHistoryCount = Math.max(history.length, 3);

  return (
    <View className={styles.pageContainer}>
      <View className={styles.profileHeader}>
        <View className={styles.profileRow}>
          <View className={styles.avatar}>邻</View>
          <View className={styles.profileInfo}>
            <Text className={styles.userName}>邻里守望者</Text>
            <Text className={styles.userRole}>🏡 社区居民 · 已守护 3 个家庭</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{totalHistoryCount}</Text>
          <Text className={styles.statName}>识别次数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>8</Text>
          <Text className={styles.statName}>收藏辟谣</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>3</Text>
          <Text className={styles.statName}>分享家人</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{reportCount}</Text>
          <Text className={styles.statName}>上报线索</Text>
        </View>
      </View>

      <View className={styles.historySection}>
        <View className={styles.historyHeader}>
          <Text className={styles.sectionTitle}>最近识别</Text>
          {isRealData && (
            <Text className={styles.historyAction} onClick={handleClearHistory}>清除</Text>
          )}
          {!isRealData && (
            <Text className={styles.historyDemoTip}>示例数据</Text>
          )}
        </View>
        <View className={styles.historyList}>
          {displayHistory.map((h) => {
            const typeInfo = inputTypeMap[h.inputType];
            return (
              <View
                key={h.id}
                className={styles.historyItem}
                onClick={() => handleTapHistory(h)}
              >
                <View className={styles.historyIcon} style={{ background: `${typeInfo.color}22`, color: typeInfo.color }}>
                  {typeInfo.icon}
                </View>
                <View className={styles.historyInfo}>
                  {h.inputImage && h.inputType === 'image' && (
                    <View className={styles.historyThumbRow}>
                      <Image src={h.inputImage} className={styles.historyThumb} mode="aspectFill" />
                      <Text className={styles.historyText}>{getHistoryDisplayText(h)}</Text>
                    </View>
                  )}
                  {!h.inputImage && (
                    <Text className={styles.historyText}>{getHistoryDisplayText(h)}</Text>
                  )}
                  <View className={styles.historyMeta}>
                    <Text className={styles.historyTypeTag} style={{ color: typeInfo.color, background: `${typeInfo.color}15` }}>
                      {typeInfo.label}识别
                    </Text>
                    <Text className={styles.historyTime}>{h.checkedAt}</Text>
                  </View>
                </View>
                <RiskBadge level={h.riskLevel} showLabel={false} />
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.volunteerBanner}>
        <Text className={styles.bannerTitle}>加入社区志愿者</Text>
        <Text className={styles.bannerDesc}>
          成为社区辟谣志愿者，帮助更多邻居辨别谣言。{"\n"}
          志愿者可获得官方培训和社区管理后台权限。
        </Text>
        <Button className={styles.bannerBtn} onClick={() => handleTapMenuItem('志愿者申请')}>
          立即申请加入 →
        </Button>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.sectionTitle}>我的工具</Text>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={() => handleTapMenuItem('收藏')}>
            <View className={classnames(styles.menuIcon, styles.green)}>★</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>我的收藏</Text>
              <Text className={styles.menuDesc}>收藏的辟谣文章和科普内容</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleTapMenuItem('分享记录')}>
            <View className={classnames(styles.menuIcon, styles.blue)}>→</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>分享记录</Text>
              <Text className={styles.menuDesc}>发给家人朋友的辟谣卡片记录</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => Taro.switchTab({ url: '/pages/report/index' })}>
            <View className={classnames(styles.menuIcon, styles.orange)}>!</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>我的上报</Text>
              <Text className={styles.menuDesc}>查看上报过的谣言线索处理进度</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.sectionTitle}>更多</Text>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={() => handleTapMenuItem('长辈关怀')}>
            <View className={classnames(styles.menuIcon, styles.purple)}>♥</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>长辈关怀模式</Text>
              <Text className={styles.menuDesc}>更大字体、更简洁的界面</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleTapMenuItem('消息设置')}>
            <View className={classnames(styles.menuIcon, styles.red)}>@</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>消息通知</Text>
              <Text className={styles.menuDesc}>小区谣言预警、官方辟谣推送</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleTapMenuItem('关于')}>
            <View className={classnames(styles.menuIcon, styles.gray)}>i</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>关于我们</Text>
              <Text className={styles.menuDesc}>社区辟谣助手 v1.0.0</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MinePage;
