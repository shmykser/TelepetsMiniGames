/**
 * Типы для системы действий по жестам
 */

export type GestureType = 'tap' | 'doubleTap' | 'press' | 'swipe' | 'pan' | 'pinch' | 'rotate';

export type TargetObjectType = 'enemy' | 'defence' | 'field' | 'egg';

export interface GestureAction {
  gesture: GestureType;
  target: TargetObjectType;
  action: string;
  description: string;
}

export interface ActionContext {
  gesture: GestureType;
  targetObject: TargetObjectType;
  targetInstance?: any; // Конкретный экземпляр объекта
  coordinates: {
    x: number;
    y: number;
  };
  metadata?: Record<string, any>;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Конфигурация действий по жестам
 */
export const GESTURE_ACTIONS: Record<string, GestureAction> = {
  // Жесты по врагу
  'tap_enemy': {
    gesture: 'tap',
    target: 'enemy',
    action: 'damage',
    description: 'Нанести урон врагу'
  },

  // Жесты по защите
  'press_pit': {
    gesture: 'press',
    target: 'defence',
    action: 'expand',
    description: 'Увеличить яму'
  },

  // Жесты по полю
  'press_field': {
    gesture: 'press',
    target: 'field',
    action: 'placeDefence',
    description: 'Установить защиту (по умолчанию яма)'
  },
  'doubleTap_field': {
    gesture: 'doubleTap',
    target: 'field',
    action: 'placeSugar',
    description: 'Установить сахар'
  }
};

/**
 * Настройки действий
 */
export const ACTION_SETTINGS = {
  enemy: {
    defaultDamage: 10
  },
  pit: {
    maxSize: 10,
    expansionAmount: 1
  },
  field: {
    defaultDefenceType: 'pit' as const,
    sugarDefenceType: 'sugar' as const
  }
};
