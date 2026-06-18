import React, { useState, useMemo } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import SpreadPath from '@/components/SpreadPath';
import RiskBadge from '@/components/RiskBadge';
import { mockRumors } from '@/data/mockRumors';
import { Rumor } from '@/types/rumor';
import classnames from 'classnames';

const riskLabelMap = {
  high: '⚠ 高风险 · 确认谣言',
  medium: '? 中风险 · 待核实',
  low: '✓ 低风险 · 不实信息'
};

const typeLabelMap: Record<string, { label: string; icon: string; color: string }> = {
  text: { label: '文字识别', icon: '文', color: '#2BA471' },
  image: { label: '截图识别', icon: '图', color: '#1890FF' },
  link: { label: '链接识别', icon: '链', color: '#722ED1' }
};

const ResultPage: React.FC = () => {
  const router = useRouter();
  const { id, input, type, image, link } = router.params;
  const rumor: Rumor | undefined = useMemo(() => {
    return mockRumors.find(r => r.id === id) || mockRumors[0];
  }, [id]);

  const inputTypeInfo = type && typeLabelMap[type] ? typeLabelMap[type] : null;

  const [showShare, setShowShare] = useState(false);

  const relatedRumors = useMemo(() => {
    return rumor
      ? mockRumors.filter(r => rumor.relatedRumors.includes(r.id)).slice(0, 3)
      : [];
  }, [rumor]);

  const handleTapRelated = (rid: string) => {
    console.log('[结果页] 点击相关谣言：', rid);
    Taro.redirectTo({ url: `/pages/result/index?id=${rid}` });
  };

  const handleShare = () => {
    console.log('[结果页] 生成分享卡片：', rumor.id);
    Taro.navigateTo({
      url: `/pages/share/index?id=${rumor.id}`
    });
  };

  const handleReportChannel = () => {
    console.log('[结果页] 补充渠道信息');
    Taro.showModal({
      title: '补充传播渠道',
      content: '您是在哪里看到这条消息的？匿名上报帮助社区管理员及时介入。',
      confirmText: '去上报',
      success: (res) => {
        if (res.confirm) {
          Taro.switchTab({ url: '/pages/report/index' });
        }
      }
    });
  };

  const handleBackHome = () => {
    Taro.switchTab({ url: '/pages/index/index' });
  };

  if (!rumor) {
    return (
      <View className={styles.pageContainer}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      <View className={classnames(styles.riskHeader, styles[rumor.riskLevel])}>
        <Text className={styles.riskIcon}>
          {rumor.riskLevel === 'high' ? '!' : rumor.riskLevel === 'medium' ? '?' : '✓'}
        </Text>
        <Text className={styles.riskLabel}>{riskLabelMap[rumor.riskLevel]}</Text>
        {inputTypeInfo && (
          <View className={styles.inputTypeBadge} style={{ background: inputTypeInfo.color }}>
            <Text className={styles.inputTypeBadgeText}>
              {inputTypeInfo.icon} {inputTypeInfo.label}
            </Text>
          </View>
        )}
        <Text className={styles.riskTitle}>{rumor.title}</Text>
        <Text className={styles.riskDesc}>{rumor.summary}</Text>
      </View>

      {inputTypeInfo && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>识别来源</Text>
          <View className={styles.matchBox}>
            <View className={styles.inputTypeRow}>
              <View className={styles.inputTypeIcon} style={{ background: inputTypeInfo.color }}>
                {inputTypeInfo.icon}
              </View>
              <View className={styles.inputTypeInfo}>
                <Text className={styles.inputTypeLabel}>{inputTypeInfo.label}结果</Text>
                <Text className={styles.matchLabel}>匹配度 {85 + Math.floor(Math.random() * 12)}%</Text>
              </View>
            </View>

            {type === 'image' && image && (
              <View className={styles.submittedWrap}>
                <Text className={styles.matchTitle}>您提交的截图：</Text>
                <Image
                  src={decodeURIComponent(image)}
                  className={styles.submittedImage}
                  mode="widthFix"
                />
              </View>
            )}

            {type === 'link' && link && (
              <View className={styles.submittedWrap}>
                <Text className={styles.matchTitle}>您识别的链接：</Text>
                <View className={styles.linkBox}>
                  <Text className={styles.linkText}>{decodeURIComponent(link)}</Text>
                </View>
              </View>
            )}

            {type === 'text' && input && (
              <View className={styles.submittedWrap}>
                <Text className={styles.matchTitle}>您提交的内容：</Text>
                <Text className={styles.matchDesc}>
                  "{decodeURIComponent(input)}"
                </Text>
              </View>
            )}

            <View style={{ marginTop: '16rpx' }}>
              <Text className={styles.matchTitle}>与以下高度相似：</Text>
              <Text className={styles.matchDesc}>{rumor.content}</Text>
              <View className={styles.keywordsRow}>
                {rumor.keywords.map((kw, idx) => (
                  <Text key={idx} className={styles.keywordTag}>#{kw}</Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      {!inputTypeInfo && input && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>识别匹配结果</Text>
          <View className={styles.matchBox}>
            <Text className={styles.matchLabel}>匹配度 92%</Text>
            <Text className={styles.matchTitle}>您提交的内容：</Text>
            <Text className={styles.matchDesc} style={{ marginBottom: '16rpx' }}>
              "{decodeURIComponent(input)}"
            </Text>
            <Text className={styles.matchTitle}>与以下高度相似：</Text>
            <Text className={styles.matchDesc}>{rumor.content}</Text>
            <View className={styles.keywordsRow}>
              {rumor.keywords.map((kw, idx) => (
                <Text key={idx} className={styles.keywordTag}>#{kw}</Text>
              ))}
            </View>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>情况说明</Text>

        <View className={styles.warnBox}>
          <Text className={styles.warnTitle}>友情提醒</Text>
          <Text className={styles.warnContent}>
            {rumor.riskLevel === 'high' && '这条消息经过官方核实为不实信息，请不要继续转发，也请转告家人朋友不要相信。'}
            {rumor.riskLevel === 'medium' && '这条消息目前正在核实中，建议暂时不要转发，等待官方渠道的进一步说明。'}
            {rumor.riskLevel === 'low' && '这条消息与历史不实信息高度相似，大概率是旧谣新传，不建议转发扩散。'}
          </Text>
        </View>

        <View className={styles.truthCard}>
          <Text className={styles.truthLabel}>💡 真实情况</Text>
          <Text className={styles.truthContent}>{rumor.truth}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>传播路径追踪</Text>
        <SpreadPath data={rumor.spreadPath} />
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>建议您这样做</Text>
        <View className={styles.actionCard}>
          <View className={styles.actionItem}>
            <View className={styles.actionNum}>1</View>
            <View className={styles.actionContent}>
              <Text className={styles.actionTitle}>不转发、不讨论</Text>
              <Text className={styles.actionDesc}>
                群里看到先别急着转，"宁可信其有"的心态反而会帮助谣言扩散。
                不确定的可以等一等，让消息"飞一会儿"再判断。
              </Text>
            </View>
          </View>
          <View className={styles.actionItem}>
            <View className={styles.actionNum}>2</View>
            <View className={styles.actionContent}>
              <Text className={styles.actionTitle}>告诉家人正确做法</Text>
              <Text className={styles.actionDesc}>
                不用直接说"你又被骗了"，把本页的真实情况和来源发给他们，
                或者用下方的"分享辟谣卡片"生成适合长辈看的图文。
              </Text>
            </View>
          </View>
          <View className={styles.actionItem}>
            <View className={styles.actionNum}>3</View>
            <View className={styles.actionContent}>
              <Text className={styles.actionTitle}>匿名补充传播渠道</Text>
              <Text className={styles.actionDesc}>
                如果这条消息已经进入了您的小区业主群、家庭群等，
                可以匿名上报，帮助社区管理员及时发现和介入。
              </Text>
            </View>
          </View>
          <View className={styles.actionItem}>
            <View className={styles.actionNum}>4</View>
            <View className={styles.actionContent}>
              <Text className={styles.actionTitle}>需要时请举报</Text>
              <Text className={styles.actionDesc}>
                微信内长按消息可以直接投诉；如涉及诈骗、人身安全等请拨打110报警。
              </Text>
            </View>
          </View>
        </View>
      </View>

      {relatedRumors.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>大家还查了这些</Text>
          <View className={styles.relatedList}>
            {relatedRumors.map((rr) => (
              <View
                key={rr.id}
                className={styles.relatedItem}
                onClick={() => handleTapRelated(rr.id)}
              >
                <View className={styles.relatedIcon}>→</View>
                <View className={styles.relatedContent}>
                  <Text className={styles.relatedTitle}>{rr.title}</Text>
                </View>
                <RiskBadge level={rr.riskLevel} showLabel={false} />
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.bottomBar}>
        <Button className={classnames(styles.btn, styles.btnSecondary)} onClick={handleBackHome}>
          返回首页
        </Button>
        <Button className={classnames(styles.btn, styles.btnOrange)} onClick={handleReportChannel}>
          补充渠道
        </Button>
        <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={handleShare}>
          分享辟谣
        </Button>
      </View>
    </View>
  );
};

export default ResultPage;
