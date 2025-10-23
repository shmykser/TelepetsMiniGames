/**
 * Сцена взлома паттерн-замка
 * Мини-игра: соединить цветные пары точек без пересечения линий (как Flow Free)
 */

import { BaseLockScene } from './BaseLockScene.js';

export class PatternLockScene extends BaseLockScene {
    constructor() {
        super('PatternLockScene');
        
        // Элементы игры
        this.grid = []; // Сетка точек [row][col]
        this.coloredPairs = []; // Пары для соединения
        this.lines = []; // Завершённые линии
        this.currentLine = null; // Линия в процессе рисования
        this.isDrawing = false;
        this.gridGraphics = null;
        this.gridSize = 0;
        this.cellSize = 0;
        this.startX = 0;
        this.startY = 0;
    }
    
    /**
     * Создание сцены
     */
    create() {
        super.create();
        
        // ВАЖНО: Принудительно инициализируем все массивы и флаги
        this.grid = [];
        this.coloredPairs = [];
        this.lines = [];
        this.currentLine = null;
        this.isDrawing = false;
        this.gridGraphics = null;
        
        console.log('🎮 [PatternLockScene] Инициализация новой игры');
        
        // Создаем базовый UI
        this.createBaseUI('🎯 ВЗЛОМ ПАТТЕРН-ЗАМКА');
        
        // Инструкция
        const { width } = this.scale;
        this.instructionText = this.add.text(width / 2, 160, 'Зажмите цветную точку и ведите к парной!\nСоедините все пары!', {
            fontSize: '15px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5).setDepth(10);
        
        // Создаем сетку
        this.gridSize = this.config.gridSize || 3;
        this.cellSize = 60;
        this.createGrid();
        this.drawGridLines();
        
        // Генерируем пары точек (с решением)
        this.generatePairs();
        
        // Кнопка "Сбросить"
        this.resetButton = this.createButton(width - 90, 220, 160, 45, '🔄 Сбросить', {
            fontSize: '14px',
            backgroundColor: 0x555555,
            borderColor: 0x777777,
            hoverColor: 0x666666
        });
        
        this.resetButton.container.on('pointerdown', () => {
            this.resetAllLines();
        });
        
        // DEBUG: Кнопка "Показать решение"
        this.debugButton = this.createButton(90, 220, 160, 45, '🔍 Решение', {
            fontSize: '14px',
            backgroundColor: 0x003366,
            borderColor: 0x0066cc,
            hoverColor: 0x004488
        });
        
        this.debugButton.container.on('pointerdown', () => {
            this.showSolution();
        });
        
        // Настраиваем управление
        this.setupInput();
        
        // Игра активна
        this.isGameActive = true;
        
        console.log('🎯 [PatternLockScene] Игра начата');
    }
    
    /**
     * Создание сетки
     */
    createGrid() {
        const { width, height } = this.scale;
        const gridWidth = (this.gridSize - 1) * this.cellSize;
        const gridHeight = (this.gridSize - 1) * this.cellSize;
        this.startX = (width - gridWidth) / 2;
        this.startY = (height - gridHeight) / 2 + 20;
        
        // Инициализируем двумерный массив
        this.grid = [];
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const x = this.startX + col * this.cellSize;
                const y = this.startY + row * this.cellSize;
                
                this.grid[row][col] = {
                    x,
                    y,
                    row,
                    col,
                    color: null,
                    pairIndex: null,
                    occupied: false, // Занята ли линией
                    circle: null
                };
            }
        }
    }
    
    /**
     * Рисование линий сетки
     */
    drawGridLines() {
        this.gridGraphics = this.add.graphics();
        this.gridGraphics.lineStyle(1, 0x333333, 0.5);
        this.gridGraphics.setDepth(1);
        
        const gridWidth = (this.gridSize - 1) * this.cellSize;
        const gridHeight = (this.gridSize - 1) * this.cellSize;
        
        // Вертикальные линии
        for (let col = 0; col < this.gridSize; col++) {
            const x = this.startX + col * this.cellSize;
            this.gridGraphics.lineBetween(x, this.startY, x, this.startY + gridHeight);
        }
        
        // Горизонтальные линии
        for (let row = 0; row < this.gridSize; row++) {
            const y = this.startY + row * this.cellSize;
            this.gridGraphics.lineBetween(this.startX, y, this.startX + gridWidth, y);
        }
    }
    
