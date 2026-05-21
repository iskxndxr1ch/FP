export {};

type BinaryOperation = (firstNumber: number, secondNumber: number) => number;
type UnaryOperation = (number: number) => number;

type OperationName =
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "power"
  | "sqrt";

interface CalculatorState {
  displayValue: string;
  expression: string;
  firstNumber: number | null;
  operation: OperationName | null;
  waitingForSecondNumber: boolean;
}

interface MemeEffect {
  result: number;
  type: "sideGif" | "prank404" | "cursed" | "slot777" | "none";
  gifUrl?: string;
}

const NICE_GIF_URL = "https://media.giphy.com/media/yJFeycRK2DB4c/giphy.gif";
const SIX_SEVEN_GIF_URL = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMng0eDVqdWd4M2xhZWlrNDVvdTlkYWtrdTlsaTVoMW8xNGNwemZoOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/08uBcURaMq6vA93TGc/giphy.gif";

// Чистая функция сложения
const add: BinaryOperation = (
  firstNumber: number,
  secondNumber: number
): number => {
  return firstNumber + secondNumber;
};

// Чистая функция вычитания
const subtract: BinaryOperation = (
  firstNumber: number,
  secondNumber: number
): number => {
  return firstNumber - secondNumber;
};

// Чистая функция умножения
const multiply: BinaryOperation = (
  firstNumber: number,
  secondNumber: number
): number => {
  return firstNumber * secondNumber;
};

// Чистая функция деления
const divide: BinaryOperation = (
  firstNumber: number,
  secondNumber: number
): number => {
  if (secondNumber === 0) {
    return NaN;
  }

  return firstNumber / secondNumber;
};

// Чистая функция возведения в степень
const power: BinaryOperation = (
  firstNumber: number,
  secondNumber: number
): number => {
  return firstNumber ** secondNumber;
};

// Чистая функция вычисления квадратного корня
const squareRoot: UnaryOperation = (number: number): number => {
  if (number < 0) {
    return NaN;
  }

  return Math.sqrt(number);
};

// Функция высшего порядка для логирования операций
const withLogging = <Args extends unknown[], ReturnType>(
  operation: (...args: Args) => ReturnType
): ((...args: Args) => ReturnType) => {
  return (...args: Args): ReturnType => {
    console.log("Выполняется операция с аргументами:", args);
    return operation(...args);
  };
};

// Функция высшего порядка для создания бинарной операции
const createBinaryOperation = (
  operation: BinaryOperation
): BinaryOperation => {
  return withLogging(operation);
};

// Чистая функция выбора операции
const getBinaryOperation = (operationName: OperationName): BinaryOperation => {
  const operations: Record<string, BinaryOperation> = {
    add,
    subtract,
    multiply,
    divide,
    power
  };

  return operations[operationName];
};

// Чистая функция получения символа операции
const getOperationSymbol = (operation: OperationName): string => {
  const symbols: Record<OperationName, string> = {
    add: "+",
    subtract: "−",
    multiply: "×",
    divide: "÷",
    power: "^",
    sqrt: "√"
  };

  return symbols[operation];
};

// Чистая функция добавления цифры на экран
const appendNumber = (
  state: CalculatorState,
  number: string
): CalculatorState => {
  if (state.waitingForSecondNumber) {
    return {
      ...state,
      displayValue: number,
      waitingForSecondNumber: false
    };
  }

  return {
    ...state,
    displayValue:
      state.displayValue === "0"
        ? number
        : state.displayValue + number
  };
};

// Чистая функция добавления десятичной точки
const appendDot = (state: CalculatorState): CalculatorState => {
  if (state.waitingForSecondNumber) {
    return {
      ...state,
      displayValue: "0.",
      waitingForSecondNumber: false
    };
  }

  if (state.displayValue.includes(".")) {
    return state;
  }

  return {
    ...state,
    displayValue: state.displayValue + "."
  };
};

// Чистая функция сброса состояния
const clearState = (): CalculatorState => {
  return {
    displayValue: "0",
    expression: "",
    firstNumber: null,
    operation: null,
    waitingForSecondNumber: false
  };
};

