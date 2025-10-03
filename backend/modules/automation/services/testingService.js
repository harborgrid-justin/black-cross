/**
 * Playbook Testing & Simulation Service
 * Handles playbook testing before production use (Sub-Feature 15.6)
 */

const Playbook = require('../models/Playbook');
const PlaybookTest = require('../models/PlaybookTest');
const executionService = require('./executionService');
const logger = require('../utils/logger');

class TestingService {
  /**
   * Test playbook
   * @param {string} playbookId - Playbook ID
   * @param {Object} testData - Test configuration
   * @returns {Promise<Object>} Test results
   */
  async testPlaybook(playbookId, testData) {
    try {
      logger.info('Starting playbook test', {
        playbook_id: playbookId,
        test_type: testData.test_type,
      });

      const playbook = await Playbook.findOne({ id: playbookId });

      if (!playbook) {
        throw new Error('Playbook not found');
      }

      // Create test record
      const test = new PlaybookTest({
        playbook_id: playbookId,
        playbook_name: playbook.name,
        test_type: testData.test_type,
        status: 'running',
        test_environment: testData.test_environment || 'sandbox',
        test_data: testData.test_data,
      });

      await test.save();

      // Execute test based on type
      let results;
      switch (testData.test_type) {
        case 'dry_run':
          results = await this.performDryRun(playbook, test);
          break;
        case 'simulation':
          results = await this.performSimulation(playbook, test, testData.test_data);
          break;
        case 'validation':
          results = await this.performValidation(playbook, test);
          break;
        case 'performance':
          results = await this.performPerformanceTest(playbook, test);
          break;
        default:
          throw new Error(`Unknown test type: ${testData.test_type}`);
      }

      // Update test record
      test.status = 'completed';
      test.end_time = new Date();
      test.results = results;
      test.summary = this.calculateTestSummary(results);

      await test.save();

      logger.info('Playbook test completed', {
        test_id: test.id,
        success_rate: test.summary.success_rate,
      });

      return test;
    } catch (error) {
      logger.error('Error testing playbook', { error: error.message });
      throw error;
    }
  }

  /**
   * Perform dry run
   * @param {Object} playbook - Playbook object
   * @param {Object} _test - Test object
   * @returns {Promise<Array>} Test results
   */
  async performDryRun(playbook, _test) {
    const results = [];

    results.push({
      test_name: 'Action Count Validation',
      status: playbook.actions.length > 0 ? 'passed' : 'failed',
      message: `Playbook has ${playbook.actions.length} actions`,
      expected: 'At least 1 action',
      actual: playbook.actions.length,
    });

    results.push({
      test_name: 'Action Order Validation',
      status: this.validateActionOrder(playbook.actions) ? 'passed' : 'failed',
      message: 'Action order is valid',
      expected: 'Sequential order',
      actual: playbook.actions.map((a) => a.order).join(', '),
    });

    results.push({
      test_name: 'Required Fields Validation',
      status: this.validateRequiredFields(playbook) ? 'passed' : 'failed',
      message: 'All required fields are present',
      expected: 'name, description, category, actions',
      actual: 'All present',
    });

    return results;
  }

  /**
   * Perform simulation
   * @param {Object} playbook - Playbook object
   * @param {Object} test - Test object
   * @param {Object} testData - Test data
   * @returns {Promise<Array>} Test results
   */
  async performSimulation(playbook, test, testData = {}) {
    const results = [];

    try {
      // Execute playbook in simulation mode
      const execution = await executionService.executePlaybook(playbook.id, {
        execution_mode: 'simulation',
        triggered_by: {
          type: 'api',
          source: 'testing_service',
        },
        variables: testData,
      });

      results.push({
        test_name: 'Playbook Execution',
        status: execution.status === 'completed' ? 'passed' : 'failed',
        message: `Playbook executed with status: ${execution.status}`,
        expected: 'completed',
        actual: execution.status,
      });

      results.push({
        test_name: 'Action Execution Rate',
        status: execution.successful_actions >= execution.total_actions * 0.8 ? 'passed' : 'failed',
        message: `${execution.successful_actions}/${execution.total_actions} actions succeeded`,
        expected: '80% success rate',
        actual: `${Math.round((execution.successful_actions / execution.total_actions) * 100)}%`,
      });

      results.push({
        test_name: 'Error Handling',
        status: execution.errors.length === 0 ? 'passed' : 'failed',
        message: `${execution.errors.length} errors encountered`,
        expected: 'No errors',
        actual: execution.errors.length,
      });
    } catch (error) {
      results.push({
        test_name: 'Playbook Execution',
        status: 'failed',
        message: `Execution failed: ${error.message}`,
        expected: 'Successful execution',
        actual: error.message,
      });
    }

    return results;
  }

  /**
   * Perform validation
   * @param {Object} playbook - Playbook object
   * @param {Object} test - Test object
   * @returns {Promise<Array>} Test results
   */
  async performValidation(playbook, test) {
    const results = [];
    const validations = [];

    // Validate playbook structure
    validations.push({
      name: 'Structure Validation',
      check: () => playbook.name && playbook.description && playbook.category,
    });

    // Validate actions
    validations.push({
      name: 'Actions Validation',
      check: () => Array.isArray(playbook.actions) && playbook.actions.length > 0,
    });

    // Validate action parameters
    validations.push({
      name: 'Action Parameters',
      check: () => playbook.actions.every((a) => a.type && a.name && typeof a.order === 'number'),
    });

    // Validate trigger conditions
    if (playbook.trigger_conditions) {
      validations.push({
        name: 'Trigger Conditions',
        check: () => playbook.trigger_conditions.type !== undefined,
      });
    }

    // Execute validations
    for (const validation of validations) {
      try {
        const passed = validation.check();
        results.push({
          test_name: validation.name,
          status: passed ? 'passed' : 'failed',
          message: passed ? `${validation.name} passed` : `${validation.name} failed`,
        });

        test.validation_checks.push({
          check_name: validation.name,
          passed,
          message: passed ? 'Valid' : 'Invalid',
        });
      } catch (error) {
        results.push({
          test_name: validation.name,
          status: 'failed',
          message: `Validation error: ${error.message}`,
        });
      }
    }

    return results;
  }

