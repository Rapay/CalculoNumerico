
const elements = {
    methodOptions: document.querySelectorAll('.method-option'),
    bisectionPanel: document.getElementById('bisection-panel'),
    gaussPanel: document.getElementById('gauss-panel'),
    bisectionResults: document.getElementById('bisection-results'),
    gaussResults: document.getElementById('gauss-results'),
    
    functionInput: document.getElementById('function-input'),
    xInitial: document.getElementById('x-initial'),
    xFinal: document.getElementById('x-final'),
    precision: document.getElementById('precision'),
    maxIterations: document.getElementById('max-iterations'),
    calculateBtn: document.getElementById('calculate-btn'),
    resetBtn: document.getElementById('reset-btn'),
    newBtn: document.getElementById('new-btn'),
    
    matrixSize: document.getElementById('matrix-size'),
    matrixInput: document.getElementById('matrix-input'),
    showSteps: document.getElementById('show-steps'),
    pivoting: document.getElementById('pivoting'),
    solveGaussBtn: document.getElementById('solve-gauss-btn'),
    resetGaussBtn: document.getElementById('reset-gauss-btn'),
    newGaussBtn: document.getElementById('new-gauss-btn'),
    gaussStepsContainer: document.getElementById('gauss-steps-container'),
    
    errorDisplay: document.getElementById('error-display'),
    successMessage: document.getElementById('success-message'),
    iterationsBody: document.getElementById('iterations-body'),
    resultValue: document.getElementById('result-value'),
    functionValue: document.getElementById('function-value'),
    convergenceInfo: document.getElementById('convergence-info'),
    
    lessonsBtn: document.getElementById('lessons-btn'),
    exitBtn: document.getElementById('exit-btn'),
    lessonsModal: document.getElementById('lessons-modal'),
    closeModal: document.querySelector('.close'),
    lessonBtns: document.querySelectorAll('.lesson-btn'),
    lessonContents: document.querySelectorAll('.lesson-content')
};

let currentMethod = 'bisection';

function switchMethod(method) {
    currentMethod = method;
    
    elements.methodOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.method === method) {
            option.classList.add('active');
        }
    });
    
    if (method === 'bisection') {
        elements.bisectionPanel.style.display = 'block';
        elements.gaussPanel.style.display = 'none';
        elements.bisectionResults.style.display = 'block';
        elements.gaussResults.style.display = 'none';
    } else if (method === 'gauss') {
        elements.bisectionPanel.style.display = 'none';
        elements.gaussPanel.style.display = 'block';
        elements.bisectionResults.style.display = 'none';
        elements.gaussResults.style.display = 'block';
        generateMatrixInput();
    }
    
    clearMessages();
}

function generateMatrixInput() {
    const size = parseInt(elements.matrixSize.value);
    const container = elements.matrixInput;
    
    container.innerHTML = '';
    
    const matrixDiv = document.createElement('div');
    matrixDiv.className = 'matrix-input';
    
    for (let i = 0; i < size; i++) {
        const row = document.createElement('div');
        row.className = 'matrix-row';
        
        for (let j = 0; j < size; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.id = `a${i}${j}`;
            input.placeholder = `a${i+1}${j+1}`;
            input.value = i === j ? '1' : '0';
            row.appendChild(input);
        }
        
        const separator = document.createElement('span');
        separator.className = 'matrix-separator';
        separator.textContent = '|';
        row.appendChild(separator);
        
        const bInput = document.createElement('input');
        bInput.type = 'number';
        bInput.step = 'any';
        bInput.id = `b${i}`;
        bInput.placeholder = `b${i+1}`;
        bInput.value = '1';
        row.appendChild(bInput);
        
        matrixDiv.appendChild(row);
    }
    
    container.appendChild(matrixDiv);
}