// Чистая функция выбора операции
const chooseOperation = (
  state: CalculatorState,
  operation: OperationName
): CalculatorState => {
  if (operation === "sqrt") {
    const loggedSquareRoot = withLogging(squareRoot);
    const currentNumber = Number(state.displayValue);
    const result = loggedSquareRoot(currentNumber);

    return {
      ...state,
      displayValue: String(result),
      expression: `√${currentNumber}`,
      firstNumber: null,
      operation: null,
      waitingForSecondNumber: true
    };
  }

  return {
    ...state,
    firstNumber: Number(state.displayValue),
    operation,
    expression: `${state.displayValue} ${getOperationSymbol(operation)}`,
    waitingForSecondNumber: true
  };
};

// Чистая функция вычисления результата
const calculateResult = (state: CalculatorState): CalculatorState => {
  if (state.firstNumber === null || state.operation === null) {
    return state;
  }

  const secondNumber = Number(state.displayValue);
  const operation = createBinaryOperation(getBinaryOperation(state.operation));
  const result = operation(state.firstNumber, secondNumber);

  return {
    displayValue: String(result),
    expression: `${state.firstNumber} ${getOperationSymbol(state.operation)} ${secondNumber} =`,
    firstNumber: null,
    operation: null,
    waitingForSecondNumber: true
  };
};

// Чистая функция выбора эффекта по результату
const getMemeEffect = (result: number): MemeEffect => {
  if (result === 69) {
    return {
      result,
      type: "sideGif",
      gifUrl: NICE_GIF_URL
    };
  }

  if (result === 67) {
    return {
      result,
      type: "sideGif",
      gifUrl: SIX_SEVEN_GIF_URL
    };
  }

  if (result === 404) {
    return {
      result,
      type: "prank404"
    };
  }

  if (result === 666) {
    return {
      result,
      type: "cursed"
    };
  }

  if (result === 777) {
    return {
      result,
      type: "slot777"
    };
  }

  return {
    result,
    type: "none"
  };
};

// Чистая функция генерации cursed-строки
const createCursedText = (length: number): string => {
  const symbols = [
    "☠",
    "✦",
    "✧",
    "✺",
    "✹",
    "⛧",
    "⌬",
    "░",
    "▒",
    "▓",
    "█",
    "҉",
    "Ж",
    "Х",
    "Ф",
    "Ы",
    "λ",
    "ψ",
    "Ω",
    "?"
  ];

  return Array.from({ length }, (): string => {
    const index = Math.floor(Math.random() * symbols.length);
    return symbols[index];
  }).join("");
};

const display = document.querySelector("#display") as HTMLDivElement;
const expressionDisplay = document.querySelector("#expressionDisplay") as HTMLDivElement;
const displayContainer = document.querySelector("#displayContainer") as HTMLDivElement;
const sideMeme = document.querySelector("#sideMeme") as HTMLImageElement;
const prankScreen = document.querySelector("#prankScreen") as HTMLDivElement;
const fireworksLayer = document.querySelector("#fireworksLayer") as HTMLDivElement;
const buttons = document.querySelectorAll<HTMLButtonElement>("button");

let calculatorState: CalculatorState = clearState();

let cursedIntervalId: number | null = null;
let slotIntervalId: number | null = null;
let prankTimeoutId: number | null = null;
let slotTimeoutIds: number[] = [];

const stopCursedEffect = (): void => {
  if (cursedIntervalId !== null) {
    window.clearInterval(cursedIntervalId);
    cursedIntervalId = null;
  }

  displayContainer.classList.remove("cursed-display");
};

const stopSlotEffect = (): void => {
  if (slotIntervalId !== null) {
    window.clearInterval(slotIntervalId);
    slotIntervalId = null;
  }

  slotTimeoutIds.forEach((timeoutId: number): void => {
    window.clearTimeout(timeoutId);
  });

  slotTimeoutIds = [];
  display.classList.remove("slot-animation");
};

const hideAllEffects = (): void => {
  sideMeme.classList.add("hidden");
  fireworksLayer.classList.add("hidden");
  prankScreen.classList.add("hidden");

  stopCursedEffect();
  stopSlotEffect();

  if (prankTimeoutId !== null) {
    window.clearTimeout(prankTimeoutId);
    prankTimeoutId = null;
  }
};

