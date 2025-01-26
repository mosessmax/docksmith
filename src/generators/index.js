import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import { getRuntimeSpecificConfig } from '../detect/runtime.js';

export async function generateConfig({ framework, runtime, development = false, port = 3000 }) {
  const runtimeConfig = getRuntimeSpecificConfig(runtime.runtime);
  
  await Promise.all([
    generateDockerfile({ framework, development }),
    generateCompose({ framework, runtime: runtime.runtime, development, port, runtimeConfig }),
    generateDockerignore({ framework }),
    generateReadme({ framework, runtime: runtime.runtime, development, port })
  ]);
}

async function generateDockerfile({ framework, development }) {
  const templatePath = path.join(process.cwd(), 'src', 'templates', framework, development ? 'Dockerfile.dev' : 'Dockerfile');
  const content = await fs.readFile(templatePath, 'utf8');
  await fs.writeFile('Dockerfile', content);
}

async function generateCompose({ framework, runtime, development, port, runtimeConfig }) {
  const compose = {
    version: runtimeConfig.composeVersion,
    services: {
      app: {
        build: {
          context: '.',
          target: development ? 'development' : 'production'
        },
        ports: [`${port}:${port}`],
        environment: {
          NODE_ENV: development ? 'development' : 'production',
          PORT: port
        },
        volumes: development ? ['.:/app'] : []
      }
    }
  };

  // runtime-specific configurations
  if (runtime === 'orbstack') {
    compose.services.app['x-orbstack'] = {
      accelerated: true
    };
  }

  await fs.writeFile('compose.yaml', yaml.stringify(compose));
}

async function generateDockerignore({ framework }) {
  const ignores = [
    '.git',
    'node_modules',
    'npm-debug.log',
    'Dockerfile',
    '.dockerignore',
    '.env',
    '*.md',
    '*.log'
  ];

  if (framework.startsWith('python')) {
    ignores.push(
      '__pycache__',
      '*.pyc',
      '*.pyo',
      '*.pyd',
      '.Python',
      'env/',
      'venv/'
    );
  }

  await fs.writeFile('.dockerignore', ignores.join('\n'));
}

async function generateReadme({ framework, runtime, development, port }) {
  const content = `# Docker Configuration

## Quick Start
\`\`\`bash
${runtime} compose up
\`\`\`

## Development
${development ? 'Running in development mode with hot reload enabled.' : 'Running in production mode.'}

### Ports
- Application: ${port}
${development ? `- Debug: ${port + 1}` : ''}

### Environment Variables
- NODE_ENV=${development ? 'development' : 'production'}
- PORT=${port}
`;

  await fs.writeFile('README.Docker.md', content);
}