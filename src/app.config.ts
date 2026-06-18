export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/knowledge/index',
    'pages/report/index',
    'pages/mine/index',
    'pages/result/index',
    'pages/knowledge-detail/index',
    'pages/share/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2BA471',
    navigationBarTitleText: '社区辟谣助手',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FFF9F0'
  },
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#2BA471',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '识别'
      },
      {
        pagePath: 'pages/knowledge/index',
        text: '知识库'
      },
      {
        pagePath: 'pages/report/index',
        text: '线索'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