function loadExample(exampleType) {
    const size = parseInt(elements.matrixSize.value);
    
    if (exampleType === 'system1') {
        const values = [
            [2, 1, -1, 8],
            [-3, -1, 2, -11],
            [-2, 1, 2, -3]
        ];
        
        if (size >= 3) {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    document.getElementById(`a${i}${j}`).value = values[i][j];
                }
                document.getElementById(`b${i}`).value = values[i][3];
            }
        }
    } else if (exampleType === 'system2') {
        const values = [
            [1, 2, 3, 14],
            [2, -1, 1, 5],
            [3, 2, -1, 2]
        ];
        
        if (size >= 3) {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    document.getElementById(`a${i}${j}`).value = values[i][j];
                }
                document.getElementById(`b${i}`).value = values[i][3];
            }
        }
    }
}

function getMatrixFromInput() {
    const size = parseInt(elements.matrixSize.value);
    const matrix = [];
    
    for (let i = 0; i < size; i++) {
        const row = [];
        
        for (let j = 0; j < size; j++) {
            const value = parseFloat(document.getElementById(`a${i}${j}`).value);
            if (isNaN(value)) {
                throw new Error(`Valor inválido na posição (${i+1},${j+1})`);
            }
            row.push(value);
        }
        
        const bValue = parseFloat(document.getElementById(`b${i}`).value);
        if (isNaN(bValue)) {
            throw new Error(`Valor inválido em b${i+1}`);
        }
        row.push(bValue);
        
        matrix.push(row);
    }
    
    return matrix;
}

function solveGaussianSystem() {
    clearMessages();
    
    elements.solveGaussBtn.textContent = '⏳ Resolvendo...';
    elements.solveGaussBtn.disabled = true;
    
    setTimeout(() => {
        try {
            const matrix = getMatrixFromInput();
            const showSteps = elements.showSteps.checked;
            
            console.log('🎯 Iniciando resolução do sistema:', matrix);
            
            const result = gaussElimination(matrix);
            
            displayGaussResults(result, showSteps);
            showSuccess();
            
        } catch (error) {
            console.error('❌ Erro na resolução:', error);
            showError(error.message);
        } finally {
            elements.solveGaussBtn.textContent = '🚀 Resolver Sistema';
            elements.solveGaussBtn.disabled = false;
        }
    }, 100);
}

function displayGaussResults(result, showSteps) {
    const container = elements.gaussStepsContainer;
    container.innerHTML = '';
    
    if (showSteps) {
        result.steps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'gauss-step';
            stepDiv.innerHTML = `
                <h3>${step.title}</h3>
                <div class="step-description">${step.description}</div>
                ${formatMatrix(step.matrix)}
                ${step.pivotElement ? `<div class="pivot-info">Pivô: ${step.pivotElement}</div>` : ''}
            `;
            container.appendChild(stepDiv);
        });
    }
    
    const solutionDiv = document.createElement('div');
    solutionDiv.className = 'solution-display';
    solutionDiv.innerHTML = `
        <h3>🎯 Solução do Sistema</h3>
        <div class="solution-vector">
            ${result.solution.map((x, i) => 
                `<div class="solution-item">x${i+1} = ${x.toFixed(6)}</div>`
            ).join('')}
        </div>
        ${result.determinant !== null ? 
            `<div style="text-align: center; margin-top: 15px; color: #a0c4e4;">
                Determinante: ${result.determinant.toFixed(6)}
            </div>` : ''}
    `;
    container.appendChild(solutionDiv);
}

function resetGaussForm() {
    generateMatrixInput();
    elements.gaussStepsContainer.innerHTML = `
        <div style="text-align: center; color: #a0c4e4; padding: 20px;">
            Aguardando sistema para resolver...
        </div>
    `;
    clearMessages();
}

function newGaussSystem() {
    resetGaussForm();
    elements.matrixSize.focus();
}


