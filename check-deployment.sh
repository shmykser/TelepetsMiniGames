#!/bin/bash

echo "🔍 Проверка статуса GitHub Pages..."

# Проверяем последний деплой
echo "📊 Последний деплой:"
curl -s "https://api.github.com/repos/shmykser/TelepetsMiniGames/actions/runs" | grep -A5 -B5 '"status"'

echo ""
echo "🌐 Проверка доступности сайта:"
if curl -s -o /dev/null -w "%{http_code}" "https://shmykser.github.io/TelepetsMiniGames/" | grep -q "200"; then
    echo "✅ Сайт доступен"
else
    echo "❌ Сайт недоступен"
fi

echo ""
echo "🖼️ Проверка спрайтов:"
if curl -s -o /dev/null -w "%{http_code}" "https://shmykser.github.io/TelepetsMiniGames/assets/graphics/sprites/enemy/ant_32x32.png" | grep -q "200"; then
    echo "✅ Спрайты доступны"
else
    echo "❌ Спрайты недоступны (404)"
fi

echo ""
echo "📝 Если спрайты недоступны, активируйте GitHub Pages:"
echo "   1. Перейдите в Settings → Pages"
echo "   2. Выберите Source: GitHub Actions"
echo "   3. Нажмите Save"
