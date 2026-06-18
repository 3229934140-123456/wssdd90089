import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockRumors } from '@/data/mockRumors';
import { HistoryItem, Rumor } from '@/types/rumor';

const STORAGE_KEY_HISTORY = 'local_identify_history';

const mockOcrTemplates = [
  ['紧急通知！本小区明天停水3天', '物业已确认 请大家提前储水', '请转发给身边的邻居！'],
  ['紧急通知：吃西瓜中毒', 'xxx医院接收3名患者', '都是打了剧毒农药', '请别再买西瓜了！'],
  ['【医生推荐】每天三瓣蒜', '胜过打疫苗，全家不感冒', '转发给家人，不转后悔！'],
  ['小区附近有人偷小孩', '已经有孩子失踪 大家看好孩子', '警方紧急提醒！'],
  ['重要提醒：微信下月开始收费', '聊天每条一分钱', '不转发本消息账户将注销'],
  ['自来水厂改用工业消毒剂', '长期饮用会致癌', '请大家改喝桶装水'],
  ['社保卡过期作废', '没换新卡钱取不出来', '赶紧去社保局办理！']
];

const ImagePreviewPage: React.FC = () => {
  const router = useRouter();
  const { image } = router.params;
  const imagePath = image ? decodeURIComponent(image) : '';

  const ocrTexts = useMemo(() => {
    const idx = Math.floor(Math.random() * mockOcrTemplates.length);
    return mockOcrTemplates[idx];
  }, []);

  const matchResults = useMemo(() => {
    const ocrText = ocrTexts.join(' ');
    const scored: { rumor: Rumor; score: number }[] = mockRumors.map(r => {
      let score = 0;
      r.keywords.forEach(k => {
        if (ocrText.toLowerCase().includes(k.toLowerCase())) score += 10;
      });
      score += Math.random() * 5;
      return { rumor: r, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 5);
  }, [ocrTexts]);

  const handleRechoose = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0] || res.tempFiles[0]?.path;
        if (tempFilePath) {
          Taro.redirectTo({
            url: `/pages/image-preview/index?image=${encodeURIComponent(tempFilePath)}`
          });
        }
      },
      fail: () => {
        Taro.navigateBack();
      }
    });
  };

  const handleStartIdentify = () => {
    const topRumor = matchResults[0]?.rumor || mockRumors[0];
    const candidates = matchResults.slice(0, 4).map(m => m.rumor.id);

    Taro.showLoading({ title: '正在识别中…', mask: true });

    setTimeout(() => {
      Taro.hideLoading();
      try {
        const historyItem: HistoryItem = {
          id: `h${Date.now()}`,
          inputType: 'image',
          inputImage: imagePath,
          ocrTexts: [...ocrTexts],
          matchedRumor: topRumor.id,
          candidateRumors: candidates,
          riskLevel: topRumor.riskLevel,
          checkedAt: new Date().toLocaleString('zh-CN')
        };
        let list: HistoryItem[] = [];
        try {
          const data = Taro.getStorageSync(STORAGE_KEY_HISTORY);
          if (data && Array.isArray(data)) list = data;
        } catch (e) {}
        list.unshift(historyItem);
        if (list.length > 20) list = list.slice(0, 20);
        Taro.setStorageSync(STORAGE_KEY_HISTORY, list);
      } catch (e) {}

      const paramCandidates = encodeURIComponent(candidates.join(','));
      const paramOcr = encodeURIComponent(ocrTexts.join('||'));
      Taro.redirectTo({
        url: `/pages/result/index?id=${topRumor.id}&type=image&image=${encodeURIComponent(imagePath)}&ocr=${paramOcr}&candidates=${paramCandidates}`
      });
    }, 800);
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.previewHeader}>
        <Text className={styles.previewTitle}>📷 请确认截图内容</Text>
        <Text className={styles.previewSubtitle}>系统从截图中提取了以下文字，确认无误后开始识别</Text>
      </View>

      <View className={styles.imageCard}>
        <Image
          src={imagePath}
          className={styles.previewImage}
          mode="widthFix"
          onError={() => Taro.showToast({ title: '图片加载失败', icon: 'none' })}
        />
      </View>

      <View className={styles.ocrSection}>
        <View className={styles.ocrHeader}>
          <Text className={styles.ocrTitle}>识别提取的文字</Text>
          <Text className={styles.ocrTag}>OCR 自动提取</Text>
        </View>
        <View className={styles.ocrList}>
          {ocrTexts.map((t, i) => (
            <View key={i} className={styles.ocrItem}>
              {t}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.tipsBox}>
        <Text className={styles.tipsText}>
          💡 如果文字提取有误，可能是图片不够清晰。您可以点击"重新选择"换一张更清晰的截图再试。
        </Text>
      </View>

      <View className={styles.actionRow}>
        <Button
          className={classnames(styles.btnAction, styles.btnSecondary)}
          onClick={handleRechoose}
        >
          重新选择
        </Button>
        <Button
          className={classnames(styles.btnAction, styles.btnPrimary)}
          onClick={handleStartIdentify}
        >
          开始识别
        </Button>
      </View>
    </View>
  );
};

export default ImagePreviewPage;
