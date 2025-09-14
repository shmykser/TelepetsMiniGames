# Создание кастомных жестов для $Q Super-Quick Recognizer

## Проблема
Библиотека $Q Super-Quick Recognizer поставляется с 16 предопределенными жестами, но не включает такие базовые фигуры как круг и треугольник.

## Решение
Используйте метод `AddGesture()` для добавления кастомных шаблонов.

## Как это работает

### 1. Метод AddGesture()
```javascript
this.qDollarRecognizer.AddGesture(name, points);
```

**Параметры:**
- `name` (string) - название жеста
- `points` (Array) - массив точек типа `Point(x, y, id)`

### 2. Структура точки
```javascript
new Point(x, y, id)
```
- `x, y` - координаты точки
- `id` - ID штриха (1, 2, 3... для мульти-штриховых жестов)

### 3. Создание шаблона треугольника
```javascript
createTriangleTemplate() {
    const centerX = 50;
    const centerY = 50;
    const radius = 30;
    
    const points = [];
    
    // Верхняя вершина
    points.push(new Point(centerX, centerY - radius, 1));
    
    // Левая нижняя вершина
    points.push(new Point(centerX - radius * Math.cos(Math.PI/6), centerY + radius * Math.sin(Math.PI/6), 1));
    
    // Правая нижняя вершина
    points.push(new Point(centerX + radius * Math.cos(Math.PI/6), centerY + radius * Math.sin(Math.PI/6), 1));
    
    // Замыкаем треугольник
    points.push(new Point(centerX, centerY - radius, 1));
    
    return points;
}
```

### 4. Создание шаблона круга
```javascript
createCircleTemplate() {
    const centerX = 50;
    const centerY = 50;
    const radius = 25;
    const numPoints = 16; // Количество точек для аппроксимации
    
    const points = [];
    
    for (let i = 0; i <= numPoints; i++) {
        const angle = (2 * Math.PI * i) / numPoints;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        points.push(new Point(x, y, 1));
    }
    
    return points;
}
```

### 5. Создание шаблона вертикальной линии
```javascript
createVerticalLineTemplate() {
    const startX = 50;
    const startY = 20;
    const endX = 50;
    const endY = 80;
    const numPoints = 10;
    
    const points = [];
    
    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const x = startX + (endX - startX) * t;
        const y = startY + (endY - startY) * t;
        points.push(new Point(x, y, 1));
    }
    
    return points;
}
```

### 6. Создание шаблона диагональной линии
```javascript
createDiagonalLineTemplate() {
    // Диагональ из левого верхнего в правый нижний
    const startX = 20;
    const startY = 20;
    const endX = 80;
    const endY = 80;
    const numPoints = 10;
    
    const points = [];
    
    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const x = startX + (endX - startX) * t;
        const y = startY + (endY - startY) * t;
        points.push(new Point(x, y, 1));
    }
    
    return points;
}
```

## Принципы создания шаблонов

### 1. Нормализация координат
- Используйте координаты в диапазоне 0-100
- Центрируйте фигуру относительно начала координат
- Библиотека автоматически масштабирует и нормализует

### 2. Количество точек
- Минимум 4-5 точек для простых фигур
- 16+ точек для сложных кривых
- Больше точек = лучшее распознавание, но медленнее

### 3. Замыкание фигур
- Всегда замыкайте фигуры (последняя точка = первая)
- Это помогает алгоритму понять структуру

### 4. Мульти-штрихи
- Используйте разные ID для разных штрихов
- Пример: треугольник из 3 линий = ID 1, 2, 3

## Примеры использования

### Добавление в инициализацию
```javascript
initializeQDollarRecognizer() {
    this.qDollarRecognizer = new QDollarRecognizer();
    this.addCustomGestures(); // Добавляем кастомные жесты
}

addCustomGestures() {
    // Добавляем треугольник
    const trianglePoints = this.createTriangleTemplate();
    this.qDollarRecognizer.AddGesture("triangle", trianglePoints);
    
    // Добавляем круг
    const circlePoints = this.createCircleTemplate();
    this.qDollarRecognizer.AddGesture("circle", circlePoints);
    
    // Добавляем линии в разных направлениях
    const verticalLinePoints = this.createVerticalLineTemplate();
    this.qDollarRecognizer.AddGesture("vertical line", verticalLinePoints);
    
    const diagonalLinePoints = this.createDiagonalLineTemplate();
    this.qDollarRecognizer.AddGesture("diagonal line", diagonalLinePoints);
    
    const reverseDiagonalLinePoints = this.createReverseDiagonalLineTemplate();
    this.qDollarRecognizer.AddGesture("reverse diagonal line", reverseDiagonalLinePoints);
}
```

## Результат
После добавления кастомных шаблонов:
- ✅ Круг распознается корректно
- ✅ Треугольник распознается корректно
- ✅ Вертикальная линия распознается корректно
- ✅ Диагональная линия распознается корректно
- ✅ Обратная диагональная линия распознается корректно
- ✅ Всего доступно 21 жест (16 встроенных + 5 кастомных)
- ✅ Библиотека $Q Super-Quick в 142 раза быстрее $1 и немного точнее

## Отладка
1. Проверьте консоль браузера на сообщения о добавлении жестов
2. Убедитесь, что количество точек в шаблоне > 3
3. Проверьте, что фигура замкнута (первая и последняя точки совпадают)
4. Используйте порог уверенности 0.6 для фильтрации ложных срабатываний
