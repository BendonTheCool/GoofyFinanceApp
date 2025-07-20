"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { SpendingFeedback } from "@/components/ui/SpendingFeedback";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function OverviewPage() {
  const [transactions, setTransactions] = useState([]);
  const [newTxn, setNewTxn] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
    incomeAmount: "",
  });
  const [filterCategory, setFilterCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewTxn((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAddTransaction = useCallback(async () => {
    if (!newTxn.amount || !newTxn.category || !newTxn.date) return;

    const transaction = {
      id: crypto.randomUUID(),
      title: newTxn.title || "Untitled",
      amount: parseFloat(newTxn.amount),
      category: newTxn.category,
      date: newTxn.date,
    };

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (!res.ok) throw new Error("Failed to add transaction");
      setNewTxn({ title: "", amount: "", category: "", date: "", incomeAmount: "" });
      await fetchTransactions();
    } catch (error) {
      console.error(error);
    }
  }, [newTxn, fetchTransactions]);

  const handleAddMoney = useCallback(async (amount) => {
    if (!amount) return;

    const now = new Date().toISOString().split("T")[0];
    const transaction = {
      id: crypto.randomUUID(),
      title: "Added Funds",
      amount: parseFloat(amount),
      category: "income",
      date: now,
    };

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (!res.ok) throw new Error("Failed to add funds");
      setNewTxn((prev) => ({ ...prev, incomeAmount: "" }));
      await fetchTransactions();
    } catch (error) {
      console.error(error);
    }
  }, [fetchTransactions]);

  const handleDelete = useCallback(async (id) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete transaction");
      await fetchTransactions();
    } catch (error) {
      console.error(error);
    }
  }, [fetchTransactions]);

  const handleEditClick = useCallback((id, txn) => {
    setEditingId(id);
    setEditValues({
      title: txn.title,
      amount: txn.amount,
      category: txn.category,
      date: txn.date,
    });
  }, []);

  const handleSaveEdit = useCallback(async (id) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editValues }),
      });
      if (!res.ok) throw new Error("Failed to save edit");
      setEditingId(null);
      await fetchTransactions();
    } catch (error) {
      console.error(error);
    }
  }, [editValues, fetchTransactions]);

  const handleExportCSV = useCallback(() => {
    const csvRows = [
      ["Title", "Category", "Amount", "Date"],
      ...transactions.map((t) => [t.title, t.category, t.amount, t.date]),
    ];
    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions]);

  const handleImportCSV = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.trim().split("\n").slice(1);
      const newTxns = rows.map((row) => {
        const [title, amount, category, date] = row.split(",");
        return {
          id: crypto.randomUUID(),
          title,
          amount: parseFloat(amount),
          category,
          date,
        };
      });

      try {
        for (const txn of newTxns) {
          const res = await fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(txn),
          });
          if (!res.ok) throw new Error("Failed to import transaction");
        }
        await fetchTransactions();
      } catch (error) {
        console.error(error);
      }
    };
    reader.readAsText(file);
  }, [fetchTransactions]);

  const balance = useMemo(() => {
    const income = transactions.filter((t) => t.category === "income").reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter((t) => t.category !== "income").reduce((sum, t) => sum + t.amount, 0);
    return income - expenses;
  }, [transactions]);

  const totalIncome = useMemo(() => {
    return transactions.filter((t) => t.category === "income").reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalSpending = useMemo(() => {
    return transactions.filter((t) => t.category !== "income").reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const filteredTransactions = filterCategory
    ? transactions.filter((txn) => txn.category === filterCategory)
    : transactions;

  return (
    <>
      {/* Background */}
      <div
        className="fixed inset-0 z-[-1] bg-gradient-to-br from-blue-700 to-blue-900 dark:from-gray-900 dark:to-black"
        aria-hidden="true"
      />

      <div className="p-6 space-y-6 relative z-10">
        <h1 className="text-2xl font-bold text-black dark:text-white">Student Finance Tracker</h1>

        <div className="border p-4 rounded-md space-y-4 bg-white dark:bg-gray-800 bg-opacity-90">
          <h2 className="font-semibold text-lg text-black dark:text-white">Add Money</h2>
          <div className="flex items-center gap-4">
            <input
              type="number"
              placeholder="Amount"
              name="incomeAmount"
              value={newTxn.incomeAmount || ""}
              onChange={handleInputChange}
              className="border p-2 rounded dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={() => handleAddMoney(newTxn.incomeAmount)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Add Money
            </button>
          </div>
        </div>

        <div className="border p-4 rounded-md space-y-4 bg-white dark:bg-gray-800 bg-opacity-90">
          <h2 className="font-semibold text-lg text-black dark:text-white">Add Transaction</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input
              name="title"
              placeholder="Title"
              value={newTxn.title || ""}
              onChange={handleInputChange}
              className="border p-2 rounded dark:bg-gray-700 dark:text-white"
            />
            <input
              name="amount"
              type="number"
              placeholder="Amount"
              value={newTxn.amount || ""}
              onChange={handleInputChange}
              className="border p-2 rounded dark:bg-gray-700 dark:text-white"
            />
            <input
              name="category"
              placeholder="Category"
              value={newTxn.category || ""}
              onChange={handleInputChange}
              className="border p-2 rounded dark:bg-gray-700 dark:text-white"
            />
            <input
              name="date"
              type="date"
              value={newTxn.date || ""}
              onChange={handleInputChange}
              className="border p-2 rounded dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={handleAddTransaction}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Transaction
          </button>
        </div>

        <div className="border p-4 mb-4 bg-white dark:bg-gray-800 bg-opacity-90 rounded">
          <label className="text-black dark:text-white">Filter by Category:</label>
          <input
            className="border p-2 ml-2 rounded dark:bg-gray-700 dark:text-white"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            placeholder="Enter a category to filter"
          />
          <button
            onClick={() => setFilterCategory("")}
            className="bg-gray-500 ml-2 text-white px-2 py-1 rounded"
          >
            Clear Filter
          </button>
        </div>

        <div className="text-xl font-semibold text-black dark:text-white">Current Balance: ${balance.toFixed(2)}</div>
        <div className="text-green-600 font-medium">Total Income: ${totalIncome.toFixed(2)}</div>
        <div className="text-red-600 font-medium">Total Spending: ${totalSpending.toFixed(2)}</div>

        <div className="space-y-2">
          <button onClick={handleExportCSV} className="bg-blue-600 text-white px-4 py-2 rounded">
            Export Transactions
          </button>
          <input
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="ml-4 border p-2 rounded dark:bg-gray-700 dark:text-white"
          />
        </div>

        <Link href="/charts">
          <button className="bg-purple-600 text-white px-4 py-2 rounded mt-4">View Charts</button>
        </Link>

        <table className="w-full border-collapse bg-white dark:bg-gray-800 bg-opacity-90">
          <thead>
            <tr>
              <th className="border p-2 text-black dark:text-white">Title</th>
              <th className="border p-2 text-black dark:text-white">Category</th>
              <th className="border p-2 text-black dark:text-white">Amount</th>
              <th className="border p-2 text-black dark:text-white">Date</th>
              <th className="border p-2 text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions?.map((txn) => (
              <tr key={txn.id}>
                <td className="border p-2 text-black dark:text-white">
                  {editingId === txn.id ? (
                    <input
                      name="title"
                      value={editValues.title}
                      onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                      className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    txn.title
                  )}
                </td>
                <td className="border p-2 text-black dark:text-white">
                  {editingId === txn.id ? (
                    <input
                      name="category"
                      value={editValues.category}
                      onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                      className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    txn.category
                  )}
                </td>
                <td className="border p-2 text-black dark:text-white">
                  {editingId === txn.id ? (
                    <input
                      name="amount"
                      type="number"
                      value={editValues.amount}
                      onChange={(e) =>
                        setEditValues({ ...editValues, amount: parseFloat(e.target.value) || 0 })
                      }
                      className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    `$${txn.amount?.toFixed(2)}`
                  )}
                </td>
                <td className="border p-2 text-black dark:text-white">
                  {editingId === txn.id ? (
                    <input
                      name="date"
                      type="date"
                      value={editValues.date}
                      onChange={(e) => setEditValues({ ...editValues, date: e.target.value })}
                      className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    txn.date
                  )}
                </td>
                <td className="border p-2">
                  {editingId === txn.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(txn.id)}
                        className="bg-green-500 text-white px-2 py-1 mr-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-500 text-white px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(txn.id, txn)}
                        className="bg-blue-500 text-white px-2 py-1 mr-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(txn.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <SpendingFeedback transactions={transactions} />
        <ThemeToggle />
      </div>
    </>
  );
}
