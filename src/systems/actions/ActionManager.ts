import { GESTURE_ACTIONS, ACTION_SETTINGS } from '@/core/types/gestureActions';
import { Enemy } from '@/core/objects/Enemy';
import { Defence } from '@/core/objects/Defence';

/**
 * Менеджер действий по жестам
 */
export class ActionManager {
  private scene: Phaser.Scene;
  private enemies: Enemy[];
  private defences: Defence[];

  constructor(scene: Phaser.Scene, enemies: Enemy[], defences: Defence[]) {
    this.scene = scene;
    this.enemies = enemies;
    this.defences = defences;
  }

  /**
   * Обрабатывает действие по жесту
   */
  handleAction(gesture: string, target: string, x: number, y: number): boolean {
    const actionKey = `${gesture}_${target}`;
    const action = GESTURE_ACTIONS[actionKey as keyof typeof GESTURE_ACTIONS];

    if (!action) {
      console.log(`Действие не найдено: ${actionKey}`);
      return false;
    }

    console.log(`Выполняется действие: ${action.description}`);

    switch (action.action) {
      case 'damage':
        return this.damageEnemy(x, y);
      case 'expand':
        return this.expandPit(x, y);
      case 'placeDefence':
        return this.placeDefence(x, y, ACTION_SETTINGS.field.defaultDefenceType);
      case 'placeSugar':
        return this.placeDefence(x, y, ACTION_SETTINGS.field.sugarDefenceType);
      default:
        console.log(`Неизвестное действие: ${action.action}`);
        return false;
    }
  }

  /**
   * Наносит урон врагу
   */
  private damageEnemy(x: number, y: number): boolean {
    const enemy = this.getEnemyAtPosition(x, y);
    
    if (!enemy) {
      console.log('Враг не найден в указанной позиции');
      return false;
    }

    const damage = ACTION_SETTINGS.enemy.defaultDamage;
    
    // Наносим урон
    enemy.takeDamage(damage);
    
    // Добавляем визуальный эффект
    this.showDamageEffect(enemy, damage);
    
    console.log(`Нанесен урон ${damage} врагу ${enemy.enemyType}`);
    
    // Проверяем, не умер ли враг
    if (!enemy.isAlive) {
      console.log(`Враг ${enemy.enemyType} убит!`);
      this.showDeathEffect(enemy);
    }

    return true;
  }

  /**
   * Увеличивает яму
   */
  private expandPit(x: number, y: number): boolean {
    const defence = this.getDefenceAtPosition(x, y);
    
    if (!defence || defence.defenceData.name !== 'pit') {
      console.log('Яма не найдена в указанной позиции');
      return false;
    }

    // Логика увеличения ямы будет реализована позже
    console.log('Яма увеличена');
    return true;
  }

  /**
   * Устанавливает защиту
   */
  private placeDefence(x: number, y: number, defenceType: string): boolean {
    // Логика установки защиты будет реализована позже
    console.log(`Установлена защита типа: ${defenceType} в позиции (${x}, ${y})`);
    return true;
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
   * Показывает эффект урона
   */
  private showDamageEffect(enemy: Enemy, damage: number): void {
    // Тряска врага
    this.scene.tweens.add({
      targets: enemy,
      x: enemy.x + 5,
      duration: 50,
      yoyo: true,
      repeat: 3,
      ease: 'Power2'
    });

    // Показываем текст урона
    const damageText = this.scene.add.text(enemy.x, enemy.y - 30, `-${damage}`, {
      fontSize: '24px',
      color: '#ff0000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Анимация текста урона
    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        damageText.destroy();
      }
    });
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
