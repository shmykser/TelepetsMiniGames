# Исправление: Улей не спавнит ос - отсутствует maxSpawned

## Проблема

После предыдущих исправлений улей все еще не спавнил ос по таймеру. Логи показали:

```
🏠 [HIVE] SpawnAttackStrategy инициализирован: interval=8000ms, spawnType=wasp, maxSpawned=null
🏠 [HIVE] canSpawn: timeSince=10126ms >= interval=8000ms, spawned=0/null -> false
```

**Критический момент**: `maxSpawned=null`, из-за чего проверка `spawnedCount < this.maxSpawned` всегда возвращала `false`.

## Причина

В конфигурации улья (`src/types/enemyTypes.js`) **отсутствовал параметр `maxSpawned`** в секции `attack`:

```javascript
hive: {
    attack: {
        strategy: 'spawn',
        spawnInterval: 8000,
        minSpawnCount: 1,
        maxSpawnCount: 3,
        spawnRange: 80,
        spawnType: 'wasp',
        spawnDirection: 'circle'
        // ❌ maxSpawned отсутствует!
    }
}
```

Для сравнения, у других спавнеров этот параметр присутствует:
- `spiderQueen`: `maxSpawned: 20`
- `wasp`: `maxSpawned: 5`

### Почему дефолтное значение не сработало?

В `SpawnAttackStrategy.js` (строка 13):
```javascript
this.maxSpawned = this.config?.get('maxSpawned', 10);
```

Дефолтное значение (10) не применилось из-за особенности `SystemConfig.get()` при работе с вложенными источниками (строка 43 `SystemConfig.js`):

```javascript
const nestedValue = source.get(key, undefined);
if (nestedValue !== undefined) {
    value = nestedValue;
    break;
}
```

При вызове вложенного `SystemConfig` передается `undefined` вместо дефолтного значения, что приводит к возврату `null`/`undefined` вместо ожидаемого дефолта.

## Решение

Добавлен параметр `maxSpawned: 20` в конфигурацию улья:

```javascript
// src/types/enemyTypes.js
hive: {
    attack: {
        strategy: 'spawn',
        spawnInterval: 8000,
        minSpawnCount: 1,
        maxSpawnCount: 3,
        spawnRange: 80,
        spawnType: 'wasp',
        spawnDirection: 'circle',
        maxSpawned: 20  // ✅ Добавлено
    }
}
```

### Обоснование значения

- Интервал спавна: 8 секунд
- За 2 минуты игры: 120 / 8 = 15 возможных спавнов
- `maxSpawned: 20` дает запас + ограничивает максимальное количество ос от одного улья

## Изменённые файлы

- `src/types/enemyTypes.js` - добавлен `maxSpawned: 20` для улья

## Проверка

После исправления логи должны показать:
```
🏠 [HIVE] SpawnAttackStrategy инициализирован: interval=8000ms, spawnType=wasp, maxSpawned=20
🏠 [HIVE] canSpawn: timeSince=10126ms >= interval=8000ms, spawned=0/20 -> true
🏠 [HIVE] performSpawn: spawning 2x wasp at range=80
🏠 [HIVE] Spawned: 2 enemies, total=2/20
```

## Связанные исправления

Это третье исправление в серии проблем со спавном улья:
1. **bugfix-wasp-spawn.md** - исправлен приоритет конфигурации в `SystemConfig`
2. **bugfix-hive-spawn-final.md** - исправлена логика вызова `attack()` для стратегии 'spawn'
3. **bugfix-hive-maxspawned.md** (текущее) - добавлен отсутствующий параметр `maxSpawned`

Все три проблемы были необходимы для полного решения задачи.

