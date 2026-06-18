import { Rumor } from '@/types/rumor';

export const mockRumors: Rumor[] = [
  {
    id: 'r001',
    title: '某地自来水致癌？别信！',
    content: '近期有消息称"本市自来水厂改用工业消毒剂，饮用后会致癌，请大家赶紧买桶装水"，并附有多段所谓"水厂内部人员爆料"短视频。',
    keywords: ['自来水', '致癌', '消毒剂', '桶装水', '水厂'],
    riskLevel: 'high',
    category: '食品安全',
    createdAt: '2026-06-10',
    summary: '这条消息去年就出现过，当时市水务局已公开辟谣。本次是旧谣言换了新包装重新传播。',
    truth: '自来水处理使用的是符合国家标准的食品级消毒剂，出厂水质经过多重检测合格。工业消毒剂成本更高，水厂不可能使用。建议大家通过官方渠道了解水质信息。',
    spreadPath: {
      origin: {
        id: 'o1',
        channel: 'video',
        name: '某短视频平台',
        description: '某账号发布"水厂内部爆料"视频',
        count: 1,
        timestamp: '2026-06-08 14:20'
      },
      mainNodes: [
        { id: 'm1', channel: 'moment', name: '朋友圈截图转发', description: '网友截图搬运到朋友圈', count: 3200, timestamp: '06-08 18:00' },
        { id: 'm2', channel: 'group', name: '本地居民群', description: '通过多个小区业主群扩散', count: 8500, timestamp: '06-09 09:00' },
        { id: 'm3', channel: 'article', name: '自媒体公众号', description: '部分自媒体以"紧急提醒"为标题撰文', count: 12000, timestamp: '06-09 15:00' }
      ],
      hasOfficialResponse: true,
      officialResponse: '市水务局6月10日发布官方通报，明确表示此信息不实，自来水水质100%达标，并公布了当月水质检测报告。',
      officialSource: '市水务局官方公众号'
    },
    relatedRumors: ['r002', 'r005']
  },
  {
    id: 'r002',
    title: '吃大蒜能防新冠？不靠谱',
    content: '"多吃大蒜可以预防新冠病毒，每天三瓣蒜，胜过打疫苗"，这条消息附带多段"医生推荐"录音在群里传播。',
    keywords: ['大蒜', '新冠', '疫苗', '预防', '医生'],
    riskLevel: 'high',
    category: '健康医疗',
    createdAt: '2026-05-28',
    summary: '大蒜有一定抗菌作用，但目前没有任何科学证据表明吃大蒜可以预防新冠病毒感染。',
    truth: '世界卫生组织和国家卫健委均明确表示，大蒜不能预防新冠病毒。接种疫苗、做好个人防护仍是最有效的预防手段。请大家不要轻信偏方，听从专业医疗机构建议。',
    spreadPath: {
      origin: {
        id: 'o2',
        channel: 'group',
        name: '中老年养生群',
        description: '群内转发所谓"养生秘方"',
        count: 1,
        timestamp: '2026-05-25 07:30'
      },
      mainNodes: [
        { id: 'm4', channel: 'group', name: '家庭亲友群', description: '长辈之间互相转发', count: 15000, timestamp: '05-26 全天' },
        { id: 'm5', channel: 'article', name: '养生类公众号', description: '多个养生号发布相关文章', count: 28000, timestamp: '05-27 10:00' }
      ],
      hasOfficialResponse: true,
      officialResponse: '国家卫健委在健康科普专栏中专门辟谣，大蒜不能替代疫苗和防疫措施。',
      officialSource: '健康中国公众号'
    },
    relatedRumors: ['r001', 'r006']
  },
  {
    id: 'r003',
    title: '小区要停水三天？核实后再说',
    content: '"通知：本小区因管网改造，6月15日起停水三天，请大家提前储水。物业已确认！"该消息在多个业主群出现。',
    keywords: ['停水', '小区', '物业', '管网改造', '储水'],
    riskLevel: 'medium',
    category: '社区通知',
    createdAt: '2026-06-12',
    summary: '经核实，本小区近期确实有管网维护计划，但仅为白天分时段低压供水，并非连续停水三天。',
    truth: '社区物业公告显示，6月15-17日每天9:00-17:00进行管网冲洗，期间可能水压偏低，夜间供水正常。如不确定请拨打物业服务电话确认。',
    spreadPath: {
      origin: {
        id: 'o3',
        channel: 'group',
        name: '某栋业主群',
        description: '群成员误读物业通知后发布',
        count: 1,
        timestamp: '2026-06-11 20:15'
      },
      mainNodes: [
        { id: 'm6', channel: 'group', name: '小区各楼栋群', description: '消息被复制转发到其他楼栋群', count: 6000, timestamp: '06-12 上午' }
      ],
      hasOfficialResponse: true,
      officialResponse: '社区居委会联合物业在各单元公告栏张贴了更正说明，并在官方业主群发布详细时间表。',
      officialSource: '社区居委会'
    },
    relatedRumors: ['r007']
  },
  {
    id: 'r004',
    title: '"有人偷小孩"消息，多数不实',
    content: '近期多个微信群和朋友圈出现"本小区附近有人贩子偷小孩，已经有孩子失踪"的消息，附有多张模糊图片。',
    keywords: ['偷小孩', '人贩子', '失踪', '小区', '附近'],
    riskLevel: 'high',
    category: '社会治安',
    createdAt: '2026-06-05',
    summary: '经辖区派出所核实，近期本区域没有接到任何儿童被拐的报案。网传图片为外地旧闻。',
    truth: '此类消息属于典型的"旧谣新传"，图片大多是几年前外地事件的旧图。如遇可疑情况请直接拨打110报警，不要转发未经核实的信息，以免造成不必要的恐慌。',
    spreadPath: {
      origin: {
        id: 'o4',
        channel: 'moment',
        name: '朋友圈转发',
        description: '来源不明的图文内容被广泛转发',
        count: 1,
        timestamp: '2026-06-03 21:00'
      },
      mainNodes: [
        { id: 'm7', channel: 'group', name: '宝妈交流群', description: '家长群内大量转发讨论', count: 22000, timestamp: '06-04 全天' },
        { id: 'm8', channel: 'group', name: '社区业主群', description: '各小区业主群广泛传播', count: 35000, timestamp: '06-05 上午' }
      ],
      hasOfficialResponse: true,
      officialResponse: '当地派出所通过官方微博发布警情通报，澄清近期无此类警情，并提醒市民不信谣不传谣。',
      officialSource: '辖区派出所官方账号'
    },
    relatedRumors: ['r009']
  },
  {
    id: 'r005',
    title: '西瓜打了甜味剂？别再传了',
    content: '"现在的西瓜都不能吃，都是打了甜味剂和催熟剂的，吃了会得白血病！有图有真相！"',
    keywords: ['西瓜', '甜味剂', '催熟剂', '白血病', '水果'],
    riskLevel: 'high',
    category: '食品安全',
    createdAt: '2026-05-20',
    summary: '西瓜注入液体后很快会腐烂变质，商家不可能这么做。所谓"针孔"其实是西瓜生长过程中自然形成的。',
    truth: '农业农村部农产品质量安全专家表示，西瓜无法通过注射增甜，因为液体会破坏细胞结构导致腐烂。西瓜甜度是品种和光照决定的。建议从正规渠道购买水果即可放心食用。',
    spreadPath: {
      origin: {
        id: 'o5',
        channel: 'video',
        name: '短视频平台',
        description: '有人拍摄"西瓜有针孔"视频博眼球',
        count: 1,
        timestamp: '2026-05-18 16:40'
      },
      mainNodes: [
        { id: 'm9', channel: 'group', name: '买菜团购群', description: '社区团购群中转发', count: 18000, timestamp: '05-19 上午' },
        { id: 'm10', channel: 'moment', name: '朋友圈转发', description: '大量朋友圈图文转发', count: 40000, timestamp: '05-19 下午' }
      ],
      hasOfficialResponse: true,
      officialResponse: '农业农村部官方抖音号专门做了科普视频，现场实验证明西瓜注糖水会在2小时内变质。',
      officialSource: '农业农村部官方账号'
    },
    relatedRumors: ['r001', 'r008']
  },
  {
    id: 'r006',
    title: '手机基站辐射大？没有的事',
    content: '"小区旁边要建5G基站，辐射超大，邻居们联合抵制！"附带多份所谓"专家报告"截图。',
    keywords: ['基站', '5G', '辐射', '小区', '抵制'],
    riskLevel: 'medium',
    category: '科学常识',
    createdAt: '2026-04-30',
    summary: '我国通信基站的辐射标准远低于国际标准，甚至比微波炉和手机还低，对人体健康没有影响。',
    truth: '国家《电磁环境控制限值》规定，通信基站电场强度限值为12伏/米，而实际建成的基站通常只有0.1-1伏/米，比你家WiFi路由器还小。基站建在附近反而手机辐射更小，因为信号好不需要大功率搜索。',
    spreadPath: {
      origin: {
        id: 'o6',
        channel: 'group',
        name: '业主维权群',
        description: '个别业主在群内发起倡议',
        count: 1,
        timestamp: '2026-04-27 19:00'
      },
      mainNodes: [
        { id: 'm11', channel: 'group', name: '周边小区群', description: '相邻多个小区群跟风转发', count: 7500, timestamp: '04-28 全天' },
        { id: 'm12', channel: 'article', name: '本地自媒体', description: '部分自媒体煽动情绪博流量', count: 9000, timestamp: '04-29 11:00' }
      ],
      hasOfficialResponse: true,
      officialResponse: '市生态环境局和运营商联合举办了"基站开放日"，邀请居民现场测量辐射值，实测数据均远低于安全标准。',
      officialSource: '市生态环境局官网'
    },
    relatedRumors: ['r002']
  },
  {
    id: 'r007',
    title: '燃气公司上门安检？先核实',
    content: '微信群消息称"明天燃气公司上门免费安检，不配合的话停气处理"，并留有一个手机号。',
    keywords: ['燃气', '安检', '上门', '停气', '免费'],
    riskLevel: 'medium',
    category: '社区通知',
    createdAt: '2026-06-08',
    summary: '燃气公司安检前会通过官方渠道提前公告，不会单独发短信或打电话威胁停气。谨防诈骗。',
    truth: '正规燃气安检人员会着工作服、佩戴工作证，且不会在安检现场推销任何产品。如遇陌生人声称燃气安检，可先拨打燃气公司官方客服电话核实，不要直接开门。',
    spreadPath: {
      origin: {
        id: 'o7',
        channel: 'other',
        name: '未知短信来源',
        description: '用户收到陌生号码短信后转发到群',
        count: 1,
        timestamp: '2026-06-07 09:20'
      },
      mainNodes: [
        { id: 'm13', channel: 'group', name: '业主群转发', description: '各小区业主群转发提醒', count: 4500, timestamp: '06-07-08 全天' }
      ],
      hasOfficialResponse: true,
      officialResponse: '燃气集团发布了防诈骗提醒，公布了官方安检预约电话，提醒用户通过正规渠道预约。',
      officialSource: '燃气集团官方公众号'
    },
    relatedRumors: ['r003']
  },
  {
    id: 'r008',
    title: '肉松是棉花做的？老谣言了',
    content: '"你还在吃肉松面包吗？快扔了！肉松都是棉花做的，用水洗一洗就能看到棉花丝！"附带视频演示。',
    keywords: ['肉松', '棉花', '面包', '水洗', '食品安全'],
    riskLevel: 'high',
    category: '食品安全',
    createdAt: '2026-05-10',
    summary: '这条谣言2017年就被辟谣过，目前已经是N次翻新传播。肉松水洗后呈絮状是正常的蛋白质纤维。',
    truth: '肉松是肉类经过加工后形成的天然肌肉纤维结构，水洗后呈絮状是正常现象，和棉花完全不同。棉花点燃会有烧纸气味，肉松则是烧焦羽毛气味，大家可以自行简单鉴别。',
    spreadPath: {
      origin: {
        id: 'o8',
        channel: 'video',
        name: '短视频平台',
        description: '博眼球的"科普"视频',
        count: 1,
        timestamp: '2026-05-08 12:30'
      },
      mainNodes: [
        { id: 'm14', channel: 'group', name: '买菜/宝妈群', description: '社区生活类群大量传播', count: 25000, timestamp: '05-09 全天' },
        { id: 'm15', channel: 'moment', name: '朋友圈', description: '朋友圈图文+视频转发', count: 45000, timestamp: '05-10 全天' }
      ],
      hasOfficialResponse: true,
      officialResponse: '中国食品工业协会面包糕饼专业委员会联合多家媒体做了现场实验，证明肉松不是棉花。',
      officialSource: '中国食品工业协会官网'
    },
    relatedRumors: ['r005']
  },
  {
    id: 'r009',
    title: '某地出现毒西瓜？查无此事',
    content: '"紧急通知：xxx医院急诊科接收了三名吃西瓜中毒的患者，据说是打了剧毒农药，大家别买西瓜了！"',
    keywords: ['中毒', '西瓜', '农药', '医院', '急诊'],
    riskLevel: 'medium',
    category: '社会治安',
    createdAt: '2026-06-01',
    summary: '经卫健委核实，近期没有任何医院接诊过因吃西瓜导致群体中毒的病例。',
    truth: '此类谣言通常用"xxx医院"这种模糊名称制造恐慌。食品安全问题应关注市场监管局的官方抽检结果，不要轻信微信群里的"紧急通知"。',
    spreadPath: {
      origin: {
        id: 'o9',
        channel: 'group',
        name: '不知名微信群',
        description: '模糊"内部消息"首发',
        count: 1,
        timestamp: '2026-05-31 22:10'
      },
      mainNodes: [
        { id: 'm16', channel: 'group', name: '居民业主群', description: '各社区群内转发讨论', count: 12000, timestamp: '06-01 全天' }
      ],
      hasOfficialResponse: true,
      officialResponse: '市卫健委和市场监管局联合通报，近期未接报相关病例，西瓜抽检合格率99.2%。',
      officialSource: '市市场监督管理局'
    },
    relatedRumors: ['r004', 'r005']
  },
  {
    id: 'r010',
    title: '微信要收费了？别被标题党骗',
    content: '"微信宣布：下月起开始收费，聊天每条一分钱，不转发这条消息账户就会被注销！"',
    keywords: ['微信', '收费', '聊天', '注销', '转发'],
    riskLevel: 'low',
    category: '网络信息',
    createdAt: '2026-05-15',
    summary: '微信团队早已公开声明，微信个人用户使用完全免费，不存在聊天收费或不转发注销账户一说。',
    truth: '此类消息已经传了十多年，每次都是类似套路诱导用户转发来增加账号流量。如果真有收费政策，腾讯一定会通过官方渠道正式公告，不会靠群消息通知。',
    spreadPath: {
      origin: {
        id: 'o10',
        channel: 'article',
        name: '营销号公众号',
        description: '营销号发布耸动标题骗取点击',
        count: 1,
        timestamp: '2026-05-13 10:00'
      },
      mainNodes: [
        { id: 'm17', channel: 'group', name: '家族群', description: '家庭亲友群中广泛传播', count: 30000, timestamp: '05-14 全天' }
      ],
      hasOfficialResponse: true,
      officialResponse: '微信团队通过"微信派"官方公众号再次澄清：个人微信使用完全免费。',
      officialSource: '微信派官方公众号'
    },
    relatedRumors: []
  },
  {
    id: 'r011',
    title: '社保卡过期要换？别着急',
    content: '"社保卡有使用期限，过期不换就用不了了，钱也取不出来！大家快去换新卡！"',
    keywords: ['社保卡', '过期', '换新卡', '期限', '取不出'],
    riskLevel: 'low',
    category: '政策解读',
    createdAt: '2026-05-25',
    summary: '社保卡没有有效期限制，只要芯片正常就能一直使用。如需更换可以正常办理，不存在"过期作废"。',
    truth: '社保卡上印的10年是芯片设计寿命，不是有效期。即使超过10年，只要卡片正常使用就无需更换。卡上的金融功能也不会因卡片年限受限。',
    spreadPath: {
      origin: {
        id: 'o11',
        channel: 'group',
        name: '退休人员群',
        description: '退休人员社群内误传',
        count: 1,
        timestamp: '2026-05-22 15:20'
      },
      mainNodes: [
        { id: 'm18', channel: 'group', name: '社区老年群', description: '中老年社区群广泛转发', count: 14000, timestamp: '05-23/24 全天' }
      ],
      hasOfficialResponse: true,
      officialResponse: '市人力资源和社会保障局在官网发布了详细解读，社保卡长期有效无需担心。',
      officialSource: '市人社局官方网站'
    },
    relatedRumors: []
  },
  {
    id: 'r012',
    title: 'ETC被盗刷？没那么容易',
    content: '有人在停车场用POS机靠近车辆ETC设备就能盗刷银行卡，各位车主赶紧把卡拔出来！',
    keywords: ['ETC', '盗刷', 'POS机', '银行卡', '车主'],
    riskLevel: 'low',
    category: '社会治安',
    createdAt: '2026-04-20',
    summary: '目前ETC卡都做了安全处理，单独的ETC记账卡不具备银行卡消费功能，不存在盗刷风险。',
    truth: '现在办理的ETC设备大多使用的是单独记账卡，不是"二合一"联名卡。即使是早期的联名卡，也需要关闭小额免密功能才存在理论风险，可联系银行确认。',
    spreadPath: {
      origin: {
        id: 'o12',
        channel: 'moment',
        name: '朋友圈',
        description: '热心车友"善意提醒"',
        count: 1,
        timestamp: '2026-04-18 11:30'
      },
      mainNodes: [
        { id: 'm19', channel: 'group', name: '车主交流群', description: '各类车友群转发', count: 9000, timestamp: '04-19 全天' }
      ],
      hasOfficialResponse: true,
      officialResponse: '交通运输部联合多家银行发布科普说明，ETC卡安全有保障。',
      officialSource: '交通运输部官方公众号'
    },
    relatedRumors: []
  }
];

export const mockHistory = [
  { id: 'h001', inputType: 'text' as const, inputText: '自来水喝了会致癌？', matchedRumor: 'r001', riskLevel: 'high' as const, checkedAt: '2026-06-18 09:30' },
  { id: 'h002', inputType: 'image' as const, matchedRumor: 'r005', riskLevel: 'high' as const, checkedAt: '2026-06-16 14:20' },
  { id: 'h003', inputType: 'link' as const, matchedRumor: 'r010', riskLevel: 'low' as const, checkedAt: '2026-06-15 18:45' }
];
