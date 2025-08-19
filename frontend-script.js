// ================================
// VCM - Visual Cálculo Numérico
// Frontend JavaScript - Versão Otimizada
// ================================

// Elementos do DOM - Principais
const elements = {
    // Inputs
    functionInput: document.getElementById('function-input'),
    xInitial: document.getElementById('x-initial'),
    xFinal: document.getElementById('x-final'),
    precision: document.getElementById('precision'),
    maxIterations: document.getElementById('max-iterations'),
    
    // Botões
    calculateBtn: document.getElementById('calculate-btn'),
    newBtn: document.getElementById('new-btn'),
    resetBtn: document.getElementById('reset-btn'),
    exitBtn: document.getElementById('exit-btn'),
    lessonsBtn: document.getElementById('lessons-btn'),
    
    // Resultados
    iterationsBody: document.getElementById('iterations-body'),
    resultValue: document.getElementById('result-value'),
    functionValue: document.getElementById('function-value'),
    errorDisplay: document.getElementById('error-display'),
    successMessage: document.getElementById('success-message'),
    convergenceInfo: document.getElementById('convergence-info'),
    
    // Modal
    lessonsModal: document.getElementById('lessons-modal'),
    closeModal: document.querySelector('.close'),
    lessonBtns: document.querySelectorAll('.lesson-btn'),
    lessonContents: document.querySelectorAll('.lesson-content')
};


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

// ================================
// FUNÇÕES UTILITÁRIAS
// ================================
function showError(message) {
    elements.errorDisplay.textContent = message;
    elements.errorDisplay.style.display = 'block';
    elements.successMessage.style.display = 'none';
    
    // Animação de shake
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

// ================================
// COMPILAÇÃO DE FUNÇÕES
// ================================
function compileFunction(fnString) {
    try {
        // Limpar e preparar a string
        const cleanString = fnString.trim().toLowerCase();
        
        // Verificar se a string não está vazia
        if (!cleanString) {
            throw new Error('Função não pode estar vazia');
        }
        
        // Compilar usando math.js
        const expr = math.compile(cleanString);
        
        // Função wrapper com tratamento de erro
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

// ================================
// MÉTODO DA BISSEÇÃO - IMPLEMENTAÇÃO OTIMIZADA
// ================================
function bisectionMethod(fn, a, b, precision, maxIterations) {
    const iterations = [];
    const startTime = performance.now();
    
    // Validações iniciais
    if (a >= b) {
        showError("❌ Erro: X inicial deve ser menor que X final");
        return { root: null, iterations: [], stats: null };
    }
    
    // Verificar Teorema de Bolzano
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
    
    // Verificar se já temos uma raiz nos extremos
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
    
    // Algoritmo principal
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
        
        // Salvar dados da iteração
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
        
        // Atualizar intervalo usando Teorema de Bolzano
        if (Math.abs(fxn) < precision) {
            // Encontrou raiz exata
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

// ================================
// ATUALIZAÇÃO DO GRÁFICO
// ================================
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

// ================================
// EXIBIÇÃO DE RESULTADOS
// ================================
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

// ================================
// FUNÇÃO PRINCIPAL DE CÁLCULO
// ================================
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

// ================================
// FUNÇÕES AUXILIARES
// ================================
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

// ================================
// GERENCIAMENTO DO MODAL
// ================================
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

// ================================
// EVENT LISTENERS
// ================================
document.addEventListener('DOMContentLoaded', function() {
    // Botões principais
    elements.calculateBtn.addEventListener('click', calculate);
    elements.resetBtn.addEventListener('click', resetForm);
    elements.newBtn.addEventListener('click', newCalculation);
    elements.lessonsBtn.addEventListener('click', openModal);
    
    elements.exitBtn.addEventListener('click', () => {
        if (confirm('🚪 Deseja realmente sair do aplicativo?')) {
            window.close();
        }
    });
    
    // Modal
    elements.closeModal.addEventListener('click', closeModal);
    
    window.addEventListener('click', (event) => {
        if (event.target === elements.lessonsModal) {
            closeModal();
        }
    });
    
    // Tecla ESC para fechar modal
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && elements.lessonsModal.style.display === 'block') {
            closeModal();
        }
    });
    
    // Seletor de aulas
    elements.lessonBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lessonId = btn.getAttribute('data-lesson');
            switchLesson(lessonId);
        });
    });
    
    // Enter para calcular
    elements.functionInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && event.ctrlKey) {
            calculate();
        }
    });
    
    // Inicializar
    resetForm();
    
    // Animação inicial
    document.querySelector('.container').style.animation = 'fadeIn 1s ease-out';
});

// ================================
// CSS ANIMATIONS (Adicionado via JavaScript)
// ================================
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

// ================================
// EXPORTAR PARA DEBUG (DESENVOLVIMENTO)
// ================================
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