  /**
   * Perform performance test
   * @param {Object} playbook - Playbook object
   * @param {Object} test - Test object
   * @returns {Promise<Array>} Test results
   */
  async performPerformanceTest(playbook, test) {
    const results = [];

    // Estimate execution time
    const estimatedTime = this.estimateExecutionTime(playbook);
    test.performance_metrics = {
      estimated_execution_time: estimatedTime,
    };

    results.push({
      test_name: 'Estimated Execution Time',
      status: estimatedTime < 300 ? 'passed' : 'failed',
      message: `Estimated time: ${estimatedTime} seconds`,
      expected: 'Less than 300 seconds',
      actual: estimatedTime,
    });

    // Check for potential bottlenecks
    const bottlenecks = this.identifyBottlenecks(playbook);
    test.performance_metrics.bottlenecks = bottlenecks;

    results.push({
      test_name: 'Bottleneck Analysis',
      status: bottlenecks.length === 0 ? 'passed' : 'failed',
      message: `${bottlenecks.length} potential bottlenecks identified`,
      expected: 'No bottlenecks',
      actual: bottlenecks.length,
    });

    // Analyze action complexity
    const complexity = this.analyzeComplexity(playbook);

    results.push({
      test_name: 'Playbook Complexity',
      status: complexity.score < 50 ? 'passed' : 'failed',
      message: `Complexity score: ${complexity.score}`,
      expected: 'Score less than 50',
      actual: complexity.score,
    });

    return results;
  }

  /**
   * Get test results
   * @param {string} testId - Test ID
   * @returns {Promise<Object>} Test results
   */
  async getTestResults(testId) {
    try {
      logger.info('Fetching test results', { test_id: testId });

      const test = await PlaybookTest.findOne({ id: testId }).select('-__v');

      if (!test) {
        throw new Error('Test not found');
      }

      return test;
    } catch (error) {
      logger.error('Error fetching test results', { error: error.message });
      throw error;
    }
  }

  /**
   * List tests for playbook
   * @param {string} playbookId - Playbook ID
   * @returns {Promise<Array>} Tests
   */
  async listTests(playbookId) {
    try {
      logger.info('Listing tests', { playbook_id: playbookId });

      const tests = await PlaybookTest.find({ playbook_id: playbookId })
        .sort({ created_at: -1 })
        .limit(50)
        .select('-results -__v');

      return tests;
    } catch (error) {
      logger.error('Error listing tests', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate test summary
   * @param {Array} results - Test results
   * @returns {Object} Summary
   */
  calculateTestSummary(results) {
    const total = results.length;
    const passed = results.filter((r) => r.status === 'passed').length;
    const failed = results.filter((r) => r.status === 'failed').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;

    return {
      total_tests: total,
      passed,
      failed,
      skipped,
      success_rate: total > 0 ? Math.round((passed / total) * 100) : 0,
    };
  }

  /**
   * Validate action order
   * @param {Array} actions - Actions
   * @returns {boolean} Valid or not
   */
  validateActionOrder(actions) {
    if (!actions || actions.length === 0) return false;

    const orders = actions.map((a) => a.order).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i) return false;
    }
    return true;
  }

  /**
   * Validate required fields
   * @param {Object} playbook - Playbook
   * @returns {boolean} Valid or not
   */
  validateRequiredFields(playbook) {
    return !!(playbook.name && playbook.description
              && playbook.category && playbook.actions
              && playbook.actions.length > 0);
  }

  /**
   * Estimate execution time
   * @param {Object} playbook - Playbook
   * @returns {number} Estimated seconds
   */
  estimateExecutionTime(playbook) {
    let total = 0;

    for (const action of playbook.actions) {
      // Base time per action
      total += 10;

      // Add timeout if specified
      if (action.timeout) {
        total += action.timeout / 10;
      }

      // Add retry time if enabled
      if (action.retry?.enabled) {
        total += (action.retry.max_attempts * action.retry.delay);
      }
    }

    return Math.round(total);
  }

  /**
   * Identify bottlenecks
   * @param {Object} playbook - Playbook
   * @returns {Array} Bottlenecks
   */
  identifyBottlenecks(playbook) {
    const bottlenecks = [];

    for (const action of playbook.actions) {
      if (action.timeout && action.timeout > 300) {
        bottlenecks.push(`Action "${action.name}" has high timeout (${action.timeout}s)`);
      }

      if (action.retry?.enabled && action.retry.max_attempts > 5) {
        bottlenecks.push(`Action "${action.name}" has high retry count`);
      }
    }

    return bottlenecks;
  }

  /**
   * Analyze complexity
   * @param {Object} playbook - Playbook
   * @returns {Object} Complexity analysis
   */
  analyzeComplexity(playbook) {
    let score = 0;

    // Base score from action count
    score += playbook.actions.length * 2;

    // Add score for conditionals
    const conditionCount = playbook.actions.filter((a) => a.condition).length;
    score += conditionCount * 5;

    // Add score for retries
    const retryCount = playbook.actions.filter((a) => a.retry?.enabled).length;
    score += retryCount * 3;

    // Add score for approvals
    if (playbook.approvals_required) {
      score += 10;
    }

    return {
      score,
      level: score < 20 ? 'low' : score < 50 ? 'medium' : 'high',
    };
  }
}

module.exports = new TestingService();
