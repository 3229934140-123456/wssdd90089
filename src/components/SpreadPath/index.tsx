import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import ChannelTag from '@/components/ChannelTag';
import { SpreadPath as SpreadPathType } from '@/types/rumor';

interface SpreadPathProps {
  data: SpreadPathType;
}

const SpreadPath: React.FC<SpreadPathProps> = ({ data }) => {
  const totalCount = data.mainNodes.reduce((sum, n) => sum + n.count, 0);

  const formatCount = (n: number): string => {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}千`;
    return `${n}`;
  };

  return (
    <View className={styles.container}>
      <View className={styles.title}>传播路径追踪</View>

      <View className={styles.pathWrap}>
        <View className={styles.originNode}>
          <View className={styles.nodeHeader}>
            <Text className={styles.nodeName}>{data.origin.name}</Text>
            <ChannelTag type={data.origin.channel} />
          </View>
          <Text className={styles.nodeDesc}>{data.origin.description}</Text>
          <View className={styles.nodeMeta}>
            <Text className={styles.nodeTime}>最早出现：{data.origin.timestamp}</Text>
          </View>
        </View>

        {data.mainNodes.map((node, idx) => (
          <React.Fragment key={node.id}>
            <View className={styles.nodeConnector}>
              <View className={styles.arrowIcon}>↓</View>
            </View>
            <View
              className={styles.mainNode}
              data-step={`${idx + 1}`}
            >
              <View className={styles.nodeHeader}>
                <Text className={styles.nodeName}>{node.name}</Text>
                <ChannelTag type={node.channel} />
              </View>
              <Text className={styles.nodeDesc}>{node.description}</Text>
              <View className={styles.nodeMeta}>
                <Text className={styles.nodeTime}>{node.timestamp}</Text>
                <Text className={styles.nodeCount}>约 {formatCount(node.count)} 人看到</Text>
              </View>
            </View>
          </React.Fragment>
        ))}
      </View>

      <View className={styles.summaryRow}>
        <View className={styles.summaryItem}>
          <View className={styles.summaryValue}>{data.mainNodes.length + 1}</View>
          <View className={styles.summaryLabel}>个传播环节</View>
        </View>
        <View className={styles.summaryItem}>
          <View className={styles.summaryValue}>{formatCount(totalCount)}</View>
          <View className={styles.summaryLabel}>累计触达人次</View>
        </View>
        <View className={styles.summaryItem}>
          <View className={styles.summaryValue}>
            {data.hasOfficialResponse ? '✓' : '…'}
          </View>
          <View className={styles.summaryLabel}>官方回应</View>
        </View>
      </View>

      {data.hasOfficialResponse ? (
        <View className={styles.officialBox}>
          <View className={styles.officialLabel}>官方回应</View>
          <Text className={styles.officialContent}>{data.officialResponse}</Text>
          {data.officialSource && (
            <Text className={styles.officialSource}>—— {data.officialSource}</Text>
          )}
        </View>
      ) : (
        <View className={styles.noOfficial}>
          <Text className={styles.noOfficialText}>
            <strong>提示：</strong>目前暂未查到官方回应，建议谨慎转发，等待权威渠道核实后再判断。
          </Text>
        </View>
      )}
    </View>
  );
};

export default SpreadPath;
