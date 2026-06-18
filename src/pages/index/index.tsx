import React, { useState } from 'react';
import { View, Text, Textarea, Input, Button, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import RiskBadge from '@/components/RiskBadge';
import { mockRumors } from '@/data/mockRumors';
import { Rumor, HistoryItem } from '@/types/rumor';
import classnames from 'classnames';

const STORAGE_KEY_IMAGE = 'local_last_image';
const STORAGE_KEY_LINK = 'local_last_link';
const STORAGE_KEY_HISTORY = 'local_identify_history';

const platformLinkPatterns: {
  domain: RegExp;
  name: string;
  biasKeywords: string[];
  urlKeywords: (url: URL) => string[];
}[] = [
  {
    domain: /mp\.weixin\.qq\.com/i,
    name: '微信公众号',
    biasKeywords: ['公众号', '文章', '微信'],
    urlKeywords: (u) => {
      const title = u.searchParams.get('__biz') || '';
      const mid = u.searchParams.get('mid') || '';
      const idx = u.searchParams.get('idx') || '';
      return [title, mid, idx].filter(Boolean);
    }
  },
  {
    domain: /(douyin\.com|iesdouyin\.com)/i,
    name: '抖音短视频',
    biasKeywords: ['抖音', '短视频', '视频'],
    urlKeywords: (u) => {
      const segs = u.pathname.split('/').filter(Boolean);
      const videoId = segs.find(s => /^\d+$/.test(s)) || '';
      return [videoId, '视频'].filter(Boolean);
    }
  },
  {
    domain: /(kuaishou\.com|gifshow\.com)/i,
    name: '快手短视频',
    biasKeywords: ['快手', '短视频', '视频'],
    urlKeywords: (u) => {
      const segs = u.pathname.split('/').filter(Boolean);
      return [...segs.slice(0, 2), '视频'];
    }
  },
  {
    domain: /(weibo\.com|weibo\.cn)/i,
    name: '微博',
    biasKeywords: ['微博', '热搜', '热点'],
    urlKeywords: (u) => {
      const segs = u.pathname.split('/').filter(Boolean);
      return [...segs.slice(-2), '热搜'];
    }
  },
  {
    domain: /(bilibili\.com|b23\.tv)/i,
    name: 'B站视频',
    biasKeywords: ['B站', '视频', 'up主'],
    urlKeywords: (u) => {
      const bvid = u.searchParams.get('bvid') || '';
      const segs = u.pathname.split('/').filter(Boolean);
      return [bvid, ...segs.slice(0, 2), '视频'].filter(Boolean);
    }
  },
  {
    domain: /xiaohongshu\.com/i,
    name: '小红书',
    biasKeywords: ['小红书', '笔记', '种草'],
    urlKeywords: (u) => {
      const segs = u.pathname.split('/').filter(Boolean);
      return [...segs.slice(-2), '笔记'];
    }
  },
  {
    domain: /toutiao\.com/i,
    name: '今日头条',
    biasKeywords: ['头条', '新闻', '资讯'],
    urlKeywords: (u) => {
      const segs = u.pathname.split('/').filter(Boolean);
      return [...segs, '新闻'];
    }
  }
];

const IndexPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [inputLink, setInputLink] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'link' | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [hotRumors, setHotRumors] = useState<Rumor[]>([]);

  useDidShow(() => {
    setHotRumors(mockRumors.filter(r => r.riskLevel === 'high').slice(0, 4));
    try {
      const lastImage = Taro.getStorageSync(STORAGE_KEY_IMAGE);
      if (lastImage) setSelectedImage(lastImage);
    } catch (e) {}
  });

  const saveHistory = (item: HistoryItem) => {
    try {
      let list: HistoryItem[] = [];
      const data = Taro.getStorageSync(STORAGE_KEY_HISTORY);
      if (data && Array.isArray(data)) list = data;
      list.unshift(item);
      if (list.length > 20) list = list.slice(0, 20);
      Taro.setStorageSync(STORAGE_KEY_HISTORY, list);
    } catch (e) {}
  };

  const scoreAndSortRumors = (text: string, platformBonus: string[] = []): Rumor[] => {
    const lower = text.toLowerCase();
    const scored = mockRumors.map(r => {
      let score = 0;
      r.keywords.forEach(k => {
        const kl = k.toLowerCase();
        if (lower.includes(kl)) {
          score += 15;
          const idx = lower.indexOf(kl);
          score += Math.max(0, 10 - idx);
        }
      });
      platformBonus.forEach(pw => {
        if (r.keywords.some(k => k.includes(pw) || pw.includes(k))) score += 8;
        if (r.content.includes(pw)) score += 5;
      });
      if (r.spreadPath.origin) {
        const ch = r.spreadPath.origin.channel;
        if (platformBonus.includes('短视频') && ch === 'video') score += 6;
        if (platformBonus.includes('公众号') && ch === 'article') score += 6;
        if (platformBonus.includes('群聊') && ch === 'group') score += 6;
        if (platformBonus.includes('微博') && ch === 'moment') score += 6;
      }
      r.mainNodes?.forEach?.(() => {});
      score += Math.random() * 3;
      return { rumor: r, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const topScore = scored[0]?.score || 0;
    if (topScore < 5) {
      const shuffled = [...mockRumors].sort(() => Math.random() - 0.5);
      if (platformBonus.includes('短视频')) {
        const videoFirst = shuffled.filter(r => r.spreadPath?.origin?.channel === 'video');
        return [...videoFirst, ...shuffled.filter(r => !videoFirst.includes(r))];
      }
      if (platformBonus.includes('公众号') || platformBonus.includes('文章')) {
        const articleFirst = shuffled.filter(r => r.spreadPath?.origin?.channel === 'article');
        return [...articleFirst, ...shuffled.filter(r => !articleFirst.includes(r))];
      }
      if (platformBonus.includes('群聊')) {
        const groupFirst = shuffled.filter(r => r.spreadPath?.origin?.channel === 'group');
        return [...groupFirst, ...shuffled.filter(r => !groupFirst.includes(r))];
      }
      return shuffled;
    }
    return scored.map(s => s.rumor);
  };

  const handleSubmitText = () => {
    if (!inputText.trim()) {
      Taro.showToast({ title: '请输入可疑内容', icon: 'none' });
      return;
    }
    const sorted = scoreAndSortRumors(inputText);
    const rumor = sorted[0];
    const candidates = sorted.slice(0, 4).map(r => r.id);

    saveHistory({
      id: `h${Date.now()}`,
      inputType: 'text',
      inputText: inputText.trim(),
      matchedRumor: rumor.id,
      candidateRumors: candidates,
      riskLevel: rumor.riskLevel,
      checkedAt: new Date().toLocaleString('zh-CN')
    });

    const paramCandidates = encodeURIComponent(candidates.join(','));
    Taro.navigateTo({
      url: `/pages/result/index?id=${rumor.id}&input=${encodeURIComponent(inputText)}&type=text&candidates=${paramCandidates}`
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
        Taro.navigateTo({
          url: `/pages/image-preview/index?image=${encodeURIComponent(tempFilePath)}`
        });
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

      let platformName = '';
      let platformBias: string[] = [];
      let urlKw: string[] = [];
      try {
        const u = new URL(link);
        const matched = platformLinkPatterns.find(p => p.domain.test(u.hostname));
        if (matched) {
          platformName = matched.name;
          platformBias = matched.biasKeywords;
          try { urlKw = matched.urlKeywords(u); } catch (_) {}
        }
      } catch (_) {
        const guess = /(weixin|wechat|douyin|kuaishou|bilibili|b23|weibo|xiaohongshu|toutiao)/i.exec(link);
        if (guess) {
          platformName = guess[1] + '平台';
          if (/douyin|kuaishou|bilibili|b23/i.test(guess[1])) platformBias = ['短视频', '视频'];
          if (/weixin|wechat/i.test(guess[1])) platformBias = ['微信', '公众号', '文章'];
          if (/weibo/i.test(guess[1])) platformBias = ['微博', '热搜'];
          if (/xiaohongshu/i.test(guess[1])) platformBias = ['小红书', '笔记'];
          if (/toutiao/i.test(guess[1])) platformBias = ['头条', '新闻'];
        }
      }

      const combinedText = link + ' ' + platformName + ' ' + platformBias.join(' ') + ' ' + urlKw.join(' ');
      const sorted = scoreAndSortRumors(combinedText, platformBias);
      const rumor = sorted[0];
      const candidates = sorted.slice(0, 4).map(r => r.id);

      saveHistory({
        id: `h${Date.now()}`,
        inputType: 'link',
        inputLink: link,
        matchedRumor: rumor.id,
        candidateRumors: candidates,
        riskLevel: rumor.riskLevel,
        checkedAt: new Date().toLocaleString('zh-CN')
      });

      const paramCandidates = encodeURIComponent(candidates.join(','));
      const paramPlatform = encodeURIComponent(platformName);
      Taro.navigateTo({
        url: `/pages/result/index?id=${rumor.id}&type=link&link=${encodeURIComponent(link)}&candidates=${paramCandidates}&platform=${paramPlatform}`
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
              <View className={styles.linkPlatforms}>
                <Text className={styles.platformTip}>📌 支持识别：</Text>
                <Text className={styles.platformTag}>公众号</Text>
                <Text className={styles.platformTag}>抖音</Text>
                <Text className={styles.platformTag}>快手</Text>
                <Text className={styles.platformTag}>微博</Text>
                <Text className={styles.platformTag}>B站</Text>
                <Text className={styles.platformTag}>小红书</Text>
              </View>
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
