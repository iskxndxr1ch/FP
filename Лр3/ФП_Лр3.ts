export {};

declare const require: any;
declare const process: any;

const readline = require("readline");

const getMultiplesOf = (numbers: number[], divisor: number): number[] => {
  if (divisor === 0) {
    throw new Error("Делитель не может быть равен 0.");
  }

  return numbers.filter((number: number): boolean => number % divisor === 0);
};

const joinStrings = (strings: string[], separator: string): string => {
  return strings.join(separator);
};

const sortByProperty = <T, K extends keyof T>(
  objects: T[],
  property: K
): T[] => {
  return [...objects].sort((firstObject: T, secondObject: T): number => {
    const firstValue = firstObject[property];
    const secondValue = secondObject[property];

    if (firstValue > secondValue) return 1;
    if (firstValue < secondValue) return -1;

    return 0;
  });
};

const withLogging = <Args extends unknown[], ReturnType>(
  func: (...args: Args) => ReturnType
): ((...args: Args) => ReturnType) => {
  return (...args: Args): ReturnType => {
    console.log("Вызов функции с аргументами:", args);
    return func(...args);
  };
};

interface Student {
  name: string;
  age: number;
  score: number;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const showWarning = (message: string): void => {
  console.warn(`Предупреждение: ${message}`);
};

const ask = async (question: string): Promise<string> => {
  try {
    return await new Promise<string>((resolve, reject): void => {
      rl.question(question, (answer: string): void => {
        try {
          resolve(answer.trim());
        } catch (error) {
          reject(error);
        }
      });
    });
  } catch (error) {
    throw new Error(`Ошибка чтения из терминала: ${(error as Error).message}`);
  }
};

const parseNumber = (value: string, fieldName: string): number => {
  const numberValue = Number(value.replace(",", "."));

  if (!Number.isFinite(numberValue)) {
    throw new Error(`${fieldName} должно быть числом.`);
  }

  return numberValue;
};

const parseInteger = (value: string, fieldName: string): number => {
  const numberValue = parseNumber(value, fieldName);

  if (!Number.isInteger(numberValue)) {
    throw new Error(`${fieldName} должно быть целым числом.`);
  }

  return numberValue;
};

const askNumber = async (question: string, fieldName: string): Promise<number> => {
  while (true) {
    try {
      const answer = await ask(question);
      return parseNumber(answer, fieldName);
    } catch (error) {
      showWarning((error as Error).message);
    }
  }
};

const askInteger = async (question: string, fieldName: string): Promise<number> => {
  while (true) {
    try {
      const answer = await ask(question);
      return parseInteger(answer, fieldName);
    } catch (error) {
      showWarning((error as Error).message);
    }
  }
};

const askPositiveInteger = async (
  question: string,
  fieldName: string
): Promise<number> => {
  while (true) {
    try {
      const value = await askInteger(question, fieldName);

      if (value <= 0) {
        throw new Error(`${fieldName} должно быть больше 0.`);
      }

      return value;
    } catch (error) {
      showWarning((error as Error).message);
    }
  }
};

const askNonEmptyString = async (
  question: string,
  fieldName: string
): Promise<string> => {
  while (true) {
    try {
      const answer = await ask(question);

      if (answer.length === 0) {
        throw new Error(`${fieldName} не может быть пустым.`);
      }

      return answer;
    } catch (error) {
      showWarning((error as Error).message);
    }
  }
};

const fillNumberArray = async (): Promise<number[]> => {
  const count = await askPositiveInteger(
    "Введите количество элементов массива чисел: ",
    "Количество элементов массива чисел"
  );

  const numbers: number[] = [];

  for (let index = 0; index < count; index++) {
    const number = await askNumber(
      `Введите число №${index + 1}: `,
      `Элемент массива чисел №${index + 1}`
    );
    numbers.push(number);
  }

  return numbers;
};

const fillStringArray = async (): Promise<string[]> => {
  const count = await askPositiveInteger(
    "Введите количество элементов массива строк: ",
    "Количество элементов массива строк"
  );

  const strings: string[] = [];

  for (let index = 0; index < count; index++) {
    const text = await askNonEmptyString(
      `Введите строку №${index + 1}: `,
      `Строка №${index + 1}`
    );
    strings.push(text);
  }

  return strings;
};

const fillStudentsArray = async (): Promise<Student[]> => {
  const count = await askPositiveInteger(
    "Введите количество студентов: ",
    "Количество студентов"
  );

  const students: Student[] = [];

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

const askSortProperty = async (): Promise<keyof Student> => {
  while (true) {
    try {
      const property = await ask(
        "Введите поле для сортировки студентов (name, age или score): "
      );

      if (property !== "name" && property !== "age" && property !== "score") {
        throw new Error("Поле сортировки должно быть name, age или score.");
      }

      return property;
    } catch (error) {
      showWarning((error as Error).message);
    }
  }
};

const main = async (): Promise<void> => {
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
  } catch (error) {
    showWarning(`Критическая ошибка программы: ${(error as Error).message}`);
  } finally {
    rl.close();
  }
};

main().catch((error: unknown): void => {
  showWarning(`Необработанная ошибка: ${(error as Error).message}`);
  rl.close();
});