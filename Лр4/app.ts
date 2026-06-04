type BillingCycle = "monthly" | "yearly";
type OperationName = "add" | "subtract" | "multiply" | "divide";

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  credits: number;
  description: string;
}

interface CalculatorState {
  displayValue: string;
  expression: string;
  firstNumber: number | null;
  operation: OperationName | null;
  waitingForSecondNumber: boolean;
}

interface SubscriptionState {
  planId: string;
  billing: BillingCycle;
  credits: number;
  cardLast4: string;
  purchasedAt: number;
  nextRefillAt: number;
}

const STORAGE_KEY = "apple-calculator-plus-subscription";
const CREDIT_COST = 1;
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

const plans: Plan[] = [
  {
    id: "starter",
    name: "Mini",
    monthlyPrice: 49,
    yearlyPrice: 490,
    credits: 10,
    description: "Для людей, которым иногда нужно узнать, сколько будет 2 + 2."
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 149,
    yearlyPrice: 1490,
    credits: 50,
    description: "Оптимально для тех, кто считает сдачу и делает вид, что это аналитика."
  },
  {
    id: "ultra",
    name: "Ultra",
    monthlyPrice: 399,
    yearlyPrice: 3990,
    credits: 250,
    description: "Когда калькулятор нужен чаще, чем здравый смысл."
  }
];

const operationSymbols: Record<OperationName, string> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷"
};

const operations: Record<OperationName, (firstNumber: number, secondNumber: number) => number> = {
  add: (firstNumber: number, secondNumber: number): number => firstNumber + secondNumber,
  subtract: (firstNumber: number, secondNumber: number): number => firstNumber - secondNumber,
  multiply: (firstNumber: number, secondNumber: number): number => firstNumber * secondNumber,
  divide: (firstNumber: number, secondNumber: number): number => {
    if (secondNumber === 0) {
      return NaN;
    }

    return firstNumber / secondNumber;
  }
};

const display = document.querySelector("#display") as HTMLDivElement;
const expressionDisplay = document.querySelector("#expressionDisplay") as HTMLDivElement;
const displayPanel = display.parentElement as HTMLDivElement | null;
const smokeVideo = document.querySelector("#smokeVideo") as HTMLVideoElement | null;
const buttons = document.querySelectorAll<HTMLButtonElement>(".buttons button");
const powerButton = document.querySelector("[data-action='power']") as HTMLButtonElement;
const creditsValue = document.querySelector("#creditsValue") as HTMLSpanElement;
const planName = document.querySelector("#planName") as HTMLHeadingElement;
const planDescription = document.querySelector("#planDescription") as HTMLParagraphElement;
const paymentLabel = document.querySelector("#paymentLabel") as HTMLElement;
const subscriptionModal = document.querySelector("#subscriptionModal") as HTMLDivElement;
const closeModalButton = document.querySelector("#closeModal") as HTMLButtonElement;
const billingButtons = document.querySelectorAll<HTMLButtonElement>("[data-billing]");
const plansGrid = document.querySelector("#plansGrid") as HTMLDivElement;
const plansStep = document.querySelector("#plansStep") as HTMLDivElement;
const paymentForm = document.querySelector("#paymentForm") as HTMLFormElement;
const backToPlansButton = document.querySelector("#backToPlans") as HTMLButtonElement;
const selectedPlanSummary = document.querySelector("#selectedPlanSummary") as HTMLDivElement;
const cardName = document.querySelector("#cardName") as HTMLInputElement;
const cardNumber = document.querySelector("#cardNumber") as HTMLInputElement;
const cardExpiry = document.querySelector("#cardExpiry") as HTMLInputElement;
const cardCvc = document.querySelector("#cardCvc") as HTMLInputElement;
const toast = document.querySelector("#toast") as HTMLDivElement;

let calculatorState: CalculatorState = createInitialCalculatorState();
let subscriptionState: SubscriptionState | null = loadSubscription();
let selectedBilling: BillingCycle = "monthly";
let selectedPlanId: string = plans[1].id;
let pendingCalculation = false;
let toastTimeoutId: number | null = null;
let memoryValue = 0;
let isPoweredOn = false;
let powerHoldTimeoutId: number | null = null;
let isMeltdownActive = false;
let meltdownTimeoutId: number | null = null;
let smokeFadeStartTimeoutId: number | null = null;
let smokeFadeTimeoutId: number | null = null;
let smokeFadeStartFrameId: number | null = null;
let smokeFadeEndFrameId: number | null = null;

