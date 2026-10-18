import {STORAGE_KEY} from './core.js?v=d9b04d29540c';

export const BACKUP_KEY=STORAGE_KEY+'-before-import';

const storageError=(code,message,cause,details={})=>{
  const error=new Error(message);
  error.name='ImportPersistenceError';
  error.code=code;
  error.cause=cause;
  Object.assign(error,details);
  return error;
};

function restore(storage,key,value){
  if(value===null)storage.removeItem(key);
  else storage.setItem(key,value);
}

/** Save the current state as a recovery copy, then persist the incoming import.
 * Web Storage writes are atomic: a failed setItem leaves that key unchanged.
 * The read-back and rollback also cover storage adapters that partially write.
 */
export function persistImport(storage,currentState,incomingState){
  const previousPrimary=storage.getItem(STORAGE_KEY);
  const previousBackup=storage.getItem(BACKUP_KEY);
  const currentJson=JSON.stringify(currentState);
  const incomingJson=JSON.stringify(incomingState);
  if(typeof currentJson!=='string'||typeof incomingJson!=='string')throw new TypeError('Las copias deben ser objetos JSON.');

  try{
    storage.setItem(BACKUP_KEY,currentJson);
  }catch(cause){
    let backupRestored=false,rollbackError=null;
    try{
      let activeBackup;
      try{activeBackup=storage.getItem(BACKUP_KEY);}catch{activeBackup=Symbol('unreadable backup');}
      if(activeBackup!==previousBackup)restore(storage,BACKUP_KEY,previousBackup);
      backupRestored=storage.getItem(BACKUP_KEY)===previousBackup;
      if(!backupRestored)throw new Error('No se pudo confirmar la restauración de la copia anterior.');
    }catch(error){rollbackError=error;}
    if(!backupRestored){
      let backupContainsCurrentState=null;
      try{backupContainsCurrentState=storage.getItem(BACKUP_KEY)===currentJson;}catch{}
      const message=backupContainsCurrentState
        ?'No se pudo guardar la copia de recuperación; el progreso actual sigue intacto, pero la copia anterior no se pudo restaurar. La copia de recuperación contiene el progreso actual.'
        :'No se pudo guardar la copia de recuperación; el progreso actual sigue intacto, pero no se pudo confirmar el estado de la copia anterior.';
      throw storageError('backup-restore-failed',message,cause,{primaryUnchanged:true,backupRestored:false,backupContainsCurrentState,rollbackError});
    }
    throw storageError('backup-write-failed','No se pudo guardar la copia de recuperación; el progreso actual sigue intacto y la copia anterior se conservó.',cause,{primaryUnchanged:true,backupRestored:true,rollbackError});
  }

  try{
    storage.setItem(STORAGE_KEY,incomingJson);
    return true;
  }catch(writeError){
    let primaryUnchanged=false,primaryRollbackError=null;
    try{
      let activePrimary;
      try{activePrimary=storage.getItem(STORAGE_KEY);}catch{activePrimary=Symbol('unreadable primary');}
      if(activePrimary!==previousPrimary)restore(storage,STORAGE_KEY,previousPrimary);
      primaryUnchanged=storage.getItem(STORAGE_KEY)===previousPrimary;
      if(!primaryUnchanged)throw new Error('No se pudo confirmar la restauración del progreso actual.');
    }catch(error){primaryRollbackError=error;}

    if(!primaryUnchanged){
      throw storageError('primary-restore-failed','No se pudo guardar la copia importada ni confirmar que el progreso activo siga intacto. La copia de recuperación con el progreso anterior se ha conservado para intentar recuperarlo.',writeError,{primaryUnchanged:false,backupRestored:false,rollbackError:primaryRollbackError});
    }

    try{
      restore(storage,BACKUP_KEY,previousBackup);
      if(storage.getItem(BACKUP_KEY)!==previousBackup)throw new Error('No se pudo confirmar la restauración de la copia anterior.');
    }catch(backupRollbackError){
      let backupContainsCurrentState=null,backupRestored=false;
      try{
        const activeBackup=storage.getItem(BACKUP_KEY);
        backupContainsCurrentState=activeBackup===currentJson;
        backupRestored=activeBackup===previousBackup;
      }catch{}
      if(backupRestored)throw storageError('import-write-failed','No se pudo guardar la copia importada; el progreso actual sigue activo y la copia de recuperación anterior se conservó.',writeError,{primaryUnchanged:true,backupRestored:true,rollbackError:backupRollbackError});
      const message=backupContainsCurrentState
        ?'No se pudo guardar la copia importada; el progreso actual sigue activo y la copia de recuperación anterior no se pudo restaurar. La copia de recuperación contiene el progreso actual.'
        :'No se pudo guardar la copia importada; el progreso actual sigue activo, pero no se pudo confirmar la restauración de la copia de recuperación anterior.';
      throw storageError('backup-restore-failed',message,writeError,{primaryUnchanged:true,backupRestored:false,backupContainsCurrentState,rollbackError:backupRollbackError});
    }

    throw storageError('import-write-failed','No se pudo guardar la copia importada; el progreso actual sigue activo y la copia de recuperación anterior se conservó.',writeError,{primaryUnchanged:true,backupRestored:true});
  }
}
