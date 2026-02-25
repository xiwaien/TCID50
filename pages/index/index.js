const calculator = require('../../utils/calculator.js');

Page({
    data: {
        experimentTypes: ['TCID50', 'CCID50', 'EID50', 'LD50', 'PD50'],
        expIndex: 0,
        algorithms: ['里德-明诺法 (Reed-Muench)', '斯皮尔曼-卡伯法 (Spearman-Kärber)'],
        algIndex: 0,

        startLogValues: [-1, -2, -3, -4, -5, -6, -7, -8, -9, -10],
        startLogIndex: 0,

        stepValuesOptions: [2, 3.16, 4, 5, 10], // UI display values
        stepValues: [0.301, 0.5, 0.602, 0.699, 1], // Log10 values
        stepIndex: 4,

        replicatesNum: [4, 6, 8, 10, 12],
        repIndex: 2,

        stepsNum: [4, 5, 6, 7, 8, 9, 10, 11, 12],
        stepsIndex: 4,

        positives: [],

        // Picker Visibilities
        expVisible: false,
        algVisible: false,
        startLogVisible: false,
        stepVisible: false,
        repVisible: false,
        stepsNumVisible: false,

        // Picker Options (Mapped for t-picker)
        expOptions: [],
        algOptions: [],
        startLogOptions: [],
        stepOptions: [],
        repOptions: [],
        stepsNumOptions: [],

        showResult: false,
        resultData: {}
    },

    onLoad() {
        this.initOptions();
        this.initPositives();
    },

    initOptions() {
        this.setData({
            expOptions: this.data.experimentTypes.map((item, index) => ({ label: item, value: index })),
            algOptions: this.data.algorithms.map((item, index) => ({ label: item, value: index })),
            startLogOptions: this.data.startLogValues.map((item, index) => ({ label: String(item), value: index })),
            stepOptions: this.data.stepValuesOptions.map((item, index) => ({ label: `${item}倍`, value: index })),
            repOptions: this.data.replicatesNum.map((item, index) => ({ label: `${item}孔`, value: index })),
            stepsNumOptions: this.data.stepsNum.map((item, index) => ({ label: `${item}梯`, value: index }))
        });
    },

    initPositives() {
        const count = this.data.stepsNum[this.data.stepsIndex];
        const arr = new Array(count).fill(0);
        this.setData({ positives: arr });
    },

    // Picker Triggers
    onExperimentPicker() { this.setData({ expVisible: true }); },
    onAlgorithmPicker() { this.setData({ algVisible: true }); },
    onStartLogPicker() { this.setData({ startLogVisible: true }); },
    onStepPicker() { this.setData({ stepVisible: true }); },
    onReplicatesPicker() { this.setData({ repVisible: true }); },
    onStepsNumPicker() { this.setData({ stepsNumVisible: true }); },

    onPickerCancel() {
        this.setData({
            expVisible: false, algVisible: false, startLogVisible: false,
            stepVisible: false, repVisible: false, stepsNumVisible: false
        });
    },

    onExpChange(e) { this.setData({ expIndex: e.detail.value[0] }); },
    onAlgChange(e) { this.setData({ algIndex: e.detail.value[0] }); },
    onStartLogChange(e) { this.setData({ startLogIndex: e.detail.value[0] }); },
    onStepChange(e) { this.setData({ stepIndex: e.detail.value[0] }); },

    onRepChange(e) {
        const idx = e.detail.value[0];
        this.setData({ repIndex: idx });
        const rep = this.data.replicatesNum[idx];
        const newPos = this.data.positives.map(p => Math.min(p, rep));
        this.setData({ positives: newPos });
    },

    onStepsNumChange(e) {
        const idx = e.detail.value[0];
        this.setData({ stepsIndex: idx });
        const count = this.data.stepsNum[idx];
        let newPos = [...this.data.positives];
        if (newPos.length < count) {
            newPos = newPos.concat(new Array(count - newPos.length).fill(0));
        } else {
            newPos = newPos.slice(0, count);
        }
        this.setData({ positives: newPos });
    },

    onWellTap(e) {
        const step = parseInt(e.currentTarget.dataset.step);
        const val = parseInt(e.currentTarget.dataset.val);
        const newPos = [...this.data.positives];
        newPos[step] = val;
        this.setData({ positives: newPos });
    },

    onCalculate() {
        wx.showLoading({ title: '正在计算...', mask: true });

        setTimeout(() => {
            const base = this.data.stepValuesOptions[this.data.stepIndex];
            const startExp = this.data.startLogValues[this.data.startLogIndex];
            const startLog = startExp * Math.log10(base);
            const stepLog = Math.log10(base);
            const rep = this.data.replicatesNum[this.data.repIndex];
            const positives = this.data.positives;

            let res;
            if (this.data.algIndex === 0) {
                res = calculator.calculateReedMuench(startLog, stepLog, rep, positives);
            } else {
                res = calculator.calculateSpearmanKarber(startLog, stepLog, rep, positives);
            }

            this.setData({ resultData: res, showResult: true });
            wx.hideLoading();

            if (res.success) {
                this.saveHistory({
                    timeFlag: new Date().getTime(),
                    timeStr: this.formatTime(new Date()),
                    expType: this.data.experimentTypes[this.data.expIndex],
                    algName: this.data.algorithms[this.data.algIndex],
                    startLog: startLog,
                    startExp: startExp,
                    base: base,
                    stepFactor: base,
                    stepLog: stepLog,
                    rep,
                    positives: [...positives],
                    resultStr: res.resultStr
                });
            }
        }, 500);
    },

    closeResult() {
        this.setData({ showResult: false });
    },

    saveHistory(record) {
        let list = wx.getStorageSync('HistoryList') || [];
        list.unshift(record);
        if (list.length > 100) list = list.slice(0, 100);
        wx.setStorageSync('HistoryList', list);
    },

    formatTime(date) {
        const y = date.getFullYear();
        const M = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${y}-${M}-${d} ${h}:${m}`;
    }
});
