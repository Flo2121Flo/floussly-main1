import { Router } from 'express';
import { DiagnosticsService, ComponentStatus } from '../../services/DiagnosticsService';
import { logger } from '../../utils/logger';
import { requireAdmin } from '../../middleware/auth';

const router = Router();
const diagnosticsService = DiagnosticsService.getInstance();

// Get system diagnostics
router.get(
  '/',
  requireAdmin,
  async (req, res) => {
    try {
      const diagnostics = await diagnosticsService.runDiagnostics();

      res.json({
        status: 'success',
        data: diagnostics
      });
    } catch (error) {
      logger.error('Failed to get system diagnostics', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get system diagnostics'
      });
    }
  }
);

// Get component health
router.get(
  '/components',
  requireAdmin,
  async (req, res) => {
    try {
      const diagnostics = await diagnosticsService.runDiagnostics();
      const components = diagnostics.components;

      // Group components by status
      const grouped = components.reduce((acc, component) => {
        if (!acc[component.status]) {
          acc[component.status] = [];
        }
        acc[component.status].push(component);
        return acc;
      }, {} as Record<ComponentStatus, any[]>);

      res.json({
        status: 'success',
        data: {
          healthy: grouped[ComponentStatus.HEALTHY] || [],
          degraded: grouped[ComponentStatus.DEGRADED] || [],
          unhealthy: grouped[ComponentStatus.UNHEALTHY] || [],
          total: components.length
        }
      });
    } catch (error) {
      logger.error('Failed to get component health', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get component health'
      });
    }
  }
);

// Get system metrics
router.get(
  '/metrics',
  requireAdmin,
  async (req, res) => {
    try {
      const diagnostics = await diagnosticsService.runDiagnostics();

      res.json({
        status: 'success',
        data: diagnostics.metrics
      });
    } catch (error) {
      logger.error('Failed to get system metrics', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get system metrics'
      });
    }
  }
);

// Get specific component status
router.get(
  '/components/:componentName',
  requireAdmin,
  async (req, res) => {
    try {
      const { componentName } = req.params;
      const diagnostics = await diagnosticsService.runDiagnostics();
      
      const component = diagnostics.components.find(
        c => c.name.toLowerCase() === componentName.toLowerCase()
      );

      if (!component) {
        return res.status(404).json({
          status: 'error',
          message: 'Component not found'
        });
      }

      res.json({
        status: 'success',
        data: component
      });
    } catch (error) {
      logger.error('Failed to get component status', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get component status'
      });
    }
  }
);

export default router; 