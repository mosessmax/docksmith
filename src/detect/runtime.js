import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const RUNTIME_COMMANDS = {
  docker: 'docker --version',
  podman: 'podman --version',
  orbstack: 'orbctl version',
  lima: 'limactl --version'
};

export async function detectRuntime() {
  const results = [];

  for (const [runtime, command] of Object.entries(RUNTIME_COMMANDS)) {
    try {
      const { stdout } = await execAsync(command);
      results.push({
        runtime,
        version: parseVersion(stdout),
        available: true
      });
    } catch {
      results.push({
        runtime,
        version: null,
        available: false
      });
    }
  }

  const availableRuntimes = results.filter(r => r.available);
  
  if (availableRuntimes.length === 0) {
    throw new Error('No container runtime detected. Please install Docker, Podman, or OrbStack.');
  }

  const priorities = {
    orbstack: 4,
    docker: 3,
    podman: 2,
    lima: 1
  };

  return availableRuntimes.sort((a, b) => 
    priorities[b.runtime] - priorities[a.runtime]
  )[0];
}

function parseVersion(output) {
  const versionMatch = output.match(/(\d+\.\d+\.\d+)/);
  return versionMatch ? versionMatch[1] : null;
}

export function getRuntimeSpecificConfig(runtime) {
  const configs = {
    docker: {
      composeVersion: '3.8',
      defaultSocket: '/var/run/docker.sock'
    },
    podman: {
      composeVersion: '3.8',
      defaultSocket: '/run/podman/podman.sock',
      rootless: true
    },
    orbstack: {
      composeVersion: '3.8',
      defaultSocket: '/var/run/docker.sock',
      accelerated: true
    },
    lima: {
      composeVersion: '3.8',
      defaultSocket: '/var/run/lima/docker.sock'
    }
  };

  return configs[runtime] || configs.docker;
}