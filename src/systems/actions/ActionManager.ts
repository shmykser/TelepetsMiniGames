import { Enemy } from '@/core/objects/Enemy';
import { Defence } from '@/core/objects/Defence';

/**
 * Менеджер действий по событиям мыши/касания
 */
export class ActionManager {
  private scene: Phaser.Scene;
  private enemies: Enemy[];
  private defences: Defence[];
  private egg?: any;

  constructor(scene: Phaser.Scene, enemies: Enemy[], defences: Defence[], egg?: any) {
    this.scene = scene;
    this.enemies = enemies;
    this.defences = defences;
    this.egg = egg;
    
    // Настройка обработчиков событий
    this.setupInputHandlers();
  }

  /**
   * Настройка обработчиков событий мыши/касания
   */
  private setupInputHandlers(): void {
    // Обработчик клика/касания
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleClick(pointer.x, pointer.y);
    });
  }

  /**
   * Обрабатывает клик/касание
   */
  private handleClick(x: number, y: number): void {
    console.log(`Клик в позиции: (${x}, ${y})`);
    
    // Проверяем, попал ли клик по врагу
    const enemy = this.getEnemyAtPosition(x, y);
    if (enemy) {
      this.damageEnemy(enemy);
      return;
    }
    
    // Проверяем, попал ли клик по яйцу
    if (this.egg && this.isPointInEgg(x, y)) {
      console.log('Клик по яйцу');
      return;
    }
    
    console.log('Клик по пустому месту');
  }

  /**
   * Наносит урон врагу
   */
  private damageEnemy(enemy: Enemy): boolean {
    if (!enemy || !enemy.isAlive) {
      console.log('Враг не найден или уже мертв');
      return false;
    }
    
    const damage = 10; // Базовый урон
    // Наносим урон
    enemy.takeDamage(damage);
    console.log(`Нанесен урон ${damage} врагу ${(enemy as any)._enemyType || 'враг'}`);
    
    // Проверяем, не умер ли враг
    if (!enemy.isAlive) {
      console.log(`Враг ${(enemy as any)._enemyType || 'враг'} убит!`);
      this.showDeathEffect(enemy);
    }
    return true;
  }

  /**
   * Проверяет, находится ли точка в яйце
   */
  private isPointInEgg(x: number, y: number): boolean {
    if (!this.egg || !this.egg.isAlive) {
      return false;
    }
    const distance = Phaser.Math.Distance.Between(x, y, this.egg.x, this.egg.y);
    const hitRadius = 30; // Радиус попадания по яйцу
    return distance <= hitRadius;
  }

  /**
   * Находит врага в указанной позиции
   */
  private getEnemyAtPosition(x: number, y: number): Enemy | null {
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      
      const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      const hitRadius = 50; // Радиус попадания
      
      if (distance <= hitRadius) {
        return enemy;
      }
    }
    return null;
  }

  /**
   * Находит защиту в указанной позиции
   */
  private getDefenceAtPosition(x: number, y: number): Defence | null {
    for (const defence of this.defences) {
      const distance = Phaser.Math.Distance.Between(x, y, defence.x, defence.y);
      const hitRadius = 50; // Радиус попадания
      
      if (distance <= hitRadius) {
        return defence;
      }
    }
    return null;
  }


  /**
   * Показывает эффект смерти
   */
  private showDeathEffect(enemy: Enemy): void {
    // Эффект исчезновения
    this.scene.tweens.add({
      targets: enemy,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        enemy.destroy();
      }
    });
  }

  /**
   * Обновляет списки объектов
   */
  updateObjects(enemies: Enemy[], defences: Defence[]): void {
    this.enemies = enemies;
    this.defences = defences;
  }
}
