/**
 * Relationship Service
 * Business logic for threat actor relationship mapping
 */

const { threatActorRepository } = require('../repositories');

class RelationshipService {
  /**
   * Add relationship between actors
   */
  async addRelationship(actorId, relationshipData) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const relatedActor = await threatActorRepository.findById(relationshipData.actor_id);
    if (!relatedActor) {
      throw new Error('Related threat actor not found');
    }

    const relationship = {
      actor_id: relationshipData.actor_id,
      relationship_type: relationshipData.relationship_type || 'unknown',
      strength: relationshipData.strength || 50,
      evidence: relationshipData.evidence || [],
      notes: relationshipData.notes || '',
      discovered_date: new Date()
    };

    // Add relationship to first actor
    await threatActorRepository.addRelationship(actorId, relationship);

    // Add reciprocal relationship to second actor
    const reciprocalRelationship = {
      actor_id: actorId,
      relationship_type: relationshipData.relationship_type || 'unknown',
      strength: relationshipData.strength || 50,
      evidence: relationshipData.evidence || [],
      notes: relationshipData.notes || '',
      discovered_date: new Date()
    };
    await threatActorRepository.addRelationship(relationshipData.actor_id, reciprocalRelationship);

    return relationship;
  }

  /**
   * Get relationships for an actor
   */
  async getRelationships(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const relationships = actor.relationships || [];

    // Enrich with actor details
    const enrichedRelationships = await Promise.all(
      relationships.map(async (rel) => {
        const relatedActor = await threatActorRepository.findById(rel.actor_id);
        return {
          ...rel,
          actor_name: relatedActor?.name || 'Unknown',
          actor_type: relatedActor?.type || 'unknown',
          actor_sophistication: relatedActor?.sophistication || 'unknown'
        };
      })
    );

    return {
      actor_id: actorId,
      actor_name: actor.name,
      total_relationships: enrichedRelationships.length,
      relationships: enrichedRelationships
    };
  }

  /**
   * Analyze infrastructure sharing
   */
  async analyzeInfrastructureSharing(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const infrastructure = actor.infrastructure || {};
    const sharing = {
      domains: [],
      ips: [],
      email_addresses: []
    };

    // Check domains
    if (infrastructure.domains && infrastructure.domains.length > 0) {
      for (const domain of infrastructure.domains) {
        const actorsUsingDomain = await threatActorRepository.searchByInfrastructure(domain);
        if (actorsUsingDomain.length > 1) {
          sharing.domains.push({
            resource: domain,
            shared_with: actorsUsingDomain
              .filter(a => a.id !== actorId)
              .map(a => ({ id: a.id, name: a.name }))
          });
        }
      }
    }

    // Check IPs
    if (infrastructure.ips && infrastructure.ips.length > 0) {
      for (const ip of infrastructure.ips) {
        const actorsUsingIP = await threatActorRepository.searchByInfrastructure(ip);
        if (actorsUsingIP.length > 1) {
          sharing.ips.push({
            resource: ip,
            shared_with: actorsUsingIP
              .filter(a => a.id !== actorId)
              .map(a => ({ id: a.id, name: a.name }))
          });
        }
      }
    }

    // Check email addresses
    if (infrastructure.email_addresses && infrastructure.email_addresses.length > 0) {
      for (const email of infrastructure.email_addresses) {
        const actorsUsingEmail = await threatActorRepository.searchByInfrastructure(email);
        if (actorsUsingEmail.length > 1) {
          sharing.email_addresses.push({
            resource: email,
            shared_with: actorsUsingEmail
              .filter(a => a.id !== actorId)
              .map(a => ({ id: a.id, name: a.name }))
          });
        }
      }
    }

    return {
      actor_id: actorId,
      actor_name: actor.name,
      infrastructure_sharing: sharing,
      total_shared_resources: 
        sharing.domains.length + 
        sharing.ips.length + 
        sharing.email_addresses.length
    };
  }

  /**
   * Analyze tool and malware sharing
   */
  async analyzeToolSharing(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const allActors = await threatActorRepository.list({ limit: 1000 });
    const toolSharing = [];
    const malwareSharing = [];

    // Check for tool overlap
    if (actor.associated_tools && actor.associated_tools.length > 0) {
      actor.associated_tools.forEach(tool => {
        const actorsUsingTool = allActors.actors.filter(a => 
          a.id !== actorId &&
          a.associated_tools &&
          a.associated_tools.some(t => t.name === tool.name)
        );

        if (actorsUsingTool.length > 0) {
          toolSharing.push({
            tool: tool.name,
            tool_type: tool.type,
            shared_with: actorsUsingTool.map(a => ({ id: a.id, name: a.name }))
          });
        }
      });
    }

    // Check for malware overlap
    if (actor.associated_malware && actor.associated_malware.length > 0) {
      actor.associated_malware.forEach(malware => {
        const actorsUsingMalware = allActors.actors.filter(a => 
          a.id !== actorId &&
          a.associated_malware &&
          a.associated_malware.some(m => m.family === malware.family)
        );

        if (actorsUsingMalware.length > 0) {
          malwareSharing.push({
            malware_family: malware.family,
            shared_with: actorsUsingMalware.map(a => ({ id: a.id, name: a.name }))
          });
        }
      });
    }

    return {
      actor_id: actorId,
      actor_name: actor.name,
      tool_sharing: toolSharing,
      malware_sharing: malwareSharing,
      total_shared_tools: toolSharing.length,
      total_shared_malware: malwareSharing.length
    };
  }

  /**
   * Detect potential collaboration
   */
  async detectCollaboration(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const [infraSharing, toolSharing, ttpOverlap] = await Promise.all([
      this.analyzeInfrastructureSharing(actorId),
      this.analyzeToolSharing(actorId),
      this.findTTPOverlap(actorId)
    ]);

    // Calculate collaboration likelihood for each actor
    const collaborationScores = {};

    // Score based on infrastructure sharing
    infraSharing.infrastructure_sharing.domains.forEach(domain => {
      domain.shared_with.forEach(actor => {
        if (!collaborationScores[actor.id]) {
          collaborationScores[actor.id] = { 
            actor_id: actor.id, 
            actor_name: actor.name, 
            score: 0,
            indicators: []
          };
        }
        collaborationScores[actor.id].score += 15;
        collaborationScores[actor.id].indicators.push(`Shared domain: ${domain.resource}`);
      });
    });

    // Score based on tool/malware sharing
    toolSharing.tool_sharing.forEach(tool => {
      tool.shared_with.forEach(actor => {
        if (!collaborationScores[actor.id]) {
          collaborationScores[actor.id] = { 
            actor_id: actor.id, 
            actor_name: actor.name, 
            score: 0,
            indicators: []
          };
        }
        collaborationScores[actor.id].score += 10;
        collaborationScores[actor.id].indicators.push(`Shared tool: ${tool.tool}`);
      });
    });

    // Score based on TTP overlap
    Object.entries(ttpOverlap.overlaps).forEach(([actorId, data]) => {
      if (!collaborationScores[actorId]) {
        collaborationScores[actorId] = { 
          actor_id: actorId, 
          actor_name: data.actor_name, 
          score: 0,
          indicators: []
        };
      }
      collaborationScores[actorId].score += data.overlap_percentage * 0.5; // Max 50 points
      collaborationScores[actorId].indicators.push(
        `${data.overlap_percentage}% TTP overlap`
      );
    });

    // Convert to array and sort
    const sortedCollaborations = Object.values(collaborationScores)
      .sort((a, b) => b.score - a.score);

    // Classify collaboration likelihood
    sortedCollaborations.forEach(collab => {
      if (collab.score >= 50) collab.likelihood = 'high';
      else if (collab.score >= 30) collab.likelihood = 'medium';
      else collab.likelihood = 'low';
    });

    return {
      actor_id: actorId,
      actor_name: actor.name,
      potential_collaborations: sortedCollaborations,
      high_likelihood_count: sortedCollaborations.filter(c => c.likelihood === 'high').length
    };
  }

  /**
   * Find TTP overlap with other actors
   */
  async findTTPOverlap(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const actorTTPs = actor.ttps || [];
    if (actorTTPs.length === 0) {
      return { actor_id: actorId, overlaps: {} };
    }

    const allActors = await threatActorRepository.list({ limit: 1000 });
    const overlaps = {};

    allActors.actors.forEach(otherActor => {
      if (otherActor.id === actorId) return;

      const otherTTPs = otherActor.ttps || [];
      if (otherTTPs.length === 0) return;

      // Find overlapping techniques
      const overlap = actorTTPs.filter(ttp => 
        otherTTPs.some(ottp => ottp.technique_id === ttp.technique_id)
      );

      if (overlap.length > 0) {
        const totalUnique = new Set([
          ...actorTTPs.map(t => t.technique_id),
          ...otherTTPs.map(t => t.technique_id)
        ]).size;

        overlaps[otherActor.id] = {
          actor_name: otherActor.name,
          actor_type: otherActor.type,
          overlap_count: overlap.length,
          overlap_percentage: ((overlap.length / totalUnique) * 100).toFixed(2)
        };
      }
    });

    return {
      actor_id: actorId,
      actor_name: actor.name,
      overlaps
    };
  }

  /**
   * Track nation-state affiliations
   */
  async trackNationStateAffiliation(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const affiliation = {
      actor_id: actorId,
      actor_name: actor.name,
      origin_country: actor.origin_country || 'unknown',
      type: actor.type,
      confidence: 50,
      indicators: []
    };

    // Analyze indicators
    if (actor.type === 'nation-state' || actor.type === 'apt') {
      affiliation.confidence += 30;
      affiliation.indicators.push('Classified as nation-state or APT');
    }

    if (actor.sophistication === 'expert' || actor.sophistication === 'strategic') {
      affiliation.confidence += 15;
      affiliation.indicators.push('Expert/strategic sophistication level');
    }

    if (actor.motivation?.includes('espionage')) {
      affiliation.confidence += 20;
      affiliation.indicators.push('Espionage motivation');
    }

    if (actor.origin_country && actor.origin_country !== 'unknown') {
      affiliation.confidence += 15;
      affiliation.indicators.push(`Known origin country: ${actor.origin_country}`);
    }

    if (actor.targets?.countries?.length > 0) {
      const targetCountries = actor.targets.countries;
      if (targetCountries.length > 10) {
        affiliation.indicators.push('Wide geographic targeting suggests state resources');
      }
    }

    affiliation.confidence = Math.min(100, affiliation.confidence);
    affiliation.assessment = affiliation.confidence >= 70 
      ? 'Likely nation-state affiliated' 
      : affiliation.confidence >= 40 
        ? 'Possible nation-state affiliation' 
        : 'Unlikely nation-state affiliation';

    return affiliation;
  }

  /**
   * Calculate relationship strength
   */
  async calculateRelationshipStrength(actorId1, actorId2) {
    const [infraSharing1, toolSharing1] = await Promise.all([
      this.analyzeInfrastructureSharing(actorId1),
      this.analyzeToolSharing(actorId1)
    ]);

    let strength = 0;

    // Check infrastructure sharing
    const sharedInfra = [
      ...infraSharing1.infrastructure_sharing.domains,
      ...infraSharing1.infrastructure_sharing.ips,
      ...infraSharing1.infrastructure_sharing.email_addresses
    ].filter(item => 
      item.shared_with.some(actor => actor.id === actorId2)
    );
    strength += sharedInfra.length * 10;

    // Check tool sharing
    const sharedTools = [
      ...toolSharing1.tool_sharing,
      ...toolSharing1.malware_sharing
    ].filter(item => 
      item.shared_with.some(actor => actor.id === actorId2)
    );
    strength += sharedTools.length * 15;

    // Check TTP overlap
    const ttpOverlap = await this.findTTPOverlap(actorId1);
    if (ttpOverlap.overlaps[actorId2]) {
      strength += parseFloat(ttpOverlap.overlaps[actorId2].overlap_percentage) * 0.5;
    }

    return Math.min(100, strength);
  }

  /**
   * Get relationship network visualization data
   */
  async getRelationshipNetwork(actorId, depth = 1) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const nodes = [{ 
      id: actor.id, 
      name: actor.name, 
      type: actor.type,
      level: 0 
    }];
    const edges = [];
    const visited = new Set([actor.id]);

    // Build network recursively
    await this.buildNetworkRecursive(actor.id, 0, depth, nodes, edges, visited);

    return {
      actor_id: actorId,
      actor_name: actor.name,
      network_depth: depth,
      nodes,
      edges,
      total_nodes: nodes.length,
      total_edges: edges.length
    };
  }

  /**
   * Build network recursively
   */
  async buildNetworkRecursive(actorId, currentDepth, maxDepth, nodes, edges, visited) {
    if (currentDepth >= maxDepth) return;

    const actor = await threatActorRepository.findById(actorId);
    if (!actor || !actor.relationships) return;

    for (const rel of actor.relationships) {
      if (!visited.has(rel.actor_id)) {
        const relatedActor = await threatActorRepository.findById(rel.actor_id);
        if (relatedActor) {
          nodes.push({
            id: relatedActor.id,
            name: relatedActor.name,
            type: relatedActor.type,
            level: currentDepth + 1
          });
          visited.add(rel.actor_id);
        }
      }

      edges.push({
        source: actorId,
        target: rel.actor_id,
        relationship_type: rel.relationship_type,
        strength: rel.strength
      });

      // Recurse
      await this.buildNetworkRecursive(
        rel.actor_id, 
        currentDepth + 1, 
        maxDepth, 
        nodes, 
        edges, 
        visited
      );
    }
  }

  /**
   * Analyze supply chain relationships
   */
  async analyzeSupplyChainRelationships(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const relationships = actor.relationships || [];
    const supplyChainRels = relationships.filter(
      rel => rel.relationship_type === 'supply-chain'
    );

    const enrichedRels = await Promise.all(
      supplyChainRels.map(async (rel) => {
        const relatedActor = await threatActorRepository.findById(rel.actor_id);
        return {
          ...rel,
          actor_name: relatedActor?.name || 'Unknown',
          actor_type: relatedActor?.type || 'unknown',
          risk_level: this.assessSupplyChainRisk(rel, relatedActor)
        };
      })
    );

    return {
      actor_id: actorId,
      actor_name: actor.name,
      supply_chain_relationships: enrichedRels,
      total_supply_chain_links: enrichedRels.length,
      high_risk_links: enrichedRels.filter(r => r.risk_level === 'high').length
    };
  }

  /**
   * Assess supply chain risk
   */
  assessSupplyChainRisk(relationship, relatedActor) {
    if (!relatedActor) return 'unknown';

    let riskScore = relationship.strength || 50;

    if (relatedActor.sophistication === 'expert' || relatedActor.sophistication === 'strategic') {
      riskScore += 20;
    }

    if (relatedActor.status === 'active') {
      riskScore += 15;
    }

    if (riskScore >= 70) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }
}

module.exports = new RelationshipService();
