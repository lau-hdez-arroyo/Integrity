# Frontend Design System & Components

## 🎨 Design Philosophy

The INTEGRITY frontend is built with:
- **Modern Design**: Elegant, professional interface with subtle animations
- **User-Centric**: Clear visual hierarchy and intuitive navigation
- **Data-Driven**: Dashboards designed to communicate complex metrics simply
- **Accessible**: WCAG 2.1 AA compliant with semantic HTML

## 🎯 Color Palette

```
Primary: #1e3a8a (Navy Blue)
Secondary: #0d9488 (Teal)
Success: #10b981 (Emerald)
Warning: #f59e0b (Amber)
Error: #ef4444 (Red)
Info: #06b6d4 (Cyan)

Background: #f8fafc (Light Slate)
Surface: #ffffff (White)
Text Primary: #0f172a (Dark Slate)
Text Secondary: #64748b (Slate)
```

## 📦 Component Library

### MetricCard
Displays single metrics with trends and progress
```jsx
<MetricCard
  title="Quality Score"
  value="92%"
  trend={{ value: 5, direction: 'up' }}
  color="success"
  icon={<CheckCircleIcon />}
  progress={92}
/>
```

### ChartCard
Container for charts with loading and header
```jsx
<ChartCard title="Performance" subtitle="Last 4 quarters">
  <Chart data={...} />
</ChartCard>
```

### HeatMapChart
Visual grid for coverage/risk heatmaps
- Color-coded modules
- Hover interactions
- Tooltips with details

### SimpleBarChart
Bar chart without external dependencies
- Responsive height
- Hover effects
- Formatted tooltips

### StatusBadge
Status indicator with icon
```jsx
<StatusBadge status="success" label="Passed" />
<StatusBadge status="error" label="Failed" />
<StatusBadge status="warning" label="Attention" />
```

### Navigation
Sidebar + Header navigation component
- Fixed sidebar (desktop)
- Drawer (mobile)
- User menu
- Project navigation

## 📱 Responsive Breakpoints

```
Mobile:  xs < 600px
Tablet:  sm 600px - 900px
Desktop: md 900px - 1200px
Large:   lg 1200px - 1536px
```

## 🎭 Dashboard Variants

### Executive Dashboard
**Target Audience**: C-level executives
**Key Metrics**:
- Quality Score
- Defect Escape Rate
- Test Execution Time
- Velocity & Trends

**Components**:
- KPI Cards (4)
- Quality Score Trend (Chart)
- Release Velocity (Chart)
- Coverage Heat Map
- Recent Releases (Table)

### QA Dashboard
**Target Audience**: QA team lead, test engineers
**Key Metrics**:
- Overall Coverage
- Pass Rate
- Total Tests
- Avg Duration

**Components**:
- Coverage Cards (4)
- Test Execution Breakdown
- Coverage by Module
- Flaky Tests (Table)

### Developer Dashboard
**Target Audience**: Individual developers
**Key Metrics**:
- Pull Requests
- Code Quality
- Test Coverage
- Defects Escaped

**Components**:
- Personal Metrics (4)
- Code Quality Trend
- Coverage Improvement
- Recent PRs (Table)
- Recommendations

### Admin Panel
**Target Audience**: System administrators
**Features**:
- Project Management
- System Configuration
- User Management
- Health Monitoring

## 🚀 Performance Features

1. **Lazy Loading**: Dashboard data loads progressively
2. **Responsive Design**: Adapts from mobile to large displays
3. **Error Handling**: Graceful fallbacks and error messages
4. **Loading States**: Visual feedback during data fetches
5. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation

## 📐 Layout Grid

All dashboards use 12-column grid system:
- Mobile: Stacked (1 column)
- Tablet: 2 columns
- Desktop: 3-4 columns
- Large: 4-6 columns

## 🎬 Animation & Transitions

- Hover effects: 300ms ease
- Card elevation: Subtle shadows
- Micro-interactions: Smooth state transitions
- Loading: Spinner animations
- Transitions: Cubic-bezier(0.4, 0, 0.2, 1)

## 📊 Data Visualization

### Charts
- Bar charts for comparisons
- Line trends for changes over time
- Heat maps for coverage/risk
- Progress bars for percentages
- Status indicators for states

### Tables
- Hover highlighting
- Striped rows
- Action buttons
- Status chips
- Responsive overflow

## 🔧 Theme Configuration

All components use MUI theme system with custom palette:
```javascript
// theme.js
const theme = createTheme({
  palette: {
    primary: { main: '#1e3a8a' },
    secondary: { main: '#0d9488' },
    // ... colors
  },
  typography: {
    fontFamily: 'Segoe UI, Roboto, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 800 },
    // ... typography
  },
});
```

## 🎯 Usage Examples

### Basic Dashboard Layout
```jsx
<Container maxWidth="lg">
  {/* Header */}
  <Box sx={{ marginBottom: '40px' }}>
    <Typography variant="h2">Dashboard Title</Typography>
  </Box>

  {/* KPI Row */}
  <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
    <Grid item xs={12} sm={6} md={3}>
      <MetricCard {...props} />
    </Grid>
  </Grid>

  {/* Charts Row */}
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <ChartCard title="Chart">
        <Chart {...props} />
      </ChartCard>
    </Grid>
  </Grid>
</Container>
```

## 📝 Component Props

### MetricCard
- `title`: Card title (string)
- `value`: Main value (string/number)
- `subtitle`: Optional subtitle (string)
- `color`: Color variant (primary|success|warning|error|info)
- `progress`: Progress percentage (0-100)
- `trend`: Trend object { value, direction } (up|down)
- `icon`: MUI Icon component
- `onClick`: Click handler

### ChartCard
- `title`: Card title (string)
- `subtitle`: Optional subtitle (string)
- `loading`: Show loading state (boolean)
- `action`: Header action component
- `children`: Chart content
- `sx`: Additional MUI styles

## 🔗 API Integration

All dashboards connect to backend API:
- `/api/v1/dashboard/executive/:projectId`
- `/api/v1/dashboard/qa/:projectId`
- `/api/v1/dashboard/developer/:projectId`

Using axios wrapper: `services/api.js`

## 🧪 Testing Strategy

1. Component unit tests (Vitest)
2. Integration tests (user interactions)
3. E2E tests (full workflows)
4. Visual regression tests
5. Accessibility tests

## 📚 Resources

- MUI Documentation: https://mui.com/
- Design Tokens: See theme.js
- Icons: @mui/icons-material
- Styling: Emotion CSS-in-JS
