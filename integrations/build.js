const fs=require('node:fs/promises');
const path=require('node:path');
async function build(){
  const out=path.resolve(__dirname,'..','dist');
  await fs.mkdir(out,{recursive:true});
  for(const name of ['index.html','thank-you.html']) await fs.copyFile(path.resolve(__dirname,'..',name),path.join(out,name));
  await fs.cp(path.resolve(__dirname,'..','assets'),path.join(out,'assets'),{recursive:true});
}
build().catch(e=>{console.error(e);process.exitCode=1});
