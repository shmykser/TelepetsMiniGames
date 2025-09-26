# Реализация Safe Area для мобильных устройств

## Обзор

В проекте реализована поддержка Safe Area для корректного отображения UI элементов на мобильных устройствах с челкой (notch) и островками камеры (Dynamic Island).

## Компоненты

### 1. SafeAreaUtils.js

Утилитарный класс для работы с safe-area значениями:

```javascript
import { SafeAreaUtils } from '../utils/SafeAreaUtils.js';

// Получение значений safe-area
const safeAreaTop = SafeAreaUtils.getSafeAreaTop();
const safeAreaBottom = SafeAreaUtils.getSafeAreaBottom();
const safeAreaLeft = SafeAreaUtils.getSafeAreaLeft();
const safeAreaRight = SafeAreaUtils.getSafeAreaRight();

// Получение всех значений
const allSafeAreas = SafeAreaUtils.getAllSafeAreas();

// Проверка поддержки
const isSupported = SafeAreaUtils.isSafeAreaSupported();

// Вычисление безопасных позиций
const safeTopY = SafeAreaUtils.getSafeTopPosition(30, 32);
const safeBottomY = SafeAreaUtils.getSafeBottomPosition(screenHeight, baseY, elementHeight);
const safeLeftX = SafeAreaUtils.getSafeLeftPosition(baseX, elementWidth);
const safeRightX = SafeAreaUtils.getSafeRightPosition(screenWidth, baseX, elementWidth);
```

### 2. CSS поддержка

В `index.html` добавлены CSS правила для поддержки safe-area:

```css
html, body {
  /* Поддержка safe-area для мобильных устройств */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

#game {
  height: 100svh; /* Support for newer browsers with safe-area */
  /* Учитываем safe-area для позиционирования */
  margin-top: calc(-1 * env(safe-area-inset-top));
  margin-bottom: calc(-1 * env(safe-area-inset-bottom));
  margin-left: calc(-1 * env(safe-area-inset-left));
  margin-right: calc(-1 * env(safe-area-inset-right));
}
```

### 3. Интеграция в EggDefense.js

#### Создание таймера с safe-area:

```javascript
createTimer() {
    // Вычисляем безопасную позицию с учетом safe-area
    const safeAreaTop = SafeAreaUtils.getSafeAreaTop();
    const timerY = SafeAreaUtils.getSafeTopPosition(30, 32);
    
    // Создаем элементы таймера
    this.timerBackground = this.add.rectangle(
        this.scale.width / 2,
        timerY,
        80,
        32,
        0x000000,
        0.7
    );
    
    this.timerText = this.add.text(
        this.scale.width / 2,
        timerY,
        '10:00',
        { /* стили */ }
    ).setOrigin(0.5);
}
```

#### Обработка изменения размера экрана:

```javascript
setupResizeHandler() {
    this.scale.on('resize', () => {
        this.updateUIPositions();
    });
}

updateUIPositions() {
    // Обновляем позицию таймера
    this.updateTimerPosition();
    
    // Обновляем позицию дисплея способностей
    if (this.abilitiesDisplay) {
        const abilitiesX = SafeAreaUtils.getSafeRightPosition(this.scale.width, this.scale.width - 100, 200);
        const abilitiesY = SafeAreaUtils.getSafeTopPosition(100, 100);
        this.abilitiesDisplay.setPosition(abilitiesX, abilitiesY);
    }
}
```

## Тестирование

### SafeAreaTest.js

Для тестирования и отладки можно использовать `SafeAreaTest`:

```javascript
import { SafeAreaTest } from '../utils/SafeAreaTest.js';

// В сцене
SafeAreaTest.createTestElements(this);
```

Это создаст визуальные индикаторы safe-area зон на экране.

### Ручное тестирование

1. Откройте игру на мобильном устройстве с челкой (iPhone X и новее)
2. Проверьте, что таймер не перекрывается челкой
3. Поверните устройство и проверьте корректность позиционирования
4. Проверьте на устройствах без челки (должно работать как обычно)

## Поддерживаемые устройства

- iPhone X и новее (с челкой)
- iPhone 14 Pro и новее (с Dynamic Island)
- Android устройства с вырезами экрана
- Обычные устройства (без изменений)

## Браузерная поддержка

- Safari на iOS 11.2+
- Chrome на Android 9+
- Firefox на Android
- Edge на Windows 10+

## Примечания

1. `env(safe-area-inset-*)` работает только в полноэкранном режиме
2. Для корректной работы необходимо установить `viewport-fit=cover` в meta теге
3. Значения safe-area доступны только после загрузки страницы
4. При изменении ориентации экрана safe-area значения могут измениться

## Отладка

Для отладки safe-area значений можно использовать:

```javascript
console.log('Safe Area:', SafeAreaUtils.getAllSafeAreas());
console.log('Supported:', SafeAreaUtils.isSafeAreaSupported());
```

Или включить тестовые элементы:

```javascript
SafeAreaTest.createTestElements(this);
```
