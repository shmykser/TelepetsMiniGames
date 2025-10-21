# 🎮 ПЛАН РЕАЛИЗАЦИИ PET THIEF v2.0

> **Источник**: [Notion - Pet Thief](http://notion.so/Pet-Thief-262ac611cc1d8077a856e6971488a55f)

---

## 📖 КОНЦЕПЦИЯ ИГРЫ

**Pet Thief** - игра о хитрости и защите, где игроки управляют питомцем в открытом мире природных биомов. Основная механика: красть ценности из жилищ других игроков и защищать свой дом от воров.

---

## 🎯 ЭТАП 1: ОТКРЫТЫЙ МИР И БАЗОВОЕ ПЕРЕМЕЩЕНИЕ

### 1.1 Генератор открытого мира (WorldGenerator)

**Цель**: Создать процедурно генерируемый открытый мир с биомами

**Локация**: `src/systems/world/WorldGenerator.js`

**Требования из Notion**:
- Мир динамически меняется каждые 24 часа
- Несколько небольших локаций с жилищами игроков
- Различные биомы с уникальными особенностями
- Случайно появляющиеся жилища (3-8 штук)

**Функционал**:
- ✅ Генерация открытого мира (например, 3000x3000 пикселей)
- ✅ Процедурная генерация биомов (Perlin noise / Simplex noise)
- ✅ Типы биомов:
  - `FOREST` - лес (травяной фон, деревья)
  - `DESERT` - пустыня (песок, кактусы)
  - `SNOW` - снежные равнины (снег, камни)
  - `PLAINS` - поля (трава, цветы)
- ✅ Размещение жилищ игроков (3-8 штук, случайно)
- ✅ Размещение препятствий (деревья, камни, кустарники)
- ✅ Размещение монет по миру
- ✅ Seed для воспроизводимости (для 24-часового цикла)

**Структура данных**:
```javascript
{
  seed: '2025-10-19', // Дата для 24-часового цикла
  size: { width: 3000, height: 3000 },
  biomes: [
    {
      type: 'FOREST',
      polygon: [...], // Полигон биома
      obstacles: [],
      items: []
    }
  ],
  houses: [
    {
      id: 'house_player_123',
      ownerId: 'player_123',
      ownerName: 'Vasya',
      position: { x: 500, y: 800 },
      biome: 'FOREST',
      security: {
        lockType: 'simple', // simple | digital | alarm
        level: 1,
        traps: []
      },
      treasures: {
        coins: 100,
        jewels: 5
      },
      ownerOnline: false
    }
  ],
  playerHouse: {
    id: 'house_player_current',
    position: { x: 1500, y: 1500 } // Центр мира
  }
}
```

**Использование существующих систем**:
- `GeometryUtils` - расчеты геометрии
- `BackgroundUtils` - фон биомов

---

### 1.2 Рендеринг мира (WorldRenderer)

**Цель**: Отрисовка открытого мира с прокруткой камеры

**Локация**: `src/systems/world/WorldRenderer.js`

**Требования**:
- Камера следует за питомцем
- Прокрутка мира (bounds)
- Отрисовка биомов
- Отрисовка препятствий
- Отрисовка жилищ

**Функционал**:
- ✅ Инициализация Phaser Camera
- ✅ Follow камеры за питомцем
- ✅ Bounds мира
- ✅ Отрисовка тайлов биомов
- ✅ Отрисовка объектов (препятствия, жилища)
- ✅ Мини-карта (опционально на будущее)

**Использование Phaser**:
```javascript
// Настройка камеры
this.cameras.main.setBounds(0, 0, world.size.width, world.size.height);
this.cameras.main.startFollow(pet, true, 0.1, 0.1);
this.cameras.main.setZoom(1);
```

**Использование существующих систем**:
- `BackgroundUtils.createAnimatedGrassBackground()` - для травяных биомов
- `DEPTH_CONSTANTS` - глубина объектов

---

### 1.3 Питомец игрока (Pet)

**Цель**: Управляемый персонаж с инвентарем

**Локация**: `src/objects/Pet.js`

**Базовый класс**: `GameObject`

**Функционал**:
- ✅ Создание питомца
- ✅ Движение по миру
- ✅ Инвентарь (монеты, ценности)
- ✅ Здоровье
- ✅ Анимации

**Свойства**:
```javascript
{
  speed: 150,
  texture: '🐾',
  spriteKey: 'pet',
  size: 2,
  health: 100,
  inventory: {
    coins: 0,
    keys: 0,
    lockpicks: 0, // Отмычки
    treasures: []
  },
  skills: {
    lockpicking: 0, // Навык взлома
    stealth: 0,     // Скрытность
    tracking: 0     // Отслеживание
  }
}
```

**Использование существующих систем**:
- `GameObject` - базовый класс
- `MovementSystem` - стратегия `linear`
- `HealthBar` - отображение здоровья

---

### 1.4 Система управления питомцем (PetControlSystem)

**Цель**: Управление по тапу с обходом препятствий

**Локация**: `src/systems/PetControlSystem.js`

**Функционал**:
- ✅ Обработка тапа по миру
- ✅ Расчет пути с обходом препятствий
- ✅ Движение по пути
- ✅ Взаимодействие с объектами:
  - Монеты → автосбор при касании
  - Жилище → вход внутрь
  - Препятствия → обход

**Использование существующих систем**:
- `GestureSystem.onTap` - обработка тапов
- `PathfindingSystem` - поиск пути
- `MovementSystem` - движение
- `GeometryUtils` - расчеты

**Логика**:
```javascript
onTap(gesture) {
  const worldX = this.camera.scrollX + gesture.endX;
  const worldY = this.camera.scrollY + gesture.endY;
  
  // Проверяем клик на объект
  const clickedObject = this.getObjectAt(worldX, worldY);
  
  if (clickedObject) {
    if (clickedObject.type === 'house') {
      this.moveToAndEnter(clickedObject);
    } else if (clickedObject.type === 'coin') {
      this.moveToAndCollect(clickedObject);
    }
  } else {
    // Просто перемещение
    this.moveTo(worldX, worldY);
  }
}
```

---

### 1.5 Жилища игроков (House)

**Цель**: Интерактивные дома с двумя режимами (внешний вид + интерьер)

**Локация**: `src/objects/House.js`

**Базовый класс**: `GameObject`

**Функционал**:
- ✅ Внешний вид (спрайт дома на карте)
- ✅ Вход в дом (смена сцены/режима)
- ✅ Интерьер (комната с предметами)
- ✅ Владелец (информация об игроке)
- ✅ Защита (замки, ловушки)

**Свойства**:
```javascript
{
  ownerId: 'player_123',
  ownerName: 'Vasya',
  ownerOnline: false,
  position: { x: 500, y: 800 },
  biome: 'FOREST',
  
  security: {
    lockType: 'simple', // simple | digital | alarm
    level: 1,
    traps: [],
    cameras: false
  },
  
  interior: {
    layout: 'small', // small | medium | large
    treasures: [
      { type: 'coin', amount: 50, visible: true },
      { type: 'jewel', amount: 3, visible: true },
      { type: 'coin', amount: 50, visible: false } // Сундук с двойным дном
    ]
  },
  
  traces: [] // След если была попытка кражи
}
```

---

### 1.6 Сцена интерьера дома (HouseInteriorScene)

**Цель**: Отдельная сцена для внутренности дома

**Локация**: `src/scenes/HouseInteriorScene.js`

**Функционал**:
- ✅ Отрисовка комнаты
- ✅ Размещение сундуков с ценностями
- ✅ Размещение ловушек
- ✅ Кнопка выхода
- ✅ Взаимодействие с предметами

**Переход**:
```javascript
// При входе в дом
this.scene.start('HouseInteriorScene', {
  houseData: house,
  returnPosition: { x: pet.x, y: pet.y }
});

// При выходе
this.scene.start('PetThiefScene', {
  returnPosition: houseData.position
});
```

---

### 1.7 Новая игровая сцена (PetThiefScene)

**Цель**: Основная сцена открытого мира

**Локация**: `src/scenes/PetThiefScene.js`

**Базовый класс**: `Phaser.Scene`

**Структура**:
```javascript
class PetThiefScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PetThiefScene' });
  }
  
  create(data) {
    // 1. Генерация/загрузка мира
    this.worldGenerator = new WorldGenerator(seed);
    this.world = data.world || this.worldGenerator.generate();
    
    // 2. Рендеринг мира
    this.worldRenderer = new WorldRenderer(this, this.world);
    this.worldRenderer.render();
    
    // 3. Создание питомца
    const startPos = data.returnPosition || this.world.playerHouse.position;
    this.pet = Pet.CreatePet(this, startPos.x, startPos.y);
    
    // 4. Настройка камеры
    this.setupCamera();
    
    // 5. Системы
    this.eventSystem = new EventSystem();
    this.petControlSystem = new PetControlSystem(this, this.pet);
    this.obstacleInteractionSystem = new ObstacleInteractionSystem(this);
    
    // 6. Создание жилищ
    this.createHouses();
    
    // 7. Создание монет
    this.createCoins();
    
    // 8. UI
    this.setupUI();
    
    // 9. События
    this.setupEvents();
  }
  
  setupCamera() {
    this.cameras.main.setBounds(0, 0, this.world.size.width, this.world.size.height);
    this.cameras.main.startFollow(this.pet, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
  }
  
  update(time, delta) {
    this.petControlSystem.update(time, delta);
    this.worldRenderer.update(time, delta);
  }
}
```

---

## 🗂️ СТРУКТУРА ФАЙЛОВ

### Новые файлы:
```
src/
├── scenes/
│   ├── PetThiefScene.js           # Основная сцена открытого мира
│   └── HouseInteriorScene.js      # Сцена интерьера дома
├── objects/
│   ├── Pet.js                     # Класс питомца
│   └── House.js                   # Класс жилища
├── systems/
│   ├── world/
│   │   ├── WorldGenerator.js      # Генератор открытого мира
│   │   └── WorldRenderer.js       # Рендеринг мира
│   └── PetControlSystem.js        # Управление питомцем
└── types/
    ├── worldTypes.js              # Типы биомов, конфигурации
    └── houseTypes.js              # Типы жилищ, защиты
```

---

## 📊 ЭТАПЫ РАЗРАБОТКИ

### ✅ **Фаза 1: Минимальный рабочий прототип** (Текущая)

**Цель**: Игрок может ходить по открытому миру и собирать монеты

1. ✅ WorldGenerator - генерация простого мира (один биом - трава)
2. ✅ WorldRenderer - отрисовка мира
3. ✅ Pet - создание питомца
4. ✅ PetControlSystem - клик → движение
5. ✅ Camera - следование за питомцем
6. ✅ Монеты - размещение и сбор
7. ✅ Инвентарь UI - отображение собранных монет
8. ✅ PetThiefScene - сборка всего вместе

**Результат**: Можно ходить, собирать монеты, видеть мир

---

### 🔄 **Фаза 2: Жилища и базовое взаимодействие**

**Цель**: Можно зайти в дом и увидеть ценности

9. ✅ House - объект жилища на карте
10. ✅ HouseInteriorScene - сцена интерьера
11. ✅ Переход внутрь/наружу дома
12. ✅ Сундуки с ценностями в доме
13. ✅ Простой сбор ценностей (без защиты)

**Результат**: Можно войти в дом и взять ценности

---

### 🔐 **Фаза 3: Системы защиты и взлома**

**Цель**: Реализовать замки и мини-игру взлома

14. ✅ Простой замок на двери
15. ✅ Мини-игра взлома (подбор пинов)
16. ✅ Отмычки в инвентаре
17. ✅ Цифровой замок
18. ✅ Головоломка для цифрового замка (пятнашки)

**Результат**: Нужно взломать замок чтобы войти

---

### 👣 **Фаза 4: Система следов и возмездия**

**Цель**: Следы после кражи, возможность мести

19. ✅ След остается после неудачной кражи
20. ✅ Показ следа до дома вора
21. ✅ Кнопка "Выследить вора"
22. ✅ Телепорт к дому вора
23. ✅ Ответная кража

**Результат**: Круговорот воров и жертв

---

### 🌍 **Фаза 5: Множественные биомы**

**Цель**: Разнообразие мира

24. ✅ Генерация нескольких биомов (Perlin noise)
25. ✅ Разные текстуры для биомов
26. ✅ Биом-специфичные препятствия
27. ✅ Жилища соответствуют биому

**Результат**: Интересный разнообразный мир

---

### 🎮 **Фаза 6: Расширенная механика**

**Цель**: Полная функциональность из Notion

28. ✅ Сигнализация (уведомление через Telegram)
29. ✅ Ловушки в домах
30. ✅ Предметы (пушистый хвост, дымовая шашка)
31. ✅ Погода (дождь, туман)
32. ✅ Время суток
33. ✅ Рейтинговая система
34. ✅ Развитие навыков (три пути)

**Результат**: Полная игра как в Notion

---

## 🔧 ТЕХНИЧЕСКИЕ ДЕТАЛИ

### Генерация мира (Perlin Noise)

Для создания природных биомов используем библиотеку noise:

```javascript
import { createNoise2D } from 'simplex-noise';

const noise2D = createNoise2D();

function getBiome(x, y) {
  const temperature = noise2D(x / 500, y / 500);
  const humidity = noise2D((x + 1000) / 500, (y + 1000) / 500);
  
  if (temperature > 0.5) return 'DESERT';
  if (temperature < -0.5 && humidity < 0) return 'SNOW';
  if (humidity > 0.3) return 'FOREST';
  return 'PLAINS';
}
```

### События

**EventSystem** - новые события:
- `WORLD_GENERATED` - мир сгенерирован
- `PET_MOVE_START` - питомец начал движение
- `PET_MOVE_COMPLETE` - питомец достиг цели
- `COIN_COLLECTED` - монета собрана
- `HOUSE_ENTERED` - вход в дом
- `HOUSE_EXITED` - выход из дома
- `LOCKPICKING_START` - начало взлома
- `LOCKPICKING_SUCCESS` - успешный взлом
- `LOCKPICKING_FAILED` - провал взлома
- `TREASURE_STOLEN` - ценность украдена
- `TRAP_TRIGGERED` - ловушка сработала
- `TRACE_LEFT` - след оставлен
- `OWNER_RETURNED` - владелец вернулся

---

## 🎨 ВИЗУАЛЬНЫЙ СТИЛЬ

### Биомы:
- **FOREST** 🌲: Зеленый травяной фон, деревья, кусты
- **DESERT** 🏜️: Песочный фон, кактусы, камни
- **SNOW** ❄️: Белый снежный фон, елки, сугробы
- **PLAINS** 🌾: Светло-зеленый фон, цветы, трава

### Жилища:
- **FOREST**: Деревянная избушка 🏡
- **DESERT**: Глиняный дом 🏠
- **SNOW**: Иглу ⛺
- **PLAINS**: Фермерский домик 🏘️

---

## ❓ ВОПРОСЫ И РЕШЕНИЯ

### ✅ 1. Размер мира
**Решение**: 3000x3000 пикселей (достаточно для исследования)

### ✅ 2. Камера
**Решение**: Следует за питомцем с плавностью 0.1

### ✅ 3. Переход между домами
**Решение**: Мгновенная смена сцены

### ✅ 4. Тип мира
**Решение**: Открытый с множеством путей, процедурная генерация

### ✅ 5. Визуализация
**Решение**: Травяной фон + текстуры/спрайты для объектов

### ✅ 6. Враги
**Решение**: Пока без врагов

### ✅ 7. Предметы
**Решение**: Только монеты для начала

### ✅ 8. Жилища
**Решение**: 3-8 жилищ, вход → смена сцены на интерьер

---

## 🚀 НАЧИНАЕМ С ФАЗЫ 1

### Минимальный прототип включает:

1. **WorldGenerator** - простой мир с травой
2. **WorldRenderer** - отрисовка
3. **Pet** - питомец
4. **PetControlSystem** - управление
5. **Camera** - следование
6. **Coins** - сбор монет
7. **UI** - инвентарь

**Время реализации**: 2-3 часа  
**Результат**: Рабочий прототип с открытым миром

---

**Статус**: План готов ✅  
**Следующий шаг**: Создание структуры типов и начало кодирования



