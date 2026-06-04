const readline = require("readline");
const getMultiplesOf = (numbers, divisor) => {
    if (divisor === 0) {
        throw new Error("Делитель не может быть равен 0.");
    }
    return numbers.filter((number) => number % divisor === 0);
};
const joinStrings = (strings, separator) => {
    return strings.join(separator);
};
const sortByProperty = (objects, property) => {
    return [...objects].sort((firstObject, secondObject) => {
        const firstValue = firstObject[property];
        const secondValue = secondObject[property];
        if (firstValue > secondValue)
            return 1;
        if (firstValue < secondValue)
            return -1;
        return 0;
    });
};
const withLogging = (func) => {
    return (...args) => {
        console.log("Вызов функции с аргументами:", args);
        return func(...args);
    };
};
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const showWarning = (message) => {
    console.warn(`Предупреждение: ${message}`);
};
const ask = async (question) => {
    try {
        return await new Promise((resolve, reject) => {
            rl.question(question, (answer) => {
                try {
                    resolve(answer.trim());
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    catch (error) {
        throw new Error(`Ошибка чтения из терминала: ${error.message}`);
    }
};
const parseNumber = (value, fieldName) => {
    const numberValue = Number(value.replace(",", "."));
    if (!Number.isFinite(numberValue)) {
        throw new Error(`${fieldName} должно быть числом.`);
    }
    return numberValue;
};
const parseInteger = (value, fieldName) => {
    const numberValue = parseNumber(value, fieldName);
    if (!Number.isInteger(numberValue)) {
        throw new Error(`${fieldName} должно быть целым числом.`);
    }
    return numberValue;
};
const askNumber = async (question, fieldName) => {
    while (true) {
        try {
            const answer = await ask(question);
            return parseNumber(answer, fieldName);
        }
        catch (error) {
            showWarning(error.message);
        }
    }
};
const askInteger = async (question, fieldName) => {
    while (true) {
        try {
            const answer = await ask(question);
            return parseInteger(answer, fieldName);
        }
        catch (error) {
            showWarning(error.message);
        }
    }
};
const askPositiveInteger = async (question, fieldName) => {
    while (true) {
        try {
            const value = await askInteger(question, fieldName);
            if (value <= 0) {
                throw new Error(`${fieldName} должно быть больше 0.`);
            }
            return value;
        }
        catch (error) {
            showWarning(error.message);
        }
    }
};
const askNonEmptyString = async (question, fieldName) => {
    while (true) {
        try {
            const answer = await ask(question);
            if (answer.length === 0) {
                throw new Error(`${fieldName} не может быть пустым.`);
            }
            return answer;
        }
        catch (error) {
            showWarning(error.message);
        }
    }
};
const fillNumberArray = async () => {
    const count = await askPositiveInteger("Введите количество элементов массива чисел: ", "Количество элементов массива чисел");
    const numbers = [];
    for (let index = 0; index < count; index++) {
        const number = await askNumber(`Введите число №${index + 1}: `, `Элемент массива чисел №${index + 1}`);
        numbers.push(number);
    }
    return numbers;
};
const fillStringArray = async () => {
    const count = await askPositiveInteger("Введите количество элементов массива строк: ", "Количество элементов массива строк");
    const strings = [];
    for (let index = 0; index < count; index++) {
        const text = await askNonEmptyString(`Введите строку №${index + 1}: `, `Строка №${index + 1}`);
        strings.push(text);
    }
    return strings;
};
const fillStudentsArray = async () => {
    const count = await askPositiveInteger("Введите количество студентов: ", "Количество студентов");
    const students = [];
    for (let index = 0; index < count; index++) {
        console.log(`\nСтудент №${index + 1}`);
        const name = await askNonEmptyString("Введите имя студента: ", "Имя студента");
        const age = await askPositiveInteger("Введите возраст студента: ", "Возраст студента");
        const score = await askNumber("Введите оценку студента: ", "Оценка студента");
        if (score < 0 || score > 100) {
            showWarning("Обычно оценка находится в диапазоне от 0 до 100.");
        }
        students.push({ name, age, score });
    }
    return students;
};
const askSortProperty = async () => {
    while (true) {
        try {
            const property = await ask("Введите поле для сортировки студентов (name, age или score): ");
            if (property !== "name" && property !== "age" && property !== "score") {
                throw new Error("Поле сортировки должно быть name, age или score.");
            }
            return property;
        }
        catch (error) {
            showWarning(error.message);
        }
    }
};
const main = async () => {
    try {
        const numbers = await fillNumberArray();
        const divisor = await askNumber("Введите делитель для поиска кратных чисел: ", "Делитель");
        const words = await fillStringArray();
        const separator = await ask("Введите разделитель для объединения строк: ");
        const students = await fillStudentsArray();
        const sortProperty = await askSortProperty();
        console.log("\nИсходный массив чисел:", numbers);
        console.log(`Числа, кратные ${divisor}:`, getMultiplesOf(numbers, divisor));
        console.log("\nИсходный массив строк:", words);
        console.log("Объединенная строка:", joinStrings(words, separator));
        console.log("\nИсходный массив студентов:");
        console.table(students);
        console.log(`Студенты, отсортированные по полю ${sortProperty}:`);
        console.table(sortByProperty(students, sortProperty));
        const loggedGetMultiplesOf = withLogging(getMultiplesOf);
        console.log("Результат вызова функции с логированием:");
        console.log(loggedGetMultiplesOf(numbers, divisor));
    }
    catch (error) {
        showWarning(`Критическая ошибка программы: ${error.message}`);
    }
    finally {
        rl.close();
    }
};
main().catch((error) => {
    showWarning(`Необработанная ошибка: ${error.message}`);
    rl.close();
});
