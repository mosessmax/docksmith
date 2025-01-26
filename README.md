# docksmith

a smart container configuration generator that works with any container runtime (Docker, Podman, OrbStack).
born because i couldn't use docker init since i don't have docker desktop, and i had gotten tired of writing dockerfiles for quickly dockerizing my apps.

## features

- 🔍 automatic framework detection
- 🎯 framework-specific optimized configurations (nextjs) only for now.
- 🛠 development & production setups
- 🔄 Multi-stage builds for optimization
- 🚀 Support for multiple container runtimes
- 📦 Easy service addition (databases, caches, etc.)

## installation

```bash
npm install -g docksmith
```

## usage

### basic usage

navigate to your project directory and run:

```bash
docksmith init
```

This will:
1. Detect your project framework
2. Ask for configuration preferences
3. Generate optimized container configurations

### command Line Options

```bash
# Initialize with default settings
docksmith init -y

# Specify framework manually
docksmith init -f nextjs

# Generate development configuration
docksmith init -d

# Specify custom port
docksmith init -p 8080

# Add a service to existing configuration
docksmith add database -t postgres (WIP)

# List available frameworks and services
docksmith list
```

### Generated Files

Running `docksmith init` generates:

- `Dockerfile`: optimized for your framework
- `compose.yaml`: container orchestration configuration
- `.dockerignore`: framework-specific ignore patterns
- `README.Docker.md`: usage instructions and configuration details

## Supported Frameworks

- Next.js (ONLY Available)
ON THE LIST
- Express
- Flask
- Django
- FastAPI
- more coming soon...

## container runtime support

- Docker
- Podman
- OrbStack
- Lima

## development workflow

1. initialize container configuration:
   ```bash
   docksmith init -d
   ```

2. start development environment:
   ```bash
   docker compose up
   ```

3. your application will be available with:
   - Hot reload enabled
   - Debug ports configured
   - Volume mounts for live changes

## Production Workflow

1. generate production configuration:
   ```bash
   docksmith init
   ```

2. Build and run:
   ```bash
   docker compose up --build
   ```

## Adding Services - WUP

add additional services to your configuration:

```bash
# Add PostgreSQL database
docksmith add database -t postgres

# Add Redis cache
docksmith add cache -t redis
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT

## Development and Testing

To work on docksmith development:

1. Clone the repository:
   ```bash
   git clone git@github.com:mosessmax/docksmith.git
   ```

2. Install dependencies:
   ```bash
   cd docksmith
   npm install
   ```

3. Link for local development:
   ```bash
   npm link
   ```

4. Run tests:
   ```bash
   npm test
   ```