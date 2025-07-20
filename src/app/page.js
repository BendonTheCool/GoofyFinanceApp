"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

export default function Home() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
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

    fetchTransactions();
  }, []);

  const feedback = useMemo(() => {
    if (!transactions.length) return ["Add transactions to see insights."];

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
      tips.push(`You’re spending the most in **${overspentCategory}**. Consider setting a cap.`);
    }

    if (totalIncome > totalExpenses) {
      tips.push(`✅ Your **income** exceeds expenses — good savings!`);
    } else {
      tips.push(`⚠️ Your **expenses** are higher than income — review spending!`);
    }

    tips.push(`📈 Keep tracking and adding money regularly.`);

    return tips;
  }, [transactions]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] text-black dark:text-white">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              src/app/page.js
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link href="/overview">
            <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
              Go to Overview
            </button>
          </Link>
          <Link href="/charts">
            <button className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700">
              View Charts
            </button>
          </Link>
        </div>

        {/* ✅ Theme-safe AI Feedback */}
        <div className="border p-4 rounded-md bg-yellow-50 dark:bg-yellow-900 text-black dark:text-yellow-100 space-y-4 w-full max-w-lg mt-6">
          <h2 className="font-semibold text-lg">AI Spending Feedback</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {feedback.map((tip, idx) => (
              <li
                key={idx}
                dangerouslySetInnerHTML={{ __html: tip }}
              />
            ))}
          </ul>
        </div>
      </main>

      FINANCE APP

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
