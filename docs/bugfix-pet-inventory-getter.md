# Исправление ошибки с геттером инвентаря питомца

## Проблема

При запуске игры возникала ошибка:
```
Uncaught TypeError: Cannot set property inventory of #<Pet> which has only a getter
    at new Pet (Pet.js:30:24)
```

## Причина

В классе `Pet` был определен геттер `inventory`, который возвращал `this.inventory`, но в конструкторе мы пытались присвоить `this.inventory = new Inventory(...)`. Это создавало циклическую ссылку и конфликт между геттером и попыткой установки свойства.

## Решение

1. **Изменили инициализацию инвентаря** в конструкторе:
   ```javascript
   // Было:
   this.inventory = new Inventory(scene, this);
   
   // Стало:
   PropertyUtils.defineProperty(this, "_inventory", new Inventory(scene, this));
   ```

2. **Исправили геттер** для доступа к приватному свойству:
   ```javascript
   // Было:
   get inventory() {
       return this.inventory; // Циклическая ссылка!
   }
   
   // Стало:
   get inventory() {
       return this._inventory;
   }
   ```

## Результат

- Устранена циклическая ссылка в геттере
- Инвентарь питомца корректно инициализируется
- Все методы работы с инвентарем продолжают работать через геттер
- Игра запускается без ошибок

## Файлы изменены

- `src/objects/Pet.js` - исправлен геттер и инициализация инвентаря

## Дата исправления

21 января 2025
