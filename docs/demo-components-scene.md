# 🎨 Сцена DemoComponents

Интерактивная демонстрация всех UI компонентов проекта с навигацией и примерами использования.

## 🎯 Основные возможности

- ✅ **Полная демонстрация** всех UI компонентов
- ✅ **Интерактивная навигация** между демо
- ✅ **Живые примеры** использования компонентов
- ✅ **Адаптивный дизайн** для разных экранов
- ✅ **Анимации и эффекты** для лучшего UX

## 📋 Структура демонстрации

### 1. 📊 Таблица результатов (Results)
- **Game Over** - красная тема для поражения
- **Victory** - зеленая тема для победы  
- **Статистика** - синяя тема для статистики
- **Анимации** - плавное появление таблиц

### 2. 🔘 Кнопки (Buttons)
- **Основная кнопка** - зеленая
- **Предупреждение** - оранжевая
- **Опасность** - красная
- **Информация** - синяя
- **Вторичная** - серая
- **Обратная связь** - анимации нажатия

### 3. ❤️ Полоска здоровья (Health)
- **Полное здоровье** - зеленый (100%)
- **Хорошее здоровье** - светло-зеленый (75%)
- **Среднее здоровье** - желтый (50%)
- **Низкое здоровье** - оранжевый (25%)
- **Критическое здоровье** - красный (10%)

### 4. ⏱️ Таймер (Timer)
- **Таймер обратного отсчета** - 30 секунд
- **Кнопки управления** - Старт, Пауза, Сброс
- **Прогресс-бар** - визуальное отображение времени
- **Анимации** - плавные переходы

### 5. 💥 Индикатор урона (Damage)
- **Обычный урон** - красный текст (-50)
- **Лечение** - зеленый текст (+30)
- **Критический урон** - фиолетовый текст (-100)
- **Анимации** - летящие числа

## 🎮 Управление

### Навигация
- **◀ Назад** - предыдущее демо
- **Вперед ▶** - следующее демо
- **🏠 В меню** - возврат в главное меню

### Интерактивность
- **Кнопки** - клик для демонстрации эффектов
- **Таймер** - управление через кнопки
- **Индикатор урона** - генерация разных типов урона

## 🏗️ Архитектура

### Основные компоненты
```javascript
export class DemoComponents extends Phaser.Scene {
    constructor() {
        super({ key: 'DemoComponents' });
        
        this.components = [];        // Активные компоненты
        this.currentDemo = 0;        // Текущее демо
        this.demos = [               // Список демо
            'results',
            'buttons', 
            'health',
            'timer',
            'damage'
        ];
    }
}
```

### Структура демо
```javascript
// Пример демо кнопок
showButtonsDemo() {
    const buttonStyles = [
        {
            text: 'Основная кнопка',
            backgroundColor: 0x4CAF50,
            textColor: '#ffffff',
            y: centerY - 100
        },
        // ... другие стили
    ];
    
    buttonStyles.forEach((style, index) => {
        const button = new Button(this, centerX, style.y, {
            width: 200,
            height: 45,
            text: style.text,
            backgroundColor: style.backgroundColor,
            textColor: style.textColor
        });
        
        button.onButtonClick = () => {
            this.showButtonFeedback(button, style.text);
        };
        
        this.components.push(button);
        
        // Анимация появления
        this.animateComponent(button, index);
    });
}
```

## 🎨 Дизайн

### Цветовая схема
- **Фон**: Градиент от темно-синего к фиолетовому
- **Навигация**: Темный фон с белой рамкой
- **Кнопки**: Разные цвета для разных типов
- **Текст**: Белый с черной обводкой

### Анимации
- **Появление**: Back.easeOut с задержкой
- **Исчезновение**: Power2.easeIn
- **Нажатие**: Масштабирование 0.95
- **Наведение**: Масштабирование 1.05

## 🔧 Методы

### Управление демо
```javascript
// Показать демо
showDemo(demoType) {
    this.clearComponents();
    this.demoInfo.setText(this.getDemoTitle(demoType));
    
    switch (demoType) {
        case 'results': this.showResultsDemo(); break;
        case 'buttons': this.showButtonsDemo(); break;
        // ... другие демо
    }
}

// Навигация
nextDemo() {
    this.currentDemo = (this.currentDemo + 1) % this.demos.length;
    this.showDemo(this.demos[this.currentDemo]);
}

previousDemo() {
    this.currentDemo = (this.currentDemo - 1 + this.demos.length) % this.demos.length;
    this.showDemo(this.demos[this.currentDemo]);
}
```

