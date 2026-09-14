import test from "node:test";
import assert from "node:assert/strict";
import {createVersionStorage,resolveVersion} from "../src/appVersions.js";
function memory(initial={}) {
 const values=new Map(Object.entries(initial));
 return {get length(){return values.size},key:i=>[...values.keys()][i]??null,
 getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
}
test("archives copy once and cannot overwrite or erase current logs",()=>{
 const storage=memory({nl4_days:"original",nl4_goals:"goals",unrelated:"private"});
 const old=createVersionStorage("1.10.0",storage);
 assert.equal(old.getItem("nl4_days"),"original");
 assert.equal(old.getItem("unrelated"),null);
 old.setItem("nl4_days","archive edit");old.removeItem("nl4_goals");
 assert.equal(storage.getItem("nl4_days"),"original");
 assert.equal(storage.getItem("nl4_goals"),"goals");
 assert.equal(createVersionStorage("1.10.0",storage).getItem("nl4_days"),"archive edit");
 assert.equal(createVersionStorage("1.9.2",storage).getItem("nl4_days"),"original");
});
test("only known versions can be opened",()=>{
 assert.equal(resolveVersion("../anything"),"current");
 assert.equal(resolveVersion(null),"current");
 assert.equal(resolveVersion("1.9.2"),"1.9.2");
 assert.throws(()=>createVersionStorage("unknown",memory()));
});
