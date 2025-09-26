import { BaseHTMLComponent } from './BaseHTMLComponent.js';
import { TELEGRAM_UI_STYLES, UI_CONSTANTS } from '../settings/GameSettings.js';

/**
 * HTML версия таблицы результатов в стиле Telegram WebApp
 * Создает HTML элемент поверх Phaser canvas
 */
export class HTMLResultsTable extends BaseHTMLComponent {
    constructor(scene, x, y, config = {}) {
        const defaultConfig = {
            title: 'Результаты игры',
            data: {},
            width: UI_CONSTANTS.RESULTS_TABLE.DEFAULT_WIDTH,
            height: UI_CONSTANTS.RESULTS_TABLE.DEFAULT_HEIGHT,
            backgroundColor: UI_CONSTANTS.RESULTS_TABLE.DEFAULT_BACKGROUND_COLOR,
            textColor: UI_CONSTANTS.RESULTS_TABLE.DEFAULT_TEXT_COLOR,
            fontSize: UI_CONSTANTS.RESULTS_TABLE.DEFAULT_FONT_SIZE,
            fontFamily: UI_CONSTANTS.RESULTS_TABLE.DEFAULT_FONT_FAMILY,
            borderRadius: UI_CONSTANTS.RESULTS_TABLE.DEFAULT_BORDER_RADIUS,
            padding: UI_CONSTANTS.RESULTS_TABLE.DEFAULT_PADDING,
            zIndex: TELEGRAM_UI_STYLES.zIndex.modal
        };
        
        super(scene, x, y, { ...defaultConfig, ...config });
        
        this.title = this.config.title;
        this.data = this.config.data;
        this.titleElement = null;
        this.dataContainer = null;
        this.buttonsContainer = null;
        
        this.createTableElements();
    }
    
    /**
     * Создать элементы таблицы
     */
    createTableElements() {
        // Создаем заголовок
        this.titleElement = document.createElement('div');
        this.titleElement.textContent = this.title;
        this.titleElement.style.fontSize = '20px';
        this.titleElement.style.fontWeight = TELEGRAM_UI_STYLES.fonts.weightBold;
        this.titleElement.style.color = TELEGRAM_UI_STYLES.colors.text;
        this.titleElement.style.textAlign = 'center';
        this.titleElement.style.marginBottom = '16px';
        this.titleElement.style.textShadow = TELEGRAM_UI_STYLES.effects.textShadow;
        
        // Создаем контейнер для данных
        this.dataContainer = document.createElement('div');
        this.dataContainer.style.display = 'flex';
        this.dataContainer.style.flexDirection = 'column';
        this.dataContainer.style.gap = '8px';
        this.dataContainer.style.marginBottom = '16px';
        
        // Создаем контейнер для кнопок
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.style.display = 'flex';
        this.buttonsContainer.style.gap = '12px';
        this.buttonsContainer.style.justifyContent = 'center';
        
        // Добавляем элементы в контейнер
        this.container.appendChild(this.titleElement);
        this.container.appendChild(this.dataContainer);
        this.container.appendChild(this.buttonsContainer);
        
        // Изменяем стили контейнера
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'flex-start';
        this.container.style.padding = '20px';
        this.container.style.textAlign = 'center';
        
        this.createDataRows();
        this.createButtons();
    }
    
    /**
     * Создать строки данных
     */
    createDataRows() {
        if (!this.data || !this.dataContainer) return;
        
        // Очищаем предыдущие элементы
        this.dataContainer.innerHTML = '';
        
        // Создаем элементы для каждой строки данных
        Object.entries(this.data).forEach(([key, value]) => {
            const rowElement = document.createElement('div');
            rowElement.style.display = 'flex';
            rowElement.style.justifyContent = 'space-between';
            rowElement.style.width = '100%';
            rowElement.style.fontSize = TELEGRAM_UI_STYLES.fonts.size;
            rowElement.style.color = TELEGRAM_UI_STYLES.colors.text;
            rowElement.style.fontFamily = TELEGRAM_UI_STYLES.fonts.family;
            rowElement.style.padding = '4px 0';
            
            const label = this.getDataLabel(key);
            const displayValue = this.formatDataValue(value);
            
            rowElement.innerHTML = `
                <span style="color: ${TELEGRAM_UI_STYLES.colors.textSecondary}">${label}:</span>
                <span style="color: ${TELEGRAM_UI_STYLES.colors.text}">${displayValue}</span>
            `;
            
            this.dataContainer.appendChild(rowElement);
        });
    }
    
