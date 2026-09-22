export const APP_VERSION = "2.0.0";

export const CHANGELOG = [
 {version:"2.0.0",date:"Sep 22, 2026",notes:[
  {text:"Lifetime stats in Settings → Stats: every carb ever counted, goals hit, streaks and your recent pace versus all time",action:"settings"},
  {text:"A line of light drifts around the screen edge — Subtle, Vivid or off in Settings",action:"settings"},
  {text:"Halloween theme — pumpkin orange and purple, in Settings → Appearance",action:"settings"},
  {text:"Workout comparison popups redesigned: volume bars and set chips instead of paragraphs",action:"workouts"},
  {text:"Backup copies are compressed, leaving more room for food history — so repeat foods come from your own log instead of the AI",action:"log"},
  {text:"Storage now warns you when it is full instead of silently dropping a save",action:"settings"},
  {text:"Fixed edge swipe between tabs and the Try buttons in What's New, which both crashed"},
 ]},
 {version:"1.10.5",date:"Sep 20, 2026",notes:[
  {text:"Equivalent exercise wording shares one history; original sets stay intact",action:"workouts"},
  {text:"Link other names under Groups → Combine exercise names",action:"workouts"},
  {text:"Workout popups stay above navigation with a reachable close button",action:"workouts"},
 ]},
 {version:"1.10.4",date:"Sep 20, 2026",notes:[
  {text:"Compact muscle-group bars and stat badges keep the overview short",action:"workouts"},
  {text:"Tap a group, exercise and date to inspect individual weights, reps and sets",action:"workouts"},
 ]},
 {version:"1.10.3",date:"Sep 20, 2026",notes:[
  {text:"Saved food fractions show a multiplier and scaled macros before logging",action:"chat"},
  {text:"Tap a volume-change badge to see the prior session and calculation",action:"workouts"},
  {text:"Muscle-group trends and workout-day rankings based on your logged sets",action:"workouts"},
 ]},
  {version:"1.10.2",date:"Sep 20, 2026",notes:[
    {text:"Ask for past foods by name, including short names like dip",action:"chat"},
    {text:"History lookups show recorded dates and macros without logging; tap + to reuse a portion",action:"chat"},
  ]},
  {version:"1.10.1",date:"Sep 14, 2026",notes:[
    {text:"Restored the 1.10.0 interface, emoji tabs and Settings layout"},
    {text:"Open previous versions in Settings → History with separate saved data",action:"settings"},
  ]},
  { version:"1.10.0", date:"Sep 14, 2026", notes:[
    { text:"Choose extra nutrients, daily targets and streaks in Settings", action:"settings" },
    { text:"Find missing nutrients with AI; estimates stay labeled for review", action:"log" },
    { text:"Diet projection is hidden by default and respects current goal streaks", action:"settings" },
  ]},
  { version:"1.9.2", date:"Sep 14, 2026", notes:[
    { text:"Use large plus and minus buttons for scanned servings, or type an exact amount", action:"scan" },
    { text:"Scan amount and calculated totals now appear first, including in meal prep" },
  ]},
  { version:"1.9.1", date:"Sep 13, 2026", notes:[
    { text:"A simple diet projection replaces the daily missing-nutrient panel", action:"log" },
    { text:"See your recent pattern compared with your goals and one practical next step" },
  ]},
  { version:"1.9.0", date:"Sep 13, 2026", notes:[
    { text:"Track fiber, sodium, and fruit and vegetable cups alongside macros", action:"log" },
    { text:"Barcode scans read fiber and sodium when available; unknown values stay blank" },
    { text:"Add diet details to foods and meal-prep ingredients; daily totals show missing data" },
  ]},
  { version:"1.8.0", date:"Sep 13, 2026", notes:[
    { text:"Scan ingredient barcodes while creating or editing a meal prep", action:"meals" },
    { text:"Enter grams or servings used for the whole batch; per-container macros update automatically" },
    { text:"Scanned nutrition is remembered and protected from AI auto-fill" },
  ]},
  { version:"1.7.0", date:"Sep 13, 2026", notes:[
    { text:"Repeat food logging offers saved portions with their exact recorded macros", action:"chat" },
    { text:"Chat can reference matching barcode nutrition, saved meals, and previous food entries", action:"chat" },
    { text:"Packaged food portions must distinguish individual pieces from packages" },
  ]},
  { version:"1.6.1", date:"Sep 11, 2026", notes:[
    { text:"Undo now appears near the bottom with larger buttons, clear of the iPhone home indicator", action:"log" },
  ]},
  { version:"1.6.0", date:"Sep 9, 2026", notes:[
    { text:"Log scanned foods in fractional servings or grams with calculated totals", action:"scan" },
    { text:"Missing barcode nutrition stays blank so you can fill it from the label", action:"scan" },
    { text:"Saved barcodes remember one base serving, keeping repeat scans accurate", action:"scan" },
    { text:"Older saved barcodes need label nutrition entered once; existing food logs stay unchanged" },
    { text:"Undo your latest food-log change, including additions, edits, deletions, and clears, during this session", action:"log" },
  ]},
  { version:"1.5.0", date:"Jun 2026", notes:[
    { text:"Food logging can search the web for real restaurant nutrition data", action:"settings" },
    { text:"Toggle web search on/off to control extra API usage", action:"settings" },
    { text:"Rigorous portion-and-macro estimation method for all food", action:"chat" },
    { text:"Low-confidence estimates now flagged with a ~est badge", action:"log" },
    { text:"Expanded Chick-fil-A and McDonald's menu accuracy", action:"chat" },
  ]},
  { version:"1.4.1", date:"Jun 2026", notes:[
    { text:"Smarter lift matching — variations of a lift count as the same", action:"workouts" },
    { text:"Rename a lift to merge its history across all days", action:"workouts" },
    { text:"More accurate macro Auto-fill for meal preps", action:"meals" },
  ]},
  { version:"1.4.0", date:"Jun 2026", notes:[
    { text:"One unified AI assistant for food, workouts, meals & questions", action:"chat" },
    { text:"Each reply is tagged with what it handled", action:"chat" },
    { text:"Programs moved to the main tab bar", action:"programs" },
    { text:"Coach and Chef merged into the assistant", action:"chat" },
  ]},
  { version:"1.3.1", date:"Jun 2026", notes:[
    { text:"Edit logged sets and exercise names", action:"workouts" },
    { text:"Workout session highlights with PR badges", action:"workouts" },
    { text:"Smarter PR detection across your full history", action:"workouts" },
    { text:"Build programs set-by-set with individual weights", action:"programs" },
  ]},
  { version:"1.3.0", date:"Jun 2026", notes:[
    { text:"Programs — build workout plans with days and exercises", action:"programs" },
    { text:"Coach can generate and save programs for you", action:"train" },
    { text:"Log a program day directly to Coach with one tap", action:"programs" },
    { text:"Multiple programs with one marked active", action:"programs" },
  ]},
  { version:"1.2.3", date:"Jun 2026", notes:[
    { text:"Workout sets always shown as indented rows", action:"workouts" },
    { text:"Coach/Chef send button renamed to Send", action:"train" },
    { text:"Settings label simplified in menu", action:null },
    { text:"Custom colors merged into Appearance tab", action:"settings" },
  ]},
  { version:"1.2.1", date:"Jun 2026", notes:[
    { text:"Version history moved into Settings", action:"settings" },
    { text:"Goals button removed — edit goals in Profile", action:"profile" },
    { text:"Log multiple servings from barcode scanner", action:"scan" },
    { text:"Log multiple containers from Meal Preps", action:"meals" },
  ]},
  { version:"1.2.0", date:"Jun 2026", notes:[
    { text:"Customize your app's look — presets or your own colors", action:"settings" },
    { text:"Swipe from a screen edge to switch tabs", action:null },
    { text:"Swipe a drawer right to close it", action:null },
    { text:"Try buttons in this what's-new list", action:null },
  ]},
  { version:"1.1.2", date:"Jun 2026", notes:[
    { text:"Goals now count as hit when you're within 10% of them", action:null },
    { text:"Barcode entry includes a serving size with a unit dropdown (grams included)", action:"scan" },
  ]},
  { version:"1.1.1", date:"Jun 2026", notes:[
    { text:"Standout days — PRs stamp your week with a ⭐", action:"week" },
    { text:"Coach grades a 'complete' workout to your experience level", action:"train" },
    { text:"One clean congrats when a session is done (no partial spam)", action:null },
  ]},
  { version:"1.1.0", date:"Jun 2026", notes:[
    { text:"Barcode scanner for packaged foods, with a personal product cache", action:"scan" },
    { text:"Customizable water goal + hold-to-pick amounts", action:"profile" },
    { text:"Source links on branded items", action:null },
    { text:"Swipe a log entry left to delete", action:"log" },
    { text:"Haptic feedback + share-sheet backup", action:null },
  ]},
  { version:"1.0.0", date:"Jun 2026", notes:[
    { text:"First release 🎉", action:null },
    { text:"AI food logging (chat + photo), strength coach, and chef", action:"chat" },
    { text:"Meal preps, week calendar, streaks, profile & goals", action:"profile" },
    { text:"Weight check-in, water tracking, and auto-backup", action:"log" },
  ]},
];