### Обратная связь
```javascript
// Обратная связь для кнопок
showButtonFeedback(button, text) {
    // Анимация нажатия
    this.tweens.add({
        targets: button,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
        ease: 'Power2.easeInOut'
    });
    
    // Показ сообщения
    const feedback = this.add.text(button.x, button.y - 60, `Нажата: ${text}`);
    // ... анимация сообщения
}
```

## 🎯 Примеры использования

### Создание демо таблиц результатов
```javascript
showResultsDemo() {
    // Game Over
    const gameOverData = {
        'Время': '3:25',
        'Убито': '20', 
        'Волны': '3',
        'Очки': '1,250'
    };
    
    this.resultsTable1 = createResultsTable(
        this, centerX - 200, centerY - 50,
        'Game Over', gameOverData,
        {
            backgroundColor: 0x8B0000,
            borderColor: 0xFF6B6B,
            titleColor: '#FFB6C1',
            textColor: '#FFE4E1'
        }
    );
    this.resultsTable1.showAnimated(600);
}
```

### Создание демо здоровья
```javascript
showHealthDemo() {
    const healthLevels = [
        { health: 100, label: 'Полное здоровье', color: 0x00FF00 },
        { health: 75, label: 'Хорошее здоровье', color: 0x80FF00 },
        // ... другие уровни
    ];
    
    healthLevels.forEach((level, index) => {
        const healthBar = new HealthBar(this, centerX + 50, y, {
            width: 200,
            height: 20,
            maxHealth: 100,
            currentHealth: level.health,
            healthColor: level.color
        });
        
        // Анимация появления
        this.animateComponent(healthBar, index);
    });
}
```

## 🎮 Интеграция с меню

### Добавление в главное меню
```javascript
// В MenuScene.js
const demoButton = this.add.rectangle(width / 2, demoButtonY, 250, 60, 0x3498db)
    .setInteractive()
    .on('pointerdown', () => {
        this.scene.start('DemoComponents');
    });

this.add.text(width / 2, demoButtonY, 'ДЕМО КОМПОНЕНТОВ', {
    fontSize: buttonFontSize,
    fill: '#ffffff',
    fontStyle: 'bold',
    align: 'center'
}).setOrigin(0.5);
```

### Регистрация в main.js
```javascript
import { DemoComponents } from '@/scenes/DemoComponents';

const config = {
    // ... другие настройки
    scene: [
        PreloadScene, 
        MenuScene, 
        EggDefense, 
        TestEffects, 
        SpriteTestScene, 
        DemoComponents  // Новая сцена
    ]
};
```

## 🎯 Польза для разработки

### Для разработчиков
- ✅ **Быстрое тестирование** компонентов
- ✅ **Визуальная проверка** стилей
- ✅ **Демонстрация возможностей** клиентам
- ✅ **Документация** в действии

### Для дизайнеров
- ✅ **Визуализация** всех компонентов
- ✅ **Тестирование** цветовых схем
- ✅ **Проверка** анимаций
- ✅ **Адаптивность** на разных экранах

## 🚀 Расширение

### Добавление нового демо
```javascript
// 1. Добавить в массив demos
this.demos = ['results', 'buttons', 'health', 'timer', 'damage', 'newDemo'];

// 2. Добавить заголовок
getDemoTitle(demoType) {
    const titles = {
        // ... существующие
        'newDemo': '🆕 Новое демо'
    };
    return titles[demoType] || demoType;
}

// 3. Создать метод демо
showNewDemo() {
    // Реализация нового демо
}

// 4. Добавить в switch
switch (demoType) {
    // ... существующие
    case 'newDemo': this.showNewDemo(); break;
}
```

## 🎨 Контекстная стилизация

Сцена использует Context7-совместимую систему стилизации:
- ✅ **UI_THEME** для базовых стилей
- ✅ **Адаптивные размеры** для разных экранов
- ✅ **Консистентные цвета** и шрифты
- ✅ **Плавные анимации** с правильными easing функциями
