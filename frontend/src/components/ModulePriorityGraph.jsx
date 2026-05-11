import React, { useMemo, useRef, useState } from 'react';
import {
  Box,
  Chip,
  Slider,
  Stack,
  Typography,
} from '@mui/material';

const PRIORITY_COLORS = {
  P0: '#ef4444',
  P1: '#f59e0b',
  P2: '#10b981',
  P3: '#94a3b8',
};

const PRIORITY_LABELS = ['P0', 'P1', 'P2', 'P3'];
const PRIORITY_ORDER = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getRelevanceScore = (module) => {
  const impactWeight = module.impact / 100;
  const volumeWeight = clamp(module.features / 17, 0, 1);
  const instabilityWeight = module.passRate < 0 ? 0.35 : clamp((100 - module.passRate) / 100, 0, 1);
  return Math.round((impactWeight * 0.5 + volumeWeight * 0.2 + instabilityWeight * 0.3) * 100);
};

const formatPassRate = (passRate) => {
  if (passRate < 0) {
    return 'N/A';
  }
  return `${passRate}%`;
};

const getModuleNodeRadius = (testCount, maxTests) => {
  if (!testCount || testCount < 1) {
    return 12;
  }
  const normalized = Math.sqrt(testCount) / Math.sqrt(Math.max(maxTests, 1));
  return 11 + Math.round(normalized * 16);
};

const getRelevanceStroke = (relevance) => {
  if (relevance >= 85) return '#7c3aed';
  if (relevance >= 70) return '#2563eb';
  if (relevance >= 50) return '#0ea5e9';
  return '#94a3b8';
};

const buildRelationshipGraph = (modules) => {
  const edges = [];
  const moduleIds = new Set(modules.map((module) => module.id));
  const relationEdgeSet = new Set();

  modules.forEach((module) => {
    edges.push({ from: 'system', to: module.id, type: 'system' });

    (module.connections || []).forEach((targetId) => {
      if (!moduleIds.has(targetId) || targetId === module.id) {
        return;
      }
      const pair = [module.id, targetId].sort().join('::');
      if (relationEdgeSet.has(pair)) {
        return;
      }
      relationEdgeSet.add(pair);
      edges.push({ from: module.id, to: targetId, type: 'module-link' });
    });
  });

  return {
    relationNodes: [],
    edges,
  };
};

const withPositions = (modules, relationNodes, maxTests) => {
  const systemNode = { id: 'system', x: 320, y: 355, type: 'system', label: 'Narnia System' };

  const sortedModules = [...modules].sort((a, b) => {
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || b.relevance - a.relevance;
  });

  const moduleNodes = sortedModules.map((module, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(sortedModules.length, 1) - Math.PI / 2;
    const radius = 205;
    return {
      ...module,
      type: 'module',
      x: Math.round(systemNode.x + Math.cos(angle) * radius),
      y: Math.round(systemNode.y + Math.sin(angle) * radius),
      radius: getModuleNodeRadius(module.totalTests, maxTests),
    };
  });

  return {
    systemNode,
    moduleNodes,
    relationNodes: [],
  };
};

