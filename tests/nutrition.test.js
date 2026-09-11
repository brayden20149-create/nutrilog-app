import test from 'node:test';
import assert from 'node:assert/strict';
import { barcodeNutrition, scaleNutrition, undoFoodChange } from '../src/nutrition.js';
const product = {product_name:'Cereal',serving_size:'1 cup (40 g)',nutriments:{'energy-kcal_serving':150,proteins_100g:10,carbohydrates_100g:70,fat_100g:5}};
test('partial serving fields convert from per 100g without losing precision',()=>{
  const b = barcodeNutrition(product);
  assert.equal(b.protein,4); assert.equal(b.carbs,28); assert.equal(b.fat,2);
  assert.equal(b.basisGrams,40);
});
test('unknown nutrition remains missing; genuine zero remains zero',()=>{
  const b = barcodeNutrition({nutriments:{'energy-kcal_serving':100,fat_serving:0}});
  assert.equal(b.fat,0); assert.equal(b.carbs,null); assert.equal(scaleNutrition(b,1),null);
});
test('mL is not interpreted as grams',()=>{
  const b=barcodeNutrition({...product,serving_size:'240 mL'});
  assert.equal(b.basisGrams,null); assert.equal(b.protein,null);
});
test('per 100g products calculate weighed portions',()=>{
  const b=barcodeNutrition({nutriments:{'energy-kcal_100g':123,proteins_100g:3.3,carbohydrates_100g:24.6,fat_100g:1.1}});
  assert.equal(b.basisGrams,100); assert.equal(scaleNutrition(b,200,'g').protein,6.6);
});
test('fractional servings and grams agree, and repeated scaling does not change base',()=>{
  const b=barcodeNutrition(product), snapshot=JSON.stringify(b);
  assert.deepEqual(scaleNutrition(b,1.5),scaleNutrition(b,60,'g'));
  assert.equal(scaleNutrition(b,1.5).calories,225);
  assert.equal(scaleNutrition(b,2).calories,300);
  assert.equal(JSON.stringify(b),snapshot);
});
test('invalid portions and missing or negative macros are rejected',()=>{
  const b=barcodeNutrition(product);
  for(const amount of ['',0,-1,'abc',Infinity]) assert.equal(scaleNutrition(b,amount),null);
  assert.equal(scaleNutrition({...b,fat:-1},1),null);
  assert.equal(scaleNutrition({...b,basisGrams:null},50,'g'),null);
});
test('undo whole chat transaction preserves unrelated later additions',()=>{
  const a={id:1,name:'A'},b={id:2,name:'B'},c={id:3,name:'C'},later={id:4,name:'Later'};
  assert.deepEqual(undoFoodChange([a,b,c,later],[a],[a,b,c]),[a,later]);
});
test('undo edit, removal and clear restores original entries',()=>{
  const a={id:1,name:'A'},b={id:2,name:'B'},edit={...a,name:'Edited'};
  assert.deepEqual(undoFoodChange([edit,b],[a,b],[edit,b]),[a,b]);
  assert.deepEqual(undoFoodChange([b],[a,b],[b]),[a,b]);
  assert.deepEqual(undoFoodChange([],[a,b],[]),[a,b]);
});
