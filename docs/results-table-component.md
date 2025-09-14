# 📊 Компонент ResultsTable

Компонент для отображения результатов игры в виде красивой таблицы с настраиваемыми стилями.

## 🎯 Основные возможности

- ✅ **Гибкая настройка** - название, данные, стили
- ✅ **Анимации** - плавное появление и исчезновение
- ✅ **Адаптивность** - автоматический расчет размеров
- ✅ **Контекстная стилизация** - готовые стили для разных ситуаций
- ✅ **SOLID принципы** - следует принципу единственной ответственности

## 📋 Использование

### Базовое использование

```javascript
import { ResultsTable } from '../components/ResultsTable.js';

// Создание таблицы результатов
const gameData = {
    'Время': '3:25',
    'Убито': '20',
    'Волны': '3',
    'Очки': '1,250'
};

const resultsTable = new ResultsTable(this, 400, 300, {
    title: 'Game Over',
    data: gameData,
    width: 350,
    height: 200
});
```

### Использование с готовыми стилями

```javascript
import { createResultsTable } from '../components/ResultsTable.js';

// Game Over стиль
const gameOverTable = createResultsTable(
    this, 
    400, 
    300, 
    'Game Over',
    {
        'Время': '3:25',
        'Убито': '20',
        'Волны': '3'
    },
    {
        backgroundColor: 0x8B0000,
        borderColor: 0xFF6B6B,
        titleColor: '#FFB6C1'
    }
);

// Victory стиль
const victoryTable = createResultsTable(
    this, 
    400, 
    300, 
    '🎉 Victory!',
    {
        'Время': '5:12',
        'Убито': '45',
        'Волны': '7'
    },
    {
        backgroundColor: 0x006400,
        borderColor: 0x90EE90,
        titleColor: '#98FB98'
    }
);
```

## ⚙️ Конфигурация

### Основные параметры

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `title` | string | 'Game Results' | Заголовок таблицы |
| `data` | Object | {} | Данные {ключ: значение} |
| `width` | number | 350 | Ширина таблицы |
| `height` | number | 200 | Высота таблицы |

### Стилизация

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `backgroundColor` | number | 0x000000 | Цвет фона |
| `backgroundAlpha` | number | 0.8 | Прозрачность фона |
| `borderColor` | number | 0xffffff | Цвет рамки |
| `borderWidth` | number | 2 | Толщина рамки |
| `borderRadius` | number | 10 | Радиус скругления |
| `titleColor` | string | '#ffffff' | Цвет заголовка |
| `titleFontSize` | string | '24px' | Размер шрифта заголовка |
| `textColor` | string | '#ffffff' | Цвет текста |
| `textFontSize` | string | '18px' | Размер шрифта текста |
| `padding` | number | 15 | Внутренние отступы |
| `rowSpacing` | number | 25 | Расстояние между строками |

## 🎨 Готовые стили

### Game Over (красный)
```javascript
{
    backgroundColor: 0x8B0000,
    borderColor: 0xFF6B6B,
    titleColor: '#FFB6C1',
    textColor: '#FFE4E1'
}
```

### Victory (зеленый)
```javascript
{
    backgroundColor: 0x006400,
    borderColor: 0x90EE90,
    titleColor: '#98FB98',
    textColor: '#F0FFF0'
}
```

### Статистика (синий)
```javascript
{
    backgroundColor: 0x1a1a2e,
    borderColor: 0x4a4a6a,
    titleColor: '#87CEEB',
    textColor: '#E0E0E0'
}
```

## 🎭 Анимации

### Плавное появление
```javascript
resultsTable.showAnimated(600); // 600мс анимация
```

### Плавное исчезновение
```javascript
resultsTable.hideAnimated(300); // 300мс анимация
```

## 🔧 Методы

### Обновление данных
```javascript
// Обновить данные
resultsTable.updateData({
    'Время': '4:12',
    'Убито': '25',
    'Волны': '4'
});

// Обновить заголовок
resultsTable.updateTitle('New Game Results');
```

### Изменение стилей
```javascript
// Изменить цвет фона
resultsTable.setBackgroundColor(0x2c3e50, 0.9);

// Изменить цвет текста
resultsTable.setTextColor('#3498db');

// Изменить цвет заголовка
resultsTable.setTitleColor('#e74c3c');
```

## 🎮 Примеры использования

### Результаты игры
```javascript
const gameResults = {
    'Время': formatTime(gameTime),
    'Убито врагов': enemiesKilled,
    'Пройдено волн': wavesCompleted,
    'Получено очков': totalScore,
    'Лучшая серия': bestStreak
};

const resultsTable = createResultsTable(
    this,
    this.scale.width / 2,
    this.scale.height / 2,
    gameWon ? '🎉 Victory!' : '💀 Game Over',
    gameResults
);

resultsTable.showAnimated(800);
```

### Статистика игрока
```javascript
const playerStats = {
    'Игр сыграно': player.gamesPlayed,
    'Побед': player.wins,
    'Поражений': player.losses,
    'Лучший результат': player.bestScore,
    'Средний результат': Math.round(player.totalScore / player.gamesPlayed)
};

const statsTable = createResultsTable(
    this,
    this.scale.width / 2,
    this.scale.height / 2,
    '📈 Ваша статистика',
    playerStats,
    {
        backgroundColor: 0x1a1a2e,
        borderColor: 0x4a4a6a,
        titleColor: '#87CEEB',
        textColor: '#E0E0E0'
    }
);
```

## 🎯 Интеграция с Event-Driven Architecture

Компонент можно легко интегрировать с системой событий:

```javascript
// В EffectHandler.js
handleGameEnd(data) {
    const { won, gameTime, enemiesKilled, wavesCompleted, score } = data;
    
    const resultsData = {
        'Результат': won ? 'Победа!' : 'Поражение',
        'Время': formatTime(gameTime),
        'Убито': enemiesKilled,
        'Волны': wavesCompleted,
        'Очки': score
    };
    
    const resultsTable = createResultsTable(
        this.scene,
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        won ? '🎉 Victory!' : '💀 Game Over',
        resultsData
    );
    
    resultsTable.showAnimated(800);
}
```

## 🏗️ Архитектурные принципы

- **Single Responsibility**: Компонент отвечает только за отображение результатов
- **Open/Closed**: Легко расширяется новыми стилями и анимациями
- **Dependency Inversion**: Использует абстракции UI_THEME для стилизации
- **Composition over Inheritance**: Использует композицию для создания сложных стилей

## 🎨 Context7 Integration

Компонент использует Context7-совместимую систему стилизации через `UI_THEME`, что обеспечивает:
- ✅ **Консистентность** дизайна
- ✅ **Переиспользование** стилей
- ✅ **Легкость настройки** цветов и размеров
- ✅ **Адаптивность** под разные экраны
