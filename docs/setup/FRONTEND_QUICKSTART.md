# Frontend Quick Start

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Server runs on `http://localhost:5173`

## Build

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── MetricCard.jsx          # KPI card component
│   │   ├── ChartCard.jsx           # Chart container
│   │   ├── HeatMapChart.jsx        # Heat map visualization
│   │   ├── SimpleBarChart.jsx      # Bar chart
│   │   ├── StatusBadge.jsx         # Status indicator
│   │   ├── Navigation.jsx          # Sidebar + Header
│   │   └── Layout.jsx              # Main layout
│   ├── pages/
│   │   ├── Dashboard.jsx           # Home/Welcome page
│   │   ├── ExecutiveDashboard.jsx  # Exec dashboard
│   │   ├── QADashboard.jsx         # QA dashboard
│   │   ├── DeveloperDashboard.jsx  # Dev dashboard
│   │   ├── AdminPanel.jsx          # Admin panel
│   │   └── Login.jsx               # Login page
│   ├── context/
│   │   └── AuthContext.jsx         # Auth context
│   ├── services/
│   │   └── api.js                  # API wrapper
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # Entry point
│   ├── theme.js                    # MUI theme configuration
│   └── index.css
├── vite.config.js
├── package.json
└── index.html
```

## Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Dashboard Pages

### 📊 Executive Dashboard
- Path: `/dashboard/executive`
- Audience: C-level executives
- Key Metrics: Quality Score, Defect Rate, Velocity, Release Data
- Features: KPI cards, trend charts, heat maps, release table

### 📈 QA Dashboard
- Path: `/dashboard/qa`
- Audience: QA team leads and test engineers
- Key Metrics: Coverage, Pass Rate, Tests, Duration
- Features: Coverage breakdown, execution summary, flaky tests

### 💻 Developer Dashboard
- Path: `/dashboard/developer`
- Audience: Individual developers
- Key Metrics: PRs, Code Quality, Coverage, Defects
- Features: Personal metrics, PR history, recommendations

### ⚙️ Admin Panel
- Path: `/admin`
- Audience: System administrators
- Features: Project management, system configuration, health monitoring

## Component Usage

### MetricCard
```jsx
import MetricCard from '../components/MetricCard';

<MetricCard
  title="Quality Score"
  value="92%"
  color="success"
  icon={<CheckCircleIcon />}
  progress={92}
  trend={{ value: 5, direction: 'up' }}
/>
```

### ChartCard
```jsx
import ChartCard from '../components/ChartCard';

<ChartCard title="Performance" subtitle="Last 4 quarters">
  <Chart data={...} />
</ChartCard>
```

### HeatMapChart
```jsx
import HeatMapChart from '../components/HeatMapChart';

<HeatMapChart
  data={[
    { module: 'Auth', coverage: 95, risk: 5 },
    { module: 'API', coverage: 92, risk: 8 },
  ]}
/>
```

### StatusBadge
```jsx
import StatusBadge from '../components/StatusBadge';

<StatusBadge status="success" label="Passed" />
<StatusBadge status="error" label="Failed" />
<StatusBadge status="warning" label="Attention" />
```

## API Integration

All dashboards connect to backend:

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Endpoints Used

- `GET /api/v1/dashboard/executive/:projectId` - Executive metrics
- `GET /api/v1/dashboard/qa/:projectId` - QA metrics
- `GET /api/v1/dashboard/developer/:projectId` - Developer metrics
- `GET /api/v1/projects` - List projects
- `POST /api/v1/heatmaps/generate` - Generate heat maps
- `POST /api/v1/test-selection/recommend` - Test recommendations
- `POST /api/v1/risk-assessment/evaluate` - Risk assessment

## Styling

Uses MUI + Emotion CSS-in-JS

### Theme Colors
```javascript
// theme.js
palette: {
  primary: { main: '#1e3a8a' },    // Navy
  secondary: { main: '#0d9488' },  // Teal
  success: { main: '#10b981' },    // Emerald
  warning: { main: '#f59e0b' },    // Amber
  error: { main: '#ef4444' },      // Red
  info: { main: '#06b6d4' },       // Cyan
}
```

### Responsive Design
```jsx
// Mobile-first approach
sx={{
  fontSize: { xs: '0.875rem', md: '1rem' },
  padding: { xs: '16px', md: '32px' },
  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
}}
```

## Common Patterns

### Grid Layout
```jsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>
    <Component />
  </Grid>
</Grid>
```

### Card with Hover Effect
```jsx
<Card
  sx={{
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
    },
  }}
>
  {/* Content */}
</Card>
```

### Status Color Mapping
```javascript
const getStatusColor = (status) => {
  switch(status) {
    case 'success': return '#10b981';
    case 'error': return '#ef4444';
    case 'warning': return '#f59e0b';
    default: return '#64748b';
  }
};
```

## Performance Tips

1. **Lazy Load Components**
   ```jsx
   const ExecutiveDashboard = lazy(() => import('./pages/ExecutiveDashboard'));
   ```

2. **Memoize Expensive Calculations**
   ```jsx
   const memoizedData = useMemo(() => calculateData(data), [data]);
   ```

3. **Use React.memo for Static Components**
   ```jsx
   export default memo(MetricCard);
   ```

4. **Optimize Re-renders**
   ```jsx
   const [data, setData] = useCallback((newData) => {
     setData(newData);
   }, []);
   ```

## Testing

Run with Vitest:
```bash
npm run test:frontend
```

## Deployment

### Vercel
```bash
vercel deploy
```

### Docker
```bash
docker build -t integrity-frontend .
docker run -p 3000:3000 integrity-frontend
```

## Troubleshooting

### CORS Errors
Check `vite.config.js` proxy configuration:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  }
}
```

### Missing Components
Ensure all imports are correct:
```jsx
import MetricCard from '../components/MetricCard';
```

### Dark Mode
To add dark mode support, modify `theme.js`:
```javascript
const mode = useMediaQuery('(prefers-color-scheme: dark)');
const theme = createTheme({
  palette: {
    mode: mode ? 'dark' : 'light',
    // ...
  },
});
```

## Support

For issues or questions, check:
- [MUI Documentation](https://mui.com/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
