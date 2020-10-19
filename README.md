<p align="center">
    <img src="./watchdog.png" alt="Explanation of work">
</p>

### Установка и запуск
```
git clone https://github.com/ingria/minter-watchdog.git
cd minter-watchdog
npm install
cp .env.example .env

// Заполняем переменные в .env, затем:

npm run start
```

Желательно запускать из-под рута, предварительно сделав:

```
chmod 600 .env
```

### Supervisor/Systemctl
Полная команда для запуска с помощью service или supervisor:

```
/usr/bin/npm start --prefix /PATH/TO/WATCHDOG/ run
                        не забываем про слеш ^
```
