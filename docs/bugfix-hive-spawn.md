# Исправление: Улей не спавнит ос

## Проблема

Улей (hive) не спавнил ос, несмотря на правильную конфигурацию в `enemyTypes.js`:

```javascript
hive: {
    movement: {
        strategy: 'static', // Неподвижный улей
        speed: 0
    },
    attack: {
        strategy: 'spawn', // Регулярный спавн ос
        spawnInterval: 8000, // Каждые 8 секунд
        minSpawnCount: 1,
        maxSpawnCount: 3,
        spawnRange: 80,
        spawnType: 'wasp',
        spawnDirection: 'circle'
    }
}
```

При этом:
- ✅ Спавн по урону (damageSpawn) работал правильно
- ✅ Спавн работал для осы (wasp) и паучихи (spiderQueen)
- ❌ Регулярный спавн ос от улья НЕ работал

## Причины

Было обнаружено **две проблемы** в `AICoordinator.js`:

### Проблема 1: Стратегия 'static' не учитывалась

В методе `coordinateSystems()` были проверки только для стратегии `'spawner'`, но улей использует стратегию `'static'`.

**Код ДО исправления**:
```javascript
// Строка 232
if (movementStrategy === 'spawner') {
    // Для спавнеров не используем pathfinding и не двигаем их
}

// Строка 257
if (movementStrategy === 'randomPoint' || movementStrategy === 'spawner') {
    // Для этих стратегий не передаем внешнюю цель
    return;
}
```

**Проблема**: Улей со стратегией `'static'` попадал в общую логику движения, которая пыталась двигать его к цели.

### Проблема 2: Проверка радиуса атаки для спавнеров

Для **всех** стратегий атаки проверялся радиус до цели через `attackSystem.isInRange()`. 

**Код ДО исправления**:
```javascript
// Строка 223
if (attackSystem && attackStrategy !== 'none' && attackSystem.isInRange && attackSystem.isInRange()) {
    this.setState('attacking');
    attackSystem.attack(this.currentTarget);
    return;
}
```

**Проблема**: 
- У улья не указан `attack.range` в конфигурации
- `SpawnAttackStrategy.isInRange()` возвращает `attackCfg.range || 0` (т.е. 0)
- Расстояние от улья до яйца > 0, поэтому `isInRange()` всегда возвращает `false`
- AttackSystem никогда не вызывается
- Спавн не происходит

**Почему спавн по урону работал**:
- `damageSpawn` вызывается напрямую в методе `takeDamage()` у врага
- Не зависит от `AICoordinator.coordinateSystems()`
- Не проверяет радиус атаки

**Почему осы и паучихи спавнили**:
- Оса (wasp): движется к яйцу и попадает в радиус атаки (`attack.range: 100`)
- Паучиха (spiderQueen): движется к яйцу, нет `attack.range`, но это не критично, так как она приближается

## Решение

### Исправление 1: Добавлена поддержка стратегии 'static'

**Код ПОСЛЕ исправления**:
```javascript
// Строка 240
if (movementStrategy === 'spawner' || movementStrategy === 'static') {
    // Для спавнеров и статичных объектов (улей) не используем pathfinding и не двигаем их
}

// Строка 265
if (movementStrategy === 'randomPoint' || movementStrategy === 'spawner' || movementStrategy === 'static') {
    // Для этих стратегий не передаем внешнюю цель
    // randomPoint и spawner работают со своими внутренними целями
    // static объекты (улей) вообще не двигаются
    return;
}
```

### Исправление 2: Отключена проверка радиуса для спавнеров

**Код ПОСЛЕ исправления**:
```javascript
// Получаем стратегии движения и атаки для дальнейших проверок
const movementData = this.config.get('movement', {});
const movementStrategy = (movementData && movementData.strategy) || 'linear';
const attackConfig = this.config.get('attack', {});
const attackStrategy = attackConfig.strategy || 'simple';

// Для стратегии 'spawn' и статичных объектов не проверяем расстояние до цели
// Они спавнят по таймеру независимо от позиции
const needsRangeCheck = attackStrategy !== 'spawn' && movementStrategy !== 'static' && movementStrategy !== 'spawner';

if (attackSystem && attackStrategy !== 'none') {
    // Для спавнеров проверяем только наличие системы атаки
    // Для остальных проверяем и радиус
    if (!needsRangeCheck || (attackSystem.isInRange && attackSystem.isInRange())) {
        this.setState('attacking');
        attackSystem.attack(this.currentTarget);
        return;
    }
}
```

**Логика**:
1. Если `attackStrategy === 'spawn'` → не проверяем радиус (спавн по таймеру)
2. Если `movementStrategy === 'static'` → не проверяем радиус (статичный спавнер)
3. Если `movementStrategy === 'spawner'` → не проверяем радиус (специальный спавнер)
4. Для всех остальных → проверяем радиус (обычная атака)