    /**
     * Генерация цветных пар с гарантией решаемости
     * Алгоритм: сначала генерируем решение, потом показываем только конечные точки
     */
    generatePairs() {
        const pairCount = this.config.pairs || 2;
        // Расширенная палитра для 7+ пар
        const colors = [
            0xff0000, // Красный
            0x0000ff, // Синий
            0x00ff00, // Зеленый
            0xffff00, // Желтый
            0xff00ff, // Пурпурный
            0x00ffff, // Голубой
            0xff8800, // Оранжевый
            0x8800ff, // Фиолетовый
            0x00ff88  // Бирюзовый
        ];
        
        console.log('🎯 [PatternLockScene] Генерация решаемой головоломки...');
        
        let attempts = 0;
        const maxAttempts = 50;
        let success = false;
        
        // Пытаемся сгенерировать решаемую головоломку
        while (!success && attempts < maxAttempts) {
            attempts++;
            
            // Очищаем предыдущую попытку
            this.clearGrid();
            this.coloredPairs = [];
            
            // Генерируем пути для каждой пары
            success = this.generateSolvablePaths(pairCount, colors);
            
            if (!success) {
                console.log(`⚠️ Попытка ${attempts} не удалась, пробуем снова...`);
            }
        }
        
        if (success) {
            console.log(`✅ [PatternLockScene] Решаемая головоломка создана за ${attempts} попыток`);
        } else {
            console.warn('⚠️ [PatternLockScene] Не удалось создать головоломку, используем простую генерацию');
            this.generateSimplePairs(pairCount, colors);
        }
    }
    
