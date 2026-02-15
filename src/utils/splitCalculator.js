// ================= BALANCE CALCULATION =================
export const calculateBalances = (expenses, members) => {

  const balances = {};

  members.forEach(m => balances[m] = 0);

  expenses.forEach(exp => {

    const share =
      Math.round(
        (exp.amount / exp.splitBetween.length) * 100
      ) / 100;

    exp.splitBetween.forEach(uid => {
      balances[uid] -= share;
    });

    balances[exp.paidBy] += exp.amount;
  });

  return balances;
};


// ================= SETTLEMENT ENGINE =================
const settlementEngine = (balances) => {

  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([user, amount]) => {

    if (amount < 0)
      debtors.push({ user, amount: -amount });

    if (amount > 0)
      creditors.push({ user, amount });
  });

  const result = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {

    const pay = Math.min(
      debtors[i].amount,
      creditors[j].amount
    );

    result.push({
      from: debtors[i].user,
      to: creditors[j].user,
      amount: pay
    });

    debtors[i].amount -= pay;
    creditors[j].amount -= pay;

    if (debtors[i].amount === 0) i++;
    if (creditors[j].amount === 0) j++;
  }

  return result;
};


// ⭐⭐⭐ EXPORT BOTH NAMES ⭐⭐⭐
// This prevents future crashes

export const settlement = settlementEngine;
export const settlementSuggestions = settlementEngine;
