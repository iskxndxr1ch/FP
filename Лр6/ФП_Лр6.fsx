open System

// Тип бинарной операции
type BinaryOperation = float -> float -> float

// Тип унарной операции
type UnaryOperation = float -> float

// Чистая функция сложения
let add x y =
    x + y

// Чистая функция вычитания
let subtract x y =
    x - y

// Чистая функция умножения
let multiply x y =
    x * y

// Чистая функция деления
let divide x y =
    if y = 0.0 then
        nan
    else
        x / y

// Чистая функция возведения в степень
let power x y =
    Math.Pow(x, y)

// Чистая функция вычисления квадратного корня
let squareRoot x =
    if x < 0.0 then
        nan
    else
        Math.Sqrt(x)

// Чистая функция перевода градусов в радианы
let degreesToRadians degrees =
    degrees * Math.PI / 180.0

// Чистая функция вычисления синуса угла в градусах
let sine degrees =
    degrees
    |> degreesToRadians
    |> Math.Sin

// Чистая функция вычисления косинуса угла в градусах
let cosine degrees =
    degrees
    |> degreesToRadians
    |> Math.Cos

// Чистая функция вычисления тангенса угла в градусах
let tangent degrees =
    degrees
    |> degreesToRadians
    |> Math.Tan

// Функция высшего порядка для создания бинарной операции
let createBinaryOperation operation =
    fun x y -> operation x y

// Функция высшего порядка для создания унарной операции
let createUnaryOperation operation =
    fun x -> operation x

// Каррирование: создание специализированных функций из общих
let calculatedAdd = createBinaryOperation add
let calculatedSubtract = createBinaryOperation subtract
let calculatedMultiply = createBinaryOperation multiply
let calculatedDivide = createBinaryOperation divide
let calculatedPower = createBinaryOperation power

let calculatedSquareRoot = createUnaryOperation squareRoot
let calculatedSine = createUnaryOperation sine
let calculatedCosine = createUnaryOperation cosine
let calculatedTangent = createUnaryOperation tangent

// Функция безопасного чтения числа
let rec readNumber message =
    printf "%s" message
    let input = Console.ReadLine()

    match Double.TryParse(input) with
    | true, value -> value
    | false, _ ->
        printfn "Ошибка: введите корректное число."
        readNumber message

// Функция форматирования результата
let formatNumber number =
    if Double.IsNaN(number) then
        "ошибка вычисления"
    elif number % 1.0 = 0.0 then
        sprintf "%.0f" number
    else
        sprintf "%.6f" number

// Вывод результата бинарной операции
let printBinaryResult firstNumber secondNumber symbol result =
    printfn ""
    printfn "%s %s %s = %s"
        (formatNumber firstNumber)
        symbol
        (formatNumber secondNumber)
        (formatNumber result)

// Вывод результата унарной операции
let printUnaryResult operationName number result =
    printfn ""
    printfn "%s(%s) = %s"
        operationName
        (formatNumber number)
        (formatNumber result)

// Выполнение бинарной операции
let executeBinaryOperation operation symbol =
    let firstNumber = readNumber "Введите первое число: "
    let secondNumber = readNumber "Введите второе число: "

    let result = operation firstNumber secondNumber

    printBinaryResult firstNumber secondNumber symbol result

// Выполнение унарной операции
let executeUnaryOperation operationName operation =
    let number = readNumber "Введите число: "

    let result = operation number

    printUnaryResult operationName number result

// Вывод меню
let printMenu () =
    printfn ""
    printfn "===== Калькулятор ====="
    printfn "1. Сложение"
    printfn "2. Вычитание"
    printfn "3. Умножение"
    printfn "4. Деление"
    printfn "5. Возведение в степень"
    printfn "6. Квадратный корень"
    printfn "7. Синус угла"
    printfn "8. Косинус угла"
    printfn "9. Тангенс угла"
    printfn "0. Выход"
    printf "Выберите операцию: "

// Основной цикл программы
let rec calculatorLoop () =
    printMenu()

    let choice = Console.ReadLine()

    match choice with
    | "1" ->
        executeBinaryOperation calculatedAdd "+"
        calculatorLoop()

    | "2" ->
        executeBinaryOperation calculatedSubtract "-"
        calculatorLoop()

    | "3" ->
        executeBinaryOperation calculatedMultiply "*"
        calculatorLoop()

    | "4" ->
        executeBinaryOperation calculatedDivide "/"
        calculatorLoop()

    | "5" ->
        executeBinaryOperation calculatedPower "^"
        calculatorLoop()

    | "6" ->
        executeUnaryOperation "sqrt" calculatedSquareRoot
        calculatorLoop()

    | "7" ->
        executeUnaryOperation "sin" calculatedSine
        calculatorLoop()

    | "8" ->
        executeUnaryOperation "cos" calculatedCosine
        calculatorLoop()

    | "9" ->
        executeUnaryOperation "tan" calculatedTangent
        calculatorLoop()

    | "0" ->
        printfn "Работа программы завершена."

    | _ ->
        printfn "Ошибка: выберите пункт меню от 0 до 9."
        calculatorLoop()

calculatorLoop()