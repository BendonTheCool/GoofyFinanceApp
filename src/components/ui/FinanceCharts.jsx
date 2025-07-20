"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a569bd", "#f39c12"];

export function FinanceCharts({ transactions }) {
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7); // YYYY-MM
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weeklyExpenses = transactions.filter(t => {
    const date = new Date(t.date);
    return t.category !== "income" && date >= weekAgo;
  });

  const monthlyExpenses = transactions.filter(t =>
    t.category !== "income" && t.date.startsWith(thisMonth)
  );

  const weeklyData = weeklyExpenses.reduce((acc, t) => {
    const day = new Date(t.date).toLocaleDateString("en-US", { weekday: "short" });
    const existing = acc.find(i => i.day === day);
    if (existing) {
      existing.amount += t.amount;
    } else {
      acc.push({ day, amount: t.amount });
    }
    return acc;
  }, []);

  const categoryData = monthlyExpenses.reduce((acc, t) => {
    const existing = acc.find(i => i.category === t.category);
    if (existing) {
      existing.amount += t.amount;
    } else {
      acc.push({ category: t.category, amount: t.amount });
    }
    return acc;
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="amount"
                nameKey="category"
                outerRadius={90}
                fill="#82ca9d"
                label
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
    