    /**
     * Генерация решаемых путей (ПРАВИЛЬНЫЙ алгоритм Flow Free)
     * Использует backtracking для создания непересекающихся путей
     */
    generateSolvablePaths(pairCount, colors) {
        const totalCells = this.gridSize * this.gridSize;
        console.log(`🎯 [Flow Free] Генерация ${pairCount} путей на сетке ${this.gridSize}x${this.gridSize}`);
        
        // Максимум попыток для генерации всей головоломки
        const maxGlobalAttempts = 100;
        
        for (let globalAttempt = 0; globalAttempt < maxGlobalAttempts; globalAttempt++) {
            // Очищаем сетку для новой попытки
            this.clearGrid();
            
            const paths = [];
            let success = true;
            const placedPoints = [];
            
            // ИЗМЕНЕНО: Генерируем пары ПОСЛЕДОВАТЕЛЬНО, а не все сразу
            // Это позволяет каждой новой паре учитывать уже занятое пространство
            for (let i = 0; i < pairCount; i++) {
                const color = colors[i % colors.length];
                const minDistance = Math.max(2, Math.floor(this.gridSize * 0.35));
                
                let startCell = null;
                let endCell = null;
                let path = null;
                let pairAttempts = 0;
                const maxPairAttempts = 50;
                
                // Пытаемся разместить пару и найти для неё путь
                while ((!path || path.length < 2) && pairAttempts < maxPairAttempts) {
                    pairAttempts++;
                    
                    const availableCells = this.getAvailableCells();
                    
                    if (availableCells.length < 2) {
                        break; // Нет места
                    }
                    
                    // Выбираем стартовую точку
                    if (i === 0) {
                        // Первая пара - из углов
                        const corners = availableCells.filter(c => 
                            (c.row === 0 || c.row === this.gridSize - 1) && 
                            (c.col === 0 || c.col === this.gridSize - 1)
                        );
                        startCell = corners.length > 0 ? 
                            Phaser.Utils.Array.GetRandom(corners) : 
                            Phaser.Utils.Array.GetRandom(availableCells);
                    } else {
                        // Максимально далеко от уже размещённых точек
                        startCell = this.selectFarthestCell(availableCells, placedPoints);
                    }
                    
                    // Временно помечаем стартовую точку
                    startCell.occupied = true;
                    
                    // Выбираем конечную точку (далеко от стартовой)
                    const remainingCells = this.getAvailableCells();
                    const farCells = remainingCells.filter(c => 
                        this.getDistance(c, startCell) >= minDistance
                    );
                    
                    if (farCells.length === 0) {
                        // Откатываем и пробуем другую стартовую точку
                        startCell.occupied = false;
                        continue;
                    }
                    
                    endCell = this.selectFarthestCell(farCells, placedPoints);
                    endCell.occupied = true;
                    
                    // Пытаемся найти путь между точками
                    path = this.findPathBetweenPoints(startCell, endCell);
                    
                    if (!path || path.length < 2) {
                        // Не получилось - откатываем обе точки
                        startCell.occupied = false;
                        endCell.occupied = false;
                        startCell = null;
                        endCell = null;
                        path = null;
                    }
                }
                
                // Не удалось создать пару - переходим к следующей глобальной попытке
                if (!path || path.length < 2) {
                    console.log(`⚠️ Попытка ${globalAttempt + 1}: не удалось создать пару ${i} за ${maxPairAttempts} попыток`);
                    success = false;
                    break;
                }
                
                // Успех! Помечаем весь путь как занятый для следующих пар
                path.forEach(cell => cell.occupied = true);
                placedPoints.push(startCell, endCell);
                
                paths.push({ path, color, pairIndex: i, start: startCell, end: endCell });
                console.log(`✅ Пара ${i}: путь длиной ${path.length} (попытка ${pairAttempts})`);
            }
            
            if (!success) {
                continue; // Пробуем заново всю головоломку
            }
            
            // Успех! Создаём визуальные элементы
            paths.forEach(({ path, color, pairIndex, start, end }) => {
                start.color = color;
                start.pairIndex = pairIndex;
                end.color = color;
                end.pairIndex = pairIndex;
                
                // ВАЖНО: Промежуточные клетки ОСТАЮТСЯ occupied = true
                // Это гарантирует, что решение уникально
                // Но для игрока мы их "освобождаем" визуально
                for (let i = 1; i < path.length - 1; i++) {
                    path[i].occupied = false; // Только для игрока!
                }
                
                this.createColoredCircle(start);
                this.createColoredCircle(end);
                
                this.coloredPairs.push({
                    index: pairIndex,
                    color: color,
                    start: start,
                    end: end,
                    connected: false,
                    solutionPath: path
                });
            });
            
            const coverage = paths.reduce((sum, p) => sum + p.path.length, 0);
            console.log(`✨ [Flow Free] Успех за ${globalAttempt + 1} попыток! Покрытие: ${coverage}/${totalCells} (${Math.round(coverage/totalCells*100)}%)`);
            
            return true;
        }
        
        console.warn(`❌ [Flow Free] Не удалось создать головоломку за ${maxGlobalAttempts} попыток`);
        return false;
    }
    
    /**
     * Поиск пути между двумя точками используя BFS (Breadth-First Search)
     * Гарантирует кратчайший путь без пересечений с занятыми клетками
     */
    findPathBetweenPoints(start, end) {
        const queue = [[start]];
        const visited = new Set();
        visited.add(`${start.row},${start.col}`);
        
        while (queue.length > 0) {
            const path = queue.shift();
            const current = path[path.length - 1];
            
            // Достигли конечной точки?
            if (current.row === end.row && current.col === end.col) {
                return path;
            }
            
            // Получаем соседей (вверх, вниз, влево, вправо)
            const neighbors = this.getNeighbors(current);
            
            for (const neighbor of neighbors) {
                const key = `${neighbor.row},${neighbor.col}`;
                
                // Пропускаем уже посещённые
                if (visited.has(key)) continue;
                
                // Пропускаем занятые клетки (НО конечную точку можем посетить!)
                // Блоки генерируются ПОСЛЕ решения, поэтому не проверяем blocked
                if (neighbor.occupied && !(neighbor.row === end.row && neighbor.col === end.col)) continue;
                
                visited.add(key);
                queue.push([...path, neighbor]);
            }
        }
        
        // Путь не найден
        return null;
    }
    
