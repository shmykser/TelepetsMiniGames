# 🔧 План рефакторинга системы замков

## 📊 **Анализ текущей архитектуры**

### **Проблемы:**

1. **Дублирование кода:** 
   - `create()`, `update()`, `shutdown()` содержат похожую логику в каждой сцене
   - Создание UI элементов дублируется
   - Обработка успеха/провала дублируется

2. **Нарушение SRP (Single Responsibility Principle):**
   - Сцены отвечают И за рендеринг, И за игровую логику
   - `Lock.js` знает о сценах, но не содержит игровую логику

3. **Слабое наследование:**
   - `BaseLockScene` содержит только базовый UI
   - Нет контроллеров для логики
   - Нет наследования в `Lock.js`

4. **Мертвый код:**
   - Неиспользуемые методы в `Lock.js` (getGameConfig)
   - Устаревшие комментарии

---

## 🎯 **Целевая архитектура**

```
Lock (abstract)
├── SimpleLock
├── MazeLock
└── PatternLock

LockController (abstract)
├── SimpleLockController
├── MazeLockController
└── PatternLockController

BaseLockScene
├── SimpleLockScene (тонкий слой: create + update + shutdown)
├── MazeLockScene (тонкий слой: create + update + shutdown)
└── PatternLockScene (тонкий слой: create + update + shutdown)
```

### **Разделение ответственности:**

| Компонент | Ответственность |
|-----------|-----------------|
| **Lock** | Данные замка, конфигурация, состояние (locked/unlocked) |
| **LockController** | Игровая логика, создание элементов, обработка ввода |
| **LockScene** | Phaser lifecycle (create/update/shutdown), делегирование в контроллер |

---

## 📁 **Новая структура файлов**

```
src/
├── objects/
│   ├── Lock.js                    // Базовый абстрактный класс
│   ├── SimpleLock.js              // Специфичный для простого замка
│   ├── MazeLock.js                // Специфичный для лабиринта
│   └── PatternLock.js             // Специфичный для паттерна
├── controllers/lockpicking/
│   ├── LockController.js          // Базовый контроллер
│   ├── SimpleLockController.js    // Логика простого замка
│   ├── MazeLockController.js      // Логика лабиринта
│   └── PatternLockController.js   // Логика паттерна
└── scenes/lockpicking/
    ├── BaseLockScene.js           // Базовая сцена
    ├── SimpleLockScene.js         // Тонкий слой (50-100 строк)
    ├── MazeLockScene.js           // Тонкий слой (50-100 строк)
    └── PatternLockScene.js        // Тонкий слой (50-100 строк)
```

---

## 🔧 **Детальный план**

### **Этап 1: Создать контроллеры**

**1.1 LockController.js (базовый)**
```javascript
export class LockController {
    constructor(scene, config, pet) {
        this.scene = scene;
        this.config = config;
        this.pet = pet;
        this.isGameActive = false;
    }
    
    // Абстрактные методы (должны быть реализованы в наследниках)
    createGameElements() { throw new Error('Not implemented'); }
    update(time, delta) { throw new Error('Not implemented'); }
    handleInput() { throw new Error('Not implemented'); }
    checkWinCondition() { return false; }
    cleanup() {}
    
    // Общие методы
    onSuccess() {
        this.scene.onSuccess();
    }
    
    onFailure() {
        this.scene.onFailure();
    }
}
```

**1.2 SimpleLockController.js**
- Переносим всю логику пинов, индикатора, проверки попадания
- Методы: `createPins()`, `createIndicator()`, `tryPick()`, `handleFailure()`, etc.

**1.3 MazeLockController.js**
- Переносим логику лабиринта, шарика, врагов, порталов, ключей
- Методы: `createMaze()`, `createBall()`, `createEnemies()`, `createPortals()`, `createKeys()`, etc.

**1.4 PatternLockController.js**
- Переносим логику сетки, генерации путей, рисования линий
- Методы: `generatePairs()`, `createGrid()`, `onPointerMove()`, `checkIntersections()`, etc.

---

### **Этап 2: Рефакторинг Lock.js**

**2.1 Создать наследование:**

```javascript
// Lock.js (базовый)
export class Lock {
    constructor(scene, x, y, config) {
        this.scene = scene;
        this.type = config.type;
        this.level = config.level;
        // ... общие свойства
    }
    
    // Общие методы
    tryPick(pet) { ... }
    onPickSuccess() { ... }
    onPickFailed() { ... }
    
    // Абстрактные методы
    getLockSceneKey() { throw new Error('Not implemented'); }
    createTypeSpecificVisuals() { throw new Error('Not implemented'); }
}

// SimpleLock.js
export class SimpleLock extends Lock {
    getLockSceneKey() { return 'SimpleLockScene'; }
    createTypeSpecificVisuals() { /* простой замок */ }
}

// MazeLock.js
export class MazeLock extends Lock {
    getLockSceneKey() { return 'MazeLockScene'; }
    createTypeSpecificVisuals() { /* лабиринт */ }
}

// PatternLock.js
export class PatternLock extends Lock {
    getLockSceneKey() { return 'PatternLockScene'; }
    createTypeSpecificVisuals() { /* паттерн */ }
}
```