const POWER_HOLD_DURATION = 900;
const MELTDOWN_DURATION = 9000;
const SMOKE_FADE_DURATION = 1200;
const MAX_DISPLAY_FONT_SIZE = 42;
const TABLET_DISPLAY_FONT_SIZE = 38;
const MOBILE_DISPLAY_FONT_SIZE = 30;
const MIN_DISPLAY_FONT_SIZE = 7;
const DISPLAY_WIDTH_RESERVE = 4;
const displayMeasureContext = document.createElement("canvas").getContext("2d");

function createInitialCalculatorState(): CalculatorState {
  return {
    displayValue: "0",
    expression: "",
    firstNumber: null,
    operation: null,
    waitingForSecondNumber: false
  };
}

function loadSubscription(): SubscriptionState | null {
  localStorage.removeItem(STORAGE_KEY);
  return null;
}

function saveSubscription(state: SubscriptionState | null): void {
  subscriptionState = state;

  if (state === null) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatMoney(value: number): string {
  return `${value} ₽`;
}

function getPlan(planId: string): Plan {
  return plans.find((plan: Plan): boolean => plan.id === planId) || plans[0];
}

function getPlanPrice(plan: Plan, billing: BillingCycle): number {
  return billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
}

function getBillingLabel(billing: BillingCycle): string {
  return billing === "monthly" ? "месяц" : "год";
}

function getNextRefillAt(fromTime: number): number {
  return fromTime + WEEK_IN_MS;
}

function formatRefillDate(value: number): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function applyWeeklyCreditRefill(): void {
  if (subscriptionState === null) {
    return;
  }

  const now = Date.now();

  if (now < subscriptionState.nextRefillAt) {
    return;
  }

  const plan = getPlan(subscriptionState.planId);
  const missedRefills = Math.floor((now - subscriptionState.nextRefillAt) / WEEK_IN_MS) + 1;

  saveSubscription({
    ...subscriptionState,
    credits: plan.credits,
    nextRefillAt: subscriptionState.nextRefillAt + missedRefills * WEEK_IN_MS
  });
}

function formatDisplayValue(value: number): string {
  if (!Number.isFinite(value)) {
    return "Ошибка";
  }

  const roundedValue = Number.parseFloat(value.toFixed(10));
  return String(roundedValue);
}

function appendNumber(state: CalculatorState, number: string): CalculatorState {
  if (state.waitingForSecondNumber) {
    return {
      ...state,
      displayValue: number,
      waitingForSecondNumber: false
    };
  }

  return {
    ...state,
    displayValue: state.displayValue === "0" ? number : state.displayValue + number
  };
}

function appendDot(state: CalculatorState): CalculatorState {
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
    displayValue: `${state.displayValue}.`
  };
}

function toggleSign(state: CalculatorState): CalculatorState {
  if (state.displayValue === "0") {
    return state;
  }

  return {
    ...state,
    displayValue: state.displayValue.startsWith("-")
      ? state.displayValue.slice(1)
      : `-${state.displayValue}`
  };
}

function percent(state: CalculatorState): CalculatorState {
  return {
    ...state,
    displayValue: formatDisplayValue(Number(state.displayValue) / 100)
  };
}

function getDisplayNumber(): number {
  const currentNumber = Number(calculatorState.displayValue);
  return Number.isFinite(currentNumber) ? currentNumber : 0;
}

function memoryRecall(): void {
  calculatorState = {
    ...calculatorState,
    displayValue: formatDisplayValue(memoryValue),
    waitingForSecondNumber: false
  };
  renderCalculator();
}

function memoryAdd(): void {
  memoryValue += getDisplayNumber();
  showToast("m+ saved. Even memory is monetizable eventually.");
}

function memorySubtract(): void {
  memoryValue -= getDisplayNumber();
  showToast("m- saved. The calculator remembers your losses.");
}

function chooseOperation(state: CalculatorState, operation: OperationName): CalculatorState {
  return {
    ...state,
    firstNumber: Number(state.displayValue),
    operation,
    expression: `${state.displayValue} ${operationSymbols[operation]}`,
    waitingForSecondNumber: true
  };
}

