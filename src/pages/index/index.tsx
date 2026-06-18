import React, { useState } from 'react';
import { View, Text, Textarea, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import RiskBadge from '@/components/RiskBadge';
import { mockRumors } from '@/data/mockRumors';
import { Rumor } from '@/types/rumor';

const IndexPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [inputMode, setInputMode] = useState<'text' | null>(null);
  const [hotRumors, setHotRumors] = useState<Rumor[]>([]);

  useDidShow(() => {
    setHotRumors(mockRumors.filter(r => r.riskLevel === 'high').slice(0, 4));
    console.log('[首页] 加载热门谣言，共', hotRumors.length, '条');
  });

  const handleSubmitText = () => {
    if (!inputText.trim()) {
      Taro.showToast({ title: '请输入可疑内容', icon: 'none' });
      return;
    }
    console.log('[首页] 提交文字识别：', inputText.substring(0, 50) + '...');
    const matched = mockRumors.find(r =>
      r.keywords.some(k => inputText.includes(k))
    );
    const rumorId = matched ? matched.id : mockRumors[0].id;
    Taro.navigateTo({
      url: `/pages/result/index?id=${rumorId}&input=${encodeURIComponent(inputText)}`
    });
  };

  const handleChooseImage = () => {
    console.log('[首页] 选择截图识别');
    Taro.showToast({ title: '截图识别已模拟', icon: 'success' });
    setTimeout(() => {
      Taro.navigateTo({
        url: `/pages/result/index?id=${mockRumors[4].id}&type=image`
      });
    }, 800);
  };

  const handlePasteLink = () => {
    console.log('[首页] 粘贴链接识别');
    Taro.showToast({ title: '链接识别已模拟', icon: 'success' });
    setTimeout(() => {
      Taro.navigateTo({
        url: `/pages/result/index?id=${mockRumors[9].id}&type=link`
      });
    }, 800);
  };

  const handleTapHot = (rumorId: string) => {
    console.log('[首页] 点击热门谣言：', rumorId);
    Taro.navigateTo({ url: `/pages/result/index?id=${rumorId}` });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.heroSection}>
        <Text className={styles.heroTitle}>帮您辨别身边的谣言</Text>
        <Text className={styles.heroSubtitle}>
          粘贴文字、上传截图或分享链接，{"\n"}
          让社区更安全，让家人更放心
        </Text>
        <View className={styles.heroBadges}>
          <Text className={styles.heroBadge}>已识别谣言 {mockRumors.length}+ 条</Text>
          <Text className={styles.heroBadge}>官方回应率 100%</Text>
        </View>
      </View>

      <View className={styles.inputSection}>
        <View className={styles.inputCard}>
          <Text className={styles.inputCardTitle}>选择识别方式</Text>
          <View className={styles.inputOptions}>
            <View
              className={styles.inputOption}
              onClick={() => setInputMode(inputMode === 'text' ? null : 'text')}
            >
              <View className={styles.inputOptionIcon}>文</View>
              <Text className={styles.inputOptionLabel}>粘贴文字</Text>
              <Text className={styles.inputOptionDesc}>复制可疑消息</Text>
            </View>
            <View className={styles.inputOption} onClick={handleChooseImage}>
              <View className={styles.inputOptionIcon}>图</View>
              <Text className={styles.inputOptionLabel}>上传截图</Text>
              <Text className={styles.inputOptionDesc}>群聊截图等</Text>
            </View>
            <View className={styles.inputOption} onClick={handlePasteLink}>
              <View className={styles.inputOptionIcon}>链</View>
              <Text className={styles.inputOptionLabel}>分享链接</Text>
              <Text className={styles.inputOptionDesc}>文章/视频链接</Text>
            </View>
          </View>

          {inputMode === 'text' && (
            <>
              <Textarea
                className={styles.textInputArea}
                placeholder="把你看到的可疑消息粘贴在这里…"
                value={inputText}
                onInput={(e) => setInputText(e.detail.value)}
                maxlength={500}
                autoHeight
              />
              <Button
                className={`${styles.submitBtn} ${!inputText.trim() ? styles.disabled : ''}`}
                onClick={handleSubmitText}
              >
                开始识别
              </Button>
            </>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>近期大家都在查</Text>
          <Text
            className={styles.sectionMore}
            onClick={() => Taro.switchTab({ url: '/pages/knowledge/index' })}
          >
            查看更多 →
          </Text>
        </View>

        <View className={styles.hotList}>
          {hotRumors.map((rumor) => (
            <View
              key={rumor.id}
              className={styles.hotCard}
              onClick={() => handleTapHot(rumor.id)}
            >
              <View className={styles.hotCardTop}>
                <Text className={styles.hotCardTitle}>{rumor.title}</Text>
                <RiskBadge level={rumor.riskLevel} showLabel={false} />
              </View>
              <Text className={styles.hotCardDesc}>{rumor.summary}</Text>
              <View className={styles.hotCardFooter}>
                <Text className={styles.hotCardCategory}>#{rumor.category}</Text>
                <Text className={styles.hotCardViews}>查过的人：{rumor.createdAt}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className={styles.tipsCard}>
          <Text className={styles.tipsTitle}>长辈们常说的三句话</Text>
          <View className={styles.tipsList}>
            <Text className={styles.tipsItem}>① "群里都在转，肯定是真的"</Text>
            <Text className={styles.tipsItem}>② "不信可以，但转给家人没坏处"</Text>
            <Text className={styles.tipsItem}>③ "人家都配视频了，还能有假？"</Text>
          </View>
          <Text style={{ fontSize: '24rpx', color: '#d48806', marginTop: '16rpx' }}>
            遇到这些情况，不如先花10秒查一查 👆
          </Text>
        </View>
      </View>
    </View>
  );
};

export default IndexPage;
