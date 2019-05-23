### Установка и запуск
```
git clone https://github.com/ingria/minter-watchdog.git
cd minter-watchdog
npm install
cp ./config.js.example ./config.js

// Заполняем настройки в config.js, затем:

npm run start
```

Желательно запускать из-под рута, предварительно сделав:

```
chmod 600 ./config.js
```

### Supervisor/Systemctl
Полная команда для запуска с помощью service или supervisor:

```
/usr/bin/npm start --prefix /PATH/TO/WATCHDOG/ run
                        не забываем про слеш ^
```

### Тестнет
http://testnet.node.minter.one:8841
http://138.197.222.87:8841
