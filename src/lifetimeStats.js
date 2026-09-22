import { MACROS } from "./nutrition.js";
import { dayHitsGoal, sumDay } from "./stats.js";
import { addDays } from "./dates.js";
import { parseSet } from "./workoutAnalysis.js";

const GOAL_CATS = ["calories", "protein", "carbs", "fat"];

const daysBetween = (from, to) =>
  Math.round((new Date(to + "T00:00:00") - new Date(from + "T00:00:00")) / 86400000);

// Longest run of consecutive calendar days meeting a goal, across all history.
const longestStreak = (loggedDays, hits) => {
  let best = 0, run = 0, prev = null;
  for (const day of loggedDays) {
    if (!hits(day)) { run = 0; prev = day; continue; }
    run = prev && addDays(prev, 1) === day ? run + 1 : 1;
    if (run > best) best = run;
    prev = day;
  }
  return best;
};

/**
 * Everything the app can say about a user's whole history, plus how their
 * recent stretch compares with it. Goal-based figures are measured against the
 * goals passed in, since earlier goals are not retained anywhere.
 */
export function lifetimeStats(days = {}, workouts = {}, goals = {}, water = {}, today, recentWindow = 30) {
  const loggedDays = Object.keys(days).filter(d => (days[d] || []).length > 0).sort();
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  let entries = 0;
  let bestDay = null;

  for (const day of loggedDays) {
    const sum = sumDay(days[day]);
    for (const k of MACROS) totals[k] += sum[k];
    entries += days[day].length;
    if (!bestDay || sum.calories > bestDay.calories) bestDay = { day, ...sum };
  }

  const n = loggedDays.length;
  const perDay = {};
  for (const k of MACROS) perDay[k] = n ? Math.round(totals[k] / n) : 0;

  const goalHits = {}, bestStreaks = {};
  for (const cat of GOAL_CATS) {
    const hits = d => dayHitsGoal(sumDay(days[d]), goals, cat);
    goalHits[cat] = loggedDays.filter(hits).length;
    bestStreaks[cat] = longestStreak(loggedDays, hits);
  }

  const workoutDays = Object.keys(workouts).filter(d => (workouts[d] || []).length > 0).sort();
  let sets = 0, volume = 0;
  const exercises = new Set();
  for (const day of workoutDays) {
    for (const w of workouts[day] || []) {
      sets++;
      if (w.name) exercises.add(w.name.trim().toLowerCase());
      const p = parseSet(w.detail || "");
      if (p) volume += p.volume;
    }
  }

  // Recent stretch vs the lifetime daily average.
  const cutoff = today ? addDays(today, -(recentWindow - 1)) : null;
  const recentDays = cutoff ? loggedDays.filter(d => d >= cutoff) : [];
  const recentTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  for (const day of recentDays) {
    const sum = sumDay(days[day]);
    for (const k of MACROS) recentTotals[k] += sum[k];
  }
  const recentPerDay = {}, delta = {};
  for (const k of MACROS) {
    recentPerDay[k] = recentDays.length ? Math.round(recentTotals[k] / recentDays.length) : 0;
    // Needs both a lifetime baseline and enough recent days to mean anything.
    delta[k] = perDay[k] > 0 && recentDays.length >= 3
      ? Math.round((recentPerDay[k] - perDay[k]) / perDay[k] * 100)
      : null;
  }

  const waterDays = Object.keys(water).filter(d => (water[d] || 0) > 0);

  return {
    daysLogged: n,
    firstDay: loggedDays[0] || null,
    lastDay: loggedDays[n - 1] || null,
    spanDays: n ? daysBetween(loggedDays[0], today || loggedDays[n - 1]) + 1 : 0,
    entries,
    totals,
    perDay,
    goalHits,
    bestStreaks,
    totalGoalHits: GOAL_CATS.reduce((a, c) => a + goalHits[c], 0),
    bestDay,
    workouts: { sessions: workoutDays.length, sets, volume, exercises: exercises.size },
    water: { total: waterDays.reduce((a, d) => a + water[d], 0), days: waterDays.length },
    recent: { window: recentWindow, days: recentDays.length, perDay: recentPerDay, delta },
  };
}
