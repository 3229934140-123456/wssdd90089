import { ChannelInfo, ChannelType } from '@/types/rumor';

export const channelList: Record<ChannelType, ChannelInfo> = {
  group: {
    type: 'group',
    name: '本地群聊',
    color: '#1890FF'
  },
  video: {
    type: 'video',
    name: '短视频搬运',
    color: '#FF4D4F'
  },
  article: {
    type: 'article',
    name: '公众号文章',
    color: '#722ED1'
  },
  moment: {
    type: 'moment',
    name: '朋友圈转发',
    color: '#52C41A'
  },
  other: {
    type: 'other',
    name: '其他渠道',
    color: '#8C8C8C'
  }
};

export const reportChannelOptions: { label: string; value: ChannelType }[] = [
  { label: '小区业主群', value: 'group' },
  { label: '亲友家庭群', value: 'group' },
  { label: '短视频平台', value: 'video' },
  { label: '微信公众号', value: 'article' },
  { label: '微信朋友圈', value: 'moment' },
  { label: '其他来源', value: 'other' }
];
