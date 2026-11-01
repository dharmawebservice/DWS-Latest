import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../lib/auth";
import { getServiceClient } from "../../../../lib/supabase";
import { isBot } from "../../../../lib/bots";

async function auth() {
  const session = await getAdminSession();
  if (!session) return null;
  return getServiceClient();
}

export async function GET() {
  const supabase = await auth();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  const { data: allRows, error: allErr } = await supabase
    .from("page_visits")
    .select("visitor_ip, visit_date, page_path, hit_count, user_agent");

  if (allErr) {
    console.error("Visits fetch error:", allErr);
    return NextResponse.json({ error: allErr.message }, { status: 500 });
  }

  // Hide bot/crawler/unknown traffic, including rows recorded before filtering existed.
  const rows = (allRows || []).filter((r) => r.visitor_ip && r.visitor_ip !== "unknown" && !isBot(r.user_agent));

  const totalHits = rows.reduce((s, r) => s + (r.hit_count || 1), 0);

  const dayMap = {};
  rows.forEach((r) => {
    if (!dayMap[r.visit_date]) dayMap[r.visit_date] = new Set();
    dayMap[r.visit_date].add(r.visitor_ip);
  });

  const dailyStats = Object.entries(dayMap)
    .map(([date, ipSet]) => ({
      date,
      unique: ipSet.size,
      label: new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const todayUnique = dayMap[today] ? dayMap[today].size : 0;
  const yesterdayUnique = dayMap[yesterday] ? dayMap[yesterday].size : 0;

  const last30Unique = Object.entries(dayMap)
    .filter(([date]) => date >= thirtyDaysAgoStr)
    .reduce((s, [, ipSet]) => s + ipSet.size, 0);

  const pageCountsToday = {};
  rows
    .filter((r) => r.visit_date === today)
    .forEach((r) => {
      pageCountsToday[r.page_path] =
        (pageCountsToday[r.page_path] || 0) + (r.hit_count || 1);
    });

  const topPages = Object.entries(pageCountsToday)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return NextResponse.json({
    todayUnique,
    yesterdayUnique,
    totalHits,
    last30Unique,
    daily: dailyStats.slice(-30),
    topPages,
  });
}