function calculateResult(state: CalculatorState): CalculatorState {
  if (state.firstNumber === null || state.operation === null) {
    return state;
  }

  const secondNumber = Number(state.displayValue);
  const result = operations[state.operation](state.firstNumber, secondNumber);

  return {
    displayValue: formatDisplayValue(result),
    expression: `${state.firstNumber} ${operationSymbols[state.operation]} ${secondNumber} =`,
    firstNumber: null,
    operation: null,
    waitingForSecondNumber: true
  };
}

function canSpendCredit(): boolean {
  applyWeeklyCreditRefill();
  return subscriptionState !== null && subscriptionState.credits >= CREDIT_COST;
}

function spendCredit(): void {
  applyWeeklyCreditRefill();

  if (subscriptionState === null) {
    return;
  }

  saveSubscription({
    ...subscriptionState,
    credits: subscriptionState.credits - CREDIT_COST
  });
}

function runPaidCalculation(): void {
  if (isMeltdownActive) {
    return;
  }

  if (calculatorState.firstNumber === null || calculatorState.operation === null) {
    showToast("Сначала соберите пример. Даже премиум не считает пустоту.");
    return;
  }

  if (isDivisionByZero(calculatorState)) {
    triggerDivisionByZeroMeltdown();
    return;
  }

  if (!canSpendCredit()) {
    pendingCalculation = true;
    openSubscriptionModal();
    return;
  }

  calculatorState = calculateResult(calculatorState);
  spendCredit();
  renderCalculator();
  renderSubscription();
}

function renderCalculator(): void {
  displayPanel?.classList.toggle("is-error", isMeltdownActive);

  if (!isPoweredOn) {
    displayPanel?.classList.add("is-off");
    expressionDisplay.textContent = "";
    display.textContent = "";
    display.style.fontSize = "";
    display.style.transform = "";
    return;
  }

  displayPanel?.classList.remove("is-off");
  expressionDisplay.textContent = calculatorState.expression;
  display.textContent = calculatorState.displayValue;
  fitDisplayValue();
}

function togglePower(): void {
  if (isMeltdownActive) {
    return;
  }

  isPoweredOn = !isPoweredOn;
  calculatorState = createInitialCalculatorState();
  pendingCalculation = false;
  closeSubscriptionModal();
  renderCalculator();
}

function startPowerHold(event: PointerEvent): void {
  if (isMeltdownActive) {
    return;
  }

  if (event.button !== undefined && event.button !== 0) {
    return;
  }

  event.preventDefault();

  if (powerHoldTimeoutId !== null) {
    return;
  }

  powerButton.classList.add("is-holding");

  powerHoldTimeoutId = window.setTimeout((): void => {
    powerHoldTimeoutId = null;
    powerButton.classList.remove("is-holding");
    togglePower();
  }, POWER_HOLD_DURATION);
}

function cancelPowerHold(): void {
  if (powerHoldTimeoutId !== null) {
    window.clearTimeout(powerHoldTimeoutId);
    powerHoldTimeoutId = null;
  }

  powerButton.classList.remove("is-holding");
}

function getMaxDisplayFontSize(): number {
  if (window.matchMedia("(max-width: 480px)").matches) {
    return MOBILE_DISPLAY_FONT_SIZE;
  }

  if (window.matchMedia("(max-width: 820px)").matches) {
    return TABLET_DISPLAY_FONT_SIZE;
  }

  return MAX_DISPLAY_FONT_SIZE;
}

function fitDisplayValue(): void {
  const maxFontSize = getMaxDisplayFontSize();
  const availableWidth = getDisplayAvailableWidth();
  const text = display.textContent || "0";

  display.style.fontSize = `${maxFontSize}px`;
  display.style.transform = "";

  if (availableWidth <= 0) {
    return;
  }

  const maxTextWidth = measureDisplayText(text, maxFontSize);

  if (maxTextWidth <= availableWidth) {
    return;
  }

  const fittedFontSize = Math.max(
    MIN_DISPLAY_FONT_SIZE,
    Math.floor((maxFontSize * availableWidth) / maxTextWidth)
  );

  display.style.fontSize = `${fittedFontSize}px`;

  const fittedTextWidth = measureDisplayText(text, fittedFontSize);

  if (fittedTextWidth > availableWidth) {
    const scale = Math.max(0.2, availableWidth / fittedTextWidth);
    display.style.transform = `scaleX(${scale})`;
  }
}

