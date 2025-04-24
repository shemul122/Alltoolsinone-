// === main.js (Use the complete code from the previous response - v6) ===
// Ensure all init...() functions and their content are present.
// No significant logic changes are needed for this UI update,
// assuming the element IDs used in JS still match the updated HTML.
// Double-check the Password Generator section uses the correct checkbox IDs
// (pass-opt-uppercase, etc.) if you copied the new HTML structure.

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // --- Global Elements ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const toolGrid = document.getElementById('tool-grid');
    const toolSections = document.querySelectorAll('.tool-section:not(#calculator-history-page)');
    const toolCards = document.querySelectorAll('.tool-card');
    const searchBar = document.getElementById('search-bar');
    const mainHeader = document.getElementById('main-header');
    const backButtons = document.querySelectorAll('.back-button:not(.history-back-button)');
    const calculatorHistoryPage = document.getElementById('calculator-history-page');
    const calculatorSection = document.getElementById('calculator');
    const showHistoryBtn = document.getElementById('show-history-btn');
    const historyBackButton = document.querySelector('.history-back-button');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const fullHistoryList = document.getElementById('full-history-list');


    // --- Theme ---
    const savedTheme = localStorage.getItem('theme');
    function applyTheme(theme) {
        const isDark = theme === 'dark-mode';
        body.classList.toggle('dark-mode', isDark);
        // Update theme icon based on current theme (requires moon.png)
        // if(themeIcon) themeIcon.src = isDark ? 'assets/icons/moon.png' : 'assets/icons/brightness.png';
    }
    if (savedTheme) applyTheme(savedTheme);
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let currentTheme = body.classList.contains('dark-mode') ? 'light-mode' : 'dark-mode';
            localStorage.setItem('theme', currentTheme); applyTheme(currentTheme);
            // Regenerate QR if visible
            if (document.getElementById('qr-generator')?.classList.contains('active') && typeof generateQrCode === 'function') {
                const qrText = document.getElementById('qr-text')?.value.trim();
                if (qrText) generateQrCode(qrText); // Call QR generation
            }
        });
    }

    // --- Navigation ---
    function showToolSection(toolId) { body.classList.add('tool-view-active'); toolSections.forEach(section => { const isActive = section.id === toolId; section.style.display = isActive ? 'flex' : 'none'; section.classList.toggle('active', isActive); }); if (calculatorHistoryPage) calculatorHistoryPage.style.display = 'none'; const activeSection = document.getElementById(toolId); if (activeSection) { const firstInput = activeSection.querySelector('input:not([type="hidden"]):not([readonly]):not([disabled]), textarea, select, button:not(.back-button)'); if (firstInput) setTimeout(() => firstInput.focus({ preventScroll: true }), 50); } window.scrollTo(0, 0); }
    function showToolGrid() { body.classList.remove('tool-view-active'); toolSections.forEach(section => { section.style.display = 'none'; section.classList.remove('active'); }); if (calculatorHistoryPage) calculatorHistoryPage.style.display = 'none'; }
    toolCards.forEach(card => { card.addEventListener('click', () => { const toolId = card.getAttribute('data-tool'); if (toolId) showToolSection(toolId); }); card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); const toolId = card.getAttribute('data-tool'); if (toolId) showToolSection(toolId); } }); });
    backButtons.forEach(button => button.addEventListener('click', showToolGrid));

    // --- Calculator History Page Navigation ---
    function showHistoryPage() { if (!calculatorHistoryPage || !calculatorSection) return; calculatorSection.style.display = 'none'; calculatorSection.classList.remove('active'); calculatorHistoryPage.style.display = 'flex'; calculatorHistoryPage.classList.add('active'); renderFullHistory(); window.scrollTo(0, 0); }
    function showCalculatorPage() { if (!calculatorHistoryPage || !calculatorSection) return; calculatorHistoryPage.style.display = 'none'; calculatorHistoryPage.classList.remove('active'); calculatorSection.style.display = 'flex'; calculatorSection.classList.add('active'); window.scrollTo(0, 0); }
    if (showHistoryBtn) showHistoryBtn.addEventListener('click', showHistoryPage);
    if (historyBackButton) historyBackButton.addEventListener('click', showCalculatorPage);

    // --- Search Filtering ---
    function filterTools() { if (!searchBar || !toolCards) return; const searchTerm = searchBar.value.toLowerCase().trim(); toolCards.forEach(card => { const toolTitle = card.querySelector('h3')?.textContent.toLowerCase() || ''; card.style.display = toolTitle.includes(searchTerm) ? 'flex' : 'none'; }); }
    if (searchBar) searchBar.addEventListener('input', filterTools);

    // ========================================================
    // --- Tool Initializations (Ensure all init functions are called) ---
    // ========================================================

    // --- 1. Basic Calculator ---
    function initCalculator() {
        const displayEl = document.getElementById('calc-display'); const previewEl = document.getElementById('calc-operation-preview'); const historyListEl = document.getElementById('full-history-list'); const clearHistoryBtnEl = document.getElementById('clear-history-btn');
        if (!displayEl || !previewEl || !historyListEl || !clearHistoryBtnEl) { console.error("Calculator elements missing!"); return; }
        let currentOperand = '0'; let previousOperand = ''; let operation = undefined; let historyLog = []; let isResultDisplayed = false;
        function loadHistory() { const savedHistory = localStorage.getItem('calculatorHistoryLog'); historyLog = savedHistory ? JSON.parse(savedHistory) : []; renderHistory(); }
        function saveHistory() { try { localStorage.setItem('calculatorHistoryLog', JSON.stringify(historyLog)); } catch(e) { console.error("Could not save history:", e); } }
        function updateDisplay() { displayEl.value = currentOperand; if (operation != null && previousOperand) { previewEl.textContent = `${previousOperand} ${operation}`; } else { previewEl.textContent = ''; } const len = currentOperand.length; displayEl.style.fontSize = len > 12 ? '2em' : (len > 9 ? '2.4em' : '2.8em'); }
        function clear() { currentOperand = '0'; previousOperand = ''; operation = undefined; isResultDisplayed = false; updateDisplay(); }
        function del() { if (currentOperand === 'Error' || isResultDisplayed) return; if (currentOperand.length > 1) currentOperand = currentOperand.slice(0, -1); else currentOperand = '0'; updateDisplay(); }
        function appendNum(number) { if (isResultDisplayed) { currentOperand = ''; isResultDisplayed = false; } if (number === '.' && currentOperand.includes('.')) return; if (currentOperand === '0' && number !== '.') currentOperand = number; else if (currentOperand === '-0' && number !== '.') currentOperand = '-' + number; else { if (currentOperand.length >= 15) return; currentOperand += number; } updateDisplay(); }
        function chooseOp(selectedOperation) { if (currentOperand === '' || currentOperand === 'Error' || currentOperand === '-') return; if (previousOperand !== '' && operation !== undefined) { if (!compute(false)) return; } operation = selectedOperation; previousOperand = currentOperand; currentOperand = ''; isResultDisplayed = false; updateDisplay(); }
        function compute(log = true) { let computation; const prev = parseFloat(previousOperand); const current = parseFloat(currentOperand); if (operation === undefined || isNaN(prev) || isNaN(current)) return false; try { switch (operation) { case '+': computation = prev + current; break; case '-': computation = prev - current; break; case '*': computation = prev * current; break; case '/': if (current === 0) throw new Error("Div by 0"); computation = prev / current; break; default: return false; } if (!isFinite(computation)) throw new Error("Infinity"); const resultString = parseFloat(computation.toFixed(10)).toString(); if (log) { const historyEntry = `${previousOperand} ${operation} ${currentOperand} = ${resultString}`; logHistory(historyEntry); } currentOperand = resultString; operation = undefined; previousOperand = ''; isResultDisplayed = true; if (log) updateDisplay(); return true; } catch(error) { console.error("Calc Error:", error); if (log) { logHistory(`Error: ${error.message}`); currentOperand = 'Error'; operation = undefined; previousOperand = ''; isResultDisplayed = true; updateDisplay(); } return false; } }
        function logHistory(entry) { historyLog.unshift(entry); if (historyLog.length > 50) historyLog.pop(); saveHistory(); renderHistory(); }
        function renderHistory() { historyListEl.innerHTML = ''; if (historyLog.length === 0) { historyListEl.innerHTML = '<li>No history yet.</li>'; return; } historyLog.forEach(entry => { const li = document.createElement('li'); li.textContent = entry; if (entry.toLowerCase().includes('error')) { li.style.color = body.classList.contains('dark-mode') ? '#fca5a5' : '#ef4444'; } historyListEl.appendChild(li); }); }
        clearHistoryBtnEl.addEventListener('click', () => { if (confirm('Clear all calculation history?')) { historyLog = []; saveHistory(); renderHistory(); } });
        window.calcAppend = appendNum; window.chooseOperator = chooseOp; window.calcEquals = () => compute(true); window.calcClear = clear; window.calcDelete = del;
        document.addEventListener('keydown', (event) => { const calculatorSection = document.getElementById('calculator'); if (!calculatorSection?.classList.contains('active') || event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return; const key = event.key; const operators = { '+': '+', '-': '-', '*': '*', '/': '/' }; if (/\d|\./.test(key)) { event.preventDefault(); appendNum(key); } else if (operators[key]) { event.preventDefault(); chooseOp(operators[key]); } else if (key === 'Enter' || key === '=') { event.preventDefault(); compute(true); } else if (key === 'Backspace') { event.preventDefault(); del(); } else if (key.toLowerCase() === 'c' || key === 'Escape') { event.preventDefault(); clear(); } });
        loadHistory(); updateDisplay();
    }
    initCalculator();

     // --- 2. Unit Converter ---
    function initUnitConverter() {
        const categorySelect = document.getElementById('unit-category'); const inputField = document.getElementById('unit-input'); const fromSelect = document.getElementById('unit-from'); const toSelect = document.getElementById('unit-to'); const outputField = document.getElementById('unit-output'); const resultDisplay = document.getElementById('unit-result-display');
        if (!categorySelect || !inputField || !fromSelect || !toSelect || !outputField || !resultDisplay) { console.error("Unit Converter elements missing!"); return; }
        const units = { length: { meter: { name: 'Meter (m)', factor: 1 }, km: { name: 'Kilometer (km)', factor: 1000 }, cm: { name: 'Centimeter (cm)', factor: 0.01 }, mm: { name: 'Millimeter (mm)', factor: 0.001 }, mi: { name: 'Mile (mi)', factor: 1609.34 }, yd: { name: 'Yard (yd)', factor: 0.9144 }, ft: { name: 'Foot (ft)', factor: 0.3048 }, in: { name: 'Inch (in)', factor: 0.0254 }, }, weight: { kg: { name: 'Kilogram (kg)', factor: 1 }, g: { name: 'Gram (g)', factor: 0.001 }, mg: { name: 'Milligram (mg)', factor: 0.000001 }, t: { name: 'Tonne (t)', factor: 1000 }, lb: { name: 'Pound (lb)', factor: 0.45359237 }, oz: { name: 'Ounce (oz)', factor: 0.0283495231 }, }, temperature: { c: { name: 'Celsius (°C)' }, f: { name: 'Fahrenheit (°F)' }, k: { name: 'Kelvin (K)' }, } };
        function populateOptions() { const category = categorySelect.value; const currentFrom = fromSelect.value; const currentTo = toSelect.value; fromSelect.innerHTML = ''; toSelect.innerHTML = ''; for (const key in units[category]) { const optionText = units[category][key].name; const optionFrom = new Option(optionText, key); const optionTo = new Option(optionText, key); fromSelect.add(optionFrom); toSelect.add(optionTo); } fromSelect.value = currentFrom && units[category][currentFrom] ? currentFrom : (fromSelect.options[0]?.value || ''); toSelect.value = currentTo && units[category][currentTo] && currentTo !== fromSelect.value ? currentTo : (fromSelect.options.length > 1 ? fromSelect.options[1].value : (fromSelect.options[0]?.value || '')); if (fromSelect.value === toSelect.value && fromSelect.options.length > 1) toSelect.selectedIndex = (fromSelect.selectedIndex + 1) % fromSelect.options.length; convert(); }
        function convert() { const category = categorySelect.value; const fromUnit = fromSelect.value; const toUnit = toSelect.value; const value = parseFloat(inputField.value); outputField.value = ''; resultDisplay.textContent = 'Result: -'; if (isNaN(value) || !fromUnit || !toUnit) return; let result; if (category === 'temperature') { if (fromUnit === toUnit) result = value; else if (fromUnit === 'c') result = (toUnit === 'f') ? (value * 9/5) + 32 : value + 273.15; else if (fromUnit === 'f') result = (toUnit === 'c') ? (value - 32) * 5/9 : (value - 32) * 5/9 + 273.15; else if (fromUnit === 'k') result = (toUnit === 'c') ? value - 273.15 : (value - 273.15) * 9/5 + 32; } else { const fromFactor = units[category][fromUnit]?.factor; const toFactor = units[category][toUnit]?.factor; if (fromFactor === undefined || toFactor === undefined) return; result = (value * fromFactor) / toFactor; } let decimals = result === 0 ? 0 : (Math.abs(result) < 0.001 ? 8 : (Math.abs(result) < 1 ? 6 : 4)); const resultString = parseFloat(result.toFixed(decimals)).toString(); outputField.value = resultString; resultDisplay.textContent = `Result: ${resultString}`; }
        categorySelect.addEventListener('change', populateOptions); inputField.addEventListener('input', convert); fromSelect.addEventListener('change', convert); toSelect.addEventListener('change', convert); populateOptions();
    }
    initUnitConverter();

    // --- 3. Currency Converter (API Version) ---
    function initCurrencyConverter() {
        const amountInput = document.getElementById('currency-amount'); const fromSelect = document.getElementById('currency-from'); const toSelect = document.getElementById('currency-to'); const resultDisplay = document.getElementById('currency-result'); const rateDisplay = document.getElementById('conversion-rate-display'); const apiStatus = document.getElementById('currency-api-status');
        if(!amountInput || !fromSelect || !toSelect || !resultDisplay || !rateDisplay || !apiStatus) { console.error("Currency Converter elements missing!"); return; }
        const apiKey = '87efb6dc5749a6da2f812298'; const apiUrlBase = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/`; let exchangeRates = null; const currencies = { "USD": "US Dollar", "EUR": "Euro", "JPY": "Japanese Yen", "GBP": "British Pound", "AUD": "Australian Dollar","CAD": "Canadian Dollar", "CHF": "Swiss Franc", "CNY": "Chinese Yuan", "SEK": "Swedish Krona", "NZD": "New Zealand Dollar","MXN": "Mexican Peso", "SGD": "Singapore Dollar", "HKD": "Hong Kong Dollar", "NOK": "Norwegian Krone", "KRW": "South Korean Won","TRY": "Turkish Lira", "INR": "Indian Rupee", "RUB": "Russian Ruble", "BRL": "Brazilian Real", "ZAR": "South African Rand", "BDT": "Bangladeshi Taka", /* Add more... */ };
        function populateOptions() { fromSelect.innerHTML = ''; toSelect.innerHTML = ''; for (const code in currencies) { const optionText = `${code} - ${currencies[code]}`; const optionFrom = new Option(optionText, code); const optionTo = new Option(optionText, code); fromSelect.add(optionFrom); toSelect.add(optionTo); } fromSelect.value = 'USD'; toSelect.value = 'BDT'; }
        async function fetchRates(baseCurrency) { if (!apiKey || apiKey === 'YOUR_API_KEY') { apiStatus.textContent = 'API Key missing'; rateDisplay.textContent = 'Cannot fetch'; return false; } apiStatus.textContent = 'Loading...'; rateDisplay.textContent = `Fetching ${baseCurrency}...`; resultDisplay.textContent = '-'; try { const response = await fetch(apiUrlBase + baseCurrency); if (!response.ok) { let errorType = `HTTP Error ${response.status}`; try { const errorData = await response.json(); errorType = errorData['error-type'] || errorType; } catch (e) {} if (errorType === 'invalid-key'){ errorType = 'Invalid Key'; } else if (errorType === 'inactive-account'){ errorType = 'Inactive Acct'; } else if (errorType === 'quota-reached'){ errorType = 'Quota Reached'; } throw new Error(errorType); } const data = await response.json(); if (data.result === 'success') { exchangeRates = data.conversion_rates; apiStatus.textContent = ''; return true; } else { throw new Error(data['error-type'] || 'API issue'); } } catch (error) { console.error('Fetch rates error:', error); apiStatus.textContent = `Error: ${error.message}`; rateDisplay.textContent = 'Fetch failed'; exchangeRates = null; return false; } }
        function convert() { const amount = parseFloat(amountInput.value); const fromCurrency = fromSelect.value; const toCurrency = toSelect.value; if (isNaN(amount) || amount < 0) { resultDisplay.textContent = 'Invalid Amount'; rateDisplay.textContent = '-'; return; } if (!exchangeRates || !exchangeRates[toCurrency]) { fetchRates(fromCurrency).then(success => { if (success && exchangeRates && exchangeRates[toCurrency]) { const rate = exchangeRates[toCurrency]; const convertedAmount = amount * rate; resultDisplay.textContent = `${convertedAmount.toFixed(2)} ${toCurrency}`; rateDisplay.textContent = `1 ${fromCurrency} ≈ ${rate.toFixed(4)} ${toCurrency}`; apiStatus.textContent = ''; } else if (success && exchangeRates && !exchangeRates[toCurrency]) { resultDisplay.textContent = 'N/A'; rateDisplay.textContent = `Rate unavailable`; apiStatus.textContent = ''; } else if (!success) { resultDisplay.textContent = 'Error'; } }); return; } const rate = exchangeRates[toCurrency]; const convertedAmount = amount * rate; resultDisplay.textContent = `${convertedAmount.toFixed(2)} ${toCurrency}`; rateDisplay.textContent = `1 ${fromCurrency} ≈ ${rate.toFixed(4)} ${toCurrency}`; apiStatus.textContent = ''; }
        amountInput.addEventListener('input', convert); toSelect.addEventListener('change', convert); fromSelect.addEventListener('change', () => { exchangeRates = null; convert(); });
        populateOptions(); convert();
    }
    initCurrencyConverter();

     // --- 4. Age Calculator ---
    function initAgeCalculator() {
        const birthDateInput = document.getElementById('birth-date'); const calculateAgeBtn = document.getElementById('calculate-age-btn'); const ageResult = document.getElementById('age-result');
        if (!birthDateInput || !calculateAgeBtn || !ageResult) { console.error("Age Calculator elements missing!"); return; }
        calculateAgeBtn.addEventListener('click', () => { ageResult.style.color = ''; ageResult.textContent = 'Calculating...'; const birthDateString = birthDateInput.value; if (!birthDateString) { ageResult.textContent = 'Please select date'; ageResult.style.color = '#f87171'; return; } const birthDate = new Date(birthDateString); const today = new Date(); today.setHours(0, 0, 0, 0); if (birthDate > today) { ageResult.textContent = 'Date cannot be in future'; ageResult.style.color = '#f87171'; return; } let years = today.getFullYear() - birthDate.getFullYear(); let months = today.getMonth() - birthDate.getMonth(); let days = today.getDate() - birthDate.getDate(); if (days < 0) { months--; const daysInLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate(); days += daysInLastMonth; } if (months < 0) { years--; months += 12; } let resultString = "Age: "; if (years > 0) resultString += `${years}Y `; if (months > 0) resultString += `${months}M `; if (days > 0) resultString += `${days}D`; if (resultString === "Age: ") resultString = "Born today!"; ageResult.textContent = resultString.trim(); });
        birthDateInput.max = new Date().toISOString().split("T")[0];
    }
    initAgeCalculator();

    // --- 5. BMI Calculator ---
    function initBmiCalculator() {
        const heightInput = document.getElementById('bmi-height'); const weightInput = document.getElementById('bmi-weight'); const calculateBtn = document.getElementById('calculate-bmi-btn'); const resultEl = document.getElementById('bmi-result');
        if (!heightInput || !weightInput || !calculateBtn || !resultEl) { console.error("BMI Calculator elements missing!"); return; }
        calculateBtn.addEventListener('click', () => { resultEl.style.color = ''; const heightCm = parseFloat(heightInput.value); const weightKg = parseFloat(weightInput.value); if (isNaN(heightCm) || isNaN(weightKg) || heightCm <= 0 || weightKg <= 0) { resultEl.textContent = 'Enter valid height/weight'; resultEl.style.color = '#f87171'; return; } const heightM = heightCm / 100; const bmi = weightKg / (heightM * heightM); const bmiRounded = bmi.toFixed(1); let category = ''; let color = 'inherit'; if (bmi < 18.5) { category = 'Underweight'; color = '#60a5fa'; } else if (bmi < 25) { category = 'Normal'; color = '#4ade80'; } else if (bmi < 30) { category = 'Overweight'; color = '#facc15'; } else { category = 'Obesity'; color = '#f87171'; } resultEl.innerHTML = `BMI: <strong style="color: ${color};">${bmiRounded}</strong> (${category})`; });
    }
    initBmiCalculator();

    // --- 6. QR Code Generator ---
    function initQrGenerator() {
        const textInput = document.getElementById('qr-text'); const generateBtn = document.getElementById('generate-qr-btn'); const resultDiv = document.getElementById('qr-code-result'); let currentQRCode = null;
        if (!textInput || !generateBtn || !resultDiv) { console.error("QR Generator elements missing!"); return; }
        function generateQrCode(text) { resultDiv.innerHTML = ''; currentQRCode = null; if (!text) { resultDiv.innerHTML = '<p style="color: #f87171;">Please enter text or URL.</p>'; return; } try { if (typeof QRCode === 'undefined') { resultDiv.innerHTML = '<p style="color: #f87171;">Error: QR library failed.</p>'; return; } const isDarkMode = body.classList.contains('dark-mode'); const qrColorDark = isDarkMode ? "#e2e8f0" : "#1f2937"; const qrColorLight = isDarkMode ? "#1e293b" : "#ffffff"; currentQRCode = new QRCode(resultDiv, { text: text, width: 180, height: 180, colorDark: qrColorDark, colorLight: qrColorLight, correctLevel: QRCode.CorrectLevel.H }); } catch (error) { resultDiv.innerHTML = `<p style="color: #f87171;">Could not generate QR code.</p>`; console.error("QR Gen Error:", error); } }
        window.generateQrCode = generateQrCode;
        generateBtn.addEventListener('click', () => { const text = textInput.value.trim(); generateQrCode(text); });
        textInput.addEventListener('input', () => { if (currentQRCode) { resultDiv.innerHTML = '<p>Enter text and click Generate.</p>'; currentQRCode = null; } });
    }
    initQrGenerator();

     // --- 7. Text Tools ---
    function initTextTools() {
        const textArea = document.getElementById('text-input'); const statsEl = document.getElementById('text-stats'); const btnUpper = document.getElementById('text-uppercase'); const btnLower = document.getElementById('text-lowercase'); const btnTitle = document.getElementById('text-titlecase'); const btnSpaces = document.getElementById('text-remove-spaces');
        if(!textArea || !statsEl || !btnUpper || !btnLower || !btnTitle || !btnSpaces) { console.error("Text Tools elements missing!"); return; }
        function updateStats() { const text = textArea.value; const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length; const chars = text.length; const lines = text.split('\n').filter(line => line.length > 0).length; statsEl.textContent = `Words: ${words} | Chars: ${chars} | Lines: ${lines}`; }
        textArea.addEventListener('input', updateStats); btnUpper.addEventListener('click', () => { textArea.value = textArea.value.toUpperCase(); updateStats(); }); btnLower.addEventListener('click', () => { textArea.value = textArea.value.toLowerCase(); updateStats(); }); btnTitle.addEventListener('click', () => { textArea.value = textArea.value.toLowerCase().replace(/(?:^|\s)\w/g, char => char.toUpperCase()); updateStats(); }); btnSpaces.addEventListener('click', () => { textArea.value = textArea.value.replace(/\s+/g, ' ').trim(); updateStats(); });
        updateStats();
    }
    initTextTools();

    // --- 8. Password Generator ---
    function initPasswordGenerator() {
        const lengthSlider = document.getElementById('pass-length-slider'); const lengthValue = document.getElementById('pass-length-value'); const optUpper = document.getElementById('pass-opt-uppercase'); const optLower = document.getElementById('pass-opt-lowercase'); const optNumbers = document.getElementById('pass-opt-numbers'); const optSymbols = document.getElementById('pass-opt-symbols'); const generateBtn = document.getElementById('generate-pass-btn'); const outputEl = document.getElementById('password-output'); const strengthTextEl = document.getElementById('pass-strength-text'); const copyBtn = document.getElementById('copy-password-btn'); const copyIcon = document.getElementById('copy-icon'); // Get the img element
        if(!lengthSlider || !lengthValue || !optUpper || !optLower || !optNumbers || !optSymbols || !generateBtn || !outputEl || !strengthTextEl || !copyBtn || !copyIcon) { console.error("Password Generator elements missing!"); return; }
        const charSets = { uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lowercase: 'abcdefghijklmnopqrstuvwxyz', numbers: '0123456789', symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?' };
        lengthSlider.addEventListener('input', () => { lengthValue.textContent = lengthSlider.value; });
        function generate() { const length = parseInt(lengthSlider.value); let pool = ''; let pass = ''; let req = []; let score = 0; if (optUpper.checked) { pool += charSets.uppercase; req.push(charSets.uppercase); score++; } if (optLower.checked) { pool += charSets.lowercase; req.push(charSets.lowercase); score++; } if (optNumbers.checked) { pool += charSets.numbers; req.push(charSets.numbers); score++; } if (optSymbols.checked) { pool += charSets.symbols; req.push(charSets.symbols); score++; } if (pool.length === 0) { outputEl.value = 'Select char types!'; outputEl.style.color = '#f87171'; updateStrength(0, 0); return; } outputEl.style.color = ''; req.forEach(set => { if (pass.length < length && set.length > 0) pass += set[Math.floor(Math.random() * set.length)]; }); let remLen = length - pass.length; for (let i = 0; i < remLen; i++) pass += pool[Math.floor(Math.random() * pool.length)]; pass = pass.split('').sort(() => 0.5 - Math.random()).join(''); outputEl.value = pass; updateStrength(length, score); }
        function updateStrength(len, score) { let str = 'Very Weak'; let cls = 'weak'; if (len >= 16 && score >= 4) { str = 'Very Strong'; cls = 'very-strong'; } else if (len >= 12 && score >= 3) { str = 'Strong'; cls = 'strong'; } else if (len >= 10 && score >= 2) { str = 'Medium'; cls = 'medium'; } else if (len >= 8 && score >= 1) { str = 'Weak'; cls = 'weak'; } strengthTextEl.textContent = str; strengthTextEl.className = cls; }
        generateBtn.addEventListener('click', generate); [optUpper, optLower, optNumbers, optSymbols].forEach(cb => cb.addEventListener('change', generate));
        copyBtn.addEventListener('click', () => { if(outputEl.value && !outputEl.value.startsWith('Select')) { navigator.clipboard.writeText(outputEl.value).then(() => { copyBtn.classList.add('copied'); copyBtn.title = "Copied!"; copyIcon.src = 'assets/icons/check.png'; /* Change to check icon */ setTimeout(() => { copyBtn.classList.remove('copied'); copyBtn.title = "Copy Password"; copyIcon.src = 'assets/icons/copy.png'; /* Change back to copy icon */ }, 1500); }).catch(err => { alert('Could not copy.'); }); } });
        generate();
    }
    initPasswordGenerator();

    // --- 9. Color Picker & Converter ---
    function initColorPicker() {
        const colorPicker = document.getElementById('color-picker-input'); const colorHexInput = document.getElementById('color-hex'); const colorRgbInput = document.getElementById('color-rgb'); const colorPreview = document.getElementById('color-preview');
        if(!colorPicker || !colorHexInput || !colorRgbInput || !colorPreview) { console.error("Color Picker elements missing!"); return; }
        function updateColorPreview(color) { try { colorPreview.style.backgroundColor = color; } catch (e) {} }
        function updateInputsFromPicker() { const hex = colorPicker.value; colorHexInput.value = hex; colorRgbInput.value = hexToRgbString(hex); updateColorPreview(hex); }
        function updatePickerFromHex() { let hex = colorHexInput.value.trim(); if (/^#([0-9A-Fa-f]{3})$/.test(hex)) hex = '#' + hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3]; if (/^#([0-9A-Fa-f]{6})$/.test(hex)) { colorPicker.value = hex; colorRgbInput.value = hexToRgbString(hex); updateColorPreview(hex); } }
        function updatePickerFromRgb() { const rgbString = colorRgbInput.value; const rgbValues = parseRgbString(rgbString); if (rgbValues) { const hex = rgbToHexString(rgbValues.r, rgbValues.g, rgbValues.b); colorPicker.value = hex; colorHexInput.value = hex; updateColorPreview(hex); } }
        function hexToRgbString(hex) { hex = hex.replace(/^#/, ''); let r=0,g=0,b=0; if(hex.length === 3){ r=parseInt(hex[0]+hex[0],16); g=parseInt(hex[1]+hex[1],16); b=parseInt(hex[2]+hex[2],16); } else if (hex.length === 6){ r=parseInt(hex.substring(0,2),16); g=parseInt(hex.substring(2,4),16); b=parseInt(hex.substring(4,6),16); } else return "Invalid"; return `rgb(${r}, ${g}, ${b})`; }
        function rgbToHexString(r,g,b){ const toHex = c => {const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16); return hex.length === 1 ? "0" + hex : hex;}; return `#${toHex(r)}${toHex(g)}${toHex(b)}`; }
        function parseRgbString(rgbStr){ const match = rgbStr.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/); if (match){ const r=parseInt(match[1]), g=parseInt(match[2]), b=parseInt(match[3]); if(r>=0&&r<=255&&g>=0&&g<=255&&b>=0&&b<=255) return {r,g,b}; } return null; }
        colorPicker.addEventListener('input', updateInputsFromPicker); colorHexInput.addEventListener('input', updatePickerFromHex); colorRgbInput.addEventListener('input', updatePickerFromRgb);
        updateInputsFromPicker();
    }
    initColorPicker();

    // --- 10. Notepad ---
    function initNotepad() {
        const notepadArea = document.getElementById('notepad-area'); const notepadStatus = document.getElementById('notepad-status'); const notepadClearBtn = document.getElementById('notepad-clear'); const notepadDownloadBtn = document.getElementById('notepad-download');
        if(!notepadArea || !notepadStatus || !notepadClearBtn || !notepadDownloadBtn) { console.error("Notepad elements missing!"); return; }
        let saveTimeout; const NOTEPAD_KEY = 'quickNotesAllToolsAppV2';
        try { const savedNotes = localStorage.getItem(NOTEPAD_KEY); if (savedNotes) notepadArea.value = savedNotes; } catch (e) { console.error("Notepad: Load error:", e); notepadStatus.textContent = 'Error loading.'; notepadStatus.className = 'notepad-status error'; }
        function showNotepadStatus(message, type = 'info', duration = 2500) { notepadStatus.textContent = message; notepadStatus.className = `notepad-status ${type}`; if (duration > 0) setTimeout(() => { notepadStatus.textContent = ''; notepadStatus.className = 'notepad-status'; }, duration); }
        notepadArea.addEventListener('input', () => { clearTimeout(saveTimeout); notepadStatus.textContent = 'Saving...'; notepadStatus.className = 'notepad-status info'; saveTimeout = setTimeout(() => { try { localStorage.setItem(NOTEPAD_KEY, notepadArea.value); showNotepadStatus('Saved ✓', 'success'); } catch (e) { console.error("Notepad: Save error:", e); let errorMsg = 'Error saving!'; if (e.name === 'QuotaExceededError') errorMsg = 'Storage full!'; showNotepadStatus(errorMsg, 'error', 5000); } }, 750); });
        notepadClearBtn.addEventListener('click', () => { if (confirm("Clear all notes?")) { notepadArea.value = ''; try { localStorage.removeItem(NOTEPAD_KEY); showNotepadStatus('Cleared', 'info'); } catch (e) { console.error("Notepad: Clear error:", e); showNotepadStatus('Error clearing', 'error'); } } });
        notepadDownloadBtn.addEventListener('click', () => { const textToSave = notepadArea.value; if (!textToSave.trim()) { showNotepadStatus('Nothing to download', 'info'); return; } const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'notes.txt'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); showNotepadStatus('Download started', 'info'); });
    }
    initNotepad();

}); // End DOMContentLoaded