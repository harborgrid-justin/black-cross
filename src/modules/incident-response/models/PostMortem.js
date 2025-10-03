/**
 * Post-Mortem Model
 * Model for post-incident analysis and reporting
 */

const { v4: uuidv4 } = require('uuid');

/**
 * PostMortem class for post-incident analysis
 */
class PostMortem {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.incident_id = data.incident_id;
    this.title = data.title || '';
    this.summary = data.summary || '';
    this.root_cause = data.root_cause || '';
    this.impact_analysis = data.impact_analysis || {
      affected_users: 0,
      affected_systems: [],
      business_impact: '',
      financial_impact: 0,
      data_compromised: false
    };
    this.timeline_summary = data.timeline_summary || {
      detected_at: null,
      responded_at: null,
      contained_at: null,
      resolved_at: null
    };
    this.response_effectiveness = data.response_effectiveness || {
      detection_quality: 0,
      response_speed: 0,
      containment_effectiveness: 0,
      communication_quality: 0,
      overall_score: 0
    };
    this.lessons_learned = data.lessons_learned || [];
    this.improvement_recommendations = data.improvement_recommendations || [];
    this.action_items = data.action_items || [];
    this.contributing_factors = data.contributing_factors || [];
    this.metrics = data.metrics || {
      time_to_detect: 0,
      time_to_respond: 0,
      time_to_contain: 0,
      time_to_resolve: 0,
      total_duration: 0
    };
    this.participants = data.participants || [];
    this.created_by = data.created_by;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Add lesson learned
   */
  addLessonLearned(lesson) {
    this.lessons_learned.push({
      id: uuidv4(),
      description: lesson.description,
      category: lesson.category || 'general',
      severity: lesson.severity || 'medium',
      created_at: new Date()
    });
  }

  /**
   * Add improvement recommendation
   */
  addRecommendation(recommendation) {
    this.improvement_recommendations.push({
      id: uuidv4(),
      title: recommendation.title,
      description: recommendation.description,
      priority: recommendation.priority || 'medium',
      category: recommendation.category || 'process',
      estimated_effort: recommendation.estimated_effort || 'medium',
      owner: recommendation.owner || null,
      created_at: new Date()
    });
  }

  /**
   * Add action item
   */
  addActionItem(item) {
    this.action_items.push({
      id: uuidv4(),
      title: item.title,
      description: item.description,
      assigned_to: item.assigned_to,
      due_date: item.due_date || null,
      status: item.status || 'pending',
      priority: item.priority || 'medium',
      created_at: new Date()
    });
  }

  /**
   * Calculate overall effectiveness score
   */
  calculateEffectivenessScore() {
    const { response_effectiveness } = this;
    const total = response_effectiveness.detection_quality +
                  response_effectiveness.response_speed +
                  response_effectiveness.containment_effectiveness +
                  response_effectiveness.communication_quality;
    
    response_effectiveness.overall_score = total / 4;
    return response_effectiveness.overall_score;
  }

  toJSON() {
    return {
      id: this.id,
      incident_id: this.incident_id,
      title: this.title,
      summary: this.summary,
      root_cause: this.root_cause,
      impact_analysis: this.impact_analysis,
      timeline_summary: this.timeline_summary,
      response_effectiveness: this.response_effectiveness,
      lessons_learned: this.lessons_learned,
      improvement_recommendations: this.improvement_recommendations,
      action_items: this.action_items,
      contributing_factors: this.contributing_factors,
      metrics: this.metrics,
      participants: this.participants,
      created_by: this.created_by,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = { PostMortem };
