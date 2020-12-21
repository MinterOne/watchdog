<p align="center">
    <img src="./watchdog.png" alt="Explanation of work">
</p>

# Minter watchdog
Этот скрипт нужен, чтобы отслеживать пропущенные валидатором [Minter](https://minter.network) блоки и отключать его, если пропусков слишком много. Информация о текущем статусе и пропусках отображается в реальном времени в группе или канале Telegram. 

## Установка и запуск
```
git clone https://github.com/MinterOne/watchdog.git
cd watchdog
npm install
cp .env.example .env
```

#### Пояснения к некоторым параметрам
| Ключ | Значение |
| ---- | -------- |
| NODE_API_URL | **Обязательный**. Полный URL к APIv2 (вместе с префиксом, если он есть). Например: `https://api.minter.one/v2/` |
| NODE_API_IS_TESTNET | Режим для тестнета: на основании этого параметра автоматически выбирается `chain_id` и монета для комиссии.<br> пример значений: `true`, `1`, `false`, `0`. По умолчанию `false`. |
| MINTER_TX_PRIVATE_KEY | **Обязательный**. Приватный ключ управляющего кошелька в hex-формате (64 символа). Важно: это должен быть именно приватный ключ, а не мнемоник (набор слов). |
| WATCHDOG_VALIDATOR_PUBKEY | **Обязательный**. Публичный ключ валидатора, который нужно мониторить (66 символов, начинается с `Mp`). |
| TELEGRAM_CHAT_ID | **Обязательный**. Айди канала или группы, в которую бот будет слать статусы и оповещения. Получить айди можно, например, через бота [@ShowJsonBot](https://t.me/showjsonbot) |
| TELEGRAM_BOT_KEY | **Обязательный**. Ключ бота, который можно получить у [@BotFather](https://t.me/BotFather) |

Все остальные переменные необязательные. Теперь можно проверить конфиг:

```
npm run testbed
```
Если всё хорошо, запускаем мониторинг:

```
npm run start
```

Для постоянной работы рекомендуется использовать Systemctl или [pm2](https://pm2.keymetrics.io).

### Pro tip
Так как в файле конфигурации лежит приватный ключ управляющего кошелька, к нему лучше ограничить доступ. Самый простой способ (для Linux) — сменить права на root и запускать скрипт так же из-под root:

```
chown root:root .env
chmod 600 .env
```

### Supervisor/Systemctl
Полная команда для запуска с помощью service или supervisor:

```
/usr/bin/npm start --prefix /PATH/TO/WATCHDOG/ run
```

Не забываем про слеш в конце префикса.

#### Пример запуска через pm2
1. Устанавливаем [pm2](https://pm2.keymetrics.io/docs/usage/quick-start/), если ещё не установлен.
2. Запускаем:
```
pm2 start npm --no-automation --name watchdog -- run start --prefix /PATH/TO/WATCHDOG/
```

3. Сохраняем:
```
pm2 startup && pm2 save
```
