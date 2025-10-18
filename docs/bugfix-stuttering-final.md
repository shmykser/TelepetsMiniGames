# Исправление рывков (stuttering) у врагов с положительным attack.range

## Проблема

Жук (beetle) и паук (spider) двигались рывками - секунду движения, затем секунда остановки, и так по кругу. При этом муравей (ant) двигался плавно и непрерывно.

## Причина

Корневая причина была в методе `isTargetReached()` класса `LinearMovementStrategy`.

### Механизм бага:

1. **Неправильное использование `effectiveAttackRange`**:
   - `LinearMovementStrategy.isTargetReached()` использовала `GeometryUtils.effectiveAttackRange()` для проверки достижения **любой** цели движения
   - Эта функция вычисляет эффективный радиус атаки с учетом размеров объектов и базового `attack.range`
   - Для жука: `attack.range = 35` → `effectiveRange ≈ 90` пикселей
   - Для паука: `attack.range = 0` → `effectiveRange ≈ 55` пикселей
   - Для муравья: `attack.range = -40` (отрицательный!) → `effectiveRange ≈ 10-15` пикселей

2. **Проблема с waypoints**:
   - При движении с pathfinding, враги проходят через промежуточные точки (waypoints)
   - `isTargetReached()` проверяла waypoint с большим `effectiveRange`
   - Жук/паук "достигали" waypoint слишком рано (на расстоянии 90/55 пикселей)
   - Враг останавливался, даже если не был реально в точке
   - Через секунду `MovementSystem.update()` вызывал следующий waypoint, и цикл повторялся

3. **Почему муравей не страдал**:
   - У муравья `attack.range = -40` (отрицательный)
   - `effectiveRange` получался очень маленьким (около 10 пикселей)
   - Муравей должен был реально достичь waypoint, чтобы `isTargetReached()` вернул `true`
   - Поэтому движение было плавным

### Последовательность в логах:

```
🐞 [beetle] Результат атаки: ❌ НЕУДАЧА (продолжаем движение, doAttack=false)
🐞 [beetle] 📍 КОД ДОШЕЛ ДО СЕКЦИИ ДВИЖЕНИЯ
🐞 [beetle] 🗺️ ИСПОЛЬЗУЕМ PATHFINDING
🐞 [MovementSystem] moveAlongPath вызван
🐞 [LinearStrategy] moveToTarget: дистанция=0, effectiveRange=90, targetReached=true
🐞 [LinearStrategy] ⛔ ЦЕЛЬ ДОСТИГНУТА - ОСТАНАВЛИВАЕМСЯ
```

Враг останавливался в `LinearMovementStrategy`, даже если только начал движение по пути!

## Решение

Заменили `effectiveAttackRange` на фиксированный `MOVEMENT_TOLERANCE = 10` пикселей в методе `isTargetReached()`.

### Обоснование:

1. **Разделение ответственности**:
   - Задача `MovementStrategy` - довести объект до точки назначения (waypoint или финальная цель)
   - Проверка радиуса атаки - задача `AttackSystem.isInRange()`
   - Эти два расчета НЕ должны пересекаться

2. **Единый tolerance для всех врагов**:
   - 10 пикселей достаточно для точного достижения waypoints
   - Все враги (муравей, жук, паук) теперь используют одинаковую логику движения
   - Нет зависимости от `attack.range`, который не имеет отношения к движению

3. **Сохранение атакующего поведения**:
   - `AICoordinator.coordinateSystems()` всё ещё проверяет `attackSystem.isInRange()` перед атакой
   - Если враг в радиусе и cooldown прошёл - он атакует и останавливается
   - Если враг в радиусе, но cooldown НЕ прошёл - он продолжает двигаться (исправление предыдущего бага)
   - Если враг вне радиуса - он двигается по пути

## Изменения

### `src/systems/strategies/movement/LinearMovementStrategy.js`

```javascript
isTargetReached(target) {
    if (!target || !this.gameObject) return false;
    const distance = GeometryUtils.distance(this.gameObject.x, this.gameObject.y, target.x, target.y);
    
    // Используем фиксированный tolerance для достижения точек движения (waypoints или финальной цели)
    // Это НЕ то же самое что attack range - радиус атаки проверяется в AttackSystem.isInRange()
    // Задача стратегии движения - просто довести объект до точки назначения, а не проверять радиус атаки
    const MOVEMENT_TOLERANCE = 10;
    
    return distance <= MOVEMENT_TOLERANCE;
}
```

**Удалено:**
```javascript
// Старый код:
const effectiveRange = GeometryUtils.effectiveAttackRange(
    this.gameObject,
    target,
    this.attackRange
);
return distance <= effectiveRange;
```

### Удалены отладочные логи

Удалены все `console.log` для жука и паука из:
- `src/systems/strategies/movement/LinearMovementStrategy.js`
- `src/systems/core/AICoordinator.js`
- `src/systems/core/MovementSystem.js`
- `src/systems/core/AttackSystem.js`

## Тестирование

1. Запустить игру
2. Заспавнить жуков, пауков и муравьёв
3. Разместить камни на пути врагов (чтобы активировать pathfinding)
4. Проверить, что все враги двигаются плавно, без рывков
5. Проверить, что враги корректно атакуют:
   - Останавливаются только когда cooldown прошёл
   - Продолжают двигаться если в радиусе, но cooldown не прошёл

## Связанные баги

Это исправление дополняет предыдущее исправление в `AICoordinator.coordinateSystems()`, где мы исправили логику:
- Теперь враг останавливается ТОЛЬКО если `attackSystem.attack()` вернёт `true` (cooldown прошёл)
- Если cooldown НЕ прошёл, враг продолжает движение, даже находясь в радиусе атаки

Оба исправления вместе обеспечивают плавное и корректное поведение врагов.

## Дата
18.10.2025

