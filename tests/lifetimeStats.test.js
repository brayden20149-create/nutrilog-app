import test from 'node:test';
import assert from 'node:assert/strict';
import {lifetimeStats} from '../src/lifetimeStats.js';

const meal=(calories,protein,carbs,fat)=>({name:'Food',calories,protein,carbs,fat});
const GOALS={calories:2000,protein:150,carbs:200,fat:70,water:100};

test('totals, averages and entry counts cover every logged day',()=>{
 const days={'2026-09-01':[meal(500,40,50,20),meal(500,40,50,20)],'2026-09-02':[meal(1000,80,100,40)],'2026-09-03':[]};
 const s=lifetimeStats(days,{},GOALS,{},'2026-09-03');
 assert.equal(s.daysLogged,2);            // the empty day is not a logged day
 assert.equal(s.entries,3);
 assert.equal(s.totals.calories,2000);
 assert.equal(s.totals.carbs,200);
 assert.equal(s.perDay.calories,1000);
 assert.equal(s.firstDay,'2026-09-01');
 assert.equal(s.lastDay,'2026-09-02');
});

test('goal hits and best streaks count only consecutive qualifying days',()=>{
 const hit=()=>[meal(2000,150,200,70)];
 const miss=()=>[meal(100,5,5,1)];
 // Two in a row, a miss, then three in a row -> best streak of 3.
 const days={'2026-09-01':hit(),'2026-09-02':hit(),'2026-09-03':miss(),
             '2026-09-04':hit(),'2026-09-05':hit(),'2026-09-06':hit()};
 const s=lifetimeStats(days,{},GOALS,{},'2026-09-06');
 assert.equal(s.goalHits.calories,5);
 assert.equal(s.bestStreaks.calories,3);
});

test('a gap in the calendar breaks a streak even when both days hit',()=>{
 const hit=()=>[meal(2000,150,200,70)];
 const s=lifetimeStats({'2026-09-01':hit(),'2026-09-09':hit()},{},GOALS,{},'2026-09-09');
 assert.equal(s.goalHits.calories,2);
 assert.equal(s.bestStreaks.calories,1);
});

test('recent window compares against the lifetime average',()=>{
 const days={};
 for(let i=1;i<=10;i++) days[`2026-09-${String(i).padStart(2,'0')}`]=[meal(1000,50,100,30)];
 for(let i=11;i<=20;i++) days[`2026-09-${String(i).padStart(2,'0')}`]=[meal(2000,100,200,60)];
 const s=lifetimeStats(days,{},GOALS,{},'2026-09-20',10);
 assert.equal(s.perDay.calories,1500);        // lifetime average across all 20 days
 assert.equal(s.recent.days,10);
 assert.equal(s.recent.perDay.calories,2000); // last 10 days only
 assert.equal(s.recent.delta.calories,33);    // 2000 vs 1500
});

test('delta stays null without a baseline or enough recent days',()=>{
 const s=lifetimeStats({'2026-09-20':[meal(1000,50,100,30)]},{},GOALS,{},'2026-09-20',30);
 assert.equal(s.recent.delta.calories,null);
 const empty=lifetimeStats({},{},GOALS,{},'2026-09-20');
 assert.equal(empty.daysLogged,0);
 assert.equal(empty.perDay.calories,0);
 assert.equal(empty.bestDay,null);
 assert.equal(empty.spanDays,0);
});

test('workout volume sums readable sets and counts distinct exercises',()=>{
 const workouts={'2026-09-01':[{name:'Bench Press',detail:'100 lbs × 10'},{name:'bench press',detail:'100 lbs × 5'}],
                 '2026-09-02':[{name:'Squat',detail:'unreadable'}]};
 const s=lifetimeStats({},workouts,GOALS,{},'2026-09-02');
 assert.equal(s.workouts.sessions,2);
 assert.equal(s.workouts.sets,3);
 assert.equal(s.workouts.volume,1500);   // the unreadable set contributes nothing
 assert.equal(s.workouts.exercises,2);   // name matching is case-insensitive
});

test('best day tracks the highest calorie total',()=>{
 const days={'2026-09-01':[meal(1200,50,100,30)],'2026-09-02':[meal(3000,50,100,30)],'2026-09-03':[meal(900,50,100,30)]};
 const s=lifetimeStats(days,{},GOALS,{},'2026-09-03');
 assert.equal(s.bestDay.day,'2026-09-02');
 assert.equal(s.bestDay.calories,3000);
});
