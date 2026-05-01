import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, Container, CircularProgress, Alert } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import MetricCard from '../components/MetricCard';
import ChartCard from '../components/ChartCard';
import HeatMapChart from '../components/HeatMapChart';
import SimpleBarChart from '../components/SimpleBarChart';
import { api } from '../services/api';

/**
 * ExecutiveDashboard - High-level KPIs for executives
 * Shows quality metrics, trends, and business impact
 */
export default function ExecutiveDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const projectId = '550e8400-e29b-41d4-a716-446655440000'; // TODO: Get from URL params

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/dashboard/executive/${projectId}`);
      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ marginBottom: '24px' }}>
        {error}
      </Alert>
    );
  }

  // Sample data for demo
  const sampleData = data || {
    qualityScore: 92,
    defectEscapeRate: 2.3,
    testExecutionTime: 145,
    velocity: 8.5,
    velocityTrend: { value: 15, direction: 'up' },
    qualityTrend: { value: 5, direction: 'up' },
    releaseData: {
      releases: [
        { name: 'v2.1.0', date: '2026-05-01', quality: 94, tests: 850 },
        { name: 'v2.0.5', date: '2026-04-25', quality: 91, tests: 820 },
        { name: 'v2.0.0', date: '2026-04-15', quality: 88, tests: 800 },
        { name: 'v1.9.8', date: '2026-04-01', quality: 85, tests: 750 },
      ],
    },
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ marginBottom: '40px' }}>
        <Typography
          variant="h2"
          sx={{
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Executive Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#64748b' }}>
          Real-time quality metrics and business impact overview
        </Typography>
      </Box>

      {/* KPI Cards - Row 1 */}
      <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Quality Score"
            value={`${sampleData.qualityScore}%`}
            trend={{ value: 5, direction: 'up' }}
            color="success"
            icon={<CheckCircleIcon sx={{ fontSize: '1.5rem' }} />}
            progress={sampleData.qualityScore}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Defect Escape Rate"
            value={`${sampleData.defectEscapeRate}%`}
            trend={{ value: 12, direction: 'down' }}
            color="error"
            icon={<BugReportIcon sx={{ fontSize: '1.5rem' }} />}
            subtitle="Lower is better"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Test Execution Time"
            value={`${sampleData.testExecutionTime}s`}
            trend={{ value: 8, direction: 'down' }}
            color="info"
            icon={<SpeedIcon sx={{ fontSize: '1.5rem' }} />}
            subtitle="Average duration"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Velocity"
            value={`${sampleData.velocity} pts/sprint`}
            trend={{ value: 15, direction: 'up' }}
            color="primary"
            icon={<TrendingUpIcon sx={{ fontSize: '1.5rem' }} />}
            progress={85}
          />
        </Grid>
      </Grid>

      {/* Charts - Row 2 */}
      <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Quality Score Trend" subtitle="Last 4 quarters">
            <SimpleBarChart
              data={[
                { label: 'Q1', value: 78 },
                { label: 'Q2', value: 85 },
                { label: 'Q3', value: 89 },
                { label: 'Q4', value: 92 },
              ]}
              color="#0d9488"
              height={280}
            />
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="Release Velocity" subtitle="Trends over time">
            <SimpleBarChart
              data={[
                { label: 'Sprint 1', value: 65 },
                { label: 'Sprint 2', value: 72 },
                { label: 'Sprint 3', value: 80 },
                { label: 'Sprint 4', value: 85 },
              ]}
              color="#1e3a8a"
              height={280}
            />
          </ChartCard>
        </Grid>
      </Grid>

      {/* Heat Map - Row 3 */}
      <Grid item xs={12} sx={{ marginBottom: '32px' }}>
        <ChartCard title="Coverage Heat Map" subtitle="Test coverage by module">
          <HeatMapChart
            data={[
              { module: 'Authentication', coverage: 95, risk: 5 },
              { module: 'Authorization', coverage: 88, risk: 12 },
              { module: 'Dashboard', coverage: 92, risk: 8 },
              { module: 'Reports', coverage: 85, risk: 15 },
              { module: 'Data Sync', coverage: 78, risk: 22 },
              { module: 'Integration', coverage: 70, risk: 30 },
            ]}
          />
        </ChartCard>
      </Grid>

      {/* Recent Releases Table - Row 4 */}
      <Grid item xs={12} sx={{ marginBottom: '32px' }}>
        <ChartCard title="Recent Releases" subtitle="Last 4 releases">
          <Box
            sx={{
              overflowX: 'auto',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontWeight: 600 }}>
                    Release
                  </th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontWeight: 600 }}>
                    Date
                  </th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontWeight: 600 }}>
                    Quality Score
                  </th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontWeight: 600 }}>
                    Tests
                  </th>
                </tr>
              </thead>
              <tbody>
                {sampleData.releaseData.releases.map((release, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '16px', color: '#0f172a', fontWeight: 600 }}>
                      {release.name}
                    </td>
                    <td style={{ padding: '16px', color: '#64748b' }}>
                      {release.date}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          backgroundColor: release.quality >= 90 ? '#d1fae5' : '#dbeafe',
                          color: release.quality >= 90 ? '#065f46' : '#0c4a6e',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                        }}
                      >
                        {release.quality}%
                      </Box>
                    </td>
                    <td style={{ padding: '16px', color: '#64748b' }}>
                      {release.tests}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </ChartCard>
      </Grid>
    </Container>
  );
}
