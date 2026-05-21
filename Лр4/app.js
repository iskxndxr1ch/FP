"use strict";
const NICE_GIF_URL = "https://media.giphy.com/media/yJFeycRK2DB4c/giphy.gif";
const SIX_SEVEN_GIF_URL = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMng0eDVqdWd4M2xhZWlrNDVvdTlkYWtrdTlsaTVoMW8xNGNwemZoOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/08uBcURaMq6vA93TGc/giphy.gif";
// Чистая функция сложения
const add = (firstNumber, secondNumber) => {
    return firstNumber + secondNumber;
};
// Чистая функция вычитания
const subtract = (firstNumber, secondNumber) => {
    return firstNumber - secondNumber;
};
// Чистая функция умножения
const multiply = (firstNumber, secondNumber) => {
    return firstNumber * secondNumber;
};
// Чистая функция деления
const divide = (firstNumber, secondNumber) => {
    if (secondNumber === 0) {
        return NaN;
    }
    return firstNumber / secondNumber;
};
// Чистая функция возведения в степень
const power = (firstNumber, secondNumber) => {
    return firstNumber ** secondNumber;
};
// Чистая функция вычисления квадратного корня
const squareRoot = (number) => {
    if (number < 0) {
        return NaN;
    }
    return Math.sqrt(number);
};
// Функция высшего порядка для логирования операций
const withLogging = (operation) => {
    return (...args) => {
        console.log("Выполняется операция с аргументами:", args);
        return operation(...args);
    };
};
// Функция высшего порядка для создания бинарной операции
const createBinaryOperation = (operation) => {
    return withLogging(operation);
};
// Чистая функция выбора операции
const getBinaryOperation = (operationName) => {
    const operations = {
        add,
        subtract,
        multiply,
        divide,
        power
    };
    return operations[operationName];
};
// Чистая функция получения символа операции
const getOperationSymbol = (operation) => {
    const symbols = {
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
const appendNumber = (state, number) => {
    if (state.waitingForSecondNumber) {
        return {
            ...state,
            displayValue: number,
            waitingForSecondNumber: false
        };
    }
    return {
        ...state,
        displayValue: state.displayValue === "0"
            ? number
            : state.displayValue + number
    };
};
// Чистая функция добавления десятичной точки
const appendDot = (state) => {
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
const clearState = () => {
    return {
        displayValue: "0",
        expression: "",
        firstNumber: null,
        operation: null,
        waitingForSecondNumber: false
    };
};
// Чистая функция выбора операции
const chooseOperation = (state, operation) => {
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
const calculateResult = (state) => {
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
const getMemeEffect = (result) => {
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
const createCursedText = (length) => {
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
    return Array.from({ length }, () => {
        const index = Math.floor(Math.random() * symbols.length);
        return symbols[index];
    }).join("");
};
const display = document.querySelector("#display");
const expressionDisplay = document.querySelector("#expressionDisplay");
const displayContainer = document.querySelector("#displayContainer");
const sideMeme = document.querySelector("#sideMeme");
const prankScreen = document.querySelector("#prankScreen");
const fireworksLayer = document.querySelector("#fireworksLayer");
const buttons = document.querySelectorAll("button");
let calculatorState = clearState();
let cursedIntervalId = null;
let slotIntervalId = null;
let prankTimeoutId = null;
let slotTimeoutIds = [];
const stopCursedEffect = () => {
    if (cursedIntervalId !== null) {
        window.clearInterval(cursedIntervalId);
        cursedIntervalId = null;
    }
    displayContainer.classList.remove("cursed-display");
};
const stopSlotEffect = () => {
    if (slotIntervalId !== null) {
        window.clearInterval(slotIntervalId);
        slotIntervalId = null;
    }
    slotTimeoutIds.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
    });
    slotTimeoutIds = [];
    display.classList.remove("slot-animation");
};
const hideAllEffects = () => {
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
const showSideGif = (gifUrl) => {
    sideMeme.src = gifUrl;
    sideMeme.classList.remove("hidden");
};
const showPrank404 = () => {
    prankScreen.classList.remove("hidden");
    prankTimeoutId = window.setTimeout(() => {
        prankScreen.classList.add("hidden");
        prankTimeoutId = null;
    }, 4000);
};
const showCursedEffect = () => {
    displayContainer.classList.add("cursed-display");
    cursedIntervalId = window.setInterval(() => {
        expressionDisplay.textContent = createCursedText(18);
        display.textContent = createCursedText(10);
    }, 90);
};
const showSlot777 = () => {
    let firstDigit = "?";
    let secondDigit = "?";
    let thirdDigit = "?";
    let activeReel = 0;
    display.classList.add("slot-animation");
    fireworksLayer.classList.add("hidden");
    display.textContent = "???";
    slotIntervalId = window.setInterval(() => {
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
    const stopFirstReel = window.setTimeout(() => {
        firstDigit = "7";
        activeReel = 1;
        display.textContent = `${firstDigit}${secondDigit}${thirdDigit}`;
    }, 900);
    const stopSecondReel = window.setTimeout(() => {
        secondDigit = "7";
        activeReel = 2;
        display.textContent = `${firstDigit}${secondDigit}${thirdDigit}`;
    }, 1700);
    const stopThirdReel = window.setTimeout(() => {
        thirdDigit = "7";
        display.textContent = `${firstDigit}${secondDigit}${thirdDigit}`;
        stopSlotEffect();
        display.textContent = "777";
        fireworksLayer.classList.remove("hidden");
    }, 2500);
    slotTimeoutIds = [stopFirstReel, stopSecondReel, stopThirdReel];
};
const applyEffect = (effect) => {
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
const render = (state, shouldApplyEffect = true) => {
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
buttons.forEach((button) => {
    button.addEventListener("click", () => {
        const number = button.dataset.number;
        const action = button.dataset.action;
        const operation = button.dataset.operation;
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