const ctx = document.getElementById('function-chart').getContext('2d');
let functionChart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            label: '📈 f(x)',
            borderColor: '#4fc3f7',
            backgroundColor: 'rgba(79, 195, 247, 0.1)',
            borderWidth: 3,
            pointRadius: 0,
            fill: true,
            tension: 0.2
        }, {
            label: '🎯 Raiz Encontrada',
            data: [],
            borderColor: '#00c853',
            backgroundColor: '#00c853',
            pointRadius: 8,
            pointHoverRadius: 12,
            showLine: false,
            pointStyle: 'star'
        }, {
            label: '📍 Intervalo Inicial',
            data: [],
            borderColor: '#ff9100',
            backgroundColor: '#ff9100',
            pointRadius: 6,
            pointHoverRadius: 8,
            showLine: false,
            pointStyle: 'triangle'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        },
        scales: {
            x: {
                type: 'linear',
                position: 'center',
                title: {
                    display: true,
                    text: 'x',
                    color: '#a0c4e4',
                    font: { size: 14, weight: 'bold' }
                },
                grid: {
                    color: 'rgba(160, 196, 228, 0.15)',
                    lineWidth: 1
                },
                ticks: {
                    color: '#a0c4e4',
                    font: { size: 12 }
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'f(x)',
                    color: '#a0c4e4',
                    font: { size: 14, weight: 'bold' }
                },
                grid: {
                    color: 'rgba(160, 196, 228, 0.15)',
                    lineWidth: 1
                },
                ticks: {
                    color: '#a0c4e4',
                    font: { size: 12 }
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#a0c4e4',
                    font: { size: 12 },
                    usePointStyle: true
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(10, 25, 47, 0.9)',
                titleColor: '#4fc3f7',
                bodyColor: '#a0c4e4',
                borderColor: '#4fc3f7',
                borderWidth: 1
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        }
    }
});


function showError(message) {
    elements.errorDisplay.textContent = message;
    elements.errorDisplay.style.display = 'block';
    elements.successMessage.style.display = 'none';
    
    elements.errorDisplay.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        elements.errorDisplay.style.animation = '';
    }, 500);
}

function showSuccess(message = '✅ Cálculo executado com sucesso!') {
    elements.successMessage.textContent = message;
    elements.successMessage.style.display = 'block';
    elements.errorDisplay.style.display = 'none';
}

function clearMessages() {
    elements.errorDisplay.style.display = 'none';
    elements.successMessage.style.display = 'none';
    elements.errorDisplay.textContent = '';
}

function formatNumber(num, decimals = 6) {
    if (!isFinite(num)) return 'N/A';
    return Number(num).toFixed(decimals);
}

function formatScientific(num, decimals = 4) {
    if (!isFinite(num)) return 'N/A';
    return Number(num).toExponential(decimals);
}


function compileFunction(fnString) {
    try {
        const cleanString = fnString.trim().toLowerCase();
        
        if (!cleanString) {
            throw new Error('Função não pode estar vazia');
        }
        
        const expr = math.compile(cleanString);
        
        return (x) => {
            try {
                const result = expr.evaluate({ x: x });
                if (!isFinite(result)) {
                    throw new Error(`Valor inválido em x = ${x}`);
                }
                return result;
            } catch (error) {
                throw new Error(`Erro ao avaliar f(${x}): ${error.message}`);
            }
        };
    } catch (error) {
        showError(`Erro na função: ${error.message}`);
        return null;
    }
}