function getDisplayAvailableWidth(): number {
  const displayParent = display.parentElement;

  if (displayParent === null) {
    return Math.max(0, display.clientWidth - DISPLAY_WIDTH_RESERVE);
  }

  const parentStyles = window.getComputedStyle(displayParent);
  const horizontalPadding =
    Number.parseFloat(parentStyles.paddingLeft) +
    Number.parseFloat(parentStyles.paddingRight);

  return Math.max(0, displayParent.clientWidth - horizontalPadding - DISPLAY_WIDTH_RESERVE);
}

function measureDisplayText(text: string, fontSize: number): number {
  if (displayMeasureContext === null) {
    return text.length * fontSize * 0.58;
  }

  const displayStyles = window.getComputedStyle(display);
  displayMeasureContext.font = `${displayStyles.fontWeight} ${fontSize}px ${displayStyles.fontFamily}`;

  return displayMeasureContext.measureText(text).width;
}

function isDivisionByZero(state: CalculatorState): boolean {
  return state.operation === "divide" && Number(state.displayValue) === 0;
}

function triggerDivisionByZeroMeltdown(): void {
  isMeltdownActive = true;
  isPoweredOn = true;
  pendingCalculation = false;
  closeSubscriptionModal();
  drainCredits();

  calculatorState = {
    displayValue: "ERROR",
    expression: "DIVISION BY ZERO",
    firstNumber: null,
    operation: null,
    waitingForSecondNumber: true
  };

  renderSubscription();
  renderCalculator();
  playSmoke();

  if (meltdownTimeoutId !== null) {
    window.clearTimeout(meltdownTimeoutId);
  }

  const smokeFadeStartDelay = Math.max(0, MELTDOWN_DURATION - SMOKE_FADE_DURATION);
  smokeFadeStartTimeoutId = window.setTimeout((): void => {
    smokeFadeStartTimeoutId = null;
    fadeOutSmoke();
  }, smokeFadeStartDelay);

  meltdownTimeoutId = window.setTimeout((): void => {
    meltdownTimeoutId = null;
    finishDivisionByZeroMeltdown();
  }, MELTDOWN_DURATION);
}

function finishDivisionByZeroMeltdown(): void {
  isMeltdownActive = false;
  isPoweredOn = false;
  calculatorState = createInitialCalculatorState();
  renderCalculator();

  if (smokeVideo === null || !smokeVideo.classList.contains("is-fading-out")) {
    fadeOutSmoke();
  }
}

function drainCredits(): void {
  if (subscriptionState === null) {
    return;
  }

  saveSubscription({
    ...subscriptionState,
    credits: 0
  });
}

function playSmoke(): void {
  if (smokeVideo === null) {
    return;
  }

  cancelSmokeFade();
  smokeVideo.classList.remove("is-fading-out");
  smokeVideo.style.opacity = "";
  smokeVideo.style.transition = "";
  smokeVideo.classList.add("is-active");
  smokeVideo.currentTime = 0;

  const playPromise = smokeVideo.play();

  if (playPromise !== undefined) {
    playPromise.catch((): void => {});
  }
}

function fadeOutSmoke(): void {
  if (smokeVideo === null) {
    return;
  }

  cancelSmokeFade();
  smokeVideo.classList.remove("is-fading-out");
  smokeVideo.classList.add("is-active");
  smokeVideo.style.transition = "none";
  smokeVideo.style.opacity = "0.72";
  void smokeVideo.offsetWidth;

  smokeFadeStartFrameId = window.requestAnimationFrame((): void => {
    smokeFadeStartFrameId = null;
    smokeFadeEndFrameId = window.requestAnimationFrame((): void => {
      smokeFadeEndFrameId = null;
      smokeVideo.classList.remove("is-active");
      smokeVideo.classList.add("is-fading-out");
      smokeVideo.style.transition = `opacity ${SMOKE_FADE_DURATION}ms ease`;
      smokeVideo.style.opacity = "0";
    });
  });

  smokeFadeTimeoutId = window.setTimeout(finishSmokeFade, SMOKE_FADE_DURATION + 220);
}

