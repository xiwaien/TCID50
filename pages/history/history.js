const excel = require('../../utils/excel.js');

Page({
    data: {
        historyList: [],
        isAllSelected: false,
        selectedCount: 0,
        showColModal: false,
        exportColumns: [
            { name: '测定时间', checked: true },
            { name: '实验类型', checked: true },
            { name: '算法名称', checked: true },
            { name: '初始稀释度(指数)', checked: true },
            { name: '稀释倍数', checked: true },
            { name: '每组孔数', checked: true },
            { name: '阳性孔序列', checked: true },
            { name: '最终结果', checked: true }
        ],
        selectedValues: [],
        selectedColsValues: ['测定时间', '实验类型', '算法名称', '初始稀释度(指数)', '稀释倍数', '每组孔数', '阳性孔序列', '最终结果']
    },

    onShow() {
        this.loadHistory();
    },

    loadHistory() {
        let list = wx.getStorageSync('HistoryList') || [];
        this.setData({
            historyList: list,
            isAllSelected: false,
            selectedCount: 0,
            selectedValues: []
        });
    },

    onCheckboxChange(e) {
        const selectedValues = e.detail.value;
        this.setData({
            selectedValues,
            selectedCount: selectedValues.length,
            isAllSelected: selectedValues.length === this.data.historyList.length && this.data.historyList.length > 0
        });
    },

    onToggleAll(e) {
        const checked = e.detail.checked;
        const list = this.data.historyList;
        // Keep value as number since timeFlag is a timestamp
        const selectedValues = checked ? list.map(item => item.timeFlag) : [];

        this.setData({
            selectedValues,
            isAllSelected: checked,
            selectedCount: selectedValues.length
        });
    },

    onExport() {
        const list = this.data.historyList.filter(item =>
            this.data.selectedValues.some(val => String(val) === String(item.timeFlag))
        );
        if (!list || list.length === 0) return;
        this.setData({ showColModal: true });
    },

    closeColModal() {
        this.setData({ showColModal: false });
    },

    onColCheckboxChange(e) {
        this.setData({ selectedColsValues: e.detail.value });
    },

    confirmExport() {
        const list = this.data.historyList.filter(item =>
            this.data.selectedValues.some(val => String(val) === String(item.timeFlag))
        );
        const selectedCols = this.data.selectedColsValues;

        if (!list || list.length === 0) return;
        if (selectedCols.length === 0) {
            wx.showToast({ title: '请至少选择一列数据', icon: 'none' });
            return;
        }

        this.setData({ showColModal: false });
        wx.showLoading({ title: '正在生成文件...' });

        try {
            const base64Data = excel.generateXLS(list, selectedCols);
            const fs = wx.getFileSystemManager();
            const filePath = `${wx.env.USER_DATA_PATH}/TCID50_History_${new Date().getTime()}.xlsx`;

            fs.writeFile({
                filePath,
                data: base64Data,
                encoding: 'base64',
                success: () => {
                    wx.hideLoading();
                    wx.openDocument({
                        filePath,
                        showMenu: true,
                        fileType: 'xlsx',
                        success: function (res) {
                            console.log('打开文档成功');
                        },
                        fail: function () {
                            wx.showToast({ title: '无法打开文件', icon: 'none' });
                        }
                    });
                },
                fail: (err) => {
                    wx.hideLoading();
                    wx.showToast({ title: '文件写入失败', icon: 'none' });
                    console.error(err);
                }
            });
        } catch (e) {
            wx.hideLoading();
            wx.showToast({ title: '导出失败', icon: 'none' });
            console.error(e);
        }
    }
});
