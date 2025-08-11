// Elementos do DOM
const functionInput = document.getElementById('function-input');
const xInitialInput = document.getElementById('x-initial');
const xFinalInput = document.getElementById('x-final');
const precisionInput = document.getElementById('precision');
const maxIterationsInput = document.getElementById('max-iterations');
const calculateBtn = document.getElementById('calculate-btn');
const newBtn = document.getElementById('new-btn');
const resetBtn = document.getElementById('reset-btn');
const exitBtn = document.getElementById('exit-btn');
const iterationsBody = document.getElementById('iterations-body');
const resultValue = document.getElementById('result-value');
const functionValue = document.getElementById('function-value');
const errorDisplay = document.getElementById('error-display');

// Inicialização do gráfico
const ctx = document.getElementById('function-chart').getContext('2d');
let functionChart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            label: 'f(x)',
            borderColor: '#4fc3f7',
            backgroundColor: 'rgba(79, 195, 247, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            fill: true
        }, {
            label: 'Raiz',
            data: [],
            borderColor: '#00c853',
            backgroundColor: '#00c853',
            pointRadius: 6,
            pointHoverRadius: 8,
            showLine: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'linear',
                position: 'center',
                title: {
                    display: true,
                    text: 'x',
                    color: '#a0c4e4'
                },
                grid: {
                    color: 'rgba(160, 196, 228, 0.1)'
                },
                ticks: {
                    color: '#a0c4e4'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'f(x)',
                    color: '#a0c4e4'
                },
                grid: {
                    color: 'rgba(160, 196, 228, 0.1)'
                },
                ticks: {
                    color: '#a0c4e4'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#a0c4e4'
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        }
    }
});

// Compilar função usando math.js
function compileFunction(fnString) {
    try {
        const expr = math.compile(fnString);
        return x => expr.evaluate({x: x});
    } catch (error) {
        errorDisplay.textContent = `Erro na função: ${error.message}`;
        return null;
    }
}

// Implementação do Método da Bisseção
function bisectionMethod(fn, a, b, precision, maxIterations) {
    const iterations = [];
    
    // Verificar se a e b são válidos
    if (a >= b) {
        errorDisplay.textContent = "Erro: X inicial deve ser menor que X final";
        return { root: null, iterations: [] };
    }
    
    // Verificar se existe raiz no intervalo
    const fa = fn(a);
    const fb = fn(b);
    
    if (fa * fb > 0) {
        errorDisplay.textContent = "Erro: A função não muda de sinal no intervalo dado. Não é possível garantir a existência de raiz.";
        return { root: null, iterations: [] };
    }
    
    let x0 = a;
    let iteration = 0;
    let error = Math.abs(b - a);
    
    while (error > precision && iteration < maxIterations) {
        iteration++;
        const x1 = (a + b) / 2;
        const f1 = fn(x1);
        
        // Salvar dados da iteração
        iterations.push({
            iteration: iteration,
            xa: a,
            fxa: fn(a),
            xb: b,
            fxb: fn(b),
            xn: x1,
            fxn: f1,
            error: error
        });
        
        // Atualizar intervalo
        if (fn(a) * f1 < 0) {
            b = x1;
        } else {
            a = x1;
        }
        
        // Calcular novo erro
        error = Math.abs(b - a);
        x0 = x1;
    }
    
    return {
        root: (a + b) / 2,
        iterations: iterations
    };
}

