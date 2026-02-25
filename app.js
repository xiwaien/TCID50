App({
  onLaunch() {
    // 提前加载 TDesign 的图标字体，防止第一次打开时图标显示为方块
    wx.loadFontFace({
      family: 't',
      source: 'url("https://tdesign.gtimg.com/icon/0.4.1/fonts/t.ttf")',
      global: true,
      success: () => console.log('TDesign font loaded'),
      fail: (err) => console.warn('Failed to load TDesign font', err)
    });
  }
})
