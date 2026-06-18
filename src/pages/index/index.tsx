import React, { useState } from 'react';
import { View, Text, Textarea, Input, Button, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import RiskBadge from '@/components/RiskBadge';
import { mockRumors } from '@/data/mockRumors';
import { Rumor } from '@/types/rumor';
import classnames from 'classnames';

const STORAGE_KEY_IMAGE = 'local_last_image';
const STORAGE_KEY_LINK = 'local_last_link';

const IndexPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [inputLink, setInputLink] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'link' | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [hotRumors, setHotRumors] = useState<Rumor[]>([]);

  useDidShow(() => {
    setHotRumors(mockRumors.filter(r => r.riskLevel === 'high').slice(0, 4));
  });

  const matchRumorByText = (text: string): Rumor => {
    const matched = mockRumors.find(r =>
      r.keywords.some(k => text.toLowerCase().includes(k.toLowerCase()))
    );
    if (matched) return matched;
    const randomIdx = Math.floor(Math.random() * mockRumors.length);
    return mockRumors[randomIdx];
  };

  const handleSubmitText = () => {
    if (!inputText.trim()) {
      Taro.showToast({ title: '请输入可疑内容', icon: 'none' });
      return;
    }
    const rumor = matchRumorByText(inputText);
    Taro.navigateTo({
      url: `/pages/result/index?id=${rumor.id}&input=${encodeURIComponent(inputText)}&type=text`
    });
  };

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0] || res.tempFiles[0]?.path;
        if (!tempFilePath) {
          Taro.showToast({ title: '选取图片失败', icon: 'none' });
          return;
        }
        setSelectedImage(tempFilePath);
        try { Taro.setStorageSync(STORAGE_KEY_IMAGE, tempFilePath); } catch (e) {}
        Taro.showLoading({ title: '正在识别截图…', mask: true });
        setTimeout(() => {
          Taro.hideLoading();
          const imageKeywords = ['截图', '群聊', '图片', '转发'];
          const rumor = matchRumorByText(imageKeywords.join(' ') + ' ' + mockRumors[Math.floor(Math.random() * mockRumors.length)].keywords[0]);
          Taro.navigateTo({
            url: `/pages/result/index?id=${rumor.id}&type=image&image=${encodeURIComponent(tempFilePath)}`
          });
        }, 1200);
      },
      fail: () => {
        Taro.showToast({ title: '已取消选择', icon: 'none' });
      }
    });
  };

  const handleSubmitLink = () => {
    if (!inputLink.trim()) {
      Taro.showToast({ title: '请粘贴文章或视频链接', icon: 'none' });
      return;
    }
    const link = inputLink.trim();
    try { Taro.setStorageSync(STORAGE_KEY_LINK, link); } catch (e) {}
    Taro.showLoading({ title: '正在分析链接…', mask: true });
    setTimeout(() => {
      Taro.hideLoading();
      const domainKeywords: Record<string, string[]> = {
        'weixin': ['微信', '公众号', '文章'],
        'qq': ['QQ', '群聊'],
        'douyin': ['抖音', '短视频'],
        'kuaishou': ['快手', '短视频'],
        'bilibili': ['B站', '视频'],
        'weibo': ['微博', '热搜'],
        'xiaohongshu': ['小红书', '笔记'],
        'toutiao': ['头条', '新闻']
      };
      let extraKw: string[] = [];
      for (const domain in domainKeywords) {
        if (link.toLowerCase().includes(domain)) {
          extraKw = domainKeywords[domain];
          break;
        }
      }
      const rumor = matchRumorByText(link + ' ' + extraKw.join(' '));
      Taro.navigateTo({
        url: `/pages/result/index?id=${rumor.id}&type=link&link=${encodeURIComponent(link)}`
      });
    }, 1000);
  };

  const handleTapMode = (mode: 'text' | 'link') => {
    if (inputMode === mode) {
      setInputMode(null);
    } else {
      setInputMode(mode);
      if (mode === 'text') setInputLink('');
      if (mode === 'link') setInputText('');
    }
  };

  const handleTapHot = (rumorId: string) => {
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
              className={classnames(styles.inputOption, inputMode === 'text' ? styles.inputOptionActive : '')}
              onClick={() => handleTapMode('text')}
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
            <View
              className={classnames(styles.inputOption, inputMode === 'link' ? styles.inputOptionActive : '')}
              onClick={() => handleTapMode('link')}
            >
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

          {inputMode === 'link' && (
            <>
              <Input
                className={styles.linkInputArea}
                placeholder="粘贴文章链接、短视频链接… 例如 https://mp.weixin.qq.com/s/xxx"
                value={inputLink}
                onInput={(e) => setInputLink(e.detail.value)}
                maxlength={500}
                confirmType="done"
              />
              {selectedImage && inputMode === 'link' ? null : null}
              <Button
                className={`${styles.submitBtn} ${!inputLink.trim() ? styles.disabled : ''}`}
                onClick={handleSubmitLink}
              >
                分析链接
              </Button>
            </>
          )}

          {selectedImage && inputMode !== 'link' && inputMode !== 'text' && (
            <View className={styles.imagePreviewWrap}>
              <Text className={styles.imagePreviewLabel}>上次识别的截图：</Text>
              <Image src={selectedImage} className={styles.imagePreview} mode="aspectFill" />
            </View>
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
