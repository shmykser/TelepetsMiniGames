import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const collected = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[SPAWNDBG]')) {
      collected.push(text);
      // Также печатаем построчно, чтобы получить вывод в реальном времени
      console.log(text);
    }
  });

  await page.goto('http://localhost:5173');

  // 1) В меню кликаем по HTML-кнопке "ТЕСТ ПОВЕДЕНИЙ"
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const btn = all.find(el => (el.textContent || '').trim().includes('ТЕСТ ПОВЕДЕНИЙ'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);

  // 2) На сцене TestBehaviors создаем цель (клик по центру canvas)
  const viewport = page.viewportSize() || { width: 800, height: 600 };
  await page.mouse.click(Math.floor(viewport.width / 2), Math.floor(viewport.height / 2));
  await page.waitForTimeout(200);

  // 3) Кликаем по сетке маленьких кнопок (круги) в TestBehaviors, чтобы создать много разных типов
  // Сетка начинается с (20,80), шаг 45px по X и Y, радиус ~20px
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 12; col++) {
      const x = 20 + col * 45;
      const y = 80 + row * 45;
      await page.mouse.click(x, y);
      await page.waitForTimeout(40);
    }
  }

  // 4) Ждем, чтобы стратегии инициализировались и (возможные) спавны успели произойти
  await page.waitForTimeout(9500);

  await browser.close();

  // Итоговый вывод (на случай, если событие консоли не сработало)
  if (collected.length) {
    console.log('\n===== [SPAWNDBG] summary captured =====');
    console.log(collected.join('\n'));
  } else {
    console.log('No [SPAWNDBG] logs captured.');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


