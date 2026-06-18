import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import RiskBadge from '@/components/RiskBadge';
import { mockKnowledgeList, categoryOptions } from '@/data/mockKnowledge';
import { mockRumors } from '@/data/mockRumors';
import classnames from 'classnames';

const KnowledgePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchText, setSearchText] = useState('');

  const filteredKnowledge = useMemo(() => {
    let list = mockKnowledgeList;
    if (activeCategory !== '全部') {
      list = list.filter(item => item.category === activeCategory);
    }
    if (searchText.trim()) {
      const kw = searchText.trim();
      list = list.filter(item =>
        item.title.includes(kw) || item.summary.includes(kw)
      );
    }
    return list;
  }, [activeCategory, searchText]);

  const hotRumors = useMemo(() => mockRumors.slice(0, 5), []);

  const handleTapKnowledge = (id: string) => {
    console.log('[知识库] 点击科普文章：', id);
    Taro.navigateTo({
      url: `/pages/knowledge-detail/index?id=${id}`
    });
  };

  const handleTapRumor = (rumorId: string) => {
    console.log('[知识库] 点击谣言条目：', rumorId);
    Taro.navigateTo({ url: `/pages/result/index?id=${rumorId}` });
  };

  const formatReadCount = (n: number) => {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万阅读`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}千阅读`;
    return `${n}阅读`;
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.headerSection}>
        <View className={styles.searchBar}>
          <View className={styles.searchIcon} />
          <Input
            className={styles.searchInput}
            placeholder="搜索关键词，如：自来水、大蒜、微信"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>
        <ScrollView scrollX className={styles.categoryScroll} enhanced showScrollbar={false}>
          {categoryOptions.map((cat) => (
            <View
              key={cat}
              className={classnames(styles.categoryItem, activeCategory === cat ? styles.active : '')}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.officialBanner}>
        <View className={styles.bannerContent}>
          <Text className={styles.bannerTitle}>官方辟谣专区</Text>
          <Text className={styles.bannerDesc}>网信办、卫健委、公安部等权威发布</Text>
        </View>
        <Text className={styles.bannerBadge}>已收录 {mockKnowledgeList.filter(k => k.official).length} 篇</Text>
      </View>

      <View className={styles.listSection}>
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>科普文章</Text>
          <Text className={styles.listCount}>共 {filteredKnowledge.length} 篇</Text>
        </View>

        <View className={styles.knowledgeList}>
          {filteredKnowledge.map((item) => (
            <View
              key={item.id}
              className={styles.knowledgeCard}
              onClick={() => handleTapKnowledge(item.id)}
            >
              <Image
                className={styles.cardCover}
                src={item.coverImage}
                mode="aspectFill"
              />
              <View className={styles.cardBody}>
                <View className={styles.cardTop}>
                  <Text className={styles.cardTitle}>{item.title}</Text>
                  {item.official && <Text className={styles.officialTag}>官方</Text>}
                </View>
                <Text className={styles.cardSummary}>{item.summary}</Text>
                <View className={styles.cardFooter}>
                  <View className={styles.cardMeta}>
                    <Text className={classnames(styles.metaItem, styles.category)}>{item.category}</Text>
                    <Text className={classnames(styles.metaItem, styles.source)}>{item.source}</Text>
                  </View>
                  <Text className={classnames(styles.metaItem, styles.views)}>
                    {formatReadCount(item.readCount)}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {filteredKnowledge.length === 0 && (
            <View style={{ padding: '80rpx 0', textAlign: 'center', color: '#9CA3AF' }}>
              <Text>暂无匹配的科普文章</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.rumorSection}>
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>常见谣言速查</Text>
          <Text className={styles.listCount}>共 {mockRumors.length} 条</Text>
        </View>

        <View className={styles.rumorList}>
          {hotRumors.map((rumor) => (
            <View
              key={rumor.id}
              className={classnames(styles.rumorCard, styles[rumor.riskLevel])}
              onClick={() => handleTapRumor(rumor.id)}
            >
              <View className={styles.rumorHeader}>
                <Text className={styles.rumorTitle}>{rumor.title}</Text>
                <RiskBadge level={rumor.riskLevel} />
              </View>
              <Text className={styles.rumorTruth}>💡 {rumor.summary}</Text>
              <View className={styles.rumorMeta}>
                <Text style={{ fontSize: '22rpx', color: '#9CA3AF' }}>#{rumor.category}</Text>
                <Text style={{ fontSize: '22rpx', color: '#2BA471' }}>点击查看详情 →</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default KnowledgePage;
