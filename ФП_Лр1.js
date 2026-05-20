// Функция возвращает новый массив, содержащий только четные числа
const getEvenNumbers = (numbers) => numbers.filter(number => number % 2 === 0);

// Функция возвращает новый массив квадратов чисел
const getSquares = (numbers) => numbers.map(number => number ** 2);

// Функция возвращает объекты, у которых есть заданное свойство
const filterByProperty = (objects, property) =>
  objects.filter(object => Object.prototype.hasOwnProperty.call(object, property));

// Функция возвращает сумму чисел массива
const getSum = (numbers) =>
  numbers.reduce((sum, number) => sum + number, 0);

// Функция высшего порядка
const applyToEach = (func, array) =>
  array.map(func);

// Функция для нахождения суммы квадратов всех четных чисел
const getSumOfEvenSquares = (numbers) => {
  const evenNumbers = getEvenNumbers(numbers);
  const squares = getSquares(evenNumbers);
  return getSum(squares);
};

// Функция для нахождения среднего арифметического чисел,
// больших заданного значения, в массиве объектов
const getAverageGreaterThan = (objects, property, minValue) => {
  const filteredNumbers = objects
    .filter(object => object[property] > minValue)
    .map(object => object[property]);

  if (filteredNumbers.length === 0) {
    return 0;
  }

  return getSum(filteredNumbers) / filteredNumbers.length;
};

// Пример массива чисел
const numbers = [1, 2, 3, 4, 5, 6, 7, 8];

// Пример массива объектов
const students = [
  { name: "Алексей", score: 75 },
  { name: "Мария", score: 90 },
  { name: "Иван", score: 60 },
  { name: "Ольга", score: 85 }
];

// Демонстрация работы функций
console.log("Исходный массив:", numbers);

console.log("Четные числа:", getEvenNumbers(numbers));

console.log("Квадраты чисел:", getSquares(numbers));

console.log("Объекты со свойством score:", filterByProperty(students, "score"));

console.log("Сумма чисел:", getSum(numbers));

console.log(
  "Применение функции к каждому элементу:",
  applyToEach(number => number * 2, numbers)
);

console.log(
  "Сумма квадратов четных чисел:",
  getSumOfEvenSquares(numbers)
);

console.log(
  "Среднее арифметическое оценок больше 70:",
  getAverageGreaterThan(students, "score", 70)
);