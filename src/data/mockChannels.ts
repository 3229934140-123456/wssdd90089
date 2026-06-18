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

export const reportChannelOptions: { key: string; label: string; value: ChannelType }[] = [
  { key: 'group_owner', label: '小区业主群', value: 'group' },
  { key: 'group_family', label: '亲友家庭群', value: 'group' },
  { key: 'video', label: '短视频平台', value: 'video' },
  { key: 'article', label: '微信公众号', value: 'article' },
  { key: 'moment', label: '微信朋友圈', value: 'moment' },
  { key: 'other', label: '其他来源', value: 'other' }
];