function bisectionMethod(fn, a, b, precision, maxIterations) {
    const iterations = [];
    const startTime = performance.now();
    
    if (a >= b) {
        showError("❌ Erro: X inicial deve ser menor que X final");
        return { root: null, iterations: [], stats: null };
    }
    
    let fa, fb;
    try {
        fa = fn(a);
        fb = fn(b);
    } catch (error) {
        showError(`❌ Erro ao avaliar função: ${error.message}`);
        return { root: null, iterations: [], stats: null };
    }
    
    if (fa * fb > 0) {
        showError(`❌ Erro: A função não muda de sinal no intervalo [${a}, ${b}].\nf(${a}) = ${formatScientific(fa)}\nf(${b}) = ${formatScientific(fb)}\nNão é possível garantir a existência de raiz.`);
        return { root: null, iterations: [], stats: null };
    }
    
    if (Math.abs(fa) < precision) {
        return { 
            root: a, 
            iterations: [{ iteration: 0, xa: a, fxa: fa, xb: b, fxb: fb, xn: a, fxn: fa, error: 0 }],
            stats: { time: performance.now() - startTime, converged: true }
        };
    }
    if (Math.abs(fb) < precision) {
        return { 
            root: b, 
            iterations: [{ iteration: 0, xa: a, fxa: fa, xb: b, fxb: fb, xn: b, fxn: fb, error: 0 }],
            stats: { time: performance.now() - startTime, converged: true }
        };
    }
    
    let iteration = 0;
    let error = Math.abs(b - a);
    let xa = a, xb = b;
    
    while (error > precision && iteration < maxIterations) {
        iteration++;
        const xn = (xa + xb) / 2;
        
        let fxa, fxb, fxn;
        try {
            fxa = fn(xa);
            fxb = fn(xb);
            fxn = fn(xn);
        } catch (err) {
            showError(`❌ Erro na iteração ${iteration}: ${err.message}`);
            break;
        }
        
        iterations.push({
            iteration: iteration,
            xa: xa,
            fxa: fxa,
            xb: xb,
            fxb: fxb,
            xn: xn,
            fxn: fxn,
            error: error
        });
        
        if (Math.abs(fxn) < precision) {
            error = 0;
            break;
        } else if (fxa * fxn < 0) {
            xb = xn;
        } else {
            xa = xn;
        }
        
        error = Math.abs(xb - xa);
    }
    
    const endTime = performance.now();
    const converged = error <= precision || Math.abs(fn((xa + xb) / 2)) < precision;
    
    return {
        root: (xa + xb) / 2,
        iterations: iterations,
        stats: {
            time: endTime - startTime,
            converged: converged,
            finalError: error,
            totalIterations: iteration
        }
    };
}

function updateChart(fn, a, b, root, iterations = []) {
    try {
        // Definir intervalo do gráfico
        const padding = Math.abs(b - a) * 0.2;
        const rangeMin = Math.min(a, b, root || a) - padding;
        const rangeMax = Math.max(a, b, root || b) + padding;
        
        // Gerar pontos da função
        const numPoints = 200;
        const step = (rangeMax - rangeMin) / numPoints;
        const functionData = [];
        
        for (let i = 0; i <= numPoints; i++) {
            const x = rangeMin + i * step;
            try {
                const y = fn(x);
                if (isFinite(y)) {
                    functionData.push({ x: x, y: y });
                }
            } catch (e) {
                // Pular pontos problemáticos
            }
        }
        
        // Atualizar dados da função
        functionChart.data.datasets[0].data = functionData;
        
        // Atualizar pontos do intervalo inicial
        const intervalData = [];
        try {
            intervalData.push({ x: a, y: fn(a) });
            intervalData.push({ x: b, y: fn(b) });
        } catch (e) {
            // Se não conseguir plotar os pontos do intervalo
        }
        functionChart.data.datasets[2].data = intervalData;
        
        // Atualizar ponto da raiz
        if (root !== null && isFinite(root)) {
            try {
                functionChart.data.datasets[1].data = [{ x: root, y: fn(root) }];
            } catch (e) {
                functionChart.data.datasets[1].data = [];
            }
        } else {
            functionChart.data.datasets[1].data = [];
        }
        
        functionChart.update('active');
    } catch (error) {
        console.error('Erro ao atualizar gráfico:', error);
    }
}

