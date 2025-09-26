import { ISystem } from '../interfaces/ISystem.js';
import { GeometryUtils } from '../../utils/GeometryUtils.js';
import PF from 'pathfinding';

/**
 * Универсальная система поиска пути для игровых объектов
 * Поддерживает различные алгоритмы поиска пути
 */
export class PathfindingSystem extends ISystem {
    constructor(gameObject, config) {
        super(gameObject, config);
        this.grid = null;
        this.finder = null;
        this.currentPath = null;
        this.pathIndex = 0;
        this.gridWidth = this.getConfigValue('gridWidth', 50);
        this.gridHeight = this.getConfigValue('gridHeight', 50);
        this.cellSize = this.getConfigValue('cellSize', 32);
        this.algorithm = this.getConfigValue('algorithm', 'astar');
        this.allowDiagonal = this.getConfigValue('allowDiagonal', true);
        this.dontCrossCorners = this.getConfigValue('dontCrossCorners', true);
        
        // Настройки для летающих объектов
        this.canFly = this.gameObject.canFly || false;
        this.ignoreGroundObstacles = this.getConfigValue('ignoreGroundObstacles', this.canFly);
        
        this.initialize();
    }

    initialize() {
        this.setupPathfinding();
    }

    setupPathfinding() {
        this.createGrid();
        this.setupFinder();
    }

    createGrid() {
        // Создаем сетку для поиска пути
        this.grid = this.createEmptyGrid(this.gridWidth, this.gridHeight);
        
        // Добавляем препятствия в сетку
        this.updateObstacles();
    }

    createEmptyGrid(width, height) {
        return new PF.Grid(width, height);
    }

    setupFinder() {
        // Инициализируем алгоритм поиска пути
        switch (this.algorithm) {
            case 'astar':
                this.finder = new PF.AStarFinder({
                    allowDiagonal: this.allowDiagonal,
                    dontCrossCorners: this.dontCrossCorners
                });
                break;
            case 'dijkstra':
                this.finder = new PF.DijkstraFinder({
                    allowDiagonal: this.allowDiagonal,
                    dontCrossCorners: this.dontCrossCorners
                });
                break;
            case 'breadthfirst':
                this.finder = new PF.BreadthFirstFinder({
                    allowDiagonal: this.allowDiagonal,
                    dontCrossCorners: this.dontCrossCorners
                });
                break;
            case 'bestfirst':
                this.finder = new PF.BestFirstFinder({
                    allowDiagonal: this.allowDiagonal,
                    dontCrossCorners: this.dontCrossCorners
                });
                break;
            case 'jps':
                this.finder = new PF.JumpPointFinder({
                    allowDiagonal: this.allowDiagonal,
                    dontCrossCorners: this.dontCrossCorners
                });
                break;
            default:
                this.finder = new PF.AStarFinder({
                    allowDiagonal: this.allowDiagonal,
                    dontCrossCorners: this.dontCrossCorners
                });
        }
    }

    /**
     * Проверка валидности клетки
     * @param {number} x - X координата
     * @param {number} y - Y координата
     * @param {PF.Grid} grid - Сетка
     * @returns {boolean}
     */
    isValidCell(x, y, grid) {
        if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) {
            return false;
        }
        
