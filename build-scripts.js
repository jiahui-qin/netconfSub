const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Netconf Tool Build Script');
console.log('===========================');

// 获取项目根目录
const projectRoot = __dirname;

// 检查必要的文件
const checkFiles = () => {
  console.log('\n📁 Checking project structure...');
  
  const requiredFiles = [
    path.join(projectRoot, 'backend/index.js'),
    path.join(projectRoot, 'backend/package.json'),
    path.join(projectRoot, 'frontend/dist/index.html')
  ];
  
  let allOk = true;
  for (const file of requiredFiles) {
    const relativePath = path.relative(projectRoot, file);
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${relativePath}`);
    } else {
      console.log(`  ❌ ${relativePath} (missing)`);
      allOk = false;
    }
  }
  
  return allOk;
};

// 复制前端构建文件到后端目录
const copyFrontend = () => {
  console.log('\n📦 Copying frontend build files...');
  
  const srcDir = path.join(projectRoot, 'frontend', 'dist');
  const destDir = path.join(projectRoot, 'backend', 'dist');
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  // 复制所有文件
  const copyRecursive = (src, dest) => {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const files = fs.readdirSync(src);
      for (const file of files) {
        copyRecursive(path.join(src, file), path.join(dest, file));
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  };
  
  copyRecursive(srcDir, destDir);
  console.log('  ✅ Frontend files copied successfully');
};

// 主函数
const main = () => {
  if (!checkFiles()) {
    console.log('\n❌ Build failed - please ensure frontend is built first');
    process.exit(1);
  }
  
  copyFrontend();
  
  console.log('\n✅ Build preparation complete!');
  console.log('\n📝 Now you can:');
  console.log('   - Run `cd backend && npm run pkg:win` to package for Windows');
  console.log('   - Run `cd backend && npm run pkg:linux` to package for Linux');
  console.log('   - Run `cd backend && npm run pkg:mac` to package for macOS');
  console.log('   - Or run `cd backend && npm run pkg` to package for all platforms');
};

main();
