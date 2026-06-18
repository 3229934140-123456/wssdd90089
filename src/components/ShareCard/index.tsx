import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import { Rumor } from '@/types/rumor';

interface ShareCardProps {
  rumor: Rumor;
}

const ShareCard: React.FC<ShareCardProps> = ({ rumor }) => {
  return (
    <View className={styles.cardWrap}>
      <View className={styles.cardHeader}>
        <View className={styles.cardLogo}>辟</View>
        <View className={styles.cardTitleArea}>
          <Text className={styles.cardAppName}>社区辟谣助手</Text>
          <Text className={styles.cardSub}>为家人守好真实信息第一道防线</Text>
        </View>
      </View>

      <View className={styles.rumorBox}>
        <View className={`${styles.boxLabel} ${styles.rumor}`}>✕ 不实信息</View>
        <Text className={styles.boxContent}>{rumor.content}</Text>
      </View>

      <View className={styles.truthBox}>
        <View className={`${styles.boxLabel} ${styles.truth}`}>✓ 真实情况</View>
        <Text className={styles.boxContent}>{rumor.truth}</Text>
      </View>

      <View className={styles.tipBox}>
        <Text className={styles.tipTitle}>温馨提醒</Text>
        <Text className={styles.tipContent}>
          看到消息先别急着转，遇到"紧急""赶紧""致癌"等字眼时更要多留个心眼。
          不确定的可以用本小程序查一查，或者等官方渠道的消息。
          不信谣、不传谣，就是保护家人最好的方式。
        </Text>
      </View>

      <View className={styles.cardFooter}>
        <Text className={styles.sourceText}>
          信息来源：{rumor.spreadPath.officialSource || '社区辟谣数据库'}
          {'\n'}
          识别时间：{rumor.createdAt}
        </Text>
        <View style={{ display: 'flex', alignItems: 'center' }}>
          <Text className={styles.scanText}>扫码查更多</Text>
          <View className={styles.qrPlaceholder}>二维码</View>
        </View>
      </View>
    </View>
  );
};

export default ShareCard;
