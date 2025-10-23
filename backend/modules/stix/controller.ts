/**
 * STIX Controller
 * Handles STIX 2.1 import/export operations
 */

import { Request, Response, NextFunction } from 'express';
import { stixConverter } from './converter';

export class STIXController {
  /**
   * Export entities to STIX 2.1 bundle
   */
  async exportBundle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { indicators, threats, threatActors, vulnerabilities } = req.body;

      const bundle = stixConverter.exportToBundle({
        indicators,
        threats,
        threatActors,
        vulnerabilities
      });

      res.json({
        success: true,
        data: bundle
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Import STIX 2.1 bundle
   */
  async importBundle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bundle } = req.body;

      if (!bundle || bundle.type !== 'bundle') {
        res.status(400).json({
          success: false,
          error: 'Invalid STIX bundle'
        });
        return;
      }

      const result = stixConverter.importBundle(bundle);

      res.json({
        success: true,
        data: result,
        counts: {
          indicators: result.indicators.length,
          threats: result.threats.length,
          threatActors: result.threatActors.length,
          vulnerabilities: result.vulnerabilities.length,
          relationships: result.relationships.length
        }
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Convert single entity to STIX
   */
  async convertToSTIX(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, entity } = req.body;

      if (!type || !entity) {
        res.status(400).json({
          success: false,
          error: 'Type and entity are required'
        });
        return;
      }

      let stixObject;
      switch (type) {
        case 'indicator':
          stixObject = stixConverter.indicatorToSTIX(entity);
          break;
        case 'threat':
        case 'malware':
          stixObject = stixConverter.threatToSTIX(entity);
          break;
        case 'threat-actor':
          stixObject = stixConverter.threatActorToSTIX(entity);
          break;
        case 'vulnerability':
          stixObject = stixConverter.vulnerabilityToSTIX(entity);
          break;
        default:
          res.status(400).json({
            success: false,
            error: `Unsupported type: ${type}`
          });
          return;
      }

      res.json({
        success: true,
        data: stixObject
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Parse STIX pattern
   */
  async parsePattern(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pattern } = req.body;

      if (!pattern) {
        res.status(400).json({
          success: false,
          error: 'Pattern is required'
        });
        return;
      }

      const parsed = stixConverter.parsePattern(pattern);

      if (!parsed) {
        res.status(400).json({
          success: false,
          error: 'Invalid STIX pattern'
        });
        return;
      }

      res.json({
        success: true,
        data: parsed
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const stixController = new STIXController();
