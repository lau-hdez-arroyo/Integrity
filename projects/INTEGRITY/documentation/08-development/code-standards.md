# Code Standards: Project INTEGRITY

**Autonomous Quality Intelligence Ecosystem (AQIE)**

*Development Standards, Code Style, and Best Practices*

---

## Executive Summary

This document establishes coding standards, conventions, and best practices for Project INTEGRITY. All developers must follow these standards to maintain code quality, consistency, and maintainability. Enforcement is automated via linters, code review, and CI/CD gates.

**Status:** Phase 08 Development - Code Standards (Generated: May 1, 2026)

---

## 1. Code Style & Formatting

### Language-Specific Standards

**[Primary Language] Code Style:**

**Naming Conventions:**
- Classes: PascalCase (e.g., `UserAuthenticationService`)
- Methods: camelCase (e.g., `validateToken()`)
- Variables: camelCase (e.g., `userId`, `isActive`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- Private members: _camelCase (e.g., `_cache`, `_logger`)

**Indentation:**
- Size: [2 or 4] spaces
- Tabs: Never use tabs
- Line length: Maximum [80/100/120] characters
- Wrapping: Maintain readability

**Bracing Style:**
```
Method declaration style:
public void ValidateUser(User user) {
    // Implementation
}

Control flow style:
if (isValid) {
    // Action
} else {
    // Alternative
}
```

---

### Formatting Rules

**File Organization:**
```
1. File header comment
2. Package/namespace declaration
3. Import statements (grouped, sorted alphabetically)
4. Class/interface declaration
5. Fields (private first, then public)
6. Constructors
7. Public methods
8. Private methods
9. Nested classes
```

**Spacing:**
- Blank line between methods
- No trailing whitespace
- Blank line at end of file
- Consistent spacing around operators

---

## 2. Architecture & Design Principles

### SOLID Principles

**S - Single Responsibility**
```
Each class should have one reason to change.

❌ Bad:
class UserService {
    public void CreateUser() { }
    public void SendEmail() { }
    public void LogToDatabase() { }
}

✅ Good:
class UserService {
    public void CreateUser() { }
}

class EmailService {
    public void SendEmail() { }
}

class LoggingService {
    public void LogToDatabase() { }
}
```

**O - Open/Closed**
```
Open for extension, closed for modification.

✅ Good:
interface IIntegrationAdapter {
    void Connect();
    void Disconnect();
}

class ADOAdapter : IIntegrationAdapter { }
class GitHubAdapter : IIntegrationAdapter { }
```

**L - Liskov Substitution**
```
Derived classes should be substitutable for base classes.

✅ Good:
IIntegrationAdapter adapter = new ADOAdapter();
// Can be replaced with any implementation
```

**I - Interface Segregation**
```
Clients should not depend on interfaces they don't use.

❌ Bad:
interface IService {
    void Create();
    void Read();
    void Update();
    void Delete();
    void SendEmail();
    void LogEvent();
}

✅ Good:
interface ICrudService {
    void Create();
    void Read();
    void Update();
    void Delete();
}

interface INotificationService {
    void SendEmail();
}
```

**D - Dependency Inversion**
```
Depend on abstractions, not concretions.

✅ Good:
public class HeatMapService {
    private readonly IDataRepository _repository;
    
    public HeatMapService(IDataRepository repository) {
        _repository = repository;
    }
}
```

---

### Design Patterns

**Factory Pattern:**
```
Used for: Creating objects with complex initialization
Location: [Module].Factory classes
Example: IntegrationAdapterFactory.Create(type)
```

**Repository Pattern:**
```
Used for: Data access abstraction
Location: [Domain].Repository namespace
Example: IProjectRepository, ProjectRepository
```

**Service Layer Pattern:**
```
Used for: Business logic encapsulation
Location: [Feature].Services namespace
Example: HeatMapService, TestSelectionService
```

---

## 3. Error Handling & Logging

### Exception Handling

**Guidelines:**
- Catch specific exceptions, not generic `Exception`
- Log exception details before re-throwing
- Provide meaningful error messages
- Use custom exceptions for domain-specific errors

**Pattern:**
```[Language]
try {
    // Operation
} catch (SpecificException ex) {
    _logger.Error($"Operation failed: {ex.Message}", ex);
    throw new DomainException("User-friendly message", ex);
} finally {
    // Cleanup if needed
}
```

---

### Logging Standards

**Log Levels & Usage:**
- **DEBUG:** Detailed diagnostic info, variable states
- **INFO:** General flow, important operations
- **WARN:** Potential issues, recoverable errors
- **ERROR:** Error conditions, exceptions
- **CRITICAL:** System failures requiring immediate attention

**Logging Requirements:**
- Include TraceId for request correlation
- Log input/output for debugging
- Avoid logging sensitive data (passwords, tokens)
- Include timestamps in structured logs

**Example:**
```
logger.Info($"[{traceId}] Heat map generation started for project {projectId}");
logger.Debug($"[{traceId}] Processing {moduleCount} modules");
logger.Error($"[{traceId}] Heat map generation failed: {ex.Message}", ex);
```

---

## 4. Security Standards

### Input Validation

**Requirements:**
- Validate all user input
- Use whitelisting, not blacklisting
- Validate data types and ranges
- Check for SQL injection patterns
- Sanitize output

**Pattern:**
```[Language]
public void CreateProject(ProjectRequest request) {
    ValidateProjectName(request.Name);
    ValidatePath(request.RepositoryPath);
    ValidateConnectionSettings(request.Connection);
}
```

---

### Authentication & Authorization

**Token Management:**
- Store tokens securely (never in code)
- Use short expiration times (15-60 min)
- Implement refresh token rotation
- Log token generation/expiration

**Authorization:**
- Check permissions before operations
- Use role-based access control (RBAC)
- Fail secure (deny by default)
- Audit all authorization checks

---

### Credential Management

**Requirements:**
- Never hardcode credentials
- Use environment variables or secrets manager
- Rotate credentials regularly
- Audit credential access
- Use least privilege principle

**Pattern:**
```[Language]
string apiKey = Environment.GetEnvironmentVariable("SONARQUBE_API_KEY");
// or
string apiKey = await secretManager.GetSecret("sonarqube-api-key");
```

---

## 5. Performance Standards

### Code Performance

**Target Metrics:**
- API endpoints: <100ms response time
- Database queries: <50ms execution time
- Cache hit rate: >90%
- Memory leaks: 0 detected

**Performance Checklist:**
```
☐ Use async/await for I/O operations
☐ Implement caching for expensive operations
☐ Use batch operations instead of loops
☐ Index database queries appropriately
☐ Monitor query performance
☐ Use connection pooling
☐ Lazy load relationships
☐ Profile hot paths
```

---

### Scalability Considerations

**Database:**
- Use connection pooling
- Index frequently queried columns
- Partition large tables if needed
- Implement query optimization

**API:**
- Use pagination for large result sets
- Implement rate limiting
- Use response compression
- Cache repeated requests

---

## 6. Testing Standards

### Unit Test Requirements

**Naming:**
```
TestClassName: [ClassUnderTest]Tests
Test Method: [Method]_[Scenario]_[Expected]

Example: HeatMapServiceTests::CalculateCoverage_WithValidModule_ReturnsPercentage
```

**Structure (Arrange-Act-Assert):**
```[Language]
[Test]
public void CalculateCoverage_WithValidModule_ReturnsPercentage() {
    // ARRANGE
    var module = new Module { CoveredLines = 85, TotalLines = 100 };
    
    // ACT
    var coverage = service.CalculateCoverage(module);
    
    // ASSERT
    Assert.AreEqual(0.85, coverage);
}
```

**Requirements:**
- Minimum 85% code coverage
- One assertion per test (ideally)
- No test dependencies
- Mock external services
- Fast execution (<1 second each)

---

### Test Data Management

**Best Practices:**
- Use test fixtures for common data
- Create builders for complex objects
- Use factories for test data
- Cleanup data after tests
- Avoid hardcoded paths/URLs

---

## 7. Documentation Standards

### Code Comments

**When to Comment:**
- Complex algorithms: Explain approach
- Non-obvious design decisions: Explain why
- Business logic: Reference requirements
- Workarounds: Explain temporary solutions

**When NOT to Comment:**
- Obvious code (e.g., `i++`)
- Method names that are self-documenting
- Type declarations (except complex generics)

---

### Documentation Format

**Method Documentation:**
```[Language]
/// <summary>
/// Calculates code coverage percentage for a module.
/// </summary>
/// <param name="module">Module to analyze</param>
/// <returns>Coverage percentage (0-100)</returns>
/// <exception cref="ArgumentNullException">Thrown when module is null</exception>
/// <example>
/// var coverage = service.CalculateCoverage(module);
/// </example>
public decimal CalculateCoverage(Module module) {
    // Implementation
}
```

---

### API Documentation

**Requirements:**
- Document every endpoint
- Include request/response examples
- Document error responses
- Include authentication requirements
- Document rate limits

---

## 8. Version Control & Branching

### Branch Naming Convention

```
feature/[FEATURE-ID]-brief-description
  Example: feature/FM-7-dashboard-executive-view

bugfix/[BUG-ID]-brief-description
  Example: bugfix/BG-123-fix-heat-map-crash

hotfix/[HOTFIX-ID]-brief-description
  Example: hotfix/HF-45-security-token-expiration

refactor/[TASK-ID]-brief-description
  Example: refactor/REF-12-consolidate-services
```

---

### Commit Message Standards

**Format:**
```
[TYPE] [ID] Brief description (max 50 chars)

Optional longer description explaining:
- What changed
- Why it changed
- Any breaking changes

Examples:
feature: FM-7 Add executive dashboard view
  - Implemented real-time KPI metrics
  - Added trend visualization
  - Integrated with analytics engine

fix: BG-123 Fix heat map null reference
  - Added null checks for module list
  - Updated tests to cover edge case
```

**Commits:**
- One logical change per commit
- Frequent, meaningful commits
- Never commit debug code
- Never commit credentials

---

### Code Review Process

**Reviewer Responsibilities:**
- Check for adherence to code standards
- Verify tests are included and passing
- Look for security vulnerabilities
- Suggest improvements
- Approve or request changes

**Author Responsibilities:**
- Address all feedback
- Provide context for design decisions
- Test locally before submitting
- Keep PRs focused (one feature per PR)

---

## 9. Dependency Management

### Approved Dependencies

**Criteria for Approval:**
- Active maintenance & updates
- Security track record
- Community support
- License compatibility
- Performance acceptable

**Process:**
1. Verify with Tech Lead
2. Check for vulnerabilities
3. Add to approved list
4. Document version constraints
5. Pin versions in lock file

---

### Dependency Security

**Requirements:**
- Regular vulnerability scans
- Update critical patches immediately
- Review changelogs before updates
- Remove unused dependencies
- Monitor for end-of-life notice

---

## 10. Configuration Management

### Environment Variables

**Naming Convention:**
```
[APPLICATION]_[SERVICE]_[SETTING]

Examples:
INTEGRITY_DATABASE_CONNECTION_STRING
INTEGRITY_SONARQUBE_API_URL
INTEGRITY_CACHE_REDIS_HOST
```

**Security:**
- Never commit to version control
- Use secrets manager in production
- Rotate regularly
- Log access attempts

---

### Configuration Files

**Strategy:**
- Separate config from code
- Use environment-specific files
- Document all settings
- Validate on startup
- Provide defaults for development

---

## 11. Common Violations & Remediation

| Violation | Severity | Example | Fix |
|-----------|----------|---------|-----|
| God Class | HIGH | Class with 500+ lines | Split into services |
| Magic Numbers | MEDIUM | `if (timeout > 30000)` | `if (timeout > MAX_TIMEOUT)` |
| Commented Code | MEDIUM | `// await db.Save();` | Delete or track in Git |
| Global State | HIGH | Static shared variables | Use dependency injection |
| Unhandled Exception | CRITICAL | Missing try-catch | Add proper error handling |

---

## 12. Code Review Checklist

**Before Submitting PR:**
```
☐ Code follows all naming conventions
☐ No violations of SOLID principles
☐ Tests added for new functionality
☐ Test coverage maintained (≥85%)
☐ No hardcoded credentials/API keys
☐ Documentation/comments added
☐ No debug code left in
☐ No unused imports/variables
☐ Performance acceptable
☐ Security review passed
☐ Follows commit message standards
☐ Rebased on latest main branch
```

---

**Phase 08 Development - Code Standards Complete**

*Enforcement required for all commits*

Date: May 1, 2026  
Status: Standards Effective  
Review: Quarterly  
Last Updated: May 1, 2026
