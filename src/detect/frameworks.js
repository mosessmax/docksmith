import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

const FRAMEWORK_PATTERNS = {
  nextjs: {
    files: ['next.config.js', 'next.config.mjs', 'next.config.ts'],
    deps: ['next'],
    configFiles: ['package.json']
  },
  express: {
    files: ['app.js', 'index.js', 'server.js', 'src/app.js',
      'src/server.js','src/index.js'],
    deps: ['express'],
    configFiles: ['package.json'],
    additionalChecks: async (projectPath) => {
      try {
        const packageJson = JSON.parse(await fs.readFile(path.join(projectPath, 'package.json'), 'utf8'));
        return !!packageJson.dependencies?.['express'];
      } catch {
        return false;
      }
    }
  },
  flask: {
    files: ['app.py', 'wsgi.py'],
    deps: ['flask'],
    configFiles: ['requirements.txt', 'pyproject.toml']
  },
  django: {
    files: ['manage.py', 'wsgi.py'],
    deps: ['django'],
    configFiles: ['requirements.txt', 'pyproject.toml']
  },
  fastapi: {
    files: ['main.py'],
    deps: ['fastapi'],
    configFiles: ['requirements.txt', 'pyproject.toml']
  }
};

async function checkFileExists(filepath) {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

async function findFiles(pattern) {
  return glob(pattern, { dot: true });
}

async function readDependencies(configFile) {
  try {
    const content = await fs.readFile(configFile, 'utf8');
    
    if (configFile.endsWith('package.json')) {
      const pkg = JSON.parse(content);
      return [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})];
    }
    
    if (configFile.endsWith('requirements.txt')) {
      return content.split('\n')
        .map(line => line.split('==')[0].split('>=')[0].trim())
        .filter(Boolean);
    }
    
    if (configFile.endsWith('pyproject.toml')) {
    //    parsing for dependencies
      const depsMatch = content.match(/\[tool\.poetry\.dependencies\]([\s\S]*?)(\[|$)/);
      if (depsMatch) {
        return depsMatch[1].split('\n')
          .map(line => line.split('=')[0].trim())
          .filter(Boolean);
      }
    }
    
    return [];
  } catch {
    return [];
  }
}

export async function detectFramework(projectPath = process.cwd()) {
  const results = [];

  for (const [framework, pattern] of Object.entries(FRAMEWORK_PATTERNS)) {
    const hasFiles = await Promise.all(
      pattern.files.map(file => checkFileExists(path.join(projectPath, file)))
    );
    
    if (hasFiles.some(Boolean)) {
      results.push({ framework, confidence: 0.8 });
      continue;
    }

    // dependencies check in config files
    for (const configFile of pattern.configFiles) {
      const configPath = path.join(projectPath, configFile);
      if (await checkFileExists(configPath)) {
        const deps = await readDependencies(configPath);
        if (pattern.deps.some(dep => deps.includes(dep))) {
          results.push({ framework, confidence: 0.6 });
          break;
        }
      }
    }
  }

  results.sort((a, b) => b.confidence - a.confidence);
  return results[0]?.framework || null;
}

export async function listAvailableFrameworks() {
  return Object.keys(FRAMEWORK_PATTERNS);
}