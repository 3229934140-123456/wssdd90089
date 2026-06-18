import React from 'react';
import { View } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { ChannelType } from '@/types/rumor';
import { channelList } from '@/data/mockChannels';

interface ChannelTagProps {
  type: ChannelType;
}

const ChannelTag: React.FC<ChannelTagProps> = ({ type }) => {
  return (
    <View className={classnames(styles.channelTag, styles[type])}>
      {channelList[type].name}
    </View>
  );
};

export default ChannelTag;