function displayIterations(iterations) {
    elements.iterationsBody.innerHTML = '';
    
    if (iterations.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="8" style="text-align: center; color: #a0c4e4; padding: 20px;">
                Nenhuma iteração realizada
            </td>
        `;
        elements.iterationsBody.appendChild(row);
        return;
    }
    
    iterations.forEach((iter, index) => {
        const row = document.createElement('tr');
        row.style.animation = `fadeInRow 0.5s ease ${index * 0.1}s both`;
        
        row.innerHTML = `
            <td>${iter.iteration}</td>
            <td>${formatNumber(iter.xa)}</td>
            <td>${formatScientific(iter.fxa)}</td>
            <td>${formatNumber(iter.xb)}</td>
            <td>${formatScientific(iter.fxb)}</td>
            <td>${formatNumber(iter.xn)}</td>
            <td>${formatScientific(iter.fxn)}</td>
            <td>${formatScientific(iter.error)}</td>
        `;
        
        elements.iterationsBody.appendChild(row);
    });
}

function displayResults(result, stats) {
    if (result !== null && isFinite(result)) {
        elements.resultValue.textContent = formatNumber(result, 10);
        
        try {
            const fnValue = compileFunction(elements.functionInput.value)(result);
            elements.functionValue.textContent = `f(${formatNumber(result, 6)}) = ${formatScientific(fnValue, 8)}`;
        } catch (e) {
            elements.functionValue.textContent = 'Erro ao calcular f(raiz)';
        }
        
        if (stats) {
            elements.convergenceInfo.innerHTML = `
                ⏱️ Tempo: ${stats.time.toFixed(2)}ms | 
                🔄 Iterações: ${stats.totalIterations} | 
                📊 Status: ${stats.converged ? '✅ Convergiu' : '⚠️ Não convergiu'} |
                📏 Erro final: ${formatScientific(stats.finalError)}
            `;
        }
        
        showSuccess();
    } else {
        elements.resultValue.textContent = '-';
        elements.functionValue.textContent = '';
        elements.convergenceInfo.textContent = '';
    }
}

function calculate() {
    clearMessages();
    
    // Mostrar indicador de carregamento
    elements.calculateBtn.textContent = '⏳ Calculando...';
    elements.calculateBtn.disabled = true;
    
    setTimeout(() => {
        try {
            // Obter e validar valores de entrada
            const fnString = elements.functionInput.value.trim();
            const a = parseFloat(elements.xInitial.value);
            const b = parseFloat(elements.xFinal.value);
            const precision = parseFloat(elements.precision.value);
            const maxIterations = parseInt(elements.maxIterations.value);
            
            // Validações
            if (isNaN(a) || isNaN(b) || isNaN(precision) || isNaN(maxIterations)) {
                throw new Error('Por favor, insira valores numéricos válidos');
            }
            
            if (precision <= 0) {
                throw new Error('A precisão deve ser maior que zero');
            }
            
            if (maxIterations < 1 || maxIterations > 1000) {
                throw new Error('Número de iterações deve estar entre 1 e 1000');
            }
            
            // Compilar a função
            const fn = compileFunction(fnString);
            if (!fn) return;
            
            // Executar método da bisseção
            const { root, iterations, stats } = bisectionMethod(fn, a, b, precision, maxIterations);
            
            // Exibir resultados
            displayIterations(iterations);
            displayResults(root, stats);
            
            // Atualizar gráfico
            updateChart(fn, a, b, root, iterations);
            
        } catch (error) {
            showError(`❌ ${error.message}`);
        } finally {
            // Restaurar botão
            elements.calculateBtn.textContent = '🚀 Calcular';
            elements.calculateBtn.disabled = false;
        }
    }, 100);
}

function setFunction(fnString) {
    elements.functionInput.value = fnString;
    elements.functionInput.focus();
    
    // Animação visual
    elements.functionInput.style.borderColor = '#00c853';
    setTimeout(() => {
        elements.functionInput.style.borderColor = '';
    }, 1000);
}

function resetForm() {
    elements.functionInput.value = 'x^2 - 4';
    elements.xInitial.value = '0';
    elements.xFinal.value = '3';
    elements.precision.value = '0.0001';
    elements.maxIterations.value = '100';
    
    elements.iterationsBody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; color: #a0c4e4; padding: 20px;">
                Aguardando cálculo...
            </td>
        </tr>
    `;
    
    elements.resultValue.textContent = '-';
    elements.functionValue.textContent = '';
    elements.convergenceInfo.textContent = '';
    clearMessages();
    
    // Limpar gráfico
    functionChart.data.datasets[0].data = [];
    functionChart.data.datasets[1].data = [];
    functionChart.data.datasets[2].data = [];
    functionChart.update();
}

function newCalculation() {
    elements.functionInput.value = '';
    elements.iterationsBody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; color: #a0c4e4; padding: 20px;">
                Aguardando nova função...
            </td>
        </tr>
    `;
    
    elements.resultValue.textContent = '-';
    elements.functionValue.textContent = '';
    elements.convergenceInfo.textContent = '';
    clearMessages();
    
    functionChart.data.datasets[0].data = [];
    functionChart.data.datasets[1].data = [];
    functionChart.data.datasets[2].data = [];
    functionChart.update();
    
    elements.functionInput.focus();
}

function openModal() {
    elements.lessonsModal.style.display = 'block';
    elements.lessonsModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    elements.lessonsModal.style.display = 'none';
    elements.lessonsModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
}

function switchLesson(lessonId) {
    // Remover active de todos
    elements.lessonBtns.forEach(btn => btn.classList.remove('active'));
    elements.lessonContents.forEach(content => content.classList.remove('active'));
    
    // Ativar selecionado
    document.querySelector(`[data-lesson="${lessonId}"]`).classList.add('active');
    document.getElementById(`lesson-${lessonId}`).classList.add('active');
}


function gaussElimination(matrix) {
    const n = matrix.length;
    const augmentedMatrix = matrix.map(row => [...row]);
    const steps = [];
    
    console.log('🎯 Iniciando Método da Eliminação de Gauss');
    
    steps.push({
        stage: 0,
        title: '📋 Matriz Aumentada Inicial [A|b]',
        matrix: augmentedMatrix.map(row => [...row]),
        description: 'Sistema linear na forma matricial aumentada'
    });
    
    for (let k = 0; k < n - 1; k++) {
        console.log(`🔄 Etapa k=${k + 1} - Eliminação da coluna ${k + 1}`);
        
        let maxRow = k;
        for (let i = k + 1; i < n; i++) {
            if (Math.abs(augmentedMatrix[i][k]) > Math.abs(augmentedMatrix[maxRow][k])) {
                maxRow = i;
            }
        }
        
        if (maxRow !== k) {
            [augmentedMatrix[k], augmentedMatrix[maxRow]] = [augmentedMatrix[maxRow], augmentedMatrix[k]];
            steps.push({
                stage: k + 1,
                title: `🔄 Troca de Linhas L${k + 1} ↔ L${maxRow + 1}`,
                matrix: augmentedMatrix.map(row => [...row]),
                description: `Pivotamento: movendo maior elemento para posição (${k + 1},${k + 1})`
            });
        }
        
        if (Math.abs(augmentedMatrix[k][k]) < 1e-10) {
            throw new Error(`❌ Sistema singular: pivô zero na posição (${k + 1},${k + 1})`);
        }
        
        for (let i = k + 1; i < n; i++) {
            const multiplier = augmentedMatrix[i][k] / augmentedMatrix[k][k];
            
            for (let j = k; j <= n; j++) {
                augmentedMatrix[i][j] -= multiplier * augmentedMatrix[k][j];
            }
            
            for (let j = 0; j <= n; j++) {
                if (Math.abs(augmentedMatrix[i][j]) < 1e-10) {
                    augmentedMatrix[i][j] = 0;
                }
            }
        }
        
        steps.push({
            stage: k + 1,
            title: `✅ Etapa k=${k + 1} Concluída`,
            matrix: augmentedMatrix.map(row => [...row]),
            description: `Eliminação da coluna ${k + 1}: zeros abaixo de a${k + 1}${k + 1}`,
            pivotElement: `a${k + 1}${k + 1} = ${augmentedMatrix[k][k].toFixed(4)}`
        });
    }
    
    steps.push({
        stage: n,
        title: '🎯 Matriz Triangular Superior Final',
        matrix: augmentedMatrix.map(row => [...row]),
        description: 'Sistema transformado em forma triangular superior, pronto para substituição regressiva'
    });
    
    const solution = new Array(n);
    
    for (let i = n - 1; i >= 0; i--) {
        solution[i] = augmentedMatrix[i][n];
        
        for (let j = i + 1; j < n; j++) {
            solution[i] -= augmentedMatrix[i][j] * solution[j];
        }
        
        solution[i] /= augmentedMatrix[i][i];
    }
    
    return {
        solution: solution,
        steps: steps,
        determinant: calculateDeterminant(matrix),
        isConsistent: true
    };
}

function calculateDeterminant(matrix) {
    const n = matrix.length;
    if (n !== matrix[0].length - 1) return null;
    
    let det = 1;
    const temp = matrix.map(row => row.slice(0, -1));
    
    for (let k = 0; k < n - 1; k++) {
        for (let i = k + 1; i < n; i++) {
            if (Math.abs(temp[k][k]) < 1e-10) return 0;
            
            const factor = temp[i][k] / temp[k][k];
            for (let j = k; j < n; j++) {
                temp[i][j] -= factor * temp[k][j];
            }
        }
    }
    
    for (let i = 0; i < n; i++) {
        det *= temp[i][i];
    }
    
    return det;
}

function formatMatrix(matrix, highlightRow = -1, highlightCol = -1) {
    const n = matrix.length;
    const m = matrix[0].length;
    
    let html = '<div class="matrix-display">';
    html += '<table class="matrix-table">';
    
    for (let i = 0; i < n; i++) {
        html += '<tr>';
        for (let j = 0; j < m; j++) {
            const value = matrix[i][j];
            const isAugmented = j === m - 1;
            const isHighlighted = (i === highlightRow || j === highlightCol);
            
            let cellClass = 'matrix-cell';
            if (isAugmented) cellClass += ' augmented-col';
            if (isHighlighted) cellClass += ' highlighted';
            if (j === m - 2) cellClass += ' before-augmented';
            
            html += `<td class="${cellClass}">`;
            html += Math.abs(value) < 1e-10 ? '0' : value.toFixed(4);
            html += '</td>';
        }
        html += '</tr>';
    }
    
    html += '</table>';
    html += '</div>';
    
    return html;
}

function addGaussianMethodToUI() {
    console.log('🚀 Método da Eliminação de Gauss implementado!');
    console.log('📚 Baseado na metodologia dos slides da Prof. Tânia Camila Goulart');
}

document.addEventListener('DOMContentLoaded', function() {
    elements.methodOptions.forEach(option => {
        option.addEventListener('click', () => {
            switchMethod(option.dataset.method);
        });
    });
    
    elements.calculateBtn.addEventListener('click', calculate);
    elements.resetBtn.addEventListener('click', resetForm);
    elements.newBtn.addEventListener('click', newCalculation);
    
    elements.matrixSize.addEventListener('change', generateMatrixInput);
    elements.solveGaussBtn.addEventListener('click', solveGaussianSystem);
    elements.resetGaussBtn.addEventListener('click', resetGaussForm);
    elements.newGaussBtn.addEventListener('click', newGaussSystem);
    
    elements.lessonsBtn.addEventListener('click', openModal);
    elements.exitBtn.addEventListener('click', () => {
        if (confirm('🚪 Deseja realmente sair do aplicativo?')) {
            window.close();
        }
    });
    
    elements.closeModal.addEventListener('click', closeModal);
    
    window.addEventListener('click', (event) => {
        if (event.target === elements.lessonsModal) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && elements.lessonsModal.style.display === 'block') {
            closeModal();
        }
    });
    
    elements.lessonBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lessonId = btn.getAttribute('data-lesson');
            switchLesson(lessonId);
        });
    });
    
    elements.functionInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && event.ctrlKey) {
            calculate();
        }
    });
    
    addGaussianMethodToUI();
    
    switchMethod('bisection');
    resetForm();
    
    document.querySelector('.container').style.animation = 'fadeIn 1s ease-out';
    
    console.log('🚀 Aplicação VCM inicializada!');
    console.log('📚 Métodos disponíveis: Bisseção e Eliminação de Gauss');
    console.log('🎯 Baseado na metodologia dos slides da Prof. Tânia Camila Goulart');
});

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInRow {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

window.VCM = {
    elements,
    calculate,
    resetForm,
    setFunction,
    compileFunction,
    bisectionMethod
};

console.log('🧮 VCM - Visual Cálculo Numérico carregado com sucesso!');
console.log('💡 Dica: Use Ctrl+Enter no campo da função para calcular rapidamente');
