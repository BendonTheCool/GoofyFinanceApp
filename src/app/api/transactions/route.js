import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET all transactions
export async function GET() {
  const transactions = db.prepare("SELECT * FROM transactions").all();
  return NextResponse.json(transactions);
}

// POST new transaction
export async function POST(req) {
  const { id, title, amount, category, date } = await req.json();

  db.prepare(
    "INSERT INTO transactions (id, title, amount, category, date) VALUES (?, ?, ?, ?, ?)"
  ).run(id, title, amount, category, date);

  return NextResponse.json({ success: true });
}

// DELETE a transaction by id (POST or URL Param)

export async function DELETE(req) {
  const { id } = await req.json();

  db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
