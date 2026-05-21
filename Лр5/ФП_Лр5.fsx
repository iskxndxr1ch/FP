// Чистая функция сложения двух чисел
let add x y =
    x + y

// Чистая функция вычитания двух чисел
let subtract x y =
    x - y

// Чистая функция умножения двух чисел
let multiply x y =
    x * y

// Чистая функция деления двух чисел
let divide x y =
    if y = 0.0 then
        nan
    else
        x / y

// Рекурсивная функция вычисления факториала числа
let rec factorial n =
    if n < 0 then
        failwith "Факториал отрицательного числа не определен"
    elif n = 0 then
        1
    else
        n * factorial (n - 1)

// Использование каррирования для создания специализированных функций
let addTen = add 10
let subtractFive = fun x -> subtract x 5
let multiplyByTwo = multiply 2
let divideByTwo = fun x -> divide x 2.0

printfn "Сумма 10 и 5: %d" (add 10 5)
printfn "Разность 10 и 5: %d" (subtract 10 5)
printfn "Произведение 10 и 5: %d" (multiply 10 5)
printfn "Деление 10.0 на 5.0: %f" (divide 10.0 5.0)

printfn "Факториал числа 5: %d" (factorial 5)

printfn "Каррирование: прибавить 10 к 7 = %d" (addTen 7)
printfn "Каррирование: вычесть 5 из 20 = %d" (subtractFive 20)
printfn "Каррирование: умножить 8 на 2 = %d" (multiplyByTwo 8)
printfn "Каррирование: разделить 20.0 на 2.0 = %f" (divideByTwo 20.0)