export default function ModulePriorityGraph({ modules }) {
  const [selectedPriorities, setSelectedPriorities] = useState(PRIORITY_LABELS);
  const [minRelevance, setMinRelevance] = useState(0);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1380, height: 760 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ clientX: 0, clientY: 0, x: 0, y: 0 });
  const svgRef = useRef(null);

  const modulesWithRelevance = useMemo(() => {
    return modules.map((module) => ({
      ...module,
      relevance: getRelevanceScore(module),
    }));
  }, [modules]);

  const filteredModules = useMemo(() => {
    return modulesWithRelevance.filter((module) => {
      return selectedPriorities.includes(module.priority) && module.relevance >= minRelevance;
    });
  }, [modulesWithRelevance, selectedPriorities, minRelevance]);

  const maxTests = useMemo(() => {
    const knownTestCounts = filteredModules
      .map((module) => module.totalTests || 0)
      .filter((value) => value > 0);
    if (knownTestCounts.length === 0) {
      return 1;
    }
    return Math.max(...knownTestCounts);
  }, [filteredModules]);

  const { relationNodes, edges } = useMemo(() => buildRelationshipGraph(filteredModules), [filteredModules]);

  const { systemNode, moduleNodes, relationNodes: positionedRelationNodes } = useMemo(() => {
    return withPositions(filteredModules, relationNodes, maxTests);
  }, [filteredModules, relationNodes, maxTests]);

  const allNodes = useMemo(() => {
    const map = new Map();
    map.set('system', systemNode);
    moduleNodes.forEach((node) => map.set(node.id, node));
    positionedRelationNodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [systemNode, moduleNodes, positionedRelationNodes]);

  const adjacency = useMemo(() => {
    const map = new Map();
    edges.forEach((edge) => {
      if (!map.has(edge.from)) map.set(edge.from, new Set());
      if (!map.has(edge.to)) map.set(edge.to, new Set());
      map.get(edge.from).add(edge.to);
      map.get(edge.to).add(edge.from);
    });
    return map;
  }, [edges]);

  const activeNode = activeNodeId ? allNodes.get(activeNodeId) : null;

  const isNodeConnected = (nodeId) => {
    if (!activeNodeId) {
      return false;
    }
    return adjacency.get(activeNodeId)?.has(nodeId) || false;
  };

  const nodeOpacity = (nodeId) => {
    if (!activeNodeId) {
      return 1;
    }
    if (nodeId === activeNodeId) {
      return 1;
    }
    if (isNodeConnected(nodeId)) {
      return 0.95;
    }
    return 0.16;
  };

  const edgeOpacity = (from, to) => {
    if (!activeNodeId) {
      return 0.35;
    }
    if (from === activeNodeId || to === activeNodeId) {
      return 0.9;
    }
    if (isNodeConnected(from) && isNodeConnected(to)) {
      return 0.55;
    }
    return 0.08;
  };

  const togglePriority = (priority) => {
    setActiveNodeId(null);
    setSelectedPriorities((prev) => {
      if (prev.includes(priority)) {
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter((item) => item !== priority);
      }
      return [...prev, priority].sort((a, b) => PRIORITY_ORDER[a] - PRIORITY_ORDER[b]);
    });
  };

  const resetViewport = () => {
    setViewBox({ x: 0, y: 0, width: 1380, height: 760 });
  };

  const handleWheel = (event) => {
    event.preventDefault();

    const svgElement = svgRef.current;
    if (!svgElement) {
      return;
    }

    const rect = svgElement.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    const cursorX = (event.clientX - rect.left) / rect.width;
    const cursorY = (event.clientY - rect.top) / rect.height;
    const zoomFactor = event.deltaY > 0 ? 1.12 : 0.9;

    setViewBox((prev) => {
      const newWidth = clamp(prev.width * zoomFactor, 580, 2800);
      const newHeight = clamp(prev.height * zoomFactor, 320, 1700);
      const anchorX = prev.x + prev.width * cursorX;
      const anchorY = prev.y + prev.height * cursorY;

      return {
        x: anchorX - newWidth * cursorX,
        y: anchorY - newHeight * cursorY,
        width: newWidth,
        height: newHeight,
      };
    });
  };

  const startPan = (event) => {
    if (event.button !== 0) {
      return;
    }
    setIsPanning(true);
    panStartRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      x: viewBox.x,
      y: viewBox.y,
    };
  };

  const onPanMove = (event) => {
    if (!isPanning || !svgRef.current) {
      return;
    }

    const rect = svgRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    const dxPx = event.clientX - panStartRef.current.clientX;
    const dyPx = event.clientY - panStartRef.current.clientY;
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;

    setViewBox((prev) => ({
      ...prev,
      x: panStartRef.current.x - dxPx * scaleX,
      y: panStartRef.current.y - dyPx * scaleY,
    }));
  };

  const stopPan = () => {
    setIsPanning(false);
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ marginBottom: '20px' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>
            Priority filter
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: '8px' }}>
            {PRIORITY_LABELS.map((priority) => (
              <Chip
                key={priority}
                label={priority}
                clickable
                onClick={() => togglePriority(priority)}
                variant={selectedPriorities.includes(priority) ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: selectedPriorities.includes(priority) ? PRIORITY_COLORS[priority] : '#ffffff',
                  color: selectedPriorities.includes(priority) ? '#ffffff' : PRIORITY_COLORS[priority],
                  borderColor: PRIORITY_COLORS[priority],
                  fontWeight: 700,
                }}
              />
            ))}
          </Stack>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '320px' } }}>
          <Typography variant="body2" sx={{ color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>
            Minimum relevance: {minRelevance}
          </Typography>
          <Slider
            value={minRelevance}
            onChange={(_, value) => {
              setActiveNodeId(null);
              setMinRelevance(value);
            }}
            min={0}
            max={100}
            step={5}
            valueLabelDisplay="auto"
            sx={{ color: '#1e3a8a' }}
          />
        </Box>

        <Box sx={{ width: { xs: '100%', md: '190px' }, display: 'flex', alignItems: 'end' }}>
          <Chip
            label="Reset zoom"
            clickable
            onClick={resetViewport}
            sx={{
              width: '100%',
              height: '38px',
              borderRadius: '8px',
              fontWeight: 700,
              color: '#1e3a8a',
              border: '1px solid #bfdbfe',
              backgroundColor: '#eff6ff',
            }}
          />
        </Box>
      </Stack>

      <Box
        sx={{
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 14% 12%, #eff6ff 0%, #f8fafc 45%, #ffffff 100%)',
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          onWheel={handleWheel}
          onMouseDown={startPan}
          onMouseMove={onPanMove}
          onMouseUp={stopPan}
          onMouseLeave={stopPan}
          style={{
            width: '100%',
            height: '520px',
            display: 'block',
            cursor: isPanning ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
        >
          <defs>
            <linearGradient id="systemGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {edges.map((edge, idx) => {
            const from = allNodes.get(edge.from);
            const to = allNodes.get(edge.to);
            if (!from || !to) {
              return null;
            }

            return (
              <line
                key={`${edge.from}-${edge.to}-${idx}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={edge.type === 'system' ? '#94a3b8' : '#0d9488'}
                strokeWidth={edge.type === 'system' ? 2 : 2.2}
                strokeDasharray={edge.type === 'system' ? '0' : '6 4'}
                opacity={edgeOpacity(edge.from, edge.to)}
              />
            );
          })}

          <g
            role="button"
            tabIndex={0}
            onClick={() => setActiveNodeId('system')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setActiveNodeId('system');
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={systemNode.x}
              cy={systemNode.y}
              r="52"
              fill="url(#systemGlow)"
              opacity={nodeOpacity('system')}
            />
            <text
              x={systemNode.x}
              y={systemNode.y - 6}
              textAnchor="middle"
              fill="#ffffff"
              style={{ fontSize: '14px', fontWeight: 700, pointerEvents: 'none' }}
            >
              Narnia
            </text>
            <text
              x={systemNode.x}
              y={systemNode.y + 14}
              textAnchor="middle"
              fill="#dbeafe"
              style={{ fontSize: '11px', pointerEvents: 'none' }}
            >
              System
            </text>
          </g>

          {moduleNodes.map((module) => {
            const isActive = activeNodeId === module.id;
            const relevanceStroke = getRelevanceStroke(module.relevance);
            return (
              <g
                key={module.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveNodeId(module.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setActiveNodeId(module.id);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <title>{module.label}</title>
                <circle
                  cx={module.x}
                  cy={module.y}
                  r={module.radius + 5}
                  fill={relevanceStroke}
                  opacity={nodeOpacity(module.id) * 0.14}
                />
                <circle
                  cx={module.x}
                  cy={module.y}
                  r={module.radius}
                  fill={PRIORITY_COLORS[module.priority] || '#64748b'}
                  stroke={relevanceStroke}
                  strokeWidth={isActive ? 4 : 2.5}
                  opacity={nodeOpacity(module.id)}
                />
                <text
                  x={module.x}
                  y={module.y - module.radius - 8}
                  textAnchor="middle"
                  fill="#0f172a"
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    pointerEvents: 'none',
                    opacity: nodeOpacity(module.id),
                  }}
                >
                  {module.shortLabel}
                </text>
                <text
                  x={module.x}
                  y={module.y + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  style={{ fontSize: '10px', fontWeight: 700, pointerEvents: 'none' }}
                >
                  {module.totalTests ? `${module.totalTests}T` : 'N/A'}
                </text>
              </g>
            );
          })}

          {positionedRelationNodes.map((node) => {
            const isActive = activeNodeId === node.id;
            return (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveNodeId(node.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setActiveNodeId(node.id);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={node.x - node.width / 2}
                  y={node.y - node.height / 2}
                  width={node.width}
                  height={node.height}
                  rx={10}
                  fill="#ffffff"
                  stroke={RELATION_TYPE_COLORS[node.type]}
                  strokeWidth={isActive ? 3 : 1.8}
                  opacity={nodeOpacity(node.id)}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill="#334155"
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    pointerEvents: 'none',
                    opacity: nodeOpacity(node.id),
                  }}
                >
                  {node.label.length > 30 ? `${node.label.slice(0, 30)}...` : node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ marginTop: '16px' }}>
        <Box
          sx={{
            flex: 1,
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
            Legend
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: '#64748b', marginBottom: '4px' }}>
            Circle nodes = application modules (real modules only)
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: '#64748b', marginBottom: '4px' }}>
            Dashed teal links = module-to-module relationships
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: '#64748b', marginBottom: '4px' }}>
            Fill color on module = priority (P0, P1, P2, P3)
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: '#64748b', marginBottom: '4px' }}>
            Circle size = number of tests in the module
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: '#64748b', marginBottom: '4px' }}>
            Border/halo color = relevance level
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
            Use mouse wheel to zoom and drag to pan
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
            {activeNode ? activeNode.label : 'Selection details'}
          </Typography>

          {activeNode && activeNode.type === 'module' ? (
            <>
              <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
                Module: {activeNode.label}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
                Priority: {activeNode.priority}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
                Status: {activeNode.status}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
                Pass rate: {formatPassRate(activeNode.passRate)}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
                Tests: {activeNode.passedTests ?? 'N/A'}/{activeNode.totalTests ?? 'N/A'}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
                Relevance: {activeNode.relevance}/100
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
                Connections: {activeNode.connections?.length ? activeNode.connections.join(', ') : 'None'}
              </Typography>
            </>
          ) : activeNode ? (
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Relation selected. The highlighted module nodes are directly linked to this entity.
            </Typography>
          ) : (
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Select any module or relation node to inspect its direct connections.
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
