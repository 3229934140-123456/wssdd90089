import React, { useState, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import ShareCard from '@/components/ShareCard';
import { mockRumors } from '@/data/mockRumors';
import classnames from 'classnames';

const styleOptions = [
  { key: 'family', name: '长辈版', desc: '字体更大、更温和' },
  { key: 'friend', name: '朋友版', desc: '简洁清晰、好沟通' },
  { key: 'group', name: '群聊版', desc: '加来源、更可信' }
];

const destOptions = [
  '妈妈',
  '爸爸',
  '家里群',
  '婆婆/岳母',
  '小区业主群',
  '其他亲友'
];

const SharePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.params;

  const rumor = useMemo(() => {
    return mockRumors.find(r => r.id === id) || mockRumors[0];
  }, [id]);

  const [activeStyle, setActiveStyle] = useState('family');
  const [activeDest, setActiveDest] = useState('妈妈');

  const handleSave = () => {
    console.log('[分享页] 保存卡片');
    Taro.showToast({ title: '卡片已保存到相册', icon: 'success' });
  };

  const handleSend = () => {
    console.log('[分享页] 发送给：', activeDest);
    Taro.showModal({
      title: '发送确认',
      content: `即将发送给「${activeDest}」，使用「${styleOptions.find(s => s.key === activeStyle)?.name}」样式`,
      confirmText: '去发送',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已唤起分享面板', icon: 'success' });
        }
      }
    });
  };

  const handleBack = () => Taro.navigateBack();

  return (
    <View className={styles.pageContainer}>
      <View className={styles.headerSection}>
        <Text className={styles.title}>生成适合发给家人的卡片</Text>
        <Text className={styles.subtitle}>
          直接说"这是假的"太生硬？{"\n"}
          用转述卡片，温和又清楚地告诉家人
        </Text>
      </View>

      <View className={styles.tipBox}>
        <Text className={styles.tipIcon}>💡</Text>
        <Text className={styles.tipText}>
          小贴士：发给长辈的内容尽量避免"你被骗了"等字眼，
          用"我查了一下，官方说其实是这样的"更易接受哦
        </Text>
      </View>

      <View className={styles.cardPreviewArea}>
        <Text className={styles.previewLabel}>— 卡片预览 —</Text>
        <ShareCard rumor={rumor} />
      </View>

      <View className={styles.styleSelector}>
        <Text className={styles.sectionTitle}>选择卡片风格</Text>
        <View className={styles.styleOptions}>
          {styleOptions.map((opt) => (
            <View
              key={opt.key}
              className={classnames(styles.styleOption, activeStyle === opt.key ? styles.active : '')}
              onClick={() => setActiveStyle(opt.key)}
            >
              <Text className={styles.styleName}>{opt.name}</Text>
              <Text className={styles.styleDesc}>{opt.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.destSelector}>
        <Text className={styles.sectionTitle}>发送给（选择对象优化措辞）</Text>
        <View className={styles.destOptions}>
          {destOptions.map((d) => (
            <View
              key={d}
              className={classnames(styles.destOption, activeDest === d ? styles.active : '')}
              onClick={() => setActiveDest(d)}
            >
              {d}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={classnames(styles.btn, styles.btnSecondary)} onClick={handleBack}>
          返回结果
        </Button>
        <Button className={classnames(styles.btn, styles.btnOrange)} onClick={handleSave}>
          保存图片
        </Button>
        <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={handleSend}>
          发送给{activeDest}
        </Button>
      </View>
    </View>
  );
};

export default SharePage;