---

### **Этап 3: Упростить сцены**

**Пример SimpleLockScene.js (ПОСЛЕ рефакторинга):**

```javascript
import { BaseLockScene } from './BaseLockScene.js';
import { SimpleLockController } from '../../controllers/lockpicking/SimpleLockController.js';

export class SimpleLockScene extends BaseLockScene {
    constructor() {
        super('SimpleLockScene');
        this.controller = null;
    }
    
    create() {
        super.create();
        
        // Создаем контроллер
        this.controller = new SimpleLockController(this, this.config, this.pet);
        
        // Создаем UI
        this.createBaseUI('🔓 ВЗЛОМ ПРОСТОГО ЗАМКА');
        
        // Делегируем создание игровых элементов контроллеру
        this.controller.createGameElements();
        
        // Игра активна
        this.isGameActive = true;
    }
    
    update(time, delta) {
        if (!this.isGameActive || !this.controller) return;
        this.controller.update(time, delta);
    }
    
    shutdown() {
        if (this.controller) {
            this.controller.cleanup();
            this.controller = null;
        }
        super.shutdown();
    }
}
```

**Результат:** Сцена ~50 строк вместо 400+

---

### **Этап 4: Удалить дублирование**

**4.1 В BaseLockScene:**
- Вынести общие методы: `onSuccess()`, `onFailure()`, `incrementAttempts()`
- Унифицировать создание кнопок

**4.2 Удалить мертвый код:**
- `Lock.js::getGameConfig()` - не используется
- `Lock.js::getInfo()` - не используется
- Устаревшие комментарии про HTMLButton

**4.3 Константы:**
- Вынести магические числа в константы (размеры, цвета, скорости)

---

## ✅ **Преимущества новой архитектуры**

1. **Разделение ответственности:**
   - Сцены: только Phaser lifecycle
   - Контроллеры: только игровая логика
   - Lock классы: только данные и состояние

2. **Переиспользование:**
   - Контроллеры можно использовать вне сцен (тестирование)
   - Логика не зависит от Phaser Scene

3. **Тестируемость:**
   - Контроллеры можно тестировать без Phaser
   - Чистые функции без побочных эффектов

4. **Расширяемость:**
   - Новый тип замка = 3 новых файла (Lock + Controller + Scene)
   - Не нужно трогать существующий код

5. **Читаемость:**
   - Сцены ~50 строк
   - Контроллеры ~200-300 строк
   - Lock классы ~100 строк

---

## 📊 **Метрики**

| Файл | До (строк) | После (строк) | Изменение |
|------|------------|---------------|-----------|
| SimpleLockScene | 466 | ~50 | -89% |
| MazeLockScene | 1152 | ~60 | -95% |
| PatternLockScene | 1187 | ~60 | -95% |
| Lock.js | 392 | ~150 | -62% |
| **НОВЫЕ файлы** | | |
| SimpleLockController | 0 | ~250 | +NEW |
| MazeLockController | 0 | ~400 | +NEW |
| PatternLockController | 0 | ~350 | +NEW |
| SimpleLock.js | 0 | ~80 | +NEW |
| MazeLock.js | 0 | ~80 | +NEW |
| PatternLock.js | 0 | ~80 | +NEW |
| **ИТОГО** | 3197 | ~1560 | **-51%** |

---

## ⚠️ **Риски и сложности**

1. **Большой объем работы:** ~3000 строк кода для рефакторинга
2. **Тестирование:** Нужно протестировать все 3 типа замков после изменений
3. **Обратная совместимость:** Убедиться что `Lock.tryPick()` работает с новыми классами

---

## 📝 **Порядок выполнения**

1. ✅ **Анализ** (текущий этап)
2. Создать `LockController.js` (базовый)
3. Создать `SimpleLockController.js` + тесты
4. Рефакторинг `SimpleLockScene.js`
5. Создать `SimpleLock.js`
6. Повторить для `MazeLock` и `PatternLock`
7. Рефакторинг `Lock.js` (убрать `getLockSceneKey` в наследники)
8. Удалить мертвый код
9. Финальное тестирование

---

## 🎯 **Ожидаемый результат**

- ✅ Код сокращен на 50%
- ✅ Нет дублирования
- ✅ Четкое разделение ответственности
- ✅ Легко добавлять новые типы замков
- ✅ Легко тестировать
- ✅ Сцены стали "тонкими" (50-60 строк)

