import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, Container, CircularProgress, Alert, Chip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import MetricCard from '../components/MetricCard';
import ChartCard from '../components/ChartCard';
import HeatMapChart from '../components/HeatMapChart';
import SimpleBarChart from '../components/SimpleBarChart';
import StatusBadge from '../components/StatusBadge';
import { api } from '../services/api';

/**
 * QADashboard - QA team metrics and test execution details
 */
export default function QADashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const projectId = '550e8400-e29b-41d4-a716-446655440000';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/qa/${projectId}`);
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

  // Sample data
  const sampleData = data || {
    coverage: {
      overall: 87,
      byModule: [
        { module: 'Auth', coverage: 95 },
        { module: 'API', coverage: 92 },
        { module: 'UI', coverage: 85 },
        { module: 'Database', coverage: 88 },
      ],
    },
    testExecutions: {
      total: 2450,
      passed: 2387,
      failed: 45,
      skipped: 18,
      avgDuration: 145,
    },
    flakyTests: [
      { name: 'test_async_validation', failureRate: 12, module: 'Auth' },
      { name: 'test_network_timeout', failureRate: 18, module: 'Integration' },
      { name: 'test_cache_expiry', failureRate: 8, module: 'Storage' },
    ],
  };

  const passRate = (
    (sampleData.testExecutions.passed / sampleData.testExecutions.total) * 100
  ).toFixed(1);

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ marginBottom: '40px' }}>
        <Typography
          variant="h2"
          sx={{
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          QA Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#64748b' }}>
          Test execution metrics and coverage analysis
        </Typography>
      </Box>

      {/* KPI Cards - Row 1 */}
      <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Overall Coverage"
            value={`${sampleData.coverage.overall}%`}
            color="success"
            icon={<CheckCircleIcon sx={{ fontSize: '1.5rem' }} />}
            progress={sampleData.coverage.overall}
            trend={{ value: 3, direction: 'up' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pass Rate"
            value={`${passRate}%`}
            color="success"
            icon={<CheckCircleIcon sx={{ fontSize: '1.5rem' }} />}
            progress={Math.round(passRate)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Tests"
            value={sampleData.testExecutions.total}
            subtitle="Last execution"
            color="info"
            icon={<ScheduleIcon sx={{ fontSize: '1.5rem' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg Duration"
            value={`${sampleData.testExecutions.avgDuration}ms`}
            color="primary"
            icon={<SpeedIcon sx={{ fontSize: '1.5rem' }} />}
          />
        </Grid>
      </Grid>

      {/* Test Execution Summary - Row 2 */}
      <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Test Execution Breakdown" subtitle="Latest test run">
            <Box sx={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  Passed
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#10b981',
                      fontWeight: 700,
                    }}
                  >
                    {sampleData.testExecutions.passed}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    tests
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  Failed
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#ef4444',
                      fontWeight: 700,
                    }}
                  >
                    {sampleData.testExecutions.failed}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    tests
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  Skipped
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#f59e0b',
                      fontWeight: 700,
                    }}
                  >
                    {sampleData.testExecutions.skipped}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    tests
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ marginTop: '24px' }}>
              <SimpleBarChart
                data={[
                  { label: 'Passed', value: Math.round((sampleData.testExecutions.passed / sampleData.testExecutions.total) * 100) },
                  { label: 'Failed', value: Math.round((sampleData.testExecutions.failed / sampleData.testExecutions.total) * 100) },
                  { label: 'Skipped', value: Math.round((sampleData.testExecutions.skipped / sampleData.testExecutions.total) * 100) },
                ]}
                color="#0d9488"
                height={200}
              />
            </Box>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Coverage by Module" subtitle="Test coverage details">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sampleData.coverage.byModule.map((item, idx) => (
                <Box key={idx}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                      {item.module}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0d9488' }}>
                      {item.coverage}%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: '#f1f5f9',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${item.coverage}%`,
                        backgroundColor: '#0d9488',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Flaky Tests */}
      <Grid item xs={12} sx={{ marginBottom: '32px' }}>
        <ChartCard title="Flaky Tests" subtitle="Tests with intermittent failures">
          <Box sx={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontWeight: 600 }}>
                    Test Name
                  </th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontWeight: 600 }}>
                    Module
                  </th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontWeight: 600 }}>
                    Failure Rate
                  </th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontWeight: 600 }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {sampleData.flakyTests.map((test, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <td style={{ padding: '16px', color: '#0f172a', fontWeight: 500 }}>
                      {test.name}
                    </td>
                    <td style={{ padding: '16px', color: '#64748b' }}>
                      <Chip label={test.module} size="small" variant="outlined" />
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Box
                          sx={{
                            width: '100px',
                            height: '6px',
                            borderRadius: '4px',
                            backgroundColor: '#f1f5f9',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${test.failureRate}%`,
                              backgroundColor: test.failureRate > 15 ? '#ef4444' : '#f59e0b',
                              borderRadius: '4px',
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {test.failureRate}%
                        </Typography>
                      </Box>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <StatusBadge
                        status={test.failureRate > 15 ? 'error' : 'warning'}
                        label={test.failureRate > 15 ? 'Critical' : 'Attention'}
                        size="small"
                      />
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
