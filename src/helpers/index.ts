import { Api } from "telegram";

import {conf} from "../config";

import PromptSync from 'prompt-sync';
const prompt = PromptSync();

// Функция форматирования даты
export function formatDate(date: any) {
    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Функция проверки возраста сообщения
export function isMessageRecent(message: Api.Message) {
    const messageDate = new Date(message.date * 1000);
    const now = new Date();
    const diffDays = (Number(now) - Number(messageDate)) / (1000 * 60 * 60 * 24);
    return diffDays <= conf.maxMessageAge;
}

// Функция проверки наличия ключевых слов
export function containsKeywords(text: string) {
    return conf.keywords.some(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
    );
}

export async function getCode(): Promise<string>{
    const message = prompt('Введите код: ')
    return message;
}
export async function getNumber(): Promise<string>{
    const message = prompt('Введите номер: ')
    return message;
}
