const macros = ['calories','protein','carbs','fat'];
const finite = n => typeof n === 'number' && Number.isFinite(n) && n >= 0;

// Project the recent logged pattern against the user's own goals, not weight or health outcomes.
export function dietProjection(days, goals, today, streaks = {}) {
  if (['calories','protein','carbs'].every(k=>streaks[k]>=3)) return {
    title:'Your recent goal streaks are strong',
    explanation:`You’re on ${streaks.calories} calorie, ${streaks.protein} protein and ${streaks.carbs} carb goal days in a row, using the same rules as your streak tiles. Your fat streak is ${streaks.fat||0} days.`,
    change:'Keep your routine consistent. Meeting macro goals alone does not establish overall diet quality.',
    days:Math.min(streaks.calories,streaks.protein,streaks.carbs),
  };
  const cutoff = new Date(today+'T12:00:00Z');
  cutoff.setUTCDate(cutoff.getUTCDate()-14);
  const first = cutoff.toISOString().slice(0,10);
  const dates = Object.keys(days).filter(d=>d>=first && d<today && days[d]?.length).sort().slice(-7);
  if (dates.length < 3) return {
    title:'Building your diet projection',
    explanation:`Log at least 3 days before today to see where your eating pattern is heading. You have ${dates.length} recent logged ${dates.length===1?'day':'days'} so far.`,
    change:'Keep logging full days; today’s unfinished meals won’t be treated as a full day.',
    days:dates.length,
  };
  const entries = dates.flatMap(d=>days[d]);
  if (entries.some(e=>macros.some(k=>!finite(e[k])))) return {title:'Check your recent logs',explanation:'Some recent foods have missing or invalid macros, so a projection would be misleading.',change:'Correct those food entries, then your projection will update.',days:dates.length};
  const avg=Object.fromEntries(macros.map(k=>[k,entries.reduce((n,e)=>n+e[k],0)/dates.length]));
  const hasGoal = k=>finite(goals[k]) && goals[k]>0;
  const calories = hasGoal('calories') ? avg.calories/goals.calories : null;
  const protein = hasGoal('protein') ? avg.protein/goals.protein : null;
  let title='Your recent eating pattern';
  let explanation=`If you keep eating like your recent logs, you’d average about ${Math.round(avg.calories).toLocaleString('en-US')} calories and ${Math.round(avg.protein)} g protein per day next week.`;
  let change='Set your calorie and protein goals so this can show your biggest opportunity.';
  if (calories !== null || protein !== null) {
    title='Close to your current goals';
    change='Keep your portions and meal routine consistent; your logged averages are close to your targets.';
    if (protein !== null && protein < .9 && !(streaks.protein>=3)) {
      title='Recent logged protein is below target';
      explanation+=` That’s about ${Math.round(goals.protein-avg.protein)} g protein below your daily target.`;
      change=calories !== null && calories>1.1 ? 'Swap part of a regular meal or snack for a leaner protein option, rather than adding another meal.' : 'Add a protein source to the meal where you usually get the least protein.';
    } else if (calories !== null && calories > 1.1) {
      title='Trending above your calorie goal';
      explanation+=` That’s about ${Math.round(avg.calories-goals.calories)} calories above your daily target.`;
      change='Adjust one regular portion, side, or sauce to bring your average closer to your goal. Compare equal portions when trying a homemade version.';
    } else if (calories !== null && calories < .9) {
      title='Trending below your calorie goal';
      explanation+=` That’s about ${Math.round(goals.calories-avg.calories)} calories below your daily target.`;
      change='First check for unlogged meals. If these are full days, increase a regular meal portion to move toward your target.';
    } else if (hasGoal('fat') && avg.fat>goals.fat*1.1) {
      title='Fat is above your chosen target';
      explanation+=` Your logged fat averages ${Math.round(avg.fat)} g versus your ${goals.fat} g target.`;
      change='Try a smaller amount of sauce, cheese, or added oil in a meal you eat regularly, if those are part of it.';
    } else if (calories === null || protein === null) {
      title='Your recent eating pattern';
      change='Set both calorie and protein goals for a clearer comparison.';
    }
  }
  return {title,explanation,change,days:dates.length,avg};
}
