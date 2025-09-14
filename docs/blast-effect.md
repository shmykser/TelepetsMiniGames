# Эффект Blast - Взрыв (Круговая волна)

## Обзор

Эффект `blast` создает анимацию взрыва в виде расширяющейся круговой волны от центра объекта. Идеально подходит для взрывов, ударных волн, магических эффектов и других воздействий с радиальным распространением.

## Параметры

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `radius` | number | `100` | Максимальный радиус волны в пикселях |
| `duration` | number | `800` | Длительность анимации в миллисекундах |
| `color` | number | `0xff6600` | Цвет волны (шестнадцатеричный) |
| `thickness` | number | `3` | Толщина линии волны в пикселях |
| `alpha` | number | `0.8` | Начальная прозрачность волны (0-1) |

## Примеры использования

### Базовый взрыв
```javascript
this.effectSystem.applyEffect('blast', target, 1.0, {
    radius: 100,
    duration: 800
});
```

### Большой взрыв с красным цветом
```javascript
this.effectSystem.applyEffect('blast', target, 1.0, {
    radius: 200,
    duration: 1200,
    color: 0xff0000,
    thickness: 5
});
```

### Быстрая ударная волна
```javascript
this.effectSystem.applyEffect('blast', target, 1.0, {
    radius: 150,
    duration: 300,
    color: 0x00ffff,
    alpha: 0.6
});
```

## Применение в игре

### Враг получает урон
```javascript
// EffectHandler.js - handleEnemyDamage
this.effectSystem.applyEffect('blast', enemy, intensity, {
    radius: 50 + (damage * 2),
    duration: 400,
    color: 0xff4444
});
```

### Взрыв при смерти врага
```javascript
// EffectHandler.js - handleEnemyDeath
this.effectSystem.applyEffect('blast', enemy, 1.0, {
    radius: 120,
    duration: 600,
    color: 0xff6600,
    thickness: 4
});
```

### Магический эффект
```javascript
// Для магических способностей
this.effectSystem.applyEffect('blast', caster, 1.0, {
    radius: 180,
    duration: 1000,
    color: 0x6600ff,
    alpha: 0.7
});
```

## Техническая реализация

### Создание волны
```javascript
// Создаем круг с прозрачной заливкой и цветной обводкой
const blast = this.scene.add.circle(target.x, target.y, 5, color);
blast.setAlpha(alpha);
blast.setStrokeStyle(thickness, color);
blast.setFillStyle(0x000000, 0); // Прозрачная заливка
```

### Анимация расширения
```javascript
// Анимируем радиус и прозрачность
const tween = this.scene.tweens.add({
    targets: blast,
    radius: radius,        // Расширение до заданного радиуса
    alpha: 0,             // Исчезновение
    duration: duration,
    ease: 'Power2.easeOut',
    onComplete: () => blast.destroy()
});
```

## Визуальные особенности

- **Начинается с малого радиуса** (5 пикселей)
- **Расширяется до заданного радиуса** с плавным замедлением
- **Исчезает по мере расширения** (alpha от начального значения до 0)
- **Использует цветную обводку** для четкости визуального эффекта
- **Автоматически удаляется** после завершения анимации

## Рекомендации

1. **Малые взрывы** - radius: 50-100, duration: 300-600
2. **Средние взрывы** - radius: 100-150, duration: 600-800  
3. **Большие взрывы** - radius: 150-250, duration: 800-1200
4. **Цветовая схема**:
   - Красный (0xff0000) - огненные взрывы
   - Синий (0x0066ff) - ледяные эффекты
   - Фиолетовый (0x6600ff) - магические взрывы
   - Оранжевый (0xff6600) - стандартные взрывы
