# Contributing to ZL Intelligence

Thank you for your interest in contributing to ZL Intelligence! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and professional in all interactions
- Focus on constructive feedback
- Help create a welcoming environment for all contributors

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone git@github.com:YOUR_USERNAME/zl-intelligence.git
   cd zl-intelligence
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### 1. Environment Setup
```bash
# Install dependencies
pip install -r requirements.txt
cd web && npm install
cd ../tsci/time_series_agent && pip install -r requirements.txt
```

### 2. Make Changes
- Follow existing code style and conventions
- Write clear, descriptive commit messages
- Test your changes locally

### 3. Run Tests
```bash
# Verify Python environment
python verify_env.py

# Test TSci integration
cd tsci/time_series_agent
./run_tsci_test.sh

# Test Next.js build
cd web
npm run build
```

### 4. Commit Guidelines
Use conventional commits format:
```
feat: add new forecasting model
fix: resolve hydration error in quant-admin
docs: update TSci setup guide
refactor: reorganize feature engineering code
test: add unit tests for Anofox bridge
```

### 5. Submit Pull Request
1. Push your branch to your fork
2. Open a PR against `main` branch
3. Fill out the PR template with details
4. Await code review

## Code Style

### Python
- Follow PEP 8
- Use type hints where possible
- Write docstrings for all functions/classes
- Maximum line length: 100 characters

### TypeScript/React
- Use TypeScript strict mode
- Follow Airbnb style guide
- Use functional components with hooks
- Prefer named exports

### SQL (Anofox)
- Use uppercase for SQL keywords
- Indent nested queries
- Comment complex logic

## Documentation

- Update relevant docs in `docs/` for any feature changes
- Keep README.md updated
- Add inline code comments for complex logic
- Update API documentation if endpoints change

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Documentation improvements
- Questions about architecture

---

**Happy Contributing! 🚀**
