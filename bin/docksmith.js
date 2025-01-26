#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { detectFramework } from '../src/detect/frameworks.js';
import { detectRuntime } from '../src/detect/runtime.js';
import { generateConfig } from '../src/generators/index.js';

const program = new Command();

program
  .name('docksmith')
  .description('intelligent container configuration generator')
  .version('0.1.0');

//init
program
  .command('init')
  .description('Initialize container configuration')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('-f, --framework <framework>', 'Specify framework manually')
  .option('-d, --dev', 'Generate development configuration')
  .option('-p, --port <port>', 'Specify port number')
  .action(async (options) => {
    const spinner = ora('Analyzing project...').start();
    
    try {
      // detect project framework 
      const framework = options.framework || await detectFramework();
      const runtime = await detectRuntime();
      
      spinner.succeed('Project analyzed');

      if (!framework) {
        spinner.fail('No framework detected');
        console.log(chalk.yellow('\nPlease specify a framework manually with -f option:'));
        console.log('Available frameworks: nextjs, express, flask, django, fastapi');
        process.exit(1);
      }

      // if not using --yes flag, prompt for configuration
      let config = { ...options };
      
      if (!options.yes) {
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'framework',
            message: 'Select framework:',
            default: framework,
            choices: ['nextjs', 'express', 'flask', 'django', 'fastapi']
          },
          {
            type: 'confirm',
            name: 'development',
            message: 'Generate development configuration?',
            default: true
          },
          {
            type: 'input',
            name: 'port',
            message: 'Application port:',
            default: '3000'
          }
        ]);
        
        config = { ...config, ...answers };
      }

      // generate configuration
      spinner.start('Generating configuration...');
      await generateConfig({
        framework: config.framework || framework,
        runtime,
        development: config.dev || config.development,
        port: config.port || 3000
      });
      
      spinner.succeed('Configuration generated successfully');
      
      console.log(chalk.green('\n✨ Done! Next steps:'));
      console.log('1. Review generated files');
      console.log(`2. Run ${chalk.cyan('docker compose up')} to start\n`);
      
    } catch (error) {
      spinner.fail('Error generating configuration');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

//aAdd command
program
  .command('add')
  .description('Add a service to existing configuration')
  .argument('<service>', 'Service to add (database, cache, etc.)')
  .option('-t, --type <type>', 'Service type (postgres, mysql, redis, etc.)')
  .action(async (service, options) => {
    console.log(`Adding ${service} service...`);
  });

// validate command
program
  .command('validate')
  .description('Validate container configuration')
  .action(async () => {
    console.log('Validating configuration...');
  });

// list command
program
  .command('list')
  .description('List available frameworks and services')
  .action(() => {
    console.log('Available frameworks and services...');
  });

program.parse();