    /**
     * Получить соседние клетки (вверх, вниз, влево, вправо)
     */
    getNeighbors(cell) {
        const neighbors = [];
        const directions = [
            { dr: -1, dc: 0 },  // вверх
            { dr: 1, dc: 0 },   // вниз
            { dr: 0, dc: -1 },  // влево
            { dr: 0, dc: 1 }    // вправо
        ];
        
        for (const { dr, dc } of directions) {
            const newRow = cell.row + dr;
            const newCol = cell.col + dc;
            
            if (newRow >= 0 && newRow < this.gridSize && 
                newCol >= 0 && newCol < this.gridSize) {
                neighbors.push(this.grid[newRow][newCol]);
            }
        }
        
        return neighbors;
    }
    
    /**
     * Генерация "змеиного" пути - извилистый путь, заполняющий максимум клеток
     */
    generateSnakePath(startCell, targetLength, availableCells) {
        const path = [startCell];
        let currentCell = startCell;
        
        // Временно помечаем стартовую клетку как занятую
        startCell.occupied = true;
        
        for (let step = 0; step < targetLength * 2; step++) { // *2 для большей попытки
            const neighbors = this.getUnoccupiedNeighbors(currentCell, path);
            
            if (neighbors.length === 0) {
                break; // Тупик - это нормально, главное чтобы путь был достаточно длинный
            }
            
            // Выбираем соседа, который ведёт в сторону с большим количеством свободных клеток
            let bestNeighbor = null;
            let maxFreedom = -1;
            
            for (const neighbor of neighbors) {
                const freedom = this.countFreeNeighbors(neighbor, path);
                if (freedom > maxFreedom) {
                    maxFreedom = freedom;
                    bestNeighbor = neighbor;
                }
            }
            
            if (!bestNeighbor) {
                bestNeighbor = Phaser.Utils.Array.GetRandom(neighbors);
            }
            
            path.push(bestNeighbor);
            currentCell = bestNeighbor;
            
            if (path.length >= targetLength) {
                break; // Достигли целевой длины
            }
        }
        
        // Снимаем временную отметку
        startCell.occupied = false;
        
        return path.length >= 2 ? path : null;
    }
    
    /**
     * Подсчёт свободных соседей (для выбора направления пути)
     */
    countFreeNeighbors(cell, excludePath) {
        return this.getUnoccupiedNeighbors(cell, excludePath).length;
    }
    
    /**
     * Выбор самой далёкой клетки от всех существующих конечных точек
     * @param {Array} existingPathsOrPoints - массив путей {path} или массив точек (клеток)
     */
    selectFarthestCell(availableCells, existingPathsOrPoints) {
        if (!existingPathsOrPoints || existingPathsOrPoints.length === 0) {
            return Phaser.Utils.Array.GetRandom(availableCells);
        }
        
        // Определяем, что передано: пути или точки
        let endpoints = [];
        if (existingPathsOrPoints[0] && existingPathsOrPoints[0].path) {
            // Это массив путей {path}
            existingPathsOrPoints.forEach(({ path }) => {
                endpoints.push(path[0], path[path.length - 1]);
            });
        } else {
            // Это массив точек (клеток)
            endpoints = existingPathsOrPoints;
        }
        
        // Находим клетку с максимальной суммой расстояний до всех конечных точек
        let bestCell = null;
        let maxTotalDistance = 0;
        
        availableCells.forEach(cell => {
            const totalDistance = endpoints.reduce((sum, endpoint) => {
                return sum + this.getDistance(cell, endpoint);
            }, 0);
            
            if (totalDistance > maxTotalDistance) {
                maxTotalDistance = totalDistance;
                bestCell = cell;
            }
        });
        
        return bestCell || Phaser.Utils.Array.GetRandom(availableCells);
    }
    
