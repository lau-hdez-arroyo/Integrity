import React, { useEffect, useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import ChartCard from '../components/ChartCard';
import ModulePriorityGraph from '../components/ModulePriorityGraph';
import { modulePriorityData } from '../data/modulePriorityData';
import { useSelectedProject } from '../hooks/useSelectedProject';
import { dashboardAPI } from '../services/api';

/**
 * DeveloperDashboard - Personal metrics and code quality
 */
export default function DeveloperDashboard() {
  const selectedProject = useSelectedProject();
  const [moduleGraphData, setModuleGraphData] = useState(modulePriorityData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const healthScore = {
    totalTests: 394,
    baseline: {
      passed: 216,
      failed: 178,
      passRate: 55,
      label: 'CRITICAL',
      threshold: 'Below 75%',
      color: '#ef4444',
    },
    target: {
      passed: 375,
      failed: 19,
      passRate: 95,
      label: 'HEALTHY',
      threshold: '95%+',
      color: '#10b981',
    },
    timeline: '3-4 weeks (with dedicated team effort)',
  };

  useEffect(() => {
    if (selectedProject) {
      fetchDashboardData();
    }
  }, [selectedProject]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const graphResponse = await dashboardAPI.getDeveloperModuleGraph(selectedProject.project_id);

      const apiModules = graphResponse?.data?.data?.modules;
      if (Array.isArray(apiModules) && apiModules.length > 0) {
        setModuleGraphData(apiModules);
      } else {
        setModuleGraphData(modulePriorityData);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      setModuleGraphData(modulePriorityData);
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
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ marginBottom: '24px' }}>
        {error}
      </Alert>
    );
  }

  const improvementNeeded = healthScore.target.passRate - healthScore.baseline.passRate;
  const progressToTarget = Math.round((healthScore.baseline.passRate / healthScore.target.passRate) * 100);

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
          Module relations and stabilization context
        </Typography>
      </Box>

      <Grid item xs={12} sx={{ marginBottom: '32px' }}>
        <ChartCard
          title="Overall Application Health Score"
          subtitle="Current baseline vs post-stabilization target"
          sx={{
            '& .MuiCardContent-root': {
              minHeight: 'auto',
            },
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  backgroundColor: '#fef2f2',
                  padding: '16px',
                }}
              >
                <Typography variant="body2" sx={{ color: '#7f1d1d', fontWeight: 700, marginBottom: '10px' }}>
                  Current Baseline
                </Typography>
                <Typography variant="h3" sx={{ color: healthScore.baseline.color, marginBottom: '8px' }}>
                  {healthScore.baseline.passRate}%
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#7f1d1d' }}>
                  Total Tests: {healthScore.totalTests}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#7f1d1d' }}>
                  Passed: {healthScore.baseline.passed}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#7f1d1d' }}>
                  Failed: {healthScore.baseline.failed}
                </Typography>
                <Chip
                  label={`${healthScore.baseline.label} (${healthScore.baseline.threshold})`}
                  size="small"
                  sx={{
                    marginTop: '10px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  backgroundColor: '#f0fdf4',
                  padding: '16px',
                }}
              >
                <Typography variant="body2" sx={{ color: '#14532d', fontWeight: 700, marginBottom: '10px' }}>
                  Target (Post-Stabilization)
                </Typography>
                <Typography variant="h3" sx={{ color: healthScore.target.color, marginBottom: '8px' }}>
                  {healthScore.target.passRate}%
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#14532d' }}>
                  Total Tests: {healthScore.totalTests}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#14532d' }}>
                  Passed: {healthScore.target.passed}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#14532d' }}>
                  Failed: {healthScore.target.failed}
                </Typography>
                <Chip
                  label={`${healthScore.target.label} (${healthScore.target.threshold})`}
                  size="small"
                  sx={{
                    marginTop: '10px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  padding: '14px',
                }}
              >
                <Typography variant="body2" sx={{ color: '#334155', fontWeight: 700, marginBottom: '8px' }}>
                  Progress To Target
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progressToTarget}
                  sx={{
                    height: '10px',
                    borderRadius: '999px',
                    backgroundColor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: '999px',
                      background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 45%, #10b981 100%)',
                    },
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', marginTop: '8px', color: '#64748b' }}>
                  Current: {healthScore.baseline.passRate}% | Target: {healthScore.target.passRate}% | Remaining improvement: {improvementNeeded}%
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', marginTop: '4px', color: '#64748b' }}>
                  Estimated timeline to target: {healthScore.timeline}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </ChartCard>
      </Grid>

      <Grid item xs={12} sx={{ marginBottom: '32px' }}>
        <ChartCard
          title="System Relations Graph"
          subtitle="Interactive relationship graph for application modules"
          sx={{
            '& .MuiCardContent-root': {
              minHeight: 'auto',
            },
          }}
        >
          <ModulePriorityGraph modules={moduleGraphData} />
        </ChartCard>
      </Grid>
    </Container>
  );
}
