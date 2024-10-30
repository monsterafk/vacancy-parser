import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

import { conf } from "./config";
import { formatDate, isMessageRecent, containsKeywords, getCode, getNumber} from  "./helpers";

// Создание клиента Telegram
const client = new TelegramClient(
    new StringSession(""),
    conf.apiId,
    conf.apiHash,
    {
        connectionRetries: 5
    }
);


// Функция логирования найденного сообщения
export function logFoundMessage(message: Api.Message, sender: Api.User, groupInfo: Api.Chat) {
    const messageDate = new Date(message.date * 1000);
    const divider = '='.repeat(50);
    
    console.log(`\n${divider}`);
    console.log('📝 Найдено новое сообщение');
    console.log(`🕒 Дата: ${formatDate(messageDate)}`);
    console.log(`👥 Группа: ${groupInfo.title} (${groupInfo.id})`);
    console.log(`👤 Отправитель: ${sender.firstName || ''} ${sender.lastName || ''}`);
    console.log(`📱 Username: @${sender.username || 'отсутствует'}`);
    console.log(`🆔 ID пользователя: ${sender.id}`);
    console.log('\n📄 Текст сообщения:');
    console.log(message.text);
    console.log(divider + '\n');
}

// Основная функция парсинга сообщений
async function parseMessages() {
    try {
        await client.connect();
        console.log('🔍 Начало процесса парсинга...');

        for (const groupId of conf.targetGroups) {
            try {
                // Получаем информацию о группе
                const groupInfo = await client.getEntity(groupId);
                console.log(`📥 Парсинг группы: ${groupInfo.id}`);

                const messages = await client.getMessages(groupId, {
                    limit: 100 // Количество последних сообщений для проверки
                });

                for (const message of messages) {
                    if (!message.text || !message.fromId) continue;

                    if (isMessageRecent(message) && containsKeywords(message.text)) {
                        try {
                            // Получаем информацию о пользователе
                            const sender = await client.getEntity(message.fromId);
                            
                            // Логируем найденное сообщение
                            logFoundMessage(message, sender as Api.User, groupInfo as Api.Chat);
                            
                            // Добавляем задержку между проверками
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        } catch (err) {
                            console.error(`❌ Ошибка при получении информации о пользователе: ${err}`);
                        }
                    }
                }
            } catch (err) {
                console.error(`❌ Ошибка при обработке группы ${groupId}: ${err}`);
            }
        }
        
        console.log('✅ Парсинг завершен');
    } catch (err) {
        console.error('❌ Ошибка при парсинге:', err);
    }
}

// Запуск парсера
async function startBot() {
    console.log('🚀 Запуск парсера...');

    await client.start({
        phoneNumber: async () => await getNumber(),
        phoneCode: async () => await getCode(),
        onError: (err) => console.log(err),
      });
    
      await client.connect();
    
    try {
        console.log('✅ Парсер успешно запущен');
        
        // Запускаем первый парсинг
        await parseMessages();
        
        // Запускаем парсинг каждые 30 минут
        setInterval(parseMessages, 30 * 60 * 1000);
        
    } catch (err) {
        console.error('❌ Ошибка при запуске парсера:', err);
        process.exit(1);
    }
}

startBot();