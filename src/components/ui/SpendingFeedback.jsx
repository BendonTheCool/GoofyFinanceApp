"use client";
import React, { useMemo } from "react";

export function SpendingFeedback({ transactions = [] }) {
  const feedback = useMemo(() => {
    if (!transactions.length) return ["Add transactions to see feedback."];

    const spending = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((t) => {
      if (t.category === "income") {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      }
    });

    const topCategory = Object.entries(spending).sort((a, b) => b[1] - a[1])[0];
    const overspentCategory = topCategory ? topCategory[0] : "N/A";

    const tips = [];

    if (overspentCategory && overspentCategory !== "N/A") {
      tips.push(
        `You're spending the most in the **${overspentCategory}** category. Consider setting a budget cap.`
      );
    }

    if (totalIncome > totalExpenses) {
      tips.push(`Your **income** exceeds your expenses. Great job!`);
    } else {
      tips.push(`Your **expenses** are higher than your income. Review your budget!`);
    }

    if (totalExpenses > 0 && topCategory === "entertainment") {
      tips.push(`Your **entertainment** expenses are high. Try to plan them better.`);
    }

    if (totalIncome > 0) {
      tips.push(`Keep tracking your savings and adding money regularly!`);
    }

    return tips;
  }, [transactions]);

  return (
    <div className="border p-4 rounded-md bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 space-y-4">
      <h2 className="font-semibold text-lg">AI Spending Feedback</h2>
      <ul className="list-disc list-inside space-y-1 text-sm">
        {feedback.map((tip, idx) => (
          <li key={idx} dangerouslySetInnerHTML={{ __html: tip }} />
        ))}
      </ul>
    </div>
  );
}