    /**
     * Выбрать клетку с учётом распределения (подальше от уже размещённых точек)
     */
    selectDistributedCell(availableCells, existingPaths) {
        if (existingPaths.length === 0) {
            // Первая пара - выбираем случайно из угловых/крайних позиций
            const cornerCells = availableCells.filter(cell => {
                const isCorner = (cell.row === 0 || cell.row === this.gridSize - 1) &&
                                 (cell.col === 0 || cell.col === this.gridSize - 1);
                const isEdge = cell.row === 0 || cell.row === this.gridSize - 1 ||
                               cell.col === 0 || cell.col === this.gridSize - 1;
                return isCorner || isEdge;
            });
            
            return cornerCells.length > 0 ? 
                   Phaser.Utils.Array.GetRandom(cornerCells) : 
                   Phaser.Utils.Array.GetRandom(availableCells);
        }
        
        // Для последующих пар выбираем клетку, которая максимально далека от всех существующих конечных точек
        let bestCell = null;
        let maxMinDistance = 0;
        
        // Получаем все существующие конечные точки
        const existingEndpoints = [];
        existingPaths.forEach(({ path }) => {
            existingEndpoints.push(path[0], path[path.length - 1]);
        });
        
        // Для каждой доступной клетки вычисляем минимальное расстояние до существующих точек
        availableCells.forEach(cell => {
            let minDistance = Infinity;
            
            existingEndpoints.forEach(endpoint => {
                const distance = this.getDistance(cell, endpoint);
                if (distance < minDistance) {
                    minDistance = distance;
                }
            });
            
            // Выбираем клетку с максимальным "минимальным расстоянием"
            if (minDistance > maxMinDistance) {
                maxMinDistance = minDistance;
                bestCell = cell;
            }
        });
        
        return bestCell;
    }
    
    /**
     * Вычислить расстояние между двумя клетками (Манхэттенское)
     */
    getDistance(cell1, cell2) {
        return Math.abs(cell1.row - cell2.row) + Math.abs(cell1.col - cell2.col);
    }
    