## Измененные файлы

- `src/systems/core/AICoordinator.js`:
  - Строки 218-226: Добавлена логика определения необходимости проверки радиуса
  - Строки 228-235: Изменена проверка атаки с учетом типа спавнера
  - Строка 240: Добавлена проверка на `'static'` для pathfinding
  - Строка 265: Добавлена проверка на `'static'` для передачи цели

## Проверка исправления

После применения изменений:
1. Запустите игру
2. Дождитесь появления улья (минута 1 в текущей конфигурации для теста)
3. Улей должен оставаться неподвижным
4. Каждые 8 секунд улей должен спавнить 1-3 осы в круговом порядке вокруг себя
5. В консоли должны быть логи:
   ```
   [SPAWNDBG][hive:xxx] init: get(cooldown=undefined, interval=8000, min=1, max=3, type=wasp...)
   [SPAWNDBG][hive:xxx] canSpawn? dt=8100>=8000, spawned=0<10, cond=true -> true
   [SPAWNDBG][hive:xxx] performSpawn: count=2 range=80 type=wasp dir=circle
   [SPAWNDBG][hive:xxx] emit enemy:spawn -> wasp at (100.0, 200.0)
   ```

## Сравнение типов спавна

### Регулярный спавн (attack.strategy: 'spawn')
- **Триггер**: По таймеру (spawnInterval/cooldown)
- **Условие**: Время с последнего спавна > интервал
- **Проверка радиуса**: НЕТ (после исправления)
- **Примеры**: улей, паучиха, оса (при атаке)

### Спавн по урону (damageSpawn.strategy: 'damageSpawn')
- **Триггер**: При получении урона
- **Условие**: Получен урон
- **Проверка радиуса**: НЕТ
- **Примеры**: улей (пчелы при атаке)

## Архитектурные выводы

### Типы спавнеров

1. **Мобильные спавнеры** (`movementStrategy !== 'static'`):
   - Движутся к цели
   - Могут спавнить на ходу (оса)
   - Могут спавнить при достижении цели (паучиха)
   - Проверка радиуса: зависит от настроек

2. **Статичные спавнеры** (`movementStrategy === 'static'`):
   - Не двигаются
   - Спавнят по таймеру независимо от расстояния до цели
   - Проверка радиуса: НЕТ (после исправления)
   - Примеры: улей

3. **Специальные спавнеры** (`movementStrategy === 'spawner'`):
   - Зарезервировано для будущего использования
   - Аналогичны статичным спавнерам

### Рекомендации по конфигурации

Для **статичных спавнеров** (улей):
```javascript
{
    movement: {
        strategy: 'static',  // Обязательно 'static'
        speed: 0
    },
    attack: {
        strategy: 'spawn',   // Обязательно 'spawn'
        spawnInterval: 8000, // Интервал спавна в мс
        minSpawnCount: 1,    // Минимум врагов за раз
        maxSpawnCount: 3,    // Максимум врагов за раз
        spawnRange: 80,      // Радиус вокруг спавнера
        spawnType: 'wasp',   // Тип спавнимых врагов
        spawnDirection: 'circle' // Направление (circle/target)
        // НЕ НУЖНО: range, damage
    }
}
```

Для **мобильных спавнеров** (оса, паучиха):
```javascript
{
    movement: {
        strategy: 'orbital', // Любая стратегия движения
        speed: 120
    },
    attack: {
        strategy: 'spawn',
        spawnInterval: 3000,
        range: 100,          // НУЖНО: радиус для начала спавна
        minSpawnCount: 1,
        maxSpawnCount: 1,
        spawnType: 'projectile'
    }
}
```

## Дополнительные замечания

### Почему у осы работало до исправления?

Оса использует:
- `movement.strategy: 'orbital'` - движется к цели
- `attack.range: 100` - есть радиус атаки
- Оса приближается к яйцу на расстояние < 100
- `isInRange()` возвращает `true`
- Спавн происходит

### Почему у паучихи работало?

Паучиха использует:
- `movement.strategy: 'linear'` - движется к цели
- `attack.range` не указан (по умолчанию 0 из Enemy.js)
- Но паучиха приближается к яйцу вплотную
- Расстояние становится очень малым
- `isInRange()` иногда возвращает `true`
- Спавн происходит (но не всегда стабильно)

### Почему у улья не работало?

Улей использует:
- `movement.strategy: 'static'` - не двигается
- `attack.range` не указан (по умолчанию 0)
- Улей может быть далеко от яйца
- Расстояние всегда > 0
- `isInRange()` всегда возвращает `false`
- Спавн НИКОГДА не происходит

## Связанные исправления

Это исправление является продолжением:
- `docs/bugfix-wasp-spawn.md` - исправление порядка приоритетов в SystemConfig

Оба исправления необходимы для корректной работы спавна.