        return grid.isWalkableAt(x, y);
    }

    /**
     * Поиск пути к цели
     * @param {Object} target - Цель {x, y}
     * @returns {Array|null} - Путь или null
     */
    findPath(target) {
        if (!target || !this.grid || !this.finder) {
            return null;
        }

        const startX = Math.floor(this.gameObject.x / this.cellSize);
        const startY = Math.floor(this.gameObject.y / this.cellSize);
        const endX = Math.floor(target.x / this.cellSize);
        const endY = Math.floor(target.y / this.cellSize);

        // Проверяем границы
        if (!this.isValidCell(startX, startY, this.grid) || !this.isValidCell(endX, endY, this.grid)) {
            return null;
        }

        // Используем PathFinding.js для поиска пути
        const path = this.finder.findPath(startX, startY, endX, endY, this.grid);
        
        if (path && path.length > 0) {
            // Конвертируем координаты сетки в мировые координаты
            return path.map(([x, y]) => ({
                x: x * this.cellSize + this.cellSize / 2,
                y: y * this.cellSize + this.cellSize / 2
            }));
        }

        return null;
    }

    /**
     * Установка текущего пути
     * @param {Array} path - Путь
     */
    setPath(path) {
        this.currentPath = path;
        this.pathIndex = 0;
        
        this.emit('pathSet', {
            path,
            gameObject: this.gameObject
        });
    }

    /**
     * Получение следующей точки пути
     * @returns {Object|null} - Следующая точка или null
     */
    getNextPathPoint() {
        if (!this.currentPath || this.pathIndex >= this.currentPath.length) {
            return null;
        }

        return this.currentPath[this.pathIndex];
    }

    /**
     * Переход к следующей точке пути
     * @returns {Object|null} - Следующая точка или null
     */
    advancePath() {
        if (!this.currentPath || this.pathIndex >= this.currentPath.length) {
            return null;
        }

        const point = this.currentPath[this.pathIndex];
        this.pathIndex++;
        
        if (this.pathIndex >= this.currentPath.length) {
            this.onPathCompleted();
        }
        
        return point;
    }

    /**
     * Проверка, завершен ли путь
     * @returns {boolean}
     */
    isPathCompleted() {
        return !this.currentPath || this.pathIndex >= this.currentPath.length;
    }

    /**
     * Очистка текущего пути
     */
    clearPath() {
        this.currentPath = null;
        this.pathIndex = 0;
        
        this.emit('pathCleared', {
            gameObject: this.gameObject
        });
    }

    /**
     * Обновление препятствий в сетке
     */
    updateObstacles() {
        if (!this.grid) {
            return;
        }

        // Очищаем сетку
        this.grid = new PF.Grid(this.gridWidth, this.gridHeight);

        // Добавляем препятствия из сцены
        this.addObstaclesToGrid();
    }

    /**
     * Добавление препятствий в сетку
     */
    addObstaclesToGrid() {
        if (!this.gameObject.scene) {
            return;
        }

        // Ищем все препятствия в сцене
        const obstacles = this.gameObject.scene.children.list.filter(obj => 
            obj.isObstacle && obj.isAlive
        );

        obstacles.forEach(obstacle => {
            // Пропускаем препятствия, которые можно облететь
            if (this.ignoreGroundObstacles && obstacle.type === 'ground') {
                return;
            }

            const gridX = Math.floor(obstacle.x / this.cellSize);
            const gridY = Math.floor(obstacle.y / this.cellSize);
            const width = Math.ceil(obstacle.width / this.cellSize);
            const height = Math.ceil(obstacle.height / this.cellSize);

            // Отмечаем клетки как препятствия
            for (let y = gridY; y < gridY + height && y < this.gridHeight; y++) {
                for (let x = gridX; x < gridX + width && x < this.gridWidth; x++) {
                    if (x >= 0 && y >= 0) {
                        this.grid.setWalkableAt(x, y, false);
                    }
                }
            }
        });
    }

    /**
     * Обработчик завершения пути
     */
    onPathCompleted() {
        this.emit('pathCompleted', {
            gameObject: this.gameObject,
            path: this.currentPath
        });
    }

    /**
     * Установка размера сетки
     * @param {number} width - Ширина
     * @param {number} height - Высота
     */
    setGridSize(width, height) {
        this.gridWidth = width;
        this.gridHeight = height;
        this.createGrid();
    }

    /**
     * Установка размера клетки
     * @param {number} cellSize - Размер клетки
     */
    setCellSize(cellSize) {
        this.cellSize = cellSize;
        this.createGrid();
    }

    /**
     * Установка алгоритма поиска пути
     * @param {string} algorithm - Алгоритм
     */
    setAlgorithm(algorithm) {
        this.algorithm = algorithm;
        this.setupFinder();
    }

    /**
     * Получение состояния поиска пути
     * @returns {Object}
     */
    getPathfindingState() {
        return {
            hasPath: !!this.currentPath,
            pathLength: this.currentPath ? this.currentPath.length : 0,
            currentIndex: this.pathIndex,
            isCompleted: this.isPathCompleted(),
            algorithm: this.algorithm,
            canFly: this.canFly,
            ignoreGroundObstacles: this.ignoreGroundObstacles,
            gridSize: { width: this.gridWidth, height: this.gridHeight },
            cellSize: this.cellSize
        };
    }

    /**
     * Эмит события
     * @param {string} event - Событие
     * @param {Object} data - Данные
     */
    emit(event, data) {
        if (this.gameObject.scene && this.gameObject.scene.events) {
            this.gameObject.scene.events.emit(`pathfinding:${event}`, data);
        }
    }

    destroy() {
        this.clearPath();
        this.grid = null;
        this.finder = null;
        super.destroy();
    }
}
