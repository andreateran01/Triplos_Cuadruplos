document.addEventListener("DOMContentLoaded", () => {
    const btnGenerar = document.getElementById("btnGenerar");
    const btnLimpiar = document.getElementById("btnLimpiar");
    const txtExpresion = document.getElementById("expresion");
    const selectTipo = document.getElementById("tipoRepresentacion");
    const divResultado = document.getElementById("resultado");

    btnGenerar.addEventListener("click", () => {
        const expresionRaw = txtExpresion.value.trim();
        const tipo = selectTipo.value;

        if (!expresionRaw) {
            alert("Por favor, ingresa una expresión aritmética.");
            return;
        }

        if (!tipo) {
            alert("Por favor, selecciona un tipo de representación (Cuádruplos o Triplos).");
            return;
        }

        procesarExpresion(expresionRaw, tipo);
    });

    btnLimpiar.addEventListener("click", () => {
        txtExpresion.value = "";
        selectTipo.value = "";
        divResultado.innerHTML = "";
    });

    function procesarExpresion(expresionStr, tipo) {
        let variableAsignacion = null;
        let expr = expresionStr;

        if (expresionStr.includes("=")) {
            const partes = expresionStr.split("=");
            variableAsignacion = partes[0].trim();
            expr = partes[1].trim();
        }

        const instrucciones = descomponerExpresion(expr);

        let html = `<div class="card shadow-sm p-4 mb-4">`;
        html += `<h4 class="mb-3 text-primary">Representación en ${tipo === 'cuadruplos' ? 'Cuádruplos' : 'Triplos'}</h4>`;

        if (tipo === 'cuadruplos') {
            html += generarTablaCuadruplos(instrucciones, variableAsignacion);
        } else {
            html += generarTablaTriplos(instrucciones, variableAsignacion);
        }

        html += `</div>`;

        divResultado.innerHTML = html;
    }

    function descomponerExpresion(expr) {
        let temporales = [];
        let tempCount = 1;

        expr = expr.replace(';', '');

        function agregarOp(op, op1, op2) {
            const temp = `t${tempCount++}`;
            temporales.push({ id: tempCount - 1, op, op1, op2, res: temp });
            return temp;
        }

        let e = expr;
        let regexParentesis = /\(([^()]+)\)/;

        while (regexParentesis.test(e)) {
            e = e.replace(regexParentesis, (match, subExpr) => {
                return reducirSubExpresion(subExpr, agregarOp);
            });
        }

        reducirSubExpresion(e, agregarOp);

        return temporales;
    }

    function reducirSubExpresion(sub, callbackOp) {
        let tokens = sub.trim().split(/\s+/);
        if (tokens.length === 1) return tokens[0];

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i] === '*' || tokens[i] === '/') {
                const temp = callbackOp(tokens[i], tokens[i - 1], tokens[i + 1]);
                tokens.splice(i - 1, 3, temp);
                i--;
            }
        }

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i] === '+' || tokens[i] === '-') {
                const temp = callbackOp(tokens[i], tokens[i - 1], tokens[i + 1]);
                tokens.splice(i - 1, 3, temp);
                i--;
            }
        }

        return tokens[0];
    }

    function generarTablaCuadruplos(instrucciones, variableAsignacion) {
        let rows = instrucciones.map((inst, index) => `
            <tr>
                <td>${index + 1}</td>
                <td class="fw-bold">${inst.op}</td>
                <td>${inst.op1}</td>
                <td>${inst.op2}</td>
                <td class="text-primary fw-bold">${inst.res}</td>
            </tr>
        `).join('');

        if (variableAsignacion && instrucciones.length > 0) {
            const ultimaTemp = instrucciones[instrucciones.length - 1].res;
            rows += `
                <tr>
                    <td>${instrucciones.length + 1}</td>
                    <td class="fw-bold">=</td>
                    <td>${ultimaTemp}</td>
                    <td>—</td>
                    <td class="text-success fw-bold">${variableAsignacion}</td>
                </tr>
            `;
        }

        return `
            <table class="table table-bordered table-striped text-center">
                <thead class="table-dark">
                    <tr>
                        <th>#</th>
                        <th>Operador</th>
                        <th>Operando1</th>
                        <th>Operando2</th>
                        <th>Resultado</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    function generarTablaTriplos(instrucciones, variableAsignacion) {
        const mapaPunteros = {};
        // Los índices de los triplos inician en 0
        instrucciones.forEach((inst, index) => {
            mapaPunteros[inst.res] = `(${index})`;
        });

        let rows = instrucciones.map((inst, index) => {
            const op1 = mapaPunteros[inst.op1] || inst.op1;
            const op2 = mapaPunteros[inst.op2] || inst.op2;
            return `
                <tr>
                    <td>(${index})</td>
                    <td class="fw-bold">${inst.op}</td>
                    <td>${op1}</td>
                    <td>${op2}</td>
                </tr>
            `;
        }).join('');

        if (variableAsignacion && instrucciones.length > 0) {
            const indiceAsignacion = instrucciones.length;
            const ultimoPuntero = `(${indiceAsignacion - 1})`;
            rows += `
                <tr>
                    <td>(${indiceAsignacion})</td>
                    <td class="fw-bold">=</td>
                    <td class="text-success fw-bold">${variableAsignacion}</td>
                    <td>${ultimoPuntero}</td>
                </tr>
            `;
        }

        return `
            <table class="table table-bordered table-striped text-center">
                <thead class="table-dark">
                    <tr>
                        <th>#</th>
                        <th>Operador</th>
                        <th>Operando1</th>
                        <th>Operando2</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }
});