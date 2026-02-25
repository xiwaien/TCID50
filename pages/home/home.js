Page({
    data: {},

    onLoad() {
        // Page load logic
    },

    goToCalculator() {
        wx.navigateTo({
            url: '/pages/index/index'
        });
    },

    showOtherOptions() {
        wx.showToast({
            title: '其他功能开发中...',
            icon: 'none'
        });
    }
});