const showSideGif = (gifUrl: string): void => {
  sideMeme.src = gifUrl;
  sideMeme.classList.remove("hidden");
};

const showPrank404 = (): void => {
  prankScreen.classList.remove("hidden");

  prankTimeoutId = window.setTimeout((): void => {
    prankScreen.classList.add("hidden");
    prankTimeoutId = null;
  }, 4000);
};

const showCursedEffect = (): void => {
  displayContainer.classList.add("cursed-display");

  cursedIntervalId = window.setInterval((): void => {
    expressionDisplay.textContent = createCursedText(18);
    display.textContent = createCursedText(10);
  }, 90);
};

const showSlot777 = (): void => {
  let firstDigit = "?";
  let secondDigit = "?";
  let thirdDigit = "?";

  let activeReel: 0 | 1 | 2 = 0;

  display.classList.add("slot-animation");
  fireworksLayer.classList.add("hidden");
  display.textContent = "???";

  slotIntervalId = window.setInterval((): void => {
    if (activeReel === 0) {
      firstDigit = String(Math.floor(Math.random() * 10));
    }

    if (activeReel === 1) {
      secondDigit = String(Math.floor(Math.random() * 10));
    }

    if (activeReel === 2) {
      thirdDigit = String(Math.floor(Math.random() * 10));
    }

    display.textContent = `${firstDigit}${secondDigit}${thirdDigit}`;
  }, 70);

  const stopFirstReel = window.setTimeout((): void => {
    firstDigit = "7";
    activeReel = 1;
    display.textContent = `${firstDigit}${secondDigit}${thirdDigit}`;
  }, 900);

  const stopSecondReel = window.setTimeout((): void => {
    secondDigit = "7";
    activeReel = 2;
    display.textContent = `${firstDigit}${secondDigit}${thirdDigit}`;
  }, 1700);

  const stopThirdReel = window.setTimeout((): void => {
    thirdDigit = "7";
    display.textContent = `${firstDigit}${secondDigit}${thirdDigit}`;

    stopSlotEffect();

    display.textContent = "777";
    fireworksLayer.classList.remove("hidden");
  }, 2500);

  slotTimeoutIds = [stopFirstReel, stopSecondReel, stopThirdReel];
};

const applyEffect = (effect: MemeEffect): void => {
  if (effect.type === "sideGif" && effect.gifUrl !== undefined) {
    showSideGif(effect.gifUrl);
    return;
  }

  if (effect.type === "prank404") {
    showPrank404();
    return;
  }

  if (effect.type === "cursed") {
    showCursedEffect();
    return;
  }

  if (effect.type === "slot777") {
    showSlot777();
    return;
  }
};

const render = (
  state: CalculatorState,
  shouldApplyEffect: boolean = true
): void => {
  hideAllEffects();

  expressionDisplay.textContent = state.expression;

  if (state.displayValue === "NaN") {
    display.textContent = "Ошибка";
    return;
  }

  display.textContent = state.displayValue;

  if (!shouldApplyEffect) {
    return;
  }

  const result = Number(state.displayValue);
  const effect = getMemeEffect(result);
  applyEffect(effect);
};

buttons.forEach((button: HTMLButtonElement): void => {
  button.addEventListener("click", (): void => {
    const number = button.dataset.number;
    const action = button.dataset.action;
    const operation = button.dataset.operation as OperationName | undefined;

    if (action === "clear") {
      calculatorState = clearState();
      render(calculatorState, false);
      return;
    }

    if (number !== undefined) {
      calculatorState = appendNumber(calculatorState, number);
      render(calculatorState, false);
      return;
    }

    if (action === "dot") {
      calculatorState = appendDot(calculatorState);
      render(calculatorState, false);
      return;
    }

    if (operation !== undefined) {
      calculatorState = chooseOperation(calculatorState, operation);
      render(calculatorState, false);
      return;
    }

    if (action === "calculate") {
      calculatorState = calculateResult(calculatorState);
      render(calculatorState, true);
      return;
    }
  });
});

render(calculatorState, false);