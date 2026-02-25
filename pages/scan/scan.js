Page({
    onLoad() {
        wx.showToast({
            title: 'AI识板开发中',
            icon: 'none',
            duration: 2000
        });
    },
    goBack() {
        wx.switchTab({
            url: '/pages/home/home'
        });
    }
});
