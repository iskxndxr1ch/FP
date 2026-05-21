export {};

// Функция возвращает новый массив чисел, кратных заданному числу
const getMultiplesOf = (numbers: number[], divisor: number): number[] => {
  return numbers.filter((number: number): boolean => number % divisor === 0);
};

// Функция объединяет массив строк в одну строку с заданным разделителем
const joinStrings = (strings: string[], separator: string): string => {
  return strings.join(separator);
};

// Generic-функция сортирует массив объектов по значению определенного свойства
const sortByProperty = <T, K extends keyof T>(
  objects: T[],
  property: K
): T[] => {
  return [...objects].sort((firstObject: T, secondObject: T): number => {
    const firstValue = firstObject[property];
    const secondValue = secondObject[property];

    if (firstValue > secondValue) {
      return 1;
    }

    if (firstValue < secondValue) {
      return -1;
    }

    return 0;
  });
};

// Generic-функция высшего порядка, добавляющая логирование перед вызовом функции
const withLogging = <Args extends unknown[], ReturnType>(
  func: (...args: Args) => ReturnType
): ((...args: Args) => ReturnType) => {
  return (...args: Args): ReturnType => {
    console.log("Вызов функции с аргументами:", args);
    return func(...args);
  };
};

// Интерфейс для объектов массива
interface Student {
  name: string;
  age: number;
  score: number;
}

// Пример массива чисел
const numbers: number[] = [3, 6, 9, 10, 12, 15, 20, 24];

// Пример массива строк
const words: string[] = ["TypeScript", "JavaScript", "Функциональное программирование"];

// Пример массива объектов
const students: Student[] = [
  { name: "Алексей", age: 20, score: 75 },
  { name: "Мария", age: 19, score: 90 },
  { name: "Иван", age: 21, score: 60 },
  { name: "Ольга", age: 18, score: 85 }
];

// Демонстрация работы функции поиска чисел, кратных заданному числу
console.log("Исходный массив чисел:", numbers);
console.log("Числа, кратные 3:", getMultiplesOf(numbers, 3));

// Демонстрация объединения строк
console.log("Исходный массив строк:", words);
console.log("Объединенная строка:", joinStrings(words, " | "));

// Демонстрация сортировки объектов по свойству
console.log("Исходный массив студентов:");
console.table(students);

console.log("Студенты, отсортированные по оценке:");
console.table(sortByProperty(students, "score"));

console.log("Студенты, отсортированные по возрасту:");
console.table(sortByProperty(students, "age"));

// Демонстрация функции высшего порядка с логированием
const loggedGetMultiplesOf = withLogging(getMultiplesOf);

console.log(
  "Результат вызова функции с логированием:",
  loggedGetMultiplesOf(numbers, 6)
);