    /**
     * Получить экранные координаты клетки
     */
    getCellPosition(row, col) {
        return {
            x: this.startX + col * this.cellSize,
            y: this.startY + row * this.cellSize
        };
    }
    
    
    /**
     * Получить свободных соседей клетки
     */
    getUnoccupiedNeighbors(cell, excludePath = []) {
        const neighbors = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dr, dc] of directions) {
            const newRow = cell.row + dr;
            const newCol = cell.col + dc;
            
            if (newRow >= 0 && newRow < this.gridSize && newCol >= 0 && newCol < this.gridSize) {
                const neighbor = this.grid[newRow][newCol];
                
                if (!neighbor.occupied && !excludePath.includes(neighbor)) {
                    neighbors.push(neighbor);
                }
            }
        }
        
        return neighbors;
    }
    
    /**
     * Получить список свободных клеток
     */
    getAvailableCells() {
        const available = [];
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = this.grid[row][col];
                if (!cell.occupied && cell.color === null) {
                    available.push(cell);
                }
            }
        }
        
        return available;
    }
    
    /**
     * Очистка сетки (для повторных попыток генерации)
     */
    clearGrid() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = this.grid[row][col];
                cell.color = null;
                cell.pairIndex = null;
                cell.occupied = false;
                
                if (cell.circle) {
                    cell.circle.destroy();
                    cell.circle = null;
                }
            }
        }
    }
    
    /**
     * Простая генерация (fallback)
     */
    generateSimplePairs(pairCount, colors) {
        const allCells = this.getAvailableCells();
        Phaser.Utils.Array.Shuffle(allCells);
        
        for (let i = 0; i < pairCount && allCells.length >= 2; i++) {
            const start = allCells.pop();
            const end = allCells.pop();
            const color = colors[i % colors.length];
            
            start.color = color;
            start.pairIndex = i;
            end.color = color;
            end.pairIndex = i;
            
            this.createColoredCircle(start);
            this.createColoredCircle(end);
            
            this.coloredPairs.push({
                index: i,
                color: color,
                start: start,
                end: end,
                connected: false
            });
        }
    }
    
    /**
     * Создание цветного круга
     */
    createColoredCircle(cell) {
        const circle = this.add.circle(cell.x, cell.y, 16, cell.color);
        circle.setStrokeStyle(3, 0xffffff);
        circle.setDepth(10);
        cell.circle = circle;
        cell.occupied = true; // Конечные точки всегда заняты
    }
    
    /**
     * Настройка управления (только свайпы)
     */
    setupInput() {
        // Создаём большую интерактивную область
        const { width, height } = this.scale;
        const gameArea = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.01);
        gameArea.setInteractive();
        gameArea.setDepth(2);
        
        gameArea.on('pointerdown', (pointer) => {
            this.onPointerDown(pointer);
        });
        
        gameArea.on('pointermove', (pointer) => {
            this.onPointerMove(pointer);
        });
        
        gameArea.on('pointerup', () => {
            this.onPointerUp();
        });
    }
    
    /**
     * Начало рисования (свайп)
     */
    onPointerDown(pointer) {
        if (!this.isGameActive) return;
        
        const cell = this.getCellAtPosition(pointer.x, pointer.y);
        if (!cell) return;
        
        // Можно начинать только с цветной точки
        if (cell.color === null) return;
        
        // Проверяем, есть ли уже линия этого цвета
        const existingLine = this.lines.find(line => line.pairIndex === cell.pairIndex);
        
        if (existingLine) {
            // Если кликнули на начало или конец существующей линии - удаляем её
            if (cell === existingLine.start || cell === existingLine.end) {
                this.removeLine(existingLine);
            } else {
                return; // Нельзя начать с середины
            }
        }
        
        // Начинаем новую линию
        this.isDrawing = true;
        this.currentLine = {
            pairIndex: cell.pairIndex,
            color: cell.color,
            start: cell,
            path: [cell],
            graphics: this.add.graphics(),
            isComplete: false
        };
        
        this.currentLine.graphics.setDepth(5);
        
        // Рисуем начальную точку
        this.drawCurrentLine();
        
        console.log('🎯 [PatternLockScene] Начало линии от:', cell.row, cell.col);
    }
    
    /**
     * Движение во время рисования
     */
    onPointerMove(pointer) {
        if (!this.isDrawing || !this.currentLine) return;
        
        const cell = this.getCellAtPosition(pointer.x, pointer.y);
        if (!cell) return;
        
        const lastCell = this.currentLine.path[this.currentLine.path.length - 1];
        
        // Если это та же клетка - игнорируем
        if (cell === lastCell) return;
        
        // Если это предыдущая клетка - удаляем последний шаг (возврат назад)
        if (this.currentLine.path.length > 1 && cell === this.currentLine.path[this.currentLine.path.length - 2]) {
            this.currentLine.path.pop();
            lastCell.occupied = false;
            this.drawCurrentLine();
            return;
        }
        
        // Проверяем, можно ли добавить эту клетку
        if (!this.canAddCell(cell, lastCell)) return;
        
        // Добавляем клетку в путь
        this.currentLine.path.push(cell);
        cell.occupied = true;
        
        // Проверяем, достигли ли конечной точки пары
        const pair = this.coloredPairs.find(p => p.index === this.currentLine.pairIndex);
        if (cell === pair.end || cell === pair.start) {
            if (cell !== this.currentLine.start) {
                this.currentLine.isComplete = true;
                this.finishLine();
                return; // finishLine уже рисует завершённую линию
            }
        }
        
        this.drawCurrentLine();
    }
    
    /**
     * Завершение рисования
     */
    onPointerUp() {
        if (!this.isDrawing) return;
        
        if (this.currentLine && !this.currentLine.isComplete) {
            // Линия не завершена - удаляем
            this.cancelCurrentLine();
        }
        
        this.isDrawing = false;
    }
    
    /**
     * Проверка, можно ли добавить клетку
     */
    canAddCell(cell, lastCell) {
        // Клетки должны быть соседними
        const dx = Math.abs(cell.col - lastCell.col);
        const dy = Math.abs(cell.row - lastCell.row);
        
        if (dx > 1 || dy > 1 || (dx === 0 && dy === 0)) {
            console.log(`❌ Не соседние клетки: (${lastCell.row},${lastCell.col}) → (${cell.row},${cell.col}), dx=${dx}, dy=${dy}`);
            return false;
        }
        
        // Клетка не должна быть уже в пути
        if (this.currentLine.path.includes(cell)) {
            console.log(`❌ Клетка уже в пути: (${cell.row},${cell.col})`);
            return false;
        }
        
        // Если это цветная клетка другой пары - нельзя
        if (cell.color !== null && cell.pairIndex !== this.currentLine.pairIndex) {
            console.log(`❌ Цветная клетка другой пары: (${cell.row},${cell.col}), цвет: ${cell.color}, текущая пара: ${this.currentLine.pairIndex}, пара клетки: ${cell.pairIndex}`);
            return false;
        }
        
        // Если клетка занята другой линией - нельзя
        if (cell.occupied && cell.color === null) {
            console.log(`❌ Клетка занята другой линией: (${cell.row},${cell.col})`);
            return false;
        }
        
        console.log(`✅ Клетку можно добавить: (${cell.row},${cell.col})`);
        return true;
    }
    
    /**
     * Получить клетку по координатам
     */
    getCellAtPosition(x, y) {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = this.grid[row][col];
                const distance = Phaser.Math.Distance.Between(x, y, cell.x, cell.y);
                if (distance < this.cellSize / 2) {
                    return cell;
                }
            }
        }
        return null;
    }
    
    /**
     * Рисование текущей линии
     */
    drawCurrentLine() {
        if (!this.currentLine) return;
        
        const graphics = this.currentLine.graphics;
        graphics.clear();
        
        const path = this.currentLine.path;
        
        // Если только одна точка - рисуем точку
        if (path.length === 1) {
            graphics.fillStyle(this.currentLine.color, 0.3);
            graphics.fillCircle(path[0].x, path[0].y, 8);
            return;
        }
        
        // Рисуем линию
        graphics.lineStyle(10, this.currentLine.color, 0.7);
        graphics.beginPath();
        graphics.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
            graphics.lineTo(path[i].x, path[i].y);
        }
        
        graphics.strokePath();
        
        console.log('🎨 [PatternLockScene] Линия нарисована, точек:', path.length);
    }
    
    /**
     * Завершение линии
     */
    finishLine() {
        if (!this.currentLine) return;
        
        console.log('✅ [PatternLockScene] Линия завершена! Путь:', this.currentLine.path.map(c => `${c.row},${c.col}`).join(' → '));
        
        // ВАЖНО: Перерисовываем финальную версию линии перед сохранением
        this.drawCompletedLine(this.currentLine);
        
        // Сохраняем линию
        this.lines.push(this.currentLine);
        
        // Обновляем статус пары
        const pair = this.coloredPairs.find(p => p.index === this.currentLine.pairIndex);
        if (pair) {
            pair.connected = true;
        }
        
        this.currentLine = null;
        this.isDrawing = false;
        
        // Проверяем завершение
        this.checkCompletion();
    }
    
    /**
     * Рисование завершённой линии (с финальным стилем)
     */
    drawCompletedLine(line) {
        const graphics = line.graphics;
        graphics.clear();
        
        const path = line.path;
        
        if (path.length < 2) {
            console.warn('⚠️ Линия слишком короткая для отрисовки');
            return;
        }
        
        // Рисуем толстую линию
        graphics.lineStyle(10, line.color, 0.8);
        graphics.beginPath();
        graphics.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
            graphics.lineTo(path[i].x, path[i].y);
        }
        
        graphics.strokePath();
        
        console.log('🎨 [PatternLockScene] Завершённая линия отрисована, точек:', path.length);
    }
    
    /**
     * Отмена текущей линии
     */
    cancelCurrentLine() {
        if (!this.currentLine) return;
        
        // Освобождаем занятые клетки (кроме начальной)
        this.currentLine.path.forEach((cell, index) => {
            if (index > 0 && cell.color === null) {
                cell.occupied = false;
            }
        });
        
        this.currentLine.graphics.destroy();
        this.currentLine = null;
    }
    
    /**
     * Удаление линии
     */
    removeLine(line) {
        // Освобождаем клетки
        line.path.forEach((cell, index) => {
            if (cell.color === null) {
                cell.occupied = false;
            }
        });
        
        // Удаляем графику
        line.graphics.destroy();
        
        // Удаляем из массива
        const index = this.lines.indexOf(line);
        if (index > -1) {
            this.lines.splice(index, 1);
        }
        
        // Обновляем статус пары
        const pair = this.coloredPairs.find(p => p.index === line.pairIndex);
        if (pair) {
            pair.connected = false;
        }
        
        console.log('🗑️ [PatternLockScene] Линия удалена');
    }
    
    /**
     * Проверка завершения головоломки
     */
    checkCompletion() {
        const allConnected = this.coloredPairs.every(pair => pair.connected);
        
        if (!allConnected) return;
        
        console.log('🎯 [PatternLockScene] Все пары соединены! Проверяем заполнение...');
        
        // Проверяем, что все клетки заняты (опционально, можно убрать)
        // В оригинальной Flow Free это не обязательно
        
        // Успех!
        this.time.delayedCall(300, () => {
            this.onSuccess();
        });
    }
    
    /**
     * DEBUG: Показать правильное решение
     */
    showSolution() {
        console.log('🔍 [DEBUG] Показываю решение...');
        
        // Сначала сбрасываем всё
        this.resetAllLines();
        
        // Рисуем решение для каждой пары
        this.coloredPairs.forEach(pair => {
            if (!pair.solutionPath || pair.solutionPath.length < 2) {
                console.warn('⚠️ У пары нет решения!', pair);
                return;
            }
            
            const path = pair.solutionPath.map(cell => ({
                row: cell.row,
                col: cell.col
            }));
            
            const graphics = this.add.graphics();
            graphics.lineStyle(8, pair.color, 0.7);
            graphics.setDepth(1);
            
            // Рисуем путь
            const startPos = this.getCellPosition(path[0].row, path[0].col);
            graphics.beginPath();
            graphics.moveTo(startPos.x, startPos.y);
            
            for (let i = 1; i < path.length; i++) {
                const pos = this.getCellPosition(path[i].row, path[i].col);
                graphics.lineTo(pos.x, pos.y);
            }
            
            graphics.strokePath();
            
            this.lines.push({
                pairIndex: pair.index,
                path: path.map(p => this.grid[p.row][p.col]),
                graphics: graphics
            });
            
            pair.connected = true;
            
            console.log(`✅ Пара ${pair.index}: решение из ${path.length} клеток`);
        });
        
        console.log('✨ [DEBUG] Решение показано!');
        this.checkCompletion();
    }
    
    /**
     * Сброс всех линий
     */
    resetAllLines() {
        console.log('🔄 [PatternLockScene] Сброс всех линий');
        
        // Удаляем все линии
        [...this.lines].forEach(line => {
            this.removeLine(line);
        });
        
        // Отменяем текущую линию
        if (this.currentLine) {
            this.cancelCurrentLine();
        }
        
        this.isDrawing = false;
    }
    
    /**
     * Очистка при завершении сцены
     */
    shutdown() {
        super.shutdown();
        
        console.log('🧹 [PatternLockScene] Очистка сцены...');
        
        // Очищаем завершённые линии
        if (this.lines) {
            this.lines.forEach(line => {
                if (line.graphics) {
                    line.graphics.destroy();
                }
            });
            this.lines = [];
        }
        
        // Очищаем текущую линию в процессе рисования
        if (this.currentLine) {
            if (this.currentLine.graphics) {
                this.currentLine.graphics.destroy();
            }
            this.currentLine = null;
        }
        
        // Очищаем сетку
        if (this.gridGraphics) {
            this.gridGraphics.destroy();
            this.gridGraphics = null;
        }
        
        // Очищаем точки сетки
        if (this.grid) {
            for (let row = 0; row < this.gridSize; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    const cell = this.grid[row][col];
                    if (cell && cell.circle) {
                        cell.circle.destroy();
                        cell.circle = null;
                    }
                }
            }
            this.grid = [];
        }
        
        // Очищаем пары
        if (this.coloredPairs) {
            this.coloredPairs = [];
        }
        
        // Сброс флагов
        this.isDrawing = false;
        this.selectedPoint = null;
        
        console.log('✅ [PatternLockScene] Сцена очищена');
    }
}
