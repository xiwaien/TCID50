/**
 * TCID50 Calculation Logic
 */

/**
 * Parses user input into a standardized format
 * @param {number} startLog10 e.g., -1
 * @param {number} stepLog10 e.g., 1 (for 10-fold dilution)
 * @param {number} replicates e.g., 8
 * @param {number[]} positives Array of positive counts, from highest conc to lowest conc (e.g., [-1, -2, -3...])
 */

function calculateReedMuench(startLog10, stepLog10, replicates, positives) {
    // Positives: [8, 8, 5, 2, 0] for dilutions [10^-1, 10^-2, 10^-3, 10^-4, 10^-5]
    const n = positives.length;
    const negatives = positives.map(p => replicates - p);

    // Accumulate Positives: from lowest concentration (end of array) to highest (start)
    const accPos = [];
    let currentPosSum = 0;
    for (let i = n - 1; i >= 0; i--) {
        currentPosSum += positives[i];
        accPos[i] = currentPosSum;
    }

    // Accumulate Negatives: from highest concentration (start) to lowest (end)
    const accNeg = [];
    let currentNegSum = 0;
    for (let i = 0; i < n; i++) {
        currentNegSum += negatives[i];
        accNeg[i] = currentNegSum;
    }

    // Calculate infection rates
    const rates = [];
    for (let i = 0; i < n; i++) {
        const total = accPos[i] + accNeg[i];
        rates[i] = total === 0 ? 0 : accPos[i] / total;
    }

    // Find the crossover point
    let above50Index = -1;
    let below50Index = -1;

    for (let i = 0; i < n - 1; i++) {
        if (rates[i] >= 0.5 && rates[i + 1] < 0.5) {
            above50Index = i;
            below50Index = i + 1;
            break;
        }
    }

    // Edge cases
    if (above50Index === -1) {
        if (rates[0] < 0.5) {
            return { error: '所有梯度的感染率均低于50%，无法计算。', details: { rates } };
        }
        if (rates[n - 1] >= 0.5) {
            return { error: '所有梯度的感染率均高于等于50%，无法计算。', details: { rates } };
        }
    }

    const rateAbove = rates[above50Index];
    const rateBelow = rates[below50Index];

    // Proportion Distance (PD)
    // PD = (Rate > 50% - 50%) / (Rate > 50% - Rate < 50%)
    const PD = (rateAbove * 100 - 50) / (rateAbove * 100 - rateBelow * 100);

    const logDilutionAbove = startLog10 - (above50Index * stepLog10);

    // LogTCID50 = 高于50%的稀释度对数 - (PD * 稀释倍数对数)
    const logTCID50 = logDilutionAbove - (PD * stepLog10);

    return {
        success: true,
        logTCID50: logTCID50,
        resultStr: `10^${logTCID50.toFixed(2)}`,
        details: {
            accPos,
            accNeg,
            rates: rates.map(r => (r * 100).toFixed(1) + '%'),
            above50Index,
            rateAbove: (rateAbove * 100).toFixed(1) + '%',
            rateBelow: (rateBelow * 100).toFixed(1) + '%',
            PD: PD.toFixed(3),
            logDilutionAbove: logDilutionAbove
        }
    };
}

function calculateSpearmanKarber(startLog10, stepLog10, replicates, positives) {
    // Standard SK Formula:
    // LogTCID50 = X0 + d/2 - d * sum(pi)
    // X0 = log dilution of highest concentration (most negative number, e.g., -1)
    // d = log of dilution factor (e.g., 1 for 10-fold)
    // pi = positives[i] / replicates

    let sumPi = 0;
    for (let i = 0; i < positives.length; i++) {
        sumPi += positives[i] / replicates;
    }

    const X0 = startLog10;
    const d = stepLog10;

    // Wait, let's verify standard SK direction.
    // If X0 = -1, d=1. LogTCID50 = -1 + 0.5 - 1 * sumPi.
    // This correctly yields a more negative end-point dilution as sumPi increases.
    const logTCID50 = X0 + (d / 2) - (d * sumPi);

    return {
        success: true,
        logTCID50: logTCID50,
        resultStr: `10^${logTCID50.toFixed(2)}`,
        details: {
            sumPi: sumPi.toFixed(3),
            X0: X0,
            d: d,
            formula: `X0 + d/2 - d*sum(Pi) = ${X0} + ${d}/2 - ${d}*${sumPi.toFixed(3)}`
        }
    };
}

module.exports = {
    calculateReedMuench,
    calculateSpearmanKarber
};
