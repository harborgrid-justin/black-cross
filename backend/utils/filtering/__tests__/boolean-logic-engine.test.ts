/**
 * Boolean Logic Engine Tests
 */

import { BooleanLogicEngine } from '../boolean-logic-engine';
import type { FilterGroup } from '../filter-types';

describe('BooleanLogicEngine', () => {
  const engine = new BooleanLogicEngine();

  describe('Simple Filters', () => {
    it('should evaluate eq operator correctly', () => {
      const filterGroup: FilterGroup = {
        mode: 'and',
        filters: [
          { key: 'status', operator: 'eq', values: ['open'] }
        ],
        filterGroups: []
      };

      const entity1 = { status: 'open' };
      const entity2 = { status: 'closed' };

      expect(engine.evaluate(filterGroup, entity1)).toBe(true);
      expect(engine.evaluate(filterGroup, entity2)).toBe(false);
    });

    it('should evaluate not_eq operator correctly', () => {
      const filterGroup: FilterGroup = {
        mode: 'and',
        filters: [
          { key: 'status', operator: 'not_eq', values: ['closed'] }
        ],
        filterGroups: []
      };

      const entity1 = { status: 'open' };
      const entity2 = { status: 'closed' };

      expect(engine.evaluate(filterGroup, entity1)).toBe(true);
      expect(engine.evaluate(filterGroup, entity2)).toBe(false);
    });

    it('should evaluate contains operator correctly', () => {
      const filterGroup: FilterGroup = {
        mode: 'and',
        filters: [
          { key: 'description', operator: 'contains', values: ['malware'] }
        ],
        filterGroups: []
      };

      const entity1 = { description: 'This is a malware attack' };
      const entity2 = { description: 'This is a phishing attack' };

      expect(engine.evaluate(filterGroup, entity1)).toBe(true);
      expect(engine.evaluate(filterGroup, entity2)).toBe(false);
    });

    it('should evaluate gt/lt operators correctly', () => {
      const filterGroup: FilterGroup = {
        mode: 'and',
        filters: [
          { key: 'severity_score', operator: 'gt', values: ['5'] }
        ],
        filterGroups: []
      };

      const entity1 = { severity_score: 8 };
      const entity2 = { severity_score: 3 };

      expect(engine.evaluate(filterGroup, entity1)).toBe(true);
      expect(engine.evaluate(filterGroup, entity2)).toBe(false);
    });
  });

  describe('AND Logic', () => {
    it('should evaluate AND filters correctly', () => {
      const filterGroup: FilterGroup = {
        mode: 'and',
        filters: [
          { key: 'severity', operator: 'eq', values: ['high'] },
          { key: 'status', operator: 'eq', values: ['open'] }
        ],
        filterGroups: []
      };

      const entity1 = { severity: 'high', status: 'open' };
      const entity2 = { severity: 'high', status: 'closed' };
      const entity3 = { severity: 'low', status: 'open' };

      expect(engine.evaluate(filterGroup, entity1)).toBe(true);
      expect(engine.evaluate(filterGroup, entity2)).toBe(false);
      expect(engine.evaluate(filterGroup, entity3)).toBe(false);
    });
  });

  describe('OR Logic', () => {
    it('should evaluate OR filters correctly', () => {
      const filterGroup: FilterGroup = {
        mode: 'or',
        filters: [
          { key: 'severity', operator: 'eq', values: ['high'] },
          { key: 'severity', operator: 'eq', values: ['critical'] }
        ],
        filterGroups: []
      };

      const entity1 = { severity: 'high' };
      const entity2 = { severity: 'critical' };
      const entity3 = { severity: 'low' };

      expect(engine.evaluate(filterGroup, entity1)).toBe(true);
      expect(engine.evaluate(filterGroup, entity2)).toBe(true);
      expect(engine.evaluate(filterGroup, entity3)).toBe(false);
    });
  });

  describe('NOT Logic', () => {
    it('should evaluate NOT filters correctly', () => {
      const filterGroup: FilterGroup = {
        mode: 'not',
        filters: [
          { key: 'status', operator: 'eq', values: ['closed'] }
        ],
        filterGroups: []
      };

      const entity1 = { status: 'open' };
      const entity2 = { status: 'closed' };

      expect(engine.evaluate(filterGroup, entity1)).toBe(true);
      expect(engine.evaluate(filterGroup, entity2)).toBe(false);
    });
  });

  describe('Nested Filter Groups', () => {
    it('should evaluate nested filter groups correctly', () => {
      const filterGroup: FilterGroup = {
        mode: 'and',
        filters: [
          { key: 'status', operator: 'eq', values: ['open'] }
        ],
        filterGroups: [
          {
            mode: 'or',
            filters: [
              { key: 'severity', operator: 'eq', values: ['high'] },
              { key: 'severity', operator: 'eq', values: ['critical'] }
            ],
            filterGroups: []
          }
        ]
      };

      const entity1 = { status: 'open', severity: 'high' };
      const entity2 = { status: 'open', severity: 'low' };
      const entity3 = { status: 'closed', severity: 'high' };

      expect(engine.evaluate(filterGroup, entity1)).toBe(true);
      expect(engine.evaluate(filterGroup, entity2)).toBe(false);
      expect(engine.evaluate(filterGroup, entity3)).toBe(false);
    });

    it('should handle deeply nested groups', () => {
      const filterGroup: FilterGroup = {
        mode: 'and',
        filters: [],
        filterGroups: [
          {
            mode: 'or',
            filters: [
              { key: 'type', operator: 'eq', values: ['malware'] }
            ],
            filterGroups: [
              {
                mode: 'and',
                filters: [
                  { key: 'severity', operator: 'eq', values: ['high'] },
                  { key: 'verified', operator: 'eq', values: ['true'] }
                ],
                filterGroups: []
              }
            ]
          }
        ]
      };

      const entity1 = { type: 'malware', severity: 'high', verified: 'true' };
      const entity2 = { type: 'phishing', severity: 'high', verified: 'true' };

      expect(engine.evaluate(filterGroup, entity1)).toBe(true);
      expect(engine.evaluate(filterGroup, entity2)).toBe(true);
    });
  });

  describe('Null Handling', () => {
    it('should evaluate nil operator correctly', () => {
      const filterGroup: FilterGroup = {
        mode: 'and',
        filters: [
          { key: 'assignee', operator: 'nil', values: [] }
        ],
        filterGroups: []
      };

      const entity1 = { assignee: null };
      const entity2 = { assignee: 'john' };

      expect(engine.evaluate(filterGroup, entity1)).toBe(true);
      expect(engine.evaluate(filterGroup, entity2)).toBe(false);
    });

    it('should evaluate not_nil operator correctly', () => {
      const filterGroup: FilterGroup = {
        mode: 'and',
        filters: [
          { key: 'assignee', operator: 'not_nil', values: [] }
        ],
        filterGroups: []
      };

      const entity1 = { assignee: 'john' };
      const entity2 = { assignee: null };

      expect(engine.evaluate(filterGroup, entity1)).toBe(true);
      expect(engine.evaluate(filterGroup, entity2)).toBe(false);
    });
  });

  describe('Nested Property Access', () => {
    it('should access nested properties with dot notation', () => {
      const filterGroup: FilterGroup = {
        mode: 'and',
        filters: [
          { key: 'user.profile.email', operator: 'contains', values: ['@example.com'] }
        ],
        filterGroups: []
      };

      const entity = {
        user: {
          profile: {
            email: 'test@example.com'
          }
        }
      };

      expect(engine.evaluate(filterGroup, entity)).toBe(true);
    });
  });

  describe('Empty Filter Groups', () => {
    it('should return true for empty filter groups', () => {
      const filterGroup: FilterGroup = {
        mode: 'and',
        filters: [],
        filterGroups: []
      };

      const entity = { any: 'data' };

      expect(engine.evaluate(filterGroup, entity)).toBe(true);
    });
  });
});
