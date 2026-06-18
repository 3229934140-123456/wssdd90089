import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { RiskLevel } from '@/types/rumor';

interface RiskBadgeProps {
  level: RiskLevel;
  showLabel?: boolean;
}

const labelMap = {
  high: '确认谣言',
  medium: '待核实',
  low: '已辟不实'
};

const iconMap = {
  high: '!',
  medium: '?',
  low: '✓'
};

const RiskBadge: React.FC<RiskBadgeProps> = ({ level, showLabel = true }) => {
  return (
    <View className={classnames(styles.riskBadge, styles[level])}>
      <Text className={styles.icon}>{iconMap[level]}</Text>
      {showLabel && <Text>{labelMap[level]}</Text>}
    </View>
  );
};

export default RiskBadge;
