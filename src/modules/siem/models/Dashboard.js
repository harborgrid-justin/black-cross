/**
 * Dashboard Model
 * 
 * Represents a security event visualization dashboard
 */

const { v4: uuidv4 } = require('uuid');

class Dashboard {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.description = data.description || '';
    this.type = data.type || 'custom'; // custom, template, system
    this.template_id = data.template_id || null;
    this.widgets = data.widgets || [];
    this.layout = data.layout || {};
    this.refresh_interval = data.refresh_interval || 60; // seconds
    this.time_range = data.time_range || '24h';
    this.filters = data.filters || {};
    this.shared = data.shared || false;
    this.shared_with = data.shared_with || [];
    this.owner = data.owner || null;
    this.tags = data.tags || [];
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Add widget to dashboard
   */
  addWidget(widget) {
    this.widgets.push({
      id: uuidv4(),
      ...widget,
      added_at: new Date()
    });
    this.updated_at = new Date();
  }

  /**
   * Remove widget from dashboard
   */
  removeWidget(widgetId) {
    this.widgets = this.widgets.filter(w => w.id !== widgetId);
    this.updated_at = new Date();
  }

  /**
   * Update widget
   */
  updateWidget(widgetId, updates) {
    const widget = this.widgets.find(w => w.id === widgetId);
    if (widget) {
      Object.assign(widget, updates, { updated_at: new Date() });
      this.updated_at = new Date();
    }
  }

  /**
   * Share dashboard with users
   */
  shareWith(userIds) {
    this.shared = true;
    this.shared_with = [...new Set([...this.shared_with, ...userIds])];
    this.updated_at = new Date();
  }

  /**
   * Convert to plain object for storage/API
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      template_id: this.template_id,
      widgets: this.widgets,
      layout: this.layout,
      refresh_interval: this.refresh_interval,
      time_range: this.time_range,
      filters: this.filters,
      shared: this.shared,
      shared_with: this.shared_with,
      owner: this.owner,
      tags: this.tags,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Dashboard;
