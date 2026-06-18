import React, { useMemo } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockKnowledgeList } from '@/data/mockKnowledge';
import classnames from 'classnames';

const KnowledgeDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.params;

  const item = useMemo(() => {
    return mockKnowledgeList.find(k => k.id === id) || mockKnowledgeList[0];
  }, [id]);

  const formatReadCount = (n: number) => {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万阅读`;
    return `${n}阅读`;
  };

  const handleBack = () => Taro.navigateBack();
  const handleShare = () => {
    Taro.showToast({ title: '分享功能开发中', icon: 'none' });
  };

  return (
    <View className={styles.pageContainer}>
      <Image
        className={styles.coverImage}
        src={item.coverImage}
        mode="aspectFill"
      />

      <View className={styles.contentWrap}>
        <Text className={styles.title}>{item.title}</Text>

        <View className={styles.metaRow}>
          {item.official && <Text className={styles.officialTag}>官方</Text>}
          <Text className={classnames(styles.metaItem, styles.category)}>{item.category}</Text>
          <Text className={classnames(styles.metaItem, styles.source)}>{item.source}</Text>
          <Text className={classnames(styles.metaItem)}>{item.publishedAt}</Text>
          <Text className={classnames(styles.metaItem, styles.views)}>
            {formatReadCount(item.readCount)}
          </Text>
        </View>

        <Text className={styles.articleContent}>{item.content}</Text>

        <View className={styles.sectionGap} />

        <View className={styles.placeholderBox}>
          <View className={styles.placeholderIcon}>📖</View>
          <Text className={styles.placeholderTitle}>更多内容正在完善中</Text>
          <Text className={styles.placeholderDesc}>
            本文为演示数据，正式版本中将接入{"\n"}
            官方辟谣平台实时科普资源
          </Text>
        </View>
      </View>

      <View className={styles.actionBar}>
        <Button className={classnames(styles.btn, styles.btnSecondary)} onClick={handleBack}>
          返回列表
        </Button>
        <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={handleShare}>
          分享给家人
        </Button>
      </View>
    </View>
  );
};

export default KnowledgeDetailPage;
