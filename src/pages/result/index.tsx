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
  const { id, input, type, image, link, ocr, candidates, platform } = router.params;

  const ocrTexts = useMemo(() => {
    if (!ocr) return [];
    try { return decodeURIComponent(ocr).split('||').filter(Boolean); }
    catch (e) { return []; }
  }, [ocr]);

  const candidateIds = useMemo(() => {
    if (!candidates) return [];
    try { return decodeURIComponent(candidates).split(',').filter(Boolean); }
    catch (e) { return []; }
  }, [candidates]);

  const platformName = useMemo(() => {
    if (!platform) return '';
    try { return decodeURIComponent(platform); } catch (e) { return ''; }
  }, [platform]);

  const [activeRumorId, setActiveRumorId] = useState<string>(id || mockRumors[0].id);
  const [showShare, setShowShare] = useState(false);

  const rumor: Rumor | undefined = useMemo(() => {
    return mockRumors.find(r => r.id === activeRumorId) || mockRumors.find(r => r.id === id) || mockRumors[0];
  }, [activeRumorId, id]);

  const inputTypeInfo = type && typeLabelMap[type] ? typeLabelMap[type] : null;

  const candidateRumors = useMemo(() => {
    let list = candidateIds.length > 0
      ? candidateIds.map(cid => mockRumors.find(r => r.id === cid)).filter(Boolean) as Rumor[]
      : [];
    if (list.length === 0 && rumor) {
      const related = rumor.relatedRumors
        .map(rid => mockRumors.find(r => r.id === rid))
        .filter(Boolean) as Rumor[];
      const extras = mockRumors.filter(r => r.id !== rumor.id && !related.includes(r)).slice(0, 2);
      list = [rumor, ...related, ...extras].slice(0, 5);
    }
    const idSet = new Set<string>();
    return list.filter(r => {
      if (idSet.has(r.id)) return false;
      idSet.add(r.id);
      return true;
    });
  }, [candidateIds, rumor]);

  const handleTapCandidate = (rid: string) => {
    if (rid === activeRumorId) return;
    setActiveRumorId(rid);
    Taro.pageScrollTo({ scrollTop: 0, duration: 300 });
    Taro.showToast({ title: '已切换', icon: 'none' });
  };

  const handleShare = () => {
    if (!rumor) return;
    Taro.navigateTo({
      url: `/pages/share/index?id=${rumor.id}`
    });
  };

  const handleReportChannel = () => {
    if (!rumor) return;
    const params: string[] = [];
    params.push(`rumorId=${rumor.id}`);
    params.push(`rumorTitle=${encodeURIComponent(rumor.title)}`);

    const srcType: string = (type as string) || 'manual';
    params.push(`sourceType=${srcType}`);

    let contentForReport = '';
    let sourceDetail = '';
    if (type === 'text' && input) {
      const raw = decodeURIComponent(input);
      contentForReport = `在群里看到：「${raw.length > 80 ? raw.substring(0, 80) + '…' : raw}」。与《${rumor.title}》高度相似，已在多个群聊转发，疑似存在夸大或不实描述。`;
      sourceDetail = `文字识别内容：${raw.length > 40 ? raw.substring(0, 40) + '…' : raw}`;
    } else if (type === 'link' && link) {
      const raw = decodeURIComponent(link);
      const platformText = platformName ? decodeURIComponent(platformName) : '网络链接';
      contentForReport = `在${platformText}看到这条链接：${raw.length > 80 ? raw.substring(0, 80) + '…' : raw}。标题与《${rumor.title}》高度相似，已有不少网友转发，传播速度较快，希望管理员核实。`;
      sourceDetail = `${platformText}链接：${raw.length > 50 ? raw.substring(0, 50) + '…' : raw}`;
    } else if (type === 'image' && (ocr || image)) {
      const ocrList = ocrTexts;
      const ocrText = ocrList.length > 0 ? ocrList.join('；') : '截图识别的群聊文字内容';
      contentForReport = `收到一张群聊截图，里面内容提到「${ocrText.length > 60 ? ocrText.substring(0, 60) + '…' : ocrText}」。与《${rumor.title}》属于同一类不实信息，截图已在多个亲友群转发，需要留意是否已进入小区业主群。`;
      sourceDetail = `截图OCR识别：${ocrText.length > 40 ? ocrText.substring(0, 40) + '…' : ocrText}`;
    } else {
      contentForReport = `谣言《${rumor.title}》在社区内传播，希望管理员留意。`;
      sourceDetail = '从结果页手动发起补充渠道';
    }
    params.push(`rumorContent=${encodeURIComponent(contentForReport)}`);
    if (sourceDetail) params.push(`sourceDetail=${encodeURIComponent(sourceDetail)}`);

    const modalContent = type === 'text'
      ? `识别结果：${rumor.title}\n\n内容来源：文字粘贴\n将自动带上以上信息，告诉管理员您是在哪里看到的。`
      : type === 'link'
        ? `识别结果：${rumor.title}\n\n内容来源：${platformName || '分享链接'}\n将自动带上链接和谣言标题，方便管理员快速定位。`
        : type === 'image'
          ? `识别结果：${rumor.title}\n\n内容来源：截图识别\n将自动带上截图OCR提取的文字内容。`
          : `识别结果：${rumor.title}\n\n将自动带上这条谣言的标题。`;

    Taro.showModal({
      title: '补充传播渠道',
      content: modalContent,
      confirmText: '去上报',
      success: (res) => {
        if (res.confirm) {
          Taro.switchTab({
            url: `/pages/report/index?${params.join('&')}`,
            fail: () => {
              Taro.setStorageSync('pending_report_params', params.join('&'));
              Taro.switchTab({ url: '/pages/report/index' });
            }
          });
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
        <View className={styles.riskBadgeRow}>
          <Text className={styles.riskLabel}>{riskLabelMap[rumor.riskLevel]}</Text>
          {inputTypeInfo && (
            <View className={styles.inputTypeBadge} style={{ background: inputTypeInfo.color }}>
              <Text className={styles.inputTypeBadgeText}>
                {inputTypeInfo.icon} {inputTypeInfo.label}
              </Text>
            </View>
          )}
        </View>
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
                <Text className={styles.inputTypeLabel}>
                  {inputTypeInfo.label}结果
                  {platformName ? ` · ${platformName}` : ''}
                </Text>
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

            {type === 'image' && ocrTexts.length > 0 && (
              <View className={styles.submittedWrap}>
                <View className={styles.ocrHeader}>
                  <Text className={styles.matchTitle}>识别提取的文字：</Text>
                  <Text className={styles.ocrTag}>OCR</Text>
                </View>
                <View className={styles.ocrList}>
                  {ocrTexts.map((t, i) => (
                    <View key={i} className={styles.ocrItem}>• {t}</View>
                  ))}
                </View>
              </View>
            )}

            {type === 'link' && link && (
              <View className={styles.submittedWrap}>
                <Text className={styles.matchTitle}>您识别的链接：</Text>
                <View className={styles.linkBox}>
                  <Text className={styles.linkText}>{decodeURIComponent(link)}</Text>
                </View>
                {platformName && (
                  <Text className={styles.platformHint}>🔍 已识别来源平台：{platformName}</Text>
                )}
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

      {candidateRumors.length > 1 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>相似谣言候选（{candidateRumors.length}）</Text>
          <Text className={styles.sectionSubtitle}>点击切换查看传播路径和官方回应 →</Text>
          <View className={styles.candidateList}>
            {candidateRumors.map((cand, idx) => (
              <View
                key={cand.id}
                className={classnames(
                  styles.candidateItem,
                  activeRumorId === cand.id ? styles.candidateActive : ''
                )}
                onClick={() => handleTapCandidate(cand.id)}
              >
                <View className={styles.candidateRank} data-active={activeRumorId === cand.id}>
                  {idx + 1}
                </View>
                <View className={styles.candidateContent}>
                  <Text className={styles.candidateTitle}>{cand.title}</Text>
                  <Text className={styles.candidateSummary}>{cand.summary}</Text>
                  <View className={styles.candidateTags}>
                    <Text className={styles.candidateCategory}>#{cand.category}</Text>
                    {cand.id === id && inputTypeInfo && <Text className={styles.currentTag}>当前匹配</Text>}
                    {activeRumorId === cand.id && cand.id !== id && <Text className={styles.currentTag}>正在查看</Text>}
                  </View>
                </View>
                <RiskBadge level={cand.riskLevel} showLabel={false} />
              </View>
            ))}
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