    /**
     * Создать кнопки
     */
    createButtons() {
        // Кнопка "Играть снова"
        const restartButton = this.createButton('Играть снова', () => {
            this.emit('restart');
        });
        
        // Кнопка "Меню"
        const menuButton = this.createButton('Меню', () => {
            this.emit('menu');
        });
        
        this.buttonsContainer.appendChild(restartButton);
        this.buttonsContainer.appendChild(menuButton);
    }
    
    /**
     * Создать кнопку
     * @param {string} text - Текст кнопки
     * @param {Function} onClick - Обработчик клика
     * @returns {HTMLElement} Элемент кнопки
     */
    createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.backgroundColor = TELEGRAM_UI_STYLES.colors.primary;
        button.style.color = TELEGRAM_UI_STYLES.colors.text;
        button.style.border = 'none';
        button.style.borderRadius = TELEGRAM_UI_STYLES.sizes.borderRadius;
        button.style.padding = '8px 16px';
        button.style.fontSize = TELEGRAM_UI_STYLES.fonts.size;
        button.style.fontFamily = TELEGRAM_UI_STYLES.fonts.family;
        button.style.fontWeight = TELEGRAM_UI_STYLES.fonts.weight;
        button.style.cursor = 'pointer';
        button.style.transition = TELEGRAM_UI_STYLES.effects.transition;
        button.style.boxShadow = TELEGRAM_UI_STYLES.effects.boxShadow;
        
        // Hover эффект
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = TELEGRAM_UI_STYLES.colors.primaryDark;
            button.style.boxShadow = TELEGRAM_UI_STYLES.effects.boxShadowHover;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = TELEGRAM_UI_STYLES.colors.primary;
            button.style.boxShadow = TELEGRAM_UI_STYLES.effects.boxShadow;
        });
        
        // Обработчик клика
        button.addEventListener('click', onClick);
        
        return button;
    }
    
    /**
     * Получить название данных
     * @param {string} key - Ключ данных
     * @returns {string} Название
     */
    getDataLabel(key) {
        const labels = {
            time: 'Время',
            score: 'Счет',
            enemiesKilled: 'Убито врагов',
            wavesCompleted: 'Волн пройдено',
            damageDealt: 'Урон нанесен',
            damageTaken: 'Урон получен',
            abilitiesUsed: 'Способностей использовано',
            itemsCollected: 'Предметов собрано'
        };
        
        return labels[key] || key;
    }
    
    /**
     * Форматировать значение данных
     * @param {*} value - Значение
     * @returns {string} Отформатированное значение
     */
    formatDataValue(value) {
        if (typeof value === 'number') {
            if (value % 1 === 0) {
                return value.toString();
            } else {
                return value.toFixed(1);
            }
        }
        return value.toString();
    }
    
    /**
     * Установить данные
     * @param {Object} data - Данные
     */
    setData(data) {
        this.data = data;
        this.createDataRows();
    }
    
    /**
     * Установить заголовок
     * @param {string} title - Заголовок
     */
    setTitle(title) {
        this.title = title;
        if (this.titleElement) {
            this.titleElement.textContent = title;
        }
    }
    
    /**
     * Эмитировать событие
     * @param {string} event - Название события
     * @param {*} data - Данные события
     */
    emit(event, data = null) {
        // Создаем кастомное событие
        const customEvent = new CustomEvent(`resultsTable:${event}`, {
            detail: data
        });
        document.dispatchEvent(customEvent);
    }
}
