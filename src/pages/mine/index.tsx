import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import RiskBadge from '@/components/RiskBadge';
import { mockHistory } from '@/data/mockRumors';
import classnames from 'classnames';

const inputTypeMap = {
  text: '文',
  image: '图',
  link: '链'
};

const MinePage: React.FC = () => {
  const handleTapHistory = (h: typeof mockHistory[0]) => {
    console.log('[我的] 点击历史记录：', h.id);
    if (h.matchedRumor) {
      Taro.navigateTo({ url: `/pages/result/index?id=${h.matchedRumor}` });
    }
  };

  const handleTapMenuItem = (key: string) => {
    console.log('[我的] 点击菜单项：', key);
    Taro.showToast({ title: `${key} 功能开发中`, icon: 'none' });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.profileHeader}>
        <View className={styles.profileRow}>
          <View className={styles.avatar}>邻</View>
          <View className={styles.profileInfo}>
            <Text className={styles.userName}>邻里守望者</Text>
            <Text className={styles.userRole}>🏡 社区居民 · 已守护 3 个家庭</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{mockHistory.length}</Text>
          <Text className={styles.statName}>识别次数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>8</Text>
          <Text className={styles.statName}>收藏辟谣</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>3</Text>
          <Text className={styles.statName}>分享家人</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>2</Text>
          <Text className={styles.statName}>上报线索</Text>
        </View>
      </View>

      <View className={styles.historySection}>
        <Text className={styles.sectionTitle}>最近识别</Text>
        <View className={styles.historyList}>
          {mockHistory.map((h) => (
            <View
              key={h.id}
              className={styles.historyItem}
              onClick={() => handleTapHistory(h)}
            >
              <View className={styles.historyIcon}>{inputTypeMap[h.inputType]}</View>
              <View className={styles.historyInfo}>
                <Text className={styles.historyText}>
                  {h.inputText || `查看的${h.riskLevel === 'high' ? '高风险' : ''}消息`}
                </Text>
                <Text className={styles.historyTime}>{h.checkedAt}</Text>
              </View>
              <RiskBadge level={h.riskLevel} showLabel={false} />
            </View>
          ))}
        </View>
      </View>

      <View className={styles.volunteerBanner}>
        <Text className={styles.bannerTitle}>加入社区志愿者</Text>
        <Text className={styles.bannerDesc}>
          成为社区辟谣志愿者，帮助更多邻居辨别谣言。{"\n"}
          志愿者可获得官方培训和社区管理后台权限。
        </Text>
        <Button className={styles.bannerBtn} onClick={() => handleTapMenuItem('志愿者申请')}>
          立即申请加入 →
        </Button>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.sectionTitle}>我的工具</Text>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={() => handleTapMenuItem('收藏')}>
            <View className={classnames(styles.menuIcon, styles.green)}>★</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>我的收藏</Text>
              <Text className={styles.menuDesc}>收藏的辟谣文章和科普内容</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleTapMenuItem('分享记录')}>
            <View className={classnames(styles.menuIcon, styles.blue)}>→</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>分享记录</Text>
              <Text className={styles.menuDesc}>发给家人朋友的辟谣卡片记录</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => Taro.switchTab({ url: '/pages/report/index' })}>
            <View className={classnames(styles.menuIcon, styles.orange)}>!</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>我的上报</Text>
              <Text className={styles.menuDesc}>查看上报过的谣言线索处理进度</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.sectionTitle}>更多</Text>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={() => handleTapMenuItem('长辈关怀')}>
            <View className={classnames(styles.menuIcon, styles.purple)}>♥</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>长辈关怀模式</Text>
              <Text className={styles.menuDesc}>更大字体、更简洁的界面</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleTapMenuItem('消息设置')}>
            <View className={classnames(styles.menuIcon, styles.red)}>@</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>消息通知</Text>
              <Text className={styles.menuDesc}>小区谣言预警、官方辟谣推送</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleTapMenuItem('关于')}>
            <View className={classnames(styles.menuIcon, styles.gray)}>i</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>关于我们</Text>
              <Text className={styles.menuDesc}>社区辟谣助手 v1.0.0</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MinePage;
