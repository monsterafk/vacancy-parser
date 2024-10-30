import {config} from "dotenv";
config();


// Конфигурация
export const conf = {
    // API данные из my.telegram.org
    apiId: Number(process.env.TG_API),
    apiHash: process.env.TG_HASH || "",
    // Ключевые слова для поиска
    keywords: ['вакансия', 'middle', 'backend'],
    // ID групп для мониторинга
    targetGroups: ['https://t.me/eth_jobs','https://t.me/nodejsjobsfeed'],
    // Максимальный возраст сообщений в днях
    maxMessageAge: 20
};