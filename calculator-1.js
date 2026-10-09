// calculator.js - CLEANED & FIXED VERSION
class ScientificCalculator {
    constructor() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.resetScreen = false;
        this.memory = 0;
        this.isRadians = false;
        this.expression = '';
        this.isError = false;
        this.history = [];
        this.maxHistoryItems = 50;
        this.sessionHistory = [];
        this.currentCalculation = '';
        
        this.initializeCalculator();
    }

    initializeCalculator() {
        console.log('🔄 Initializing calculator...');
        this.bindEvents();
        this.loadHistory();
        this.enableSaveShare();
        this.updateDisplay();
        console.log('✅ Calculator initialized successfully');
    }

    bindEvents() {
        console.log('🔗 Binding events...');
        
        // Number buttons
        const numberButtons = document.querySelectorAll('button[data-value]');
        console.log('🔢 Number buttons found:', numberButtons.length);
        numberButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.getAttribute('data-value'));
            });
        });

        // Operator buttons
        const operatorButtons = document.querySelectorAll('button[data-operator]');
        console.log('⚡ Operator buttons found:', operatorButtons.length);
        operatorButtons.forEach(button => {
            button.addEventListener('click', () => {
                const operator = button.getAttribute('data-operator');
                if (operator === '=') {
                    this.calculate();
                } else {
                    this.chooseOperation(operator);
                }
            });
        });

        // Function buttons
        const functionButtons = document.querySelectorAll('button[data-func]');
        console.log('🔧 Function buttons found:', functionButtons.length);
        functionButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleFunction(button.getAttribute('data-func'));
            });
        });

        // Enhanced Keyboard support
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardInput(event);
        });

        // Test structure
        this.testCalculatorStructure();
    }

    testCalculatorStructure() {
        console.log('🔍 Testing calculator structure...');
        const display = document.getElementById('display');
        const calculation = document.getElementById('calculation');
        console.log('📍 Main Display:', display ? '✅ Found' : '❌ NOT FOUND');
        console.log('📍 Calculation Display:', calculation ? '✅ Found' : '❌ NOT FOUND');
        console.log('📍 Buttons Container:', document.querySelector('.buttons-container') ? '✅ Found' : '❌ NOT FOUND');
    }

    // Enhanced Keyboard support
    handleKeyboardInput(event) {
        const key = event.key;
        const shiftPressed = event.shiftKey;
        
        // Number keys (0-9)
        if (key >= '0' && key <= '9') {
            event.preventDefault();
            this.appendNumber(key);
            this.highlightButton(`button[data-key="${key}"]`);
            return;
        }
        
        // Decimal point
        if (key === '.') {
            event.preventDefault();
            this.appendNumber('.');
            this.highlightButton('button[data-key="."]');
            return;
        }
        
        // Basic operators
        if (['+', '-', '*', '/'].includes(key)) {
            event.preventDefault();
            const operator = key === '*' ? '*' : key === '/' ? '/' : key;
            this.chooseOperation(operator);
            this.highlightButton(`button[data-operator="${operator}"]`);
            return;
        }
        
        // Equals and Enter
        if (key === '=' || key === 'Enter') {
            event.preventDefault();
            this.calculate();
            this.highlightButton('button[data-operator="="]');
            return;
        }
        
        // Clear and Escape
        if (key === 'Escape' || key === 'Esc') {
            event.preventDefault();
            this.handleFunction('clear');
            this.highlightButton('button[data-func="clear"]');
            return;
        }
        
        // Backspace
        if (key === 'Backspace') {
            event.preventDefault();
            this.handleFunction('backspace');
            this.highlightButton('button[data-func="backspace"]');
            return;
        }
        
        // Delete (Clear Entry)
        if (key === 'Delete') {
            event.preventDefault();
            this.handleFunction('clearEntry');
            this.highlightButton('button[data-func="clearEntry"]');
            return;
        }
        
        // Parentheses
        if (key === '(' || key === ')') {
            event.preventDefault();
            this.appendNumber(key);
            this.highlightButton(`button[data-key="${key}"]`);
            return;
        }
        
        // Power operator (^)
        if (key === '^' || key === '**') {
            event.preventDefault();
            this.chooseOperation('^');
            this.highlightButton('button[data-func="power"]');
            return;
        }
        
        // Enhanced function keys mapping
        const functionMap = {
            // Basic functions
            's': 'sin', 'S': 'asin',
            'c': 'cos', 'C': 'acos', 
            't': 'tan', 'T': 'atan',
            'd': 'toggleAngleMode', 'r': 'toggleAngleMode',
            'p': 'pi', 'e': 'e',
            'q': 'sqrt', 
            'l': 'log', 'n': 'ln',
            '!': 'factorial', '_': 'toggleSign',
            '?': 'random', 'x': 'expNotation',
            'm': 'memoryAdd', 'M': 'memorySubtract',
            'X': 'memoryRecall', 'i': 'reciprocal',
            '%': 'percent',
            
            // Special characters
            '@': 'square', '#': 'cube', '~': 'cubeRoot'
        };
        
        let functionKey = key.toLowerCase();
        
        // Handle Shift key combinations
        if (shiftPressed) {
            switch (key) {
                case 'S': functionKey = 'S'; break;
                case 'C': functionKey = 'C'; break;
                case 'T': functionKey = 'T'; break;
                case 'R': functionKey = 'R'; break;
                case 'E': functionKey = 'E'; break;
                case 'M': functionKey = 'M'; break;
                case 'X': functionKey = 'X'; break;
            }
        }
        
        if (functionMap[functionKey]) {
            event.preventDefault();
            const func = functionMap[functionKey];
            this.handleFunction(func);
            this.highlightButton(`button[data-key="${functionKey}"]`);
        }
    }

    highlightButton(selector) {
        const button = document.querySelector(selector);
        if (button) {
            button.classList.add('key-active');
            setTimeout(() => {
                button.classList.remove('key-active');
            }, 150);
        }
    }

    // CORE CALCULATOR METHODS
    appendNumber(number) {
        if (this.isError) {
            this.resetCalculator();
        }
        
        if (this.resetScreen) {
            this.currentInput = '';
            this.resetScreen = false;
            this.currentCalculation = '';
        }
        
        if (number === '.' && this.currentInput.includes('.')) return;
        if (this.currentInput === '0' && number !== '.') this.currentInput = '';
        
        this.currentInput += number;
        
        // Build current calculation display
        if (this.operation && this.previousInput) {
            this.currentCalculation = `${this.previousInput} ${this.getOperatorSymbol(this.operation)} ${this.currentInput}`;
        } else {
            this.currentCalculation = this.currentInput;
        }
        
        this.updateDisplay();
    }

    chooseOperation(op) {
        if (this.currentInput === '' || this.isError) return;
        
        if (this.previousInput !== '' && this.operation !== null) {
            this.calculate();
        }
        
        this.operation = op;
        this.previousInput = this.currentInput;
        this.resetScreen = true;
        
        // Update current calculation
        this.currentCalculation = `${this.previousInput} ${this.getOperatorSymbol(this.operation)}`;
        
        this.updateDisplay();
    }

    calculate() {
        if (this.operation === null || this.resetScreen || this.isError) return;
        
        let result;
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        try {
            switch (this.operation) {
                case '+':
                    result = prev + current;
                    break;
                case '-':
                    result = prev - current;
                    break;
                case '*':
                    result = prev * current;
                    break;
                case '/':
                    if (current === 0) {
                        throw new Error('Division by zero');
                    }
                    result = prev / current;
                    break;
                case '^':
                    result = Math.pow(prev, current);
                    break;
                case '√':
                    result = Math.pow(current, 1/prev);
                    break;
                default:
                    return;
            }
            
            // Complete calculation with equals and result
            const completeCalculation = `${this.previousInput} ${this.getOperatorSymbol(this.operation)} ${this.currentInput} = ${this.roundResult(result)}`;
            
            // Add to session history (visible in calculation display)
            this.addToSessionHistory(completeCalculation);
            
            // Add to dropdown history
            this.addToHistory(`${this.previousInput} ${this.getOperatorSymbol(this.operation)} ${this.currentInput}`, this.roundResult(result).toString(), 'calculation');
            
            this.currentInput = this.roundResult(result).toString();
            this.operation = null;
            this.previousInput = '';
            this.resetScreen = true;
            this.isError = false;
            
            // Clear current calculation for next input
            this.currentCalculation = '';
            
        } catch (error) {
            this.handleError(error.message);
        }
        
        this.updateDisplay();
    }

    handleFunction(func) {
        if (this.isError && func !== 'clear') return;
        
        let inputValue = parseFloat(this.currentInput);
        
        if (isNaN(inputValue) && !['clear', 'clearEntry', 'backspace', 'toggleAngleMode', 'random', 'pi', 'e'].includes(func)) {
            return;
        }
        
        try {
            switch (func) {
                case 'clear':
                    this.resetCalculator();
                    break;
                    
                case 'clearEntry':
                    this.currentInput = '0';
                    this.currentCalculation = '';
                    this.updateDisplay();
                    break;
                    
                case 'backspace':
                    if (this.currentInput.length === 1 || (this.currentInput.length === 2 && this.currentInput.startsWith('-'))) {
                        this.currentInput = '0';
                    } else {
                        this.currentInput = this.currentInput.slice(0, -1);
                    }
                    
                    if (this.operation && this.previousInput) {
                        this.currentCalculation = `${this.previousInput} ${this.getOperatorSymbol(this.operation)} ${this.currentInput}`;
                    } else {
                        this.currentCalculation = this.currentInput;
                    }
                    
                    this.updateDisplay();
                    break;
                    
                case 'toggleSign':
                    this.currentInput = (parseFloat(this.currentInput) * -1).toString();
                    this.updateDisplay();
                    break;

                // Inverse Trigonometric Functions
                case 'asin':
                    if (inputValue < -1 || inputValue > 1) {
                        throw new Error('Input must be between -1 and 1 for inverse sine');
                    }
                    let asinResult = this.isRadians ? Math.asin(inputValue) : Math.asin(inputValue) * 180 / Math.PI;
                    asinResult = this.roundResult(asinResult).toString();
                    const asinCalculation = `asin(${inputValue}) = ${asinResult}`;
                    this.addToSessionHistory(asinCalculation);
                    this.addToHistory(`asin(${inputValue})`, asinResult, 'scientific');
                    this.currentInput = asinResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;
                    
                case 'acos':
                    if (inputValue < -1 || inputValue > 1) {
                        throw new Error('Input must be between -1 and 1 for inverse cosine');
                    }
                    let acosResult = this.isRadians ? Math.acos(inputValue) : Math.acos(inputValue) * 180 / Math.PI;
                    acosResult = this.roundResult(acosResult).toString();
                    const acosCalculation = `acos(${inputValue}) = ${acosResult}`;
                    this.addToSessionHistory(acosCalculation);
                    this.addToHistory(`acos(${inputValue})`, acosResult, 'scientific');
                    this.currentInput = acosResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;
                    
                case 'atan':
                    let atanResult = this.isRadians ? Math.atan(inputValue) : Math.atan(inputValue) * 180 / Math.PI;
                    atanResult = this.roundResult(atanResult).toString();
                    const atanCalculation = `atan(${inputValue}) = ${atanResult}`;
                    this.addToSessionHistory(atanCalculation);
                    this.addToHistory(`atan(${inputValue})`, atanResult, 'scientific');
                    this.currentInput = atanResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;

                // Cube Root Function
                case 'cubeRoot':
                    const cubeRootResult = this.roundResult(Math.cbrt(inputValue)).toString();
                    const cubeRootCalculation = `∛(${inputValue}) = ${cubeRootResult}`;
                    this.addToSessionHistory(cubeRootCalculation);
                    this.addToHistory(`∛(${inputValue})`, cubeRootResult, 'scientific');
                    this.currentInput = cubeRootResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;

                // Natural Logarithm (ln)
                case 'ln':
                    if (inputValue <= 0) {
                        throw new Error('Input must be greater than 0 for natural logarithm');
                    }
                    const lnResult = this.roundResult(Math.log(inputValue)).toString();
                    const lnCalculation = `ln(${inputValue}) = ${lnResult}`;
                    this.addToSessionHistory(lnCalculation);
                    this.addToHistory(`ln(${inputValue})`, lnResult, 'scientific');
                    this.currentInput = lnResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;

                // Common Logarithm (log)
                case 'log':
                    if (inputValue <= 0) {
                        throw new Error('Input must be greater than 0 for logarithm');
                    }
                    const logResult = this.roundResult(Math.log10(inputValue)).toString();
                    const logCalculation = `log(${inputValue}) = ${logResult}`;
                    this.addToSessionHistory(logCalculation);
                    this.addToHistory(`log(${inputValue})`, logResult, 'scientific');
                    this.currentInput = logResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;

                // Other scientific functions
                case 'sqrt':
                    if (inputValue < 0) throw new Error('Cannot calculate square root of negative number');
                    const sqrtResult = this.roundResult(Math.sqrt(inputValue)).toString();
                    const sqrtCalculation = `√(${inputValue}) = ${sqrtResult}`;
                    this.addToSessionHistory(sqrtCalculation);
                    this.addToHistory(`√(${inputValue})`, sqrtResult, 'scientific');
                    this.currentInput = sqrtResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;
                    
                case 'square':
                    const squareResult = this.roundResult(Math.pow(inputValue, 2)).toString();
                    const squareCalculation = `sqr(${inputValue}) = ${squareResult}`;
                    this.addToSessionHistory(squareCalculation);
                    this.addToHistory(`sqr(${inputValue})`, squareResult, 'scientific');
                    this.currentInput = squareResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;
                    
                case 'cube':
                    const cubeResult = this.roundResult(Math.pow(inputValue, 3)).toString();
                    const cubeCalculation = `cube(${inputValue}) = ${cubeResult}`;
                    this.addToSessionHistory(cubeCalculation);
                    this.addToHistory(`cube(${inputValue})`, cubeResult, 'scientific');
                    this.currentInput = cubeResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;
                    
                case 'factorial':
                    if (inputValue < 0 || !Number.isInteger(inputValue)) {
                        throw new Error('Factorial is only defined for non-negative integers');
                    }
                    const factorialResult = this.factorial(inputValue).toString();
                    const factorialCalculation = `${inputValue}! = ${factorialResult}`;
                    this.addToSessionHistory(factorialCalculation);
                    this.addToHistory(`${inputValue}!`, factorialResult, 'scientific');
                    this.currentInput = factorialResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;
                    
                case 'sin':
                    const sinResult = this.roundResult(this.isRadians ? Math.sin(inputValue) : Math.sin(inputValue * Math.PI / 180)).toString();
                    const sinCalculation = `sin(${inputValue}${this.isRadians ? ' rad' : '°'}) = ${sinResult}`;
                    this.addToSessionHistory(sinCalculation);
                    this.addToHistory(`sin(${inputValue}${this.isRadians ? ' rad' : '°'})`, sinResult, 'scientific');
                    this.currentInput = sinResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;
                    
                case 'cos':
                    const cosResult = this.roundResult(this.isRadians ? Math.cos(inputValue) : Math.cos(inputValue * Math.PI / 180)).toString();
                    const cosCalculation = `cos(${inputValue}${this.isRadians ? ' rad' : '°'}) = ${cosResult}`;
                    this.addToSessionHistory(cosCalculation);
                    this.addToHistory(`cos(${inputValue}${this.isRadians ? ' rad' : '°'})`, cosResult, 'scientific');
                    this.currentInput = cosResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;
                    
                case 'tan':
                    if (!this.isRadians && (inputValue % 90 === 0 && inputValue % 180 !== 0)) {
                        throw new Error('Tangent is undefined for this angle');
                    }
                    const tanResult = this.roundResult(this.isRadians ? Math.tan(inputValue) : Math.tan(inputValue * Math.PI / 180)).toString();
                    const tanCalculation = `tan(${inputValue}${this.isRadians ? ' rad' : '°'}) = ${tanResult}`;
                    this.addToSessionHistory(tanCalculation);
                    this.addToHistory(`tan(${inputValue}${this.isRadians ? ' rad' : '°'})`, tanResult, 'scientific');
                    this.currentInput = tanResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;
                    
                case 'exp':
                    const expResult = this.roundResult(Math.exp(inputValue)).toString();
                    const expCalculation = `e^(${inputValue}) = ${expResult}`;
                    this.addToSessionHistory(expCalculation);
                    this.addToHistory(`e^(${inputValue})`, expResult, 'scientific');
                    this.currentInput = expResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;
                    
                case 'pi':
                    this.currentInput = Math.PI.toString();
                    this.addToSessionHistory(`π = ${Math.PI}`);
                    this.updateDisplay();
                    break;
                    
                case 'e':
                    this.currentInput = Math.E.toString();
                    this.addToSessionHistory(`e = ${Math.E}`);
                    this.updateDisplay();
                    break;
                    
                case 'random':
                    const randomResult = this.roundResult(Math.random()).toString();
                    const randomCalculation = `rand() = ${randomResult}`;
                    this.addToSessionHistory(randomCalculation);
                    this.addToHistory('rand()', randomResult, 'scientific');
                    this.currentInput = randomResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;
                    
                case 'percent':
                    const percentResult = this.roundResult(inputValue / 100).toString();
                    const percentCalculation = `${inputValue}% = ${percentResult}`;
                    this.addToSessionHistory(percentCalculation);
                    this.currentInput = percentResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;
                    
                case 'reciprocal':
                    if (inputValue === 0) throw new Error('Cannot divide by zero');
                    const reciprocalResult = this.roundResult(1 / inputValue).toString();
                    const reciprocalCalculation = `1/(${inputValue}) = ${reciprocalResult}`;
                    this.addToSessionHistory(reciprocalCalculation);
                    this.addToHistory(`1/(${inputValue})`, reciprocalResult, 'scientific');
                    this.currentInput = reciprocalResult;
                    this.resetScreen = true;
                    this.updateDisplay();
                    break;
                    
                case 'toggleAngleMode':
                    this.isRadians = !this.isRadians;
                    document.querySelectorAll('[data-func="toggleAngleMode"]').forEach(btn => {
                        btn.textContent = this.isRadians ? 'Rad' : 'Deg';
                    });
                    break;
                    
                case 'power':
                    this.chooseOperation('^');
                    break;
                    
                case 'nthRoot':
                    this.chooseOperation('√');
                    break;
                    
                case 'expNotation':
                    if (this.currentInput !== '0') {
                        this.currentInput += 'e';
                        this.updateDisplay();
                    }
                    break;
                    
                case 'memoryAdd':
                    this.memory += parseFloat(this.currentInput);
                    break;
                    
                case 'memorySubtract':
                    this.memory -= parseFloat(this.currentInput);
                    break;
                    
                case 'memoryRecall':
                    this.currentInput = this.memory.toString();
                    this.updateDisplay();
                    break;
                    
                default:
                    console.log('Unknown function:', func);
                    break;
            }
            
        } catch (error) {
            this.handleError(error.message);
        }
    }

    // Save/Share functionality
    enableSaveShare() {
        console.log('💾 Setting up save/share functionality...');
        
        // JSON Export
        const saveJSON = document.getElementById('saveJSON');
        if (saveJSON) {
            saveJSON.addEventListener('click', () => {
                this.exportToJSON();
            });
        }
        
        // Text Export
        const saveText = document.getElementById('saveText');
        if (saveText) {
            saveText.addEventListener('click', () => {
                this.exportToText();
            });
        }
        
        // Copy to Clipboard
        const copyClipboard = document.getElementById('copyClipboard');
        if (copyClipboard) {
            copyClipboard.addEventListener('click', () => {
                this.copyToClipboard();
            });
        }
        
        // Import
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                this.importFromJSON(e);
            });
        }
        
        // Quick Save Slots
        const slotButtons = document.querySelectorAll('.slot-btn');
        console.log('💾 Quick save slots found:', slotButtons.length);
        slotButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleQuickSave(btn.getAttribute('data-slot'));
            });
        });
    }

    handleQuickSave(slotNumber) {
        const slotKey = `calculator_slot_${slotNumber}`;
        const btn = document.querySelector(`[data-slot="${slotNumber}"]`);
        
        // If already saved, load it
        if (btn.classList.contains('saved')) {
            const savedData = localStorage.getItem(slotKey);
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    this.sessionHistory = data.sessionHistory || [];
                    this.updateDisplay();
                    this.showNotification(`Loaded from Slot ${slotNumber}`);
                } catch (error) {
                    this.showNotification('Error loading saved data');
                }
            }
        } else {
            // Save current session
            const saveData = {
                sessionHistory: this.sessionHistory,
                saveDate: new Date().toISOString()
            };
            localStorage.setItem(slotKey, JSON.stringify(saveData));
            btn.classList.add('saved');
            btn.textContent = `Slot ${slotNumber} ✓`;
            this.showNotification(`Saved to Slot ${slotNumber}`);
        }
    }

    // Export functionality
    exportToJSON() {
        const exportData = {
            sessionHistory: this.sessionHistory,
            savedCalculations: this.history,
            exportDate: new Date().toISOString(),
            calculatorVersion: '1.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `calculations-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        this.showNotification('Calculations exported as JSON');
    }

    exportToText() {
        const textContent = this.sessionHistory.join('\n');
        const dataBlob = new Blob([textContent], {type: 'text/plain'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `calculations-${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        this.showNotification('Calculations exported as text');
    }

    copyToClipboard() {
        const textContent = this.sessionHistory.join('\n');
        navigator.clipboard.writeText(textContent).then(() => {
            this.showNotification('Calculations copied to clipboard!');
        });
    }

    // Import functionality
    importFromJSON(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData.sessionHistory) {
                    this.sessionHistory = importedData.sessionHistory;
                    this.updateDisplay();
                    this.showNotification('Calculations imported successfully!');
                }
            } catch (error) {
                this.showNotification('Error importing file');
            }
        };
        reader.readAsText(file);
    }

    // DISPLAY & HISTORY METHODS
    updateDisplay() {
        const display = document.getElementById('display');
        const calculationDisplay = document.getElementById('calculation');
        
        if (display) {
            display.textContent = this.isError ? 'Error' : this.formatDisplay(this.currentInput);
        }
        
        if (calculationDisplay) {
            // Build multi-line display with session history + current calculation
            let displayContent = '';
            
            // Add session history (all previous calculations)
            if (this.sessionHistory.length > 0) {
                displayContent = this.sessionHistory.join('\n') + '\n';
            }
            
            // Add current building calculation
            if (this.currentCalculation) {
                displayContent += this.currentCalculation;
            }
            
            calculationDisplay.textContent = displayContent;
            
            // Auto-scroll to bottom
            calculationDisplay.scrollTop = calculationDisplay.scrollHeight;
            
            // Adjust height based on content
            this.adjustCalculationHeight();
        }
    }

    adjustCalculationHeight() {
        const calculationDisplay = document.getElementById('calculation');
        if (calculationDisplay) {
            const lines = calculationDisplay.textContent.split('\n').length;
            const minHeight = 28;
            const lineHeight = 20;
            const maxHeight = 150;
            
            const newHeight = Math.min(maxHeight, Math.max(minHeight, lines * lineHeight));
            calculationDisplay.style.height = newHeight + 'px';
            calculationDisplay.style.minHeight = minHeight + 'px';
            calculationDisplay.style.maxHeight = maxHeight + 'px';
        }
    }

    addToSessionHistory(calculation) {
        this.sessionHistory.push(calculation);
        
        if (this.sessionHistory.length > 100) {
            this.sessionHistory = this.sessionHistory.slice(-50);
        }
    }

    addToHistory(expression, result, type = 'calculation') {
        if (!expression || !result || result === 'Error') return;
        
        const historyItem = {
            expression: expression,
            result: result,
            type: type,
            timestamp: new Date().toLocaleTimeString()
        };
        
        const isDuplicate = this.history.length > 0 && 
                           this.history[0].expression === expression && 
                           this.history[0].result === result;
        
        if (!isDuplicate) {
            this.history.unshift(historyItem);
            
            if (this.history.length > this.maxHistoryItems) {
                this.history = this.history.slice(0, this.maxHistoryItems);
            }
            
            this.saveHistory();
        }
    }

    // HELPER METHODS
    formatDisplay(value) {
        if (value.length > 12) {
            return parseFloat(value).toExponential(6);
        }
        return value;
    }

    resetCalculator() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.resetScreen = false;
        this.currentCalculation = '';
        this.isError = false;
        this.updateDisplay();
    }

    handleError(message) {
        this.isError = true;
        this.currentInput = 'Error';
        this.expression = message;
        this.updateDisplay();
        
        setTimeout(() => {
            if (this.isError) {
                this.resetCalculator();
            }
        }, 3000);
    }

    roundResult(num) {
        return Math.round(num * 100000000) / 100000000;
    }

    factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    getOperatorSymbol(op) {
        const symbols = {
            '+': '+',
            '-': '-',
            '*': '×',
            '/': '÷',
            '^': '^',
            '√': '√'
        };
        return symbols[op] || '';
    }

    showNotification(message) {
        // Simple notification implementation
        console.log('💬 Notification:', message);
        // You can implement a proper UI notification here
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }

    // STORAGE METHODS
    saveHistory() {
        try {
            localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        } catch (error) {
            console.warn('Could not save history to localStorage:', error);
        }
    }

    loadHistory() {
        try {
            const savedHistory = localStorage.getItem('calculatorHistory');
            if (savedHistory) {
                this.history = JSON.parse(savedHistory).slice(0, this.maxHistoryItems);
            }
        } catch (error) {
            console.warn('Could not load history from localStorage:', error);
        }
    }
}

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    new ScientificCalculator();
});