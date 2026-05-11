import React, { useEffect, useMemo, useState } from 'react';
import { Grid, Box, Typography, Container, CircularProgress, Alert, Chip } from '@mui/material';
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
import { useSelectedProject } from '../hooks/useSelectedProject';
import { api } from '../services/api';

/**
 * ExecutiveDashboard - High-level KPIs for executives
 * Shows quality metrics, trends, and business impact
 */
export default function ExecutiveDashboard() {
  const selectedProject = useSelectedProject();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedProject) {
      console.log('Fetching executive dashboard data for project:', selectedProject.project_id);
      fetchDashboardData();
    }
  }, [selectedProject]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/executive/${selectedProject.project_id}`);
      console.log('Dashboard data received:', response.data);
      setData(response.data.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
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

  const defaultData = useMemo(() => ({
    qualityScore: 0,
    defectEscapeRate: 0,
    testExecutionTime: 0,
    velocity: { current: 0, trend: 'up', changePercent: 0 },
    testMetrics: { total: 0, passed: 0, failed: 0 },
    releases: { total: 0, withZeroDefects: 0, successRate: 0 },
    qualityTrend: [],
    velocityTrend: [],
    coverageByModule: [],
    releaseData: { releases: [] },
    teamMetrics: { totalMembers: 0, byRole: {} },
    adoMetrics: null,
  }), []);

  const sampleData = { ...defaultData, ...(data || {}) };

  const adoMetrics = sampleData.adoMetrics || null;

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
            value={`${Number(sampleData.defectEscapeRate || 0).toFixed(2)}%`}
            trend={{ value: 12, direction: 'down' }}
            color="error"
            icon={<BugReportIcon sx={{ fontSize: '1.5rem' }} />}
            subtitle="Lower is better"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Test Execution Time"
            value={`${sampleData.testExecutionTime}ms`}
            trend={{ value: 8, direction: 'down' }}
            color="info"
            icon={<SpeedIcon sx={{ fontSize: '1.5rem' }} />}
            subtitle="Average duration"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Velocity"
            value={`${sampleData.velocity?.current || 0} pts/sprint`}
            trend={{ value: 15, direction: 'up' }}
            color="primary"
            icon={<TrendingUpIcon sx={{ fontSize: '1.5rem' }} />}
            progress={85}
          />
        </Grid>
      </Grid>

      {/* Team Snapshot */}
      <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
        <Grid item xs={12}>
          <ChartCard title="Team Snapshot" subtitle="Members contributing to this project">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                color="primary"
                label={`Total Members: ${sampleData.teamMetrics?.totalMembers || 0}`}
              />
              {Object.entries(sampleData.teamMetrics?.byRole || {}).map(([role, count]) => (
                <Chip key={role} variant="outlined" label={`${role}: ${count}`} />
              ))}
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* ADO Snapshot - Row 1b */}
      <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
        <Grid item xs={12}>
          <ChartCard
            title="ADO Project Snapshot"
            subtitle="Repositories, tests, functionalities and priorities from latest sync"
          >
            {!adoMetrics ? (
              <Alert severity="info" sx={{ marginBottom: '8px' }}>
                No ADO sync data available yet. Run "Sync Project Data" in Admin Panel first.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="Repositories"
                    value={adoMetrics.repositories}
                    color="primary"
                    icon={<TrendingUpIcon sx={{ fontSize: '1.5rem' }} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="Tests"
                    value={adoMetrics.tests}
                    color="success"
                    icon={<CheckCircleIcon sx={{ fontSize: '1.5rem' }} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="Functionalities"
                    value={adoMetrics.functionalities}
                    color="warning"
                    icon={<SpeedIcon sx={{ fontSize: '1.5rem' }} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="Last Sync"
                    value={adoMetrics.lastSyncAt ? new Date(adoMetrics.lastSyncAt).toLocaleDateString() : 'N/A'}
                    color="info"
                    icon={<BugReportIcon sx={{ fontSize: '1.5rem' }} />}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#64748b', marginBottom: '8px' }}>
                    Priorities distribution
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={`P0: ${adoMetrics.priorities?.P0 || 0}`} color="error" />
                    <Chip label={`P1: ${adoMetrics.priorities?.P1 || 0}`} color="warning" />
                    <Chip label={`P2: ${adoMetrics.priorities?.P2 || 0}`} color="info" />
                    <Chip label={`P3: ${adoMetrics.priorities?.P3 || 0}`} color="success" />
                    <Chip label={`Unknown: ${adoMetrics.priorities?.Unknown || 0}`} variant="outlined" />
                  </Box>
                </Grid>
              </Grid>
            )}
          </ChartCard>
        </Grid>
      </Grid>

      {/* Charts - Row 2 */}
      <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Quality Score Trend" subtitle="Last 4 quarters">
            <SimpleBarChart
              data={sampleData.qualityTrend?.length > 0 ? sampleData.qualityTrend : [{ label: 'W-1', value: sampleData.qualityScore || 0 }]}
              color="#0d9488"
              height={280}
            />
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="Release Velocity" subtitle="Trends over time">
            <SimpleBarChart
              data={sampleData.velocityTrend?.length > 0 ? sampleData.velocityTrend : [{ label: 'W-1', value: sampleData.velocity?.current || 0 }]}
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
            data={sampleData.coverageByModule?.length > 0 ? sampleData.coverageByModule : [{ module: 'N/A', coverage: 0, risk: 0 }]}
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
