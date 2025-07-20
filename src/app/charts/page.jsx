"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SpendingFeedback } from "@/components/ui/SpendingFeedback";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function ChartsPage() {
  const [transactions, setTransactions] = useState([]);
  const [timeframe, setTimeframe] = useState("overtime");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Group transactions by timeframe
  const groupTransactions = () => {
    const groups = {};

    transactions.forEach((txn) => {
      const date = new Date(txn.date);
      let key;

      switch (timeframe) {
        case "yearly":
          key = date.getFullYear();
          break;
        case "monthly":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "weekly":
          const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
          const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
          const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
          key = `${date.getFullYear()}-W${week}`;
          break;
        default:
          key = txn.date;
      }

      if (!groups[key]) {
        groups[key] = { income: 0, expenses: 0 };
      }

      if (txn.category === "income") {
        groups[key].income += txn.amount;
      } else {
        groups[key].expenses += txn.amount;
      }
    });

    return Object.entries(groups)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, { income, expenses }]) => ({ date, income, expenses }));
  };

  const chartData = groupTransactions();

  const totalIncome = transactions
    .filter((t) => t.category === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.category !== "income")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen px-4 py-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Finance Charts</h1>
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-2">Total Summary</h2>
          <div className="text-green-500 font-medium">Total Income: ${totalIncome.toFixed(2)}</div>
          <div className="text-red-500 font-medium">Total Expenses: ${totalExpenses.toFixed(2)}</div>
        </div>

        {/* Timeframe Dropdown */}
        <div className="bg-white dark:bg-gray-800 rounded-md p-4 shadow-md">
          <label htmlFor="timeframe" className="mr-2 font-semibold">
            Select View:
          </label>
          <select
            id="timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="overtime">Over Time</option>
            <option value="yearly">Yearly</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        {/* Line Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-md p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-2">Income vs Expenses</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Feedback */}
        <SpendingFeedback transactions={transactions} />

        {/* Back to Overview */}
        <Link href="/overview">
          <button className="bg-purple-600 text-white px-4 py-2 rounded mt-4">
            Back to Overview
          </button>
        </Link>
      </div>
    </div>
  );
}
