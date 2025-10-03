/**
 * Query Service Tests
 */

const QueryService = require('../services/QueryService');
const database = require('../models/database');

describe('QueryService', () => {
  beforeEach(async () => {
    await database.clearAll();
  });

  describe('executeQuery', () => {
    it('should execute a query and return results', async () => {
      const queryData = {
        name: 'Test Query',
        query: 'SELECT * FROM logs WHERE status="failed"',
        queryLanguage: 'sql',
        dataSources: ['logs'],
      };

      const result = await QueryService.executeQuery(queryData, 'user123');

      expect(result).toHaveProperty('queryId');
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('executionTime');
      expect(result.results.data).toBeDefined();
      expect(Array.isArray(result.results.data)).toBe(true);
    });

    it('should reject queries with forbidden keywords', async () => {
      const queryData = {
        query: 'DROP TABLE logs',
        queryLanguage: 'sql',
      };

      await expect(
        QueryService.executeQuery(queryData, 'user123'),
      ).rejects.toThrow('Forbidden keyword');
    });

    it('should reject empty queries', async () => {
      const queryData = {
        query: '',
        queryLanguage: 'sql',
      };

      await expect(
        QueryService.executeQuery(queryData, 'user123'),
      ).rejects.toThrow('Query cannot be empty');
    });
  });

  describe('saveQuery', () => {
    it('should save a query', async () => {
      const queryData = {
        name: 'Saved Query',
        query: 'SELECT * FROM events',
        queryLanguage: 'sql',
      };

      const saved = await QueryService.saveQuery(queryData, 'user123');

      expect(saved.id).toBeDefined();
      expect(saved.name).toBe('Saved Query');
      expect(saved.createdBy).toBe('user123');
    });
  });

  describe('listQueries', () => {
    it('should list all queries', async () => {
      await QueryService.saveQuery(
        { name: 'Query 1', query: 'SELECT 1', queryLanguage: 'sql' },
        'user123',
      );
      await QueryService.saveQuery(
        { name: 'Query 2', query: 'SELECT 2', queryLanguage: 'sql' },
        'user123',
      );

      const queries = await QueryService.listQueries();

      expect(queries.length).toBe(2);
    });

    it('should filter queries by status', async () => {
      await QueryService.saveQuery(
        { name: 'Active Query', query: 'SELECT 1', status: 'active' },
        'user123',
      );
      await QueryService.saveQuery(
        { name: 'Inactive Query', query: 'SELECT 2', status: 'inactive' },
        'user123',
      );

      const queries = await QueryService.listQueries({ status: 'active' });

      expect(queries.length).toBe(1);
      expect(queries[0].name).toBe('Active Query');
    });
  });

  describe('getQuery', () => {
    it('should get a query by id', async () => {
      const saved = await QueryService.saveQuery(
        { name: 'Test Query', query: 'SELECT 1' },
        'user123',
      );

      const retrieved = await QueryService.getQuery(saved.id);

      expect(retrieved.id).toBe(saved.id);
      expect(retrieved.name).toBe('Test Query');
    });

    it('should throw error for non-existent query', async () => {
      await expect(
        QueryService.getQuery('nonexistent'),
      ).rejects.toThrow('Query not found');
    });
  });

  describe('updateQuery', () => {
    it('should update a query', async () => {
      const saved = await QueryService.saveQuery(
        { name: 'Original', query: 'SELECT 1' },
        'user123',
      );

      const updated = await QueryService.updateQuery(
        saved.id,
        { name: 'Updated' },
        'user123',
      );

      expect(updated.name).toBe('Updated');
    });

    it('should prevent unauthorized updates', async () => {
      const saved = await QueryService.saveQuery(
        { name: 'Test', query: 'SELECT 1' },
        'user123',
      );

      await expect(
        QueryService.updateQuery(saved.id, { name: 'Hacked' }, 'attacker'),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('deleteQuery', () => {
    it('should delete a query', async () => {
      const saved = await QueryService.saveQuery(
        { name: 'To Delete', query: 'SELECT 1' },
        'user123',
      );

      await QueryService.deleteQuery(saved.id, 'user123');

      await expect(
        QueryService.getQuery(saved.id),
      ).rejects.toThrow('Query not found');
    });
  });
});
