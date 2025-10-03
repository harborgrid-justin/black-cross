# Contributing to Black-Cross

Thank you for your interest in contributing to Black-Cross! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Issues

- Use the GitHub issue tracker
- Search existing issues before creating a new one
- Provide detailed information:
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - System information
  - Logs and screenshots

### Feature Requests

- Open an issue with the "feature request" label
- Describe the feature and its benefits
- Provide use cases
- Discuss implementation approach

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the code style guidelines
   - Add tests for new features
   - Update documentation
   - Keep commits atomic and well-described

4. **Test your changes**
   ```bash
   npm test
   npm run lint
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Add feature: description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Provide a clear description
   - Reference related issues
   - Include screenshots for UI changes
   - Ensure CI passes

## Development Setup

### Prerequisites

- Node.js 16+
- Docker and Docker Compose
- PostgreSQL 13+
- MongoDB 4.4+ (optional, for specific modules)
- Redis 6+ (optional)

### Setup Steps

1. Clone the repository
   ```bash
   git clone https://github.com/harborgrid-justin/black-cross.git
   cd black-cross
   ```

2. Install all dependencies (uses npm workspaces)
   ```bash
   npm run install:all
   ```

3. Set up environment variables
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Frontend
   cp frontend/.env.example frontend/.env
   # Edit both .env files with your configuration
   ```

4. Set up Prisma and database
   ```bash
   # Generate Prisma Client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   ```

5. Start services (optional - for PostgreSQL, MongoDB, Redis)
   ```bash
   docker-compose up -d postgres mongodb redis
   ```

6. Start development servers
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run dev:backend  # Backend on http://localhost:8080
   npm run dev:frontend # Frontend on http://localhost:3000
   ```

## Code Style Guidelines

### JavaScript/Node.js

- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use async/await over callbacks
- Use descriptive variable names
- Add JSDoc comments for functions
- Keep functions small and focused

### Example

```javascript
/**
 * Enriches threat intelligence with additional data
 * @param {Object} threat - The threat object
 * @param {Array} sources - Enrichment sources
 * @returns {Promise<Object>} Enriched threat object
 */
async function enrichThreat(threat, sources) {
  try {
    const enrichmentData = await Promise.all(
      sources.map(source => source.enrich(threat))
    );
    
    return {
      ...threat,
      enrichment: enrichmentData
    };
  } catch (error) {
    logger.error('Enrichment failed', { error, threat });
    throw error;
  }
}
```

### File Structure

```
black-cross/
├── frontend/         # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── package.json
├── backend/          # Node.js + Express backend
│   ├── modules/      # Feature modules
│   │   ├── module-name/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   └── validators/
│   │   └── ...
│   ├── index.js
│   └── package.json
├── prisma/           # Database schema and migrations
│   ├── schema.prisma
│   └── migrations/
└── package.json      # Root workspace config
```

## Testing Guidelines

### Unit Tests

- Test individual functions and methods
- Mock external dependencies
- Aim for >80% code coverage
- Use descriptive test names

### Integration Tests

- Test API endpoints
- Test database operations
- Test external integrations
- Use test databases

### Example Test

```javascript
describe('Threat Intelligence Service', () => {
  describe('enrichThreat', () => {
    it('should enrich threat with OSINT data', async () => {
      const threat = { id: '123', type: 'malware' };
      const enriched = await threatService.enrichThreat(threat);
      
      expect(enriched).toHaveProperty('enrichment');
      expect(enriched.enrichment).toHaveProperty('osint');
    });
    
    it('should handle enrichment failures gracefully', async () => {
      const threat = { id: 'invalid' };
      
      await expect(
        threatService.enrichThreat(threat)
      ).rejects.toThrow();
    });
  });
});
```

## Documentation Guidelines

### Code Documentation

- Add JSDoc comments to all public functions
- Document complex algorithms
- Include usage examples
- Document return types and error conditions

### User Documentation

- Update user guides for new features
- Add screenshots for UI changes
- Provide step-by-step instructions
- Include troubleshooting tips

### API Documentation

- Document all endpoints
- Include request/response examples
- Document error responses
- Keep OpenAPI/Swagger specs updated

## Commit Message Guidelines

Follow conventional commits:

```
type(scope): subject

body

footer
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(threat-intel): add threat correlation algorithm

Implemented graph-based correlation algorithm for identifying
related threats based on IoC overlap and timing.

Closes #123
```

```
fix(incident-response): correct priority calculation

Fixed bug where incidents were not properly prioritized
based on asset criticality.

Fixes #456
```

## Review Process

1. All PRs require at least one review
2. CI must pass
3. Code coverage must not decrease
4. Documentation must be updated
5. Follow-up on review comments

## Security

- Never commit secrets or credentials
- Report security issues privately
- Follow secure coding practices
- Validate all user inputs
- Use parameterized queries

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

- Open an issue for questions
- Join our community forum
- Email: dev@black-cross.io

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Acknowledged in the project

Thank you for contributing to Black-Cross!
