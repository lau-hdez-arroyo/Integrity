import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, Container, CircularProgress, Alert, Chip } from '@mui/material';
import {
  Code as CodeIcon,
  TrendingUp as TrendingUpIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import MetricCard from '../components/MetricCard';
import ChartCard from '../components/ChartCard';
import SimpleBarChart from '../components/SimpleBarChart';
import StatusBadge from '../components/StatusBadge';
import { api } from '../services/api';

/**
 * DeveloperDashboard - Personal metrics and code quality
 */
export default function DeveloperDashboard() {
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
      const response = await api.get(`/api/v1/dashboard/developer/${projectId}`);
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
    personalMetrics: {
      prs: 12,
      codeQuality: 8.7,
      testCoverage: 92,
      defectsEscaped: 2,
    },
    recentPullRequests: [
      {
        id: 'PR-145',
        title: 'Add authentication service',
        branch: 'feat/auth-service',
        qualityScore: 95,
        riskLevel: 'LOW',
        coverage: 98,
        status: 'merged',
      },
      {
        id: 'PR-144',
        title: 'Fix cache invalidation',
        branch: 'fix/cache-bug',
        qualityScore: 87,
        riskLevel: 'MODERATE',
        coverage: 88,
        status: 'merged',
      },
      {
        id: 'PR-143',
        title: 'Refactor API routes',
        branch: 'refactor/routes',
        qualityScore: 91,
        riskLevel: 'LOW',
        coverage: 95,
        status: 'in-review',
      },
      {
        id: 'PR-142',
        title: 'Add logging middleware',
        branch: 'feat/logging',
        qualityScore: 88,
        riskLevel: 'LOW',
        coverage: 90,
        status: 'merged',
      },
    ],
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'LOW':
        return 'success';
      case 'MODERATE':
        return 'warning';
      case 'HIGH':
        return 'error';
      default:
        return 'info';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'merged':
        return { label: 'Merged', color: 'success' };
      case 'in-review':
        return { label: 'In Review', color: 'warning' };
      case 'draft':
        return { label: 'Draft', color: 'info' };
      default:
        return { label: status, color: 'default' };
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ marginBottom: '40px' }}>
        <Typography
          variant="h2"
          sx={{
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #1e3a8a 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Developer Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#64748b' }}>
          Personal productivity and code quality metrics
        </Typography>
      </Box>

      {/* Personal Metrics - Row 1 */}
      <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pull Requests"
            value={sampleData.personalMetrics.prs}
            subtitle="This sprint"
            color="info"
            icon={<CodeIcon sx={{ fontSize: '1.5rem' }} />}
            trend={{ value: 20, direction: 'up' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Code Quality"
            value={`${sampleData.personalMetrics.codeQuality}/10`}
            color="success"
            icon={<CheckCircleIcon sx={{ fontSize: '1.5rem' }} />}
            progress={Math.round(sampleData.personalMetrics.codeQuality * 10)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Test Coverage"
            value={`${sampleData.personalMetrics.testCoverage}%`}
            color="primary"
            icon={<CheckCircleIcon sx={{ fontSize: '1.5rem' }} />}
            progress={sampleData.personalMetrics.testCoverage}
            trend={{ value: 5, direction: 'up' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Defects Escaped"
            value={sampleData.personalMetrics.defectsEscaped}
            color="error"
            icon={<BugReportIcon sx={{ fontSize: '1.5rem' }} />}
            trend={{ value: 50, direction: 'down' }}
          />
        </Grid>
      </Grid>

      {/* Performance Trends - Row 2 */}
      <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Code Quality Trend" subtitle="Last 4 sprints">
            <SimpleBarChart
              data={[
                { label: 'Sprint 1', value: 75 },
                { label: 'Sprint 2', value: 82 },
                { label: 'Sprint 3', value: 88 },
                { label: 'Sprint 4', value: 87 },
              ]}
              color="#06b6d4"
              height={280}
            />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Test Coverage Improvement" subtitle="Progressive coverage growth">
            <SimpleBarChart
              data={[
                { label: 'Sprint 1', value: 68 },
                { label: 'Sprint 2', value: 76 },
                { label: 'Sprint 3', value: 85 },
                { label: 'Sprint 4', value: 92 },
              ]}
              color="#10b981"
              height={280}
            />
          </ChartCard>
        </Grid>
      </Grid>

      {/* Recent Pull Requests - Row 3 */}
      <Grid item xs={12} sx={{ marginBottom: '32px' }}>
        <ChartCard title="Recent Pull Requests" subtitle="Last 4 contributions">
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
                    PR
                  </th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontWeight: 600 }}>
                    Title
                  </th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontWeight: 600 }}>
                    Branch
                  </th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontWeight: 600 }}>
                    Quality
                  </th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontWeight: 600 }}>
                    Risk
                  </th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontWeight: 600 }}>
                    Coverage
                  </th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontWeight: 600 }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {sampleData.recentPullRequests.map((pr, idx) => {
                  const statusBadge = getStatusBadge(pr.status);
                  return (
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
                      <td style={{ padding: '16px' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: '#1e3a8a',
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {pr.id}
                        </Typography>
                      </td>
                      <td style={{ padding: '16px', color: '#0f172a', fontWeight: 500 }}>
                        {pr.title}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Chip label={pr.branch} size="small" variant="outlined" />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#dbeafe',
                            color: '#0c4a6e',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                          }}
                        >
                          {pr.qualityScore}%
                        </Box>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <StatusBadge
                          status={getRiskColor(pr.riskLevel)}
                          label={pr.riskLevel}
                          size="small"
                        />
                      </td>
                      <td style={{ padding: '16px', fontWeight: 600, color: '#10b981' }}>
                        {pr.coverage}%
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Chip
                          label={statusBadge.label}
                          size="small"
                          color={statusBadge.color}
                          variant={pr.status === 'merged' ? 'filled' : 'outlined'}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        </ChartCard>
      </Grid>

      {/* Recommendations */}
      <Grid item xs={12}>
        <ChartCard title="Recommendations" subtitle="Suggestions for improvement">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Box
              sx={{
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: '#dbeafe',
                borderLeft: '4px solid #06b6d4',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0c4a6e', marginBottom: '4px' }}>
                💡 Increase test coverage on Integration module
              </Typography>
              <Typography variant="caption" sx={{ color: '#0c4a6e', opacity: 0.8 }}>
                Current coverage is 78%. Target: 90%
              </Typography>
            </Box>

            <Box
              sx={{
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: '#d1fae5',
                borderLeft: '4px solid #10b981',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#065f46', marginBottom: '4px' }}>
                ✅ Excellent code quality trend
              </Typography>
              <Typography variant="caption" sx={{ color: '#065f46', opacity: 0.8 }}>
                Keep maintaining high standards in PR reviews
              </Typography>
            </Box>

            <Box
              sx={{
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: '#fef08a',
                borderLeft: '4px solid #f59e0b',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#713f12', marginBottom: '4px' }}>
                ⚠️ Review flaky test in Authentication module
              </Typography>
              <Typography variant="caption" sx={{ color: '#713f12', opacity: 0.8 }}>
                Test failure rate: 12%. Needs investigation
              </Typography>
            </Box>
          </Box>
        </ChartCard>
      </Grid>
    </Container>
  );
}