// Atualizar gráfico com dados da função
function updateChart(fn, a, b, root) {
    // Ajustar o intervalo do gráfico para mostrar o intervalo e um pouco mais
    const rangeMin = Math.min(a, b, root || a) - 1;
    const rangeMax = Math.max(a, b, root || b) + 1;
    
    // Gerar pontos de dados
    const step = (rangeMax - rangeMin) / 100;
    const data = [];
    
    for (let x = rangeMin; x <= rangeMax; x += step) {
        try {
            const y = fn(x);
            if (isFinite(y)) {
                data.push({x: x, y: y});
            }
        } catch (e) {
            // Pular pontos onde a função não está definida
        }
    }
    
    // Atualizar dados do gráfico
    functionChart.data.datasets[0].data = data;
    
    // Atualizar ponto da raiz se encontrada
    if (root !== null) {
        functionChart.data.datasets[1].data = [{x: root, y: fn(root)}];
    } else {
        functionChart.data.datasets[1].data = [];
    }
    
    functionChart.update();
}

// Exibir iterações na tabela
function displayIterations(iterations) {
    iterationsBody.innerHTML = '';
    
    iterations.forEach(iter => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${iter.iteration}</td>
            <td>${iter.xa.toFixed(6)}</td>
            <td>${iter.fxa.toExponential(4)}</td>
            <td>${iter.xb.toFixed(6)}</td>
            <td>${iter.fxb.toExponential(4)}</td>
            <td>${iter.xn.toFixed(6)}</td>
            <td>${iter.fxn.toExponential(4)}</td>
            <td>${iter.error.toExponential(4)}</td>
        `;
        
        iterationsBody.appendChild(row);
    });
}

// Função principal de cálculo
function calculate() {
    errorDisplay.textContent = '';
    resultValue.textContent = '-';
    functionValue.textContent = '';
    
    // Obter valores de entrada
    const fnString = functionInput.value.trim();
    const a = parseFloat(xInitialInput.value);
    const b = parseFloat(xFinalInput.value);
    const precision = parseFloat(precisionInput.value);
    const maxIterations = parseInt(maxIterationsInput.value);
    
    // Validar entradas
    if (isNaN(a) || isNaN(b) || isNaN(precision) || isNaN(maxIterations)) {
        errorDisplay.textContent = "Erro: Por favor, insira valores numéricos válidos";
        return;
    }
    
    if (precision <= 0) {
        errorDisplay.textContent = "Erro: A precisão deve ser maior que zero";
        return;
    }
    
    // Compilar a função
    const fn = compileFunction(fnString);
    if (!fn) return;
    
    // Executar método da bisseção
    const { root, iterations } = bisectionMethod(fn, a, b, precision, maxIterations);
    
    if (root !== null) {
        resultValue.textContent = root.toFixed(10);
        functionValue.textContent = `f(${root.toFixed(10)}) = ${fn(root).toExponential(6)}`;
        displayIterations(iterations);
    } else if (iterations.length === 0) {
        errorDisplay.textContent = "O método não convergiu com os parâmetros fornecidos";
    }
    
    // Atualizar o gráfico
    updateChart(fn, a, b, root);
}

// Reiniciar o formulário
function resetForm() {
    functionInput.value = 'exp(x/10) - 3';
    xInitialInput.value = '0';
    xFinalInput.value = '40';
    precisionInput.value = '0.0001';
    maxIterationsInput.value = '100';
    iterationsBody.innerHTML = '';
    resultValue.textContent = '-';
    functionValue.textContent = '';
    errorDisplay.textContent = '';
    
    functionChart.data.datasets[0].data = [];
    functionChart.data.datasets[1].data = [];
    functionChart.update();
}

// Nova calculação
function newCalculation() {
    functionInput.value = '';
    iterationsBody.innerHTML = '';
    resultValue.textContent = '-';
    functionValue.textContent = '';
    errorDisplay.textContent = '';

    functionChart.data.datasets[0].data = [];
    functionChart.data.datasets[1].data = [];
    functionChart.update();
}

// Event listeners
calculateBtn.addEventListener('click', calculate);
resetBtn.addEventListener('click', resetForm);
newBtn.addEventListener('click', newCalculation);
exitBtn.addEventListener('click', () => {
    if (confirm('Deseja realmente sair do aplicativo?')) {
        window.close();
    }
});

// Inicializar o formulário
resetForm();
