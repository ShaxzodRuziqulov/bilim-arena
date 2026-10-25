const fs=require('node:fs');
const path=require('node:path');
function createDataStore(file, validate) {
  const backup=file+'.bak';
  const exists=(name)=>{try{fs.statSync(name);return true;}catch(error){if(error.code==='ENOENT')return false;throw error;}};
  const read=(name)=>validate(JSON.parse(fs.readFileSync(name,'utf8')));
  const write=(name,text)=>{ fs.mkdirSync(path.dirname(name),{recursive:true}); const tmp=name+'.tmp'; fs.writeFileSync(tmp,text); fs.renameSync(tmp,name); };
  return {
    load() {
      if (!exists(file) && !exists(backup)) return {data:null,recovered:false};
      try { return {data:read(file),recovered:false}; } catch {
        try { return {data:read(backup),recovered:true}; } catch { throw new Error('Asosiy ma’lumot va zaxirani o‘qib bo‘lmadi. Fayllar saqlandi; zaxira fayldan tiklang.'); }
      }
    },
    save(data) {
      const valid=validate(data);
      if (exists(file)) {
        try { const previous=read(file); write(backup,JSON.stringify(previous)); }
        catch(error) { // Buzilgan asl fayl zaxiraning ustiga yozilmaydi.
          let validPrevious=false; try { read(file); validPrevious=true; } catch {}
          if (validPrevious) throw error;
        }
      }
      if (!exists(backup)) write(backup,JSON.stringify(valid));
      write(file,JSON.stringify(valid));
      return true;
    },
  };
}
module.exports={createDataStore};
