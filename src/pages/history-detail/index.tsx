import React, { useMemo, useState } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import RiskBadge from '@/components/RiskBadge';
import { mockRumors } from '@/data/mockRumors';
import { HistoryItem, Rumor } from '@/types/rumor';
import classnames from 'classnames';

const STORAGE_KEY_HISTORY = 'local_identify_history';

const typeMap: Record<HistoryItem['inputType'], { label: string; color: string }> = {
  text: { label: '文字识别', color: '#2BA471' },
  image: { label: '截图识别', color: '#1890FF' },
  link: { label: '链接识别', color: '#722ED1' }
};

const riskClassMap: Record<string, string> = {
  high: styles.highRisk,
  medium: styles.mediumRisk,
  low: styles.lowRisk
};

const riskTextMap: Record<string, string> = {
  high: '高风险',
  medium: '中风险',
  low: '低风险'
};

const HistoryDetailPage: React.FC = () => {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem | null>(null);

  const loadHistoryById = () => {
    const id = router.params.id;
    if (!id) return;
    try {
      const data = Taro.getStorageSync(STORAGE_KEY_HISTORY);
      if (data && Array.isArray(data)) {
        const found = (data as HistoryItem[]).find((h) => h.id === id);
        if (found) setHistory(found);
      }
    } catch (e) {}
  };

  useDidShow(() => {
    if (!history) loadHistoryById();
  });

  const finalRumor: Rumor | undefined = useMemo(() => {
    if (!history) return undefined;
    if (history.matchedRumor) {
      return mockRumors.find((r) => r.id === history.matchedRumor);
    }
    return undefined;
  }, [history]);

  const candidateList: Rumor[] = useMemo(() => {
    if (!history) return [];
    if (history.candidateRumors && history.candidateRumors.length > 0) {
      return history.candidateRumors
        .map((rid) => mockRumors.find((r) => r.id === rid))
        .filter(Boolean) as Rumor[];
    }
    if (finalRumor && finalRumor.relatedRumors) {
      return [
        finalRumor,
        ...finalRumor.relatedRumors
          .map((rid) => mockRumors.find((r) => r.id === rid))
          .filter(Boolean) as Rumor[]
      ];
    }
    return finalRumor ? [finalRumor] : [];
  }, [history, finalRumor]);

  const typeInfo = history ? typeMap[history.inputType] : null;

  const buildResultUrl = () => {
    if (!history) return '/pages/index/index';
    const params: string[] = [];
    if (history.matchedRumor) params.push(`id=${history.matchedRumor}`);
    if (history.inputType) params.push(`type=${history.inputType}`);
    if (history.inputText) params.push(`input=${encodeURIComponent(history.inputText)}`);
    if (history.inputImage) params.push(`image=${encodeURIComponent(history.inputImage)}`);
    if (history.inputLink) params.push(`link=${encodeURIComponent(history.inputLink)}`);
    if (history.ocrTexts && history.ocrTexts.length > 0) {
      params.push(`ocr=${encodeURIComponent(history.ocrTexts.join('||'))}`);
    }
    if (history.candidateRumors && history.candidateRumors.length > 0) {
      params.push(`candidates=${encodeURIComponent(history.candidateRumors.join(','))}`);
    }
    return `/pages/result/index?${params.join('&')}`;
  };

  if (!history) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.emptyTip}>
          找不到这条识别记录，可能已被清除。
          {"\n"}
          请回到「我的」页面查看最新历史。
        </View>
        <View className={styles.bottomBar}>
          <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={() => Taro.switchTab({ url: '/pages/mine/index' })}>
            返回我的
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.detailHeader}>
        <View className={styles.headerRow}>
          {typeInfo && <View className={styles.typeBadge} style={{ background: `${typeInfo.color}33` }}>
            <Text style={{ color: typeInfo.color }}>{typeInfo.label}</Text>
          </View>}
          <View className={classnames(styles.riskInline, riskClassMap[history.riskLevel] || '')}>
            {riskTextMap[history.riskLevel] || '风险未知'}
          </View>
          <Text style={{ fontSize: '24rpx', color: 'rgba(255,255,255,0.85)' }}>识别于 {history.checkedAt}</Text>
        </View>
        <Text className={styles.headerTitle}>{finalRumor?.title || '这条识别未匹配到对应谣言'}</Text>
        <Text className={styles.headerSubtitle}>{finalRumor?.summary || '可点击下方按钮查看完整识别结果页。'}</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>识别原始内容</Text>

        {history.inputType === 'text' && (
          <View className={styles.card}>
            <View className={styles.row}>
              <Text className={styles.rowTitle}>识别内容</Text>
              <Text className={styles.rowValue}>{history.inputText}</Text>
            </View>
          </View>
        )}

        {history.inputType === 'image' && (
          <View className={styles.card}>
            {history.inputImage && (
              <View className={styles.row}>
                <Text className={styles.rowTitle}>截图</Text>
                <Image src={history.inputImage} className={styles.thumbImage} mode="aspectFill" />
              </View>
            )}
            {history.ocrTexts && history.ocrTexts.length > 0 && (
              <View className={styles.row}>
                <Text className={styles.rowTitle}>OCR 提取文字</Text>
                <View className={styles.ocrList}>
                  {history.ocrTexts.map((t, i) => (
                    <View key={i} className={styles.ocrItem}>{t}</View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {history.inputType === 'link' && (
          <View className={styles.card}>
            <View className={styles.row}>
              <Text className={styles.rowTitle}>原始链接</Text>
              <Text className={classnames(styles.rowValue, styles.linkRow)} selectable>{history.inputLink}</Text>
            </View>
          </View>
        )}
      </View>

      {candidateList.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>候选与匹配结果</Text>
          <Text className={styles.candidatesTitle}>
            共 {candidateList.length} 个相似候选项，绿色为最终匹配结果
          </Text>
          {candidateList.map((cand, idx) => {
            const isPicked = history.matchedRumor === cand.id;
            return (
              <View
                key={cand.id}
                className={classnames(styles.candidateRow, isPicked ? styles.candidateRowActive : '')}
                onClick={() => {
                  Taro.navigateTo({
                    url: `/pages/result/index?id=${cand.id}`
                  });
                }}
              >
                <View className={classnames(styles.candidateIdx, isPicked ? styles.candidateIdxActive : '')}>
                  {idx + 1}
                </View>
                <View className={styles.candidateContent}>
                  <Text className={styles.candidateTitle}>{cand.title}</Text>
                  <View className={styles.candidateTagRow}>
                    <Text className={styles.categoryTag}>#{cand.category}</Text>
                    {isPicked && <Text className={styles.pickedBadge}>✓ 最终选择</Text>}
                    <RiskBadge level={cand.riskLevel} showLabel={false} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View className={styles.bottomBar}>
        <Button className={classnames(styles.btn, styles.btnSecondary)} onClick={() => Taro.switchTab({ url: '/pages/mine/index' })}>
          返回我的
        </Button>
        <Button
          className={classnames(styles.btn, styles.btnPrimary)}
          onClick={() => Taro.navigateTo({ url: buildResultUrl() })}
        >
          查看完整结果
        </Button>
      </View>
    </View>
  );
};

export default HistoryDetailPage;
