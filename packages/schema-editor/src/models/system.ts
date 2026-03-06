export interface System {
  getComponent: (name: string, isStatic?: boolean) => any;
  getConfigs: () => Record<string, any>;
  // Extend
}
