import test from 'node:test';
import assert from 'node:assert/strict';
import {STORAGE_KEY} from '../dist/core.js';
import {BACKUP_KEY,persistImport} from '../dist/storage.js';

class FakeStorage{
  constructor(entries=[],{limit=Infinity,failBefore=()=>false,failAfter=()=>false,failRemove=()=>false}={}){
    this.values=new Map(entries);
    this.limit=limit;
    this.failBefore=failBefore;
    this.failAfter=failAfter;
    this.failRemove=failRemove;
  }
  getItem(key){return this.values.has(key)?this.values.get(key):null;}
  setItem(key,value){
    value=String(value);
    if(this.failBefore(key,value))throw new Error('Injected storage write failure.');
    const used=[...this.values].filter(([storedKey])=>storedKey!==key).reduce((total,[,storedValue])=>total+storedValue.length,0);
    if(used+value.length>this.limit){const error=new Error('Quota exceeded.');error.name='QuotaExceededError';throw error;}
    this.values.set(key,value);
    if(this.failAfter(key,value))throw new Error('Injected post-write failure.');
  }
  removeItem(key){
    if(this.failRemove(key))throw new Error('Injected storage remove failure.');
    this.values.delete(key);
  }
}

const currentState={version:1,level:'B1',notes:'Current progress'};
const incomingState={version:1,level:'B2',notes:'Imported progress'};
const currentJson=JSON.stringify(currentState);
const incomingJson=JSON.stringify(incomingState);
const oldPrimary='previous-primary-raw';
const oldBackup='previous-recovery-raw';

test('Successful import saves the prior current state before replacing the primary',()=>{
  const storage=new FakeStorage([[STORAGE_KEY,oldPrimary],[BACKUP_KEY,oldBackup]]);
  assert.equal(persistImport(storage,currentState,incomingState),true);
  assert.equal(storage.getItem(BACKUP_KEY),currentJson);
  assert.equal(storage.getItem(STORAGE_KEY),incomingJson);
});

test('A quota failure on the import write restores the exact prior recovery backup',()=>{
  const limit=oldPrimary.length+currentJson.length;
  const storage=new FakeStorage([[STORAGE_KEY,oldPrimary],[BACKUP_KEY,oldBackup]],{limit});
  assert.throws(()=>persistImport(storage,currentState,{...incomingState,notes:'x'.repeat(500)}),error=>{
    assert.equal(error.name,'ImportPersistenceError');
    assert.equal(error.code,'import-write-failed');
    assert.equal(error.primaryUnchanged,true);
    assert.equal(error.backupRestored,true);
    return true;
  });
  assert.equal(storage.getItem(STORAGE_KEY),oldPrimary);
  assert.equal(storage.getItem(BACKUP_KEY),oldBackup);
});

test('A failed recovery-backup write leaves both existing values untouched',()=>{
  const storage=new FakeStorage([[STORAGE_KEY,oldPrimary],[BACKUP_KEY,oldBackup]],{failBefore:key=>key===BACKUP_KEY});
  assert.throws(()=>persistImport(storage,currentState,incomingState),error=>{
    assert.equal(error.code,'backup-write-failed');
    assert.equal(error.primaryUnchanged,true);
    assert.equal(error.backupRestored,true);
    return true;
  });
  assert.equal(storage.getItem(STORAGE_KEY),oldPrimary);
  assert.equal(storage.getItem(BACKUP_KEY),oldBackup);
});

test('A recovery-backup write that mutates then throws is rolled back before import',()=>{
  let failedCurrentBackup=false;
  const storage=new FakeStorage([[STORAGE_KEY,oldPrimary],[BACKUP_KEY,oldBackup]],{
    failAfter:(key,value)=>{
      if(key===BACKUP_KEY&&value===currentJson&&!failedCurrentBackup){failedCurrentBackup=true;return true;}
      return false;
    }
  });
  assert.throws(()=>persistImport(storage,currentState,incomingState),error=>{
    assert.equal(error.code,'backup-write-failed');
    assert.equal(error.primaryUnchanged,true);
    assert.equal(error.backupRestored,true);
    return true;
  });
  assert.equal(storage.getItem(STORAGE_KEY),oldPrimary);
  assert.equal(storage.getItem(BACKUP_KEY),oldBackup);
});

test('If restoring the old backup fails, keep current progress active and report the fallback copy',()=>{
  const storage=new FakeStorage([[STORAGE_KEY,oldPrimary],[BACKUP_KEY,oldBackup]],{
    limit:oldPrimary.length+currentJson.length,
    failBefore:(key,value)=>key===BACKUP_KEY&&value===oldBackup
  });
  assert.throws(()=>persistImport(storage,currentState,{...incomingState,notes:'x'.repeat(500)}),error=>{
    assert.equal(error.code,'backup-restore-failed');
    assert.equal(error.primaryUnchanged,true);
    assert.equal(error.backupRestored,false);
    assert.equal(error.backupContainsCurrentState,true);
    assert.match(error.message,/contiene el progreso actual/);
    return true;
  });
  assert.equal(storage.getItem(STORAGE_KEY),oldPrimary);
  assert.equal(storage.getItem(BACKUP_KEY),currentJson);
});

test('A storage adapter that mutates then throws has its primary and backup rolled back',()=>{
  let failedIncomingWrite=false;
  const storage=new FakeStorage([[STORAGE_KEY,oldPrimary],[BACKUP_KEY,oldBackup]],{
    failAfter:(key,value)=>{
      if(key===STORAGE_KEY&&value===incomingJson&&!failedIncomingWrite){failedIncomingWrite=true;return true;}
      return false;
    }
  });
  assert.throws(()=>persistImport(storage,currentState,incomingState),error=>{
    assert.equal(error.code,'import-write-failed');
    assert.equal(error.primaryUnchanged,true);
    assert.equal(error.backupRestored,true);
    return true;
  });
  assert.equal(storage.getItem(STORAGE_KEY),oldPrimary);
  assert.equal(storage.getItem(BACKUP_KEY),oldBackup);
});
