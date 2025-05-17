import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { api } from './api';

const EXPERIMENT_STORAGE_KEY = '@ab_experiments';
const USER_ID_KEY = '@ab_user_id';

interface Experiment {
  id: string;
  name: string;
  variants: {
    id: string;
    name: string;
    weight: number;
  }[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  timestamp: string;
}

interface ExperimentEvent {
  experimentId: string;
  variantId: string;
  eventName: string;
  properties?: Record<string, any>;
  timestamp: string;
}

class ABTestingService {
  private static instance: ABTestingService;
  private experiments: Record<string, Experiment> = {};
  private assignments: Record<string, ExperimentAssignment> = {};
  private userId: string | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): ABTestingService {
    if (!ABTestingService.instance) {
      ABTestingService.instance = new ABTestingService();
    }
    return ABTestingService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load or generate user ID
    this.userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!this.userId) {
      this.userId = uuidv4();
      await AsyncStorage.setItem(USER_ID_KEY, this.userId);
    }

    // Load cached experiments and assignments
    const cachedData = await AsyncStorage.getItem(EXPERIMENT_STORAGE_KEY);
    if (cachedData) {
      const { experiments, assignments } = JSON.parse(cachedData);
      this.experiments = experiments;
      this.assignments = assignments;
    }

    // Fetch latest experiments from server
    await this.fetchExperiments();

    this.initialized = true;
  }

  private async fetchExperiments(): Promise<void> {
    try {
      const response = await api.get('/experiments', {
        params: {
          userId: this.userId,
          platform: Platform.OS,
          appVersion: Platform.Version
        }
      });

      const { experiments, assignments } = response.data;
      this.experiments = experiments;
      this.assignments = assignments;

      // Cache the data
      await AsyncStorage.setItem(
        EXPERIMENT_STORAGE_KEY,
        JSON.stringify({ experiments, assignments })
      );
    } catch (error) {
      console.error('Failed to fetch experiments:', error);
    }
  }

  getVariant(experimentName: string): string | null {
    const experiment = Object.values(this.experiments).find(
      exp => exp.name === experimentName && exp.isActive
    );

    if (!experiment) return null;

    const assignment = this.assignments[experiment.id];
    if (assignment) {
      return assignment.variantId;
    }

    // Assign variant based on weights
    const totalWeight = experiment.variants.reduce(
      (sum, variant) => sum + variant.weight,
      0
    );
    let random = Math.random() * totalWeight;
    let selectedVariant = experiment.variants[0].id;

    for (const variant of experiment.variants) {
      random -= variant.weight;
      if (random <= 0) {
        selectedVariant = variant.id;
        break;
      }
    }

    // Save assignment
    const newAssignment: ExperimentAssignment = {
      experimentId: experiment.id,
      variantId: selectedVariant,
      timestamp: new Date().toISOString()
    };
    this.assignments[experiment.id] = newAssignment;

    // Report assignment to server
    this.reportAssignment(newAssignment);

    return selectedVariant;
  }

  private async reportAssignment(assignment: ExperimentAssignment): Promise<void> {
    try {
      await api.post('/experiments/assignments', {
        userId: this.userId,
        ...assignment
      });
    } catch (error) {
      console.error('Failed to report assignment:', error);
    }
  }

  async trackEvent(
    experimentName: string,
    eventName: string,
    properties?: Record<string, any>
  ): Promise<void> {
    const experiment = Object.values(this.experiments).find(
      exp => exp.name === experimentName
    );
    if (!experiment) return;

    const assignment = this.assignments[experiment.id];
    if (!assignment) return;

    const event: ExperimentEvent = {
      experimentId: experiment.id,
      variantId: assignment.variantId,
      eventName,
      properties,
      timestamp: new Date().toISOString()
    };

    try {
      await api.post('/experiments/events', {
        userId: this.userId,
        ...event
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  async forceVariant(experimentName: string, variantId: string): Promise<void> {
    const experiment = Object.values(this.experiments).find(
      exp => exp.name === experimentName
    );
    if (!experiment) return;

    const assignment: ExperimentAssignment = {
      experimentId: experiment.id,
      variantId,
      timestamp: new Date().toISOString()
    };
    this.assignments[experiment.id] = assignment;

    // Report forced assignment
    await this.reportAssignment(assignment);
  }

  clearCache(): Promise<void> {
    return AsyncStorage.removeItem(EXPERIMENT_STORAGE_KEY);
  }
}

export const abTesting = ABTestingService.getInstance(); 