function finishSmokeFade(): void {
  if (smokeVideo === null) {
    return;
  }

  cancelSmokeFade();
  smokeVideo.pause();
  smokeVideo.currentTime = 0;
  smokeVideo.style.opacity = "";
  smokeVideo.style.transition = "";
  smokeVideo.classList.remove("is-active");
  smokeVideo.classList.remove("is-fading-out");
}

function cancelSmokeFade(): void {
  if (smokeFadeStartTimeoutId !== null) {
    window.clearTimeout(smokeFadeStartTimeoutId);
    smokeFadeStartTimeoutId = null;
  }

  if (smokeFadeTimeoutId !== null) {
    window.clearTimeout(smokeFadeTimeoutId);
    smokeFadeTimeoutId = null;
  }

  if (smokeFadeStartFrameId !== null) {
    window.cancelAnimationFrame(smokeFadeStartFrameId);
    smokeFadeStartFrameId = null;
  }

  if (smokeFadeEndFrameId !== null) {
    window.cancelAnimationFrame(smokeFadeEndFrameId);
    smokeFadeEndFrameId = null;
  }
}

function renderSubscription(): void {
  applyWeeklyCreditRefill();

  const credits = subscriptionState === null ? 0 : subscriptionState.credits;
  creditsValue.textContent = String(credits);

  if (subscriptionState === null) {
    planName.textContent = "Бесплатный тариф";
    planDescription.textContent = "Базовый режим без активной подписки. Можно открыть калькулятор, вводить числа и тестировать интерфейс.";
    paymentLabel.textContent = "Не подключена";
    return;
  }

  const plan = getPlan(subscriptionState.planId);
  const refillText = subscriptionState.credits <= 0
    ? ` Кредиты закончились. Следующее пополнение: ${formatRefillDate(subscriptionState.nextRefillAt)}.`
    : "";

  planName.textContent = `Calculator+ ${plan.name}`;
  planDescription.textContent =
    `${plan.credits} кредитов в пакете. Осталось ${subscriptionState.credits}.${refillText}`;
  paymentLabel.textContent = `•••• ${subscriptionState.cardLast4}`;
}

function renderPlans(): void {
  plansGrid.innerHTML = "";

  plans.forEach((plan: Plan): void => {
    const price = getPlanPrice(plan, selectedBilling);
    const planButton = document.createElement("button");
    planButton.className = "plan-card";
    planButton.type = "button";
    planButton.dataset.planId = plan.id;
    planButton.innerHTML = `
      <h3>${plan.name}</h3>
      <div class="price">${formatMoney(price)}<span> / ${getBillingLabel(selectedBilling)}</span></div>
      <div class="credits">${plan.credits} кредитов</div>
      <div class="refill">Пополнение каждую неделю</div>
      <p>${plan.description}</p>
      <span class="choose-plan">Выбрать</span>
    `;

    planButton.addEventListener("click", (): void => {
      selectedPlanId = plan.id;
      openPaymentStep();
    });

    plansGrid.append(planButton);
  });
}

function renderBillingToggle(): void {
  billingButtons.forEach((button: HTMLButtonElement): void => {
    button.classList.toggle("active", button.dataset.billing === selectedBilling);
  });
}

function openSubscriptionModal(): void {
  plansStep.classList.remove("hidden");
  paymentForm.classList.add("hidden");
  subscriptionModal.classList.remove("hidden");
  subscriptionModal.setAttribute("aria-hidden", "false");
  renderPlans();
  renderBillingToggle();
}

function closeSubscriptionModal(): void {
  subscriptionModal.classList.add("hidden");
  subscriptionModal.setAttribute("aria-hidden", "true");
}

function openPaymentStep(): void {
  const plan = getPlan(selectedPlanId);
  const price = getPlanPrice(plan, selectedBilling);

  selectedPlanSummary.textContent =
    `Calculator+ ${plan.name}: ${formatMoney(price)} за ${getBillingLabel(selectedBilling)}, ${plan.credits} кредитов. Пополнение каждую неделю с даты покупки.`;

  plansStep.classList.add("hidden");
  paymentForm.classList.remove("hidden");
  cardName.focus();
}

function completePayment(): void {
  const plan = getPlan(selectedPlanId);
  const digits = cardNumber.value.replace(/\D/g, "");
  const cardLast4 = digits.slice(-4).padStart(4, "0");
  const purchasedAt = Date.now();

  saveSubscription({
    planId: plan.id,
    billing: selectedBilling,
    credits: plan.credits,
    cardLast4,
    purchasedAt,
    nextRefillAt: getNextRefillAt(purchasedAt)
  });

  paymentForm.reset();
  closeSubscriptionModal();
  renderSubscription();

  if (pendingCalculation) {
    pendingCalculation = false;
    showToast("Подписка активирована. Один кредит героически отправился за ответом.");
    runPaidCalculation();
    return;
  }

  showToast("Подписка активирована. Кнопка '=' теперь смотрит на вас уважительно.");
}

function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.remove("hidden");

  if (toastTimeoutId !== null) {
    window.clearTimeout(toastTimeoutId);
  }

  toastTimeoutId = window.setTimeout((): void => {
    toast.classList.add("hidden");
    toastTimeoutId = null;
  }, 3200);
}

buttons.forEach((button: HTMLButtonElement): void => {
  button.addEventListener("click", (): void => {
    const number = button.dataset.number;
    const action = button.dataset.action;
    const operation = button.dataset.operation as OperationName | undefined;

    if (action === "power") {
      return;
    }

    if (!isPoweredOn || isMeltdownActive) {
      return;
    }

    if (number !== undefined) {
      calculatorState = appendNumber(calculatorState, number);
      renderCalculator();
      return;
    }

    if (action === "clear") {
      calculatorState = createInitialCalculatorState();
      renderCalculator();
      return;
    }

    if (action === "dot") {
      calculatorState = appendDot(calculatorState);
      renderCalculator();
      return;
    }

    if (action === "toggle-sign") {
      calculatorState = toggleSign(calculatorState);
      renderCalculator();
      return;
    }

    if (action === "percent") {
      calculatorState = percent(calculatorState);
      renderCalculator();
      return;
    }

    if (action === "memory-recall") {
      memoryRecall();
      return;
    }

    if (action === "memory-plus") {
      memoryAdd();
      return;
    }

    if (action === "memory-minus") {
      memorySubtract();
      return;
    }

    if (operation !== undefined) {
      calculatorState = chooseOperation(calculatorState, operation);
      renderCalculator();
      return;
    }

    if (action === "calculate") {
      runPaidCalculation();
    }
  });
});

powerButton.addEventListener("pointerdown", startPowerHold);
powerButton.addEventListener("pointerup", cancelPowerHold);
powerButton.addEventListener("pointerleave", cancelPowerHold);
powerButton.addEventListener("pointercancel", cancelPowerHold);

billingButtons.forEach((button: HTMLButtonElement): void => {
  button.addEventListener("click", (): void => {
    selectedBilling = button.dataset.billing as BillingCycle;
    renderBillingToggle();
    renderPlans();
  });
});

closeModalButton.addEventListener("click", (): void => {
  pendingCalculation = false;
  closeSubscriptionModal();
});

backToPlansButton.addEventListener("click", (): void => {
  paymentForm.classList.add("hidden");
  plansStep.classList.remove("hidden");
});

paymentForm.addEventListener("submit", (event: SubmitEvent): void => {
  event.preventDefault();

  const digits = cardNumber.value.replace(/\D/g, "");
  const expiryIsValid = /^\d{2}\/\d{2}$/.test(cardExpiry.value.trim());
  const cvcIsValid = /^\d{3}$/.test(cardCvc.value.trim());

  if (digits.length < 12 || !expiryIsValid || !cvcIsValid) {
    showToast("Демо-банк отклонил форму. Проверьте номер, срок и CVC.");
    return;
  }

  completePayment();
});

cardNumber.addEventListener("input", (): void => {
  const digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
  cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
});

cardExpiry.addEventListener("input", (): void => {
  const digits = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
  cardExpiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
});

cardCvc.addEventListener("input", (): void => {
  cardCvc.value = cardCvc.value.replace(/\D/g, "").slice(0, 3);
});

document.addEventListener("keydown", (event: KeyboardEvent): void => {
  if (event.key === "Escape" && !subscriptionModal.classList.contains("hidden")) {
    pendingCalculation = false;
    closeSubscriptionModal();
  }
});

window.addEventListener("resize", fitDisplayValue);

renderCalculator();
renderSubscription();
