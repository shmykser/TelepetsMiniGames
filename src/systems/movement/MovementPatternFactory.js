/**
 * Фабрика для создания паттернов движения
 * Реализует паттерн Factory Method
 */
import { MovementStrategies } from './MovementStrategies.js';

export class MovementPatternFactory {
    /**
     * Создает паттерн движения для конкретного типа насекомого
     */
    static createPattern(type, customParams = {}) {
        const patternConfig = this.getPatternConfig(type);
        const params = { ...patternConfig.params, ...customParams };
        
        return {
            type: type,
            strategy: patternConfig.strategy,
            params: params,
            time: 0,
            state: 'idle',
            energy: 100,
            aggression: 0
        };
    }

    /**
     * Получает конфигурацию паттерна для типа насекомого
     */
    static getPatternConfig(type) {
        const configs = {
            // МУРАВЕЙ - волновое движение
            ant: {
                strategy: 'wave',
                params: {
                    amplitude: 0.5,
                    frequency: 0.05,
                    offset: 0.5
                }
            },
            
            // МУХА - хаотичное движение
            fly: {
                strategy: 'chaos',
                params: {
                    intensity: 2.0,
                    targetInfluence: 0.7,
                    period: 1500
                }
            },
            
            // КОМАР - зигзагообразное движение
            mosquito: {
                strategy: 'zigzag',
                params: {
                    amplitude: 1.2,
                    influence: 0.8
                }
            },
            
            // ПАУК - рывковое движение
            spider: {
                strategy: 'burst',
                params: {
                    intensity: 2.5,
                    duration: 300,
                    period: 1500
                }
            },
            
            // ЖУК - рывковое движение с другими параметрами
            beetle: {
                strategy: 'burst',
                params: {
                    intensity: 2.0,
                    duration: 500,
                    period: 2000
                }
            },
            
            // ПЧЕЛА - порхающее движение
            bee: {
                strategy: 'flutter',
                params: {
                    intensity: 0.6,
                    influence: 1.5
                }
            },
            
            // БАБОЧКА - порхающее движение с минимальным влиянием цели
            butterfly: {
                strategy: 'flutter',
                params: {
                    intensity: 1.2,
                    influence: 1.5,
                    targetInfluence: 0.2
                }
            },
            
            // СТРЕКОЗА - быстрые рывки
            dragonfly: {
                strategy: 'burst',
                params: {
                    intensity: 3.0,
                    duration: 300,
                    period: 1500
                }
            },
            
            // НОСОРОГ - мощные рывки
            rhinoceros: {
                strategy: 'burst',
                params: {
                    intensity: 2.5,
                    duration: 800,
                    period: 4000
                }
            }
        };

        return configs[type] || {
            strategy: 'linear',
            params: {}
        };
    }

    /**
     * Создает кастомный паттерн с указанными параметрами
     */
    static createCustomPattern(strategy, params = {}) {
        return {
            type: 'custom',
            strategy: strategy,
            params: params,
            time: 0,
            state: 'idle',
            energy: 100,
            aggression: 0
        };
    }

    /**
     * Создает комбинированный паттерн из нескольких стратегий
     */
    static createCombinedPattern(strategies, weights = [], params = {}) {
        return {
            type: 'combined',
            strategy: 'combined',
            params: {
                strategies: strategies,
                weights: weights,
                ...params
            },
            time: 0,
            state: 'idle',
            energy: 100,
            aggression: 0
        };
    }

    /**
     * Получает список доступных стратегий
     */
    static getAvailableStrategies() {
        return [
            'linear',
            'wave', 
            'burst',
            'flutter',
            'zigzag',
            'chaos',
            'combined'
        ];
    }

    /**
     * Получает список доступных типов насекомых
     */
    static getAvailableTypes() {
        return [
            'ant',
            'fly',
            'mosquito', 
            'spider',
            'beetle',
            'bee',
            'butterfly',
            'dragonfly',
            'rhinoceros'
        ];
    }
}

