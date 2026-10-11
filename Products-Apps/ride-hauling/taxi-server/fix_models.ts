import fs from 'fs';
import path from 'path';

const baseDir = './server';

function walk(dir: string, callback: (filePath: string) => void) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

walk(baseDir, (filePath) => {
  if (filePath.endsWith('.model.ts') || filePath.endsWith('.model.js') || filePath.endsWith('User.model.ts') || filePath.endsWith('AdminNotification.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Case 1: export default mongoose.model(...)
    const regex1 = /export default mongoose\.model(<[^>]+>)?\(['"]([^'"]+)['"],\s*([^)]+)\)/g;
    let newContent = content.replace(regex1, (match, types, modelName, schemaName) => {
      console.log(`Fixing (Type 1) ${filePath}: ${modelName}`);
      return `export default mongoose.models.${modelName} || mongoose.model${types || ''}('${modelName}', ${schemaName})`;
    });

    // Case 2: const ModelName = mongoose.model(...); export default ModelName;
    const regex2 = /const\s+([A-Za-z0-9_]+Model)\s*:\s*(Model<[^>]+>|any)\s*=\s*mongoose\.model(<[^>]+>)?\(['"]([^'"]+)['"],\s*([^)]+)\);/g;
    newContent = newContent.replace(regex2, (match, variableName, typeSpec, types, modelName, schemaName) => {
       console.log(`Fixing (Type 2) ${filePath}: ${modelName}`);
       return `const ${variableName}: ${typeSpec} = mongoose.models.${modelName} || mongoose.model${types || ''}('${modelName}', ${schemaName});`;
    });

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
    }
  }
});
