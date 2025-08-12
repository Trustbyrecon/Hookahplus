const fs=require('fs'),{execSync}=require('child_process');
const sha=execSync('git rev-parse --short HEAD').toString().trim();
const when=new Date().toISOString();
fs.mkdirSync('public',{recursive:true});
fs.writeFileSync('public/health.txt',`commit=${sha}\nbuilt_at=${when}\nsite=https://hookahplus.net\n`);
console.log('health.txt', sha, when);
