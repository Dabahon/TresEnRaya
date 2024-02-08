document.addEventListener('DOMContentLoaded', () => {

    /**
     * Variables
     */

    let arrayFichas = ['', '', '', '', '', '', '', '', ''];
    let jugadorActual = 'X';
    let estadoJuego = true;
    let empezarPartida = false;
    let tiempoTotal = 0;
    let gameTimerInterval;
    let tiempoTurnoJugador;
    let tiempoTurnoX = 30;
    let tiempoTurnoO = 30;
    let modoJugadoresActivo = false;
    let modoRandomActivo = false;
    let modoIAActivo = false;
    let modoNueveFichasActivo = false;
    let modoSeisFichasActivo = false;
    let contadorPartidas = 0;
    let fichasColocadas = 0;
    let fichaSeleccionada = { seleccionada: false, indice: null, jugador: null };


    const tablero = document.getElementById('tablero');
    const reiniciarBoton = document.getElementById('reiniciar');
    const empezar = document.getElementById('empezar');
    const modoJugadores = document.getElementById('modoJugadores');
    const modoRandom = document.getElementById('modoRandom');
    const modoIA = document.getElementById('modoIA');
    const modoNueveFichas = document.getElementById('nueveFichas');
    const modoSeisFichas = document.getElementById('seisFichas');
    const botonResetearEstadisticas = document.getElementById('resetearEstadisticas');
    const maxFichas = 6;

    /**
     * Juego Principal
     */

    // Función para desactivar modos
    function desactivarModosFichas(modoSeleccionado) {
        if (modoSeleccionado !== 'modoSeisFichas') {
            modoSeisFichasActivo = false;
            modoSeisFichas.style.backgroundColor = '';
        }
        if (modoSeleccionado !== 'modoNueveFichas') {
            modoNueveFichasActivo = false;
            modoNueveFichas.style.backgroundColor = '';
        }
    }

    modoSeisFichas.addEventListener('click', () => {
        if (!empezarPartida) { 
            modoSeisFichasActivo = !modoSeisFichasActivo;
            modoNueveFichasActivo = false; 
            modoSeisFichas.style.backgroundColor = modoSeisFichasActivo ? '#9EDB77' : '';
            modoNueveFichas.style.backgroundColor = '';
        }
    });

    modoNueveFichas.addEventListener('click', () => {
        modoNueveFichasActivo = !modoNueveFichasActivo;
        modoNueveFichas.style.backgroundColor = modoNueveFichasActivo ? '#9EDB77' : '';
        desactivarModosFichas('modoNueveFichas');
    });

    // Mostrar si la partida esta activa
    const activa = document.getElementById('activa');
    function mostrarActiva() {
        if (empezarPartida) {
            activa.innerHTML = `<p>La partida esta activa. Partida numero: <span style="color: dodgerblue;">${contadorPartidas}</span></p>`;
        } else {
            activa.innerHTML = `<p>La partida esta terminada. Partida jugadas: <span style="color: dodgerblue;">${contadorPartidas}</span></p>`;
        }
    }


    // Empezar Partida
    empezar.addEventListener('click', () => {
        if (!empezarPartida) {
            contadorPartidas++;
            pararTiempoTurno()
            empezarTiempoTotal();
            empezarTurnoTiempo();
            empezarPartida = true;
            mostrarActiva();
            crearTablero();
        }
    });

    // Tablero fichas
    function crearTablero() {
        tablero.innerHTML = '';
        arrayFichas.forEach((_, idx) => {
            let celda = document.createElement('div');
            celda.dataset.posicion = idx;
            celda.addEventListener('click', tipoPartida);
            tablero.appendChild(celda);
        });
    }

    // Saber el tipo de partida para el evento
    function tipoPartida(event) {
        const index = parseInt(event.target.dataset.posicion);
        if (modoSeisFichasActivo) {
            colocarOMoverFicha(index);
        } else if (modoNueveFichasActivo) {
            pulsarCelda(event);
        }
    }

    // Modifica verificarGanador para aceptar un argumento jugador
    function verificarGanador(jugador) {
        const condicionVictoria = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        for (let condicion of condicionVictoria) {
            let [a, b, c] = condicion;
            if (arrayFichas[a] && arrayFichas[a] === arrayFichas[b] && arrayFichas[a] === arrayFichas[c]) {
                estadoJuego = false;
                jugador = arrayFichas[a];
                sumarPuntos(jugador);
                setTimeout(() => alert(`Jugador ${jugador} gana!`), 10);
                finalizarPartida();
                return;
            }
        }

        if (!arrayFichas.includes('')) {
            estadoJuego = false;
            sumarPuntos(null);
            alert("Empate!");
            finalizarPartida();
            return;
        }
    }

    function finalizarPartida() {
        estadoJuego = false;
        mostrarActiva();
        setTimeout(reiniciarJuego, 2000);
    }

    // Empezar de Nuevo
    reiniciarBoton.addEventListener('click', reiniciarJuego);

    function reiniciarJuego() {
        arrayFichas.fill('');
        estadoJuego = true;
        empezarPartida = false;
        jugadorActual = 'X';
        fichasColocadas = 0;
        fichaSeleccionada = { seleccionada: false, indice: null, jugador: null };
        tiempoTotal = 0;
        document.getElementById('tiempoTotal').textContent = 'Tiempo de juego: 0s';
        document.getElementById('tiempoTurno').textContent = 'Tiempo turno: 30s';
        actualizarTablero();
        mostrarActiva();
        pararTiempoTotal();
        pararTiempoTurno();
    }

    // Desactivar otros modos cuando uno es seleccionado
    function desactivarOtrosModos(modoSeleccionado) {
        if (modoSeleccionado !== 'modoJugadores') {
            modoJugadoresActivo = false;
            modoJugadores.style.backgroundColor = '';
        }
        if (modoSeleccionado !== 'modoRandom') {
            modoRandomActivo = false;
            modoRandom.style.backgroundColor = '';
        }
        if (modoSeleccionado !== 'modoIA') {
            modoIAActivo = false;
            modoIA.style.backgroundColor = '';
        }
    }

    // Actualizar los event listeners para cada modo
    modoJugadores.addEventListener('click', () => {
        modoJugadoresActivo = !modoJugadoresActivo;
        modoJugadores.style.backgroundColor = modoJugadoresActivo ? '#9EDB77' : '';
        desactivarOtrosModos('modoJugadores');
    });

    modoRandom.addEventListener('click', () => {
        modoRandomActivo = !modoRandomActivo;
        modoRandom.style.backgroundColor = modoRandomActivo ? '#9EDB77' : '';
        desactivarOtrosModos('modoRandom');
    });

    modoIA.addEventListener('click', () => {
        modoIAActivo = !modoIAActivo;
        modoIA.style.backgroundColor = modoIAActivo ? '#9EDB77' : '';
        desactivarOtrosModos('modoIA');
    });


    /* ----------- Contadores de tiempo ---------------- */

    // Tiempo Total
    function empezarTiempoTotal() {
        gameTimerInterval = setInterval(() => {
            tiempoTotal++;
            document.getElementById('tiempoTotal').innerHTML = `<p>Tiempo de juego: <span style="color: dodgerblue;">${tiempoTotal}s</span></p>`;
        }, 1000);
    }

    function pararTiempoTotal() {
        clearInterval(gameTimerInterval);
        tiempoTotal = 0;
    }

    // Tiempo turno 
    function empezarTurnoTiempo() {
        tiempoTurnoJugador = setInterval(() => {
            if (jugadorActual == 'X') {
                tiempoTurnoX--;
                document.getElementById('tiempoTurno').innerHTML = `<p>Tiempo X: <span style="color: dodgerblue;">${tiempoTurnoX}s</span></p>`;
                if (tiempoTurnoX === 0) {
                    finalizarPartida();
                    setTimeout(() => alert(`Jugador ${jugadorActual} pierde por límite de tiempo!`), 10);

                }
            } else {
                tiempoTurnoO--;
                document.getElementById('tiempoTurno').innerHTML = `<p>Tiempo O: <span style="color: dodgerblue;">${tiempoTurnoX}s</span></p>`;
                if (tiempoTurnoO === 0) {
                    finalizarPartida();
                    setTimeout(() => alert(`Jugador ${jugadorActual} pierde por límite de tiempo!`), 10);
                }
            }
        }, 1000);
    };

    function pararTiempoTurno() {
        clearInterval(tiempoTurnoJugador);
        tiempoTurnoX = 30;
        tiempoTurnoO = 30;
    }

    // Reiniciar tiempo
    function reiniciarTiempoTurno(jugador) {
        if (jugador === 'X') {
            tiempoTurnoX = 30;
        } else {
            tiempoTurnoO = 30;
        }
        document.getElementById('tiempoTurno').textContent = jugador === 'X' ? `Tiempo X: ${tiempoTurnoX}s` : `Tiempo O: ${tiempoTurnoO}s`;
    }

    /* ----------- Registro de Partidas ---------------- */

    // Inicialización de estadísticas para cada jugador y la IA
    let estadisticas = {
        X: { victorias: 0, derrotas: 0, empates: 0 },
        O: { victorias: 0, derrotas: 0, empates: 0 },
        IA: { victorias: 0, derrotas: 0, empates: 0 }
    };

    function sumarPuntos(jugador) {
        // Final de la partida
        if (estadoJuego === false) {
            if (jugador === 'O') {
                if (modoIAActivo || modoRandomActivo) {
                    
                    estadisticas['IA'].victorias++;
                    estadisticas['X'].derrotas++;
                } else if (modoJugadoresActivo) {
                    console.log(jugador);
                    estadisticas['O'].victorias++;
                    estadisticas['X'].derrotas++;
                }
            } else if (jugador === 'X') {
                estadisticas[jugador].victorias++;
                if (modoIAActivo || modoRandomActivo) {
                    estadisticas['IA'].derrotas++;
                }
            } else if (jugador === null) {
                estadisticas['X'].empates++;
                if (modoIAActivo || modoRandomActivo) {
                    estadisticas['IA'].empates++;
                } else if (modoJugadoresActivo) {
                    estadisticas['O'].empates++;
                }
            }

            let tablaHTML = `<table class="tabla-estadisticas">
                        <thead>
                            <tr>
                                <th>Jugador</th>
                                <th>Victorias</th>
                                <th>Derrotas</th>
                                <th>Empates</th>
                            </tr>
                        </thead>
                        <tbody>`;
            tablaHTML += `<tr>
                    <td>X </td>
                    <td>${estadisticas['X'].victorias}</td>
                    <td>${estadisticas['X'].derrotas}</td>
                    <td>${estadisticas['X'].empates}</td>
                  </tr>
                  <tr>
                    <td>O </td>
                    <td>${estadisticas['O'].victorias}</td>
                    <td>${estadisticas['O'].derrotas}</td>
                    <td>${estadisticas['O'].empates}</td>
                  </tr>
                  <tr>
                        <td>IA </td>
                        <td>${estadisticas['IA'].victorias}</td>
                        <td>${estadisticas['IA'].derrotas}</td>
                        <td>${estadisticas['IA'].empates}</td>
                    </tr>`;
            tablaHTML += `</tbody></table>`;

            document.querySelector('.estadisticas').innerHTML = tablaHTML;
        }

        botonResetearEstadisticas.addEventListener('click', resetearEstadisticas);

        function resetearEstadisticas() {
            estadisticas = {
                X: { victorias: 0, derrotas: 0, empates: 0 },
                O: { victorias: 0, derrotas: 0, empates: 0 },
                IA: { victorias: 0, derrotas: 0, empates: 0 }
            };
            actualizarEstadisticasUI();
            contadorPartidas = 0;
            mostrarActiva();
        }

        function actualizarEstadisticasUI() {
            let tablaHTML = `<table class="tabla-estadisticas">
                        <thead>
                            <tr>
                                <th>Jugador</th>
                                <th>Victorias</th>
                                <th>Derrotas</th>
                                <th>Empates</th>
                            </tr>
                        </thead>
                        <tbody>`;

            tablaHTML += `<tr>
                    <td>X</td>
                    <td>${estadisticas['X'].victorias}</td>
                    <td>${estadisticas['X'].derrotas}</td>
                    <td>${estadisticas['X'].empates}</td>
                </tr>
                <tr>
                    <td>O</td>
                    <td>${estadisticas['O'].victorias}</td>
                    <td>${estadisticas['O'].derrotas}</td>
                    <td>${estadisticas['O'].empates}</td>
                </tr>
                <tr>
                  <td>IA</td>
                  <td>${estadisticas['IA'].victorias}</td>
                  <td>${estadisticas['IA'].derrotas}</td>
                  <td>${estadisticas['IA'].empates}</td>
              </tr>`;
            tablaHTML += `</tbody></table>`;
            document.querySelector('.estadisticas').innerHTML = tablaHTML;
        }
    }

    /* ----------------------------------- MODO 9 FICHAS --------------------------------------------- */
    /**
     * Funciones para Modo 9 fichas
     */

    // Evento para el modo 9 fichas 
    function pulsarCelda(event) {
        
        if (!empezarPartida || arrayFichas[parseInt(event.target.dataset.posicion)] !== '' || !estadoJuego) {
            return;
        }
        if (modoNueveFichasActivo && estadoJuego) {
            const celdaPulsada = parseInt(event.target.dataset.posicion);
            arrayFichas[celdaPulsada] = jugadorActual;
            event.target.textContent = jugadorActual;

            if (modoJugadoresActivo && estadoJuego) {

                reiniciarTiempoTurno(jugadorActual);
                jugadorActual = jugadorActual === 'X' ? 'O' : 'X';
                verificarGanador(jugadorActual === 'X' ? 'O' : 'X');

            } else if (modoRandomActivo && estadoJuego) {

                reiniciarTiempoTurno(jugadorActual);
                jugadorActual = jugadorActual === 'X' ? 'O' : 'X';
                movimientoAleatorio();
                if (!estadoJuego) {
                    return;
                } else {
                    setTimeout(() => { verificarGanador(jugadorActual = jugadorActual === 'X' ? 'O' : 'X') }, 10);
                }

            } else if (modoIAActivo && estadoJuego) {

                reiniciarTiempoTurno(jugadorActual);
                jugadorActual = jugadorActual === 'X' ? 'O' : 'X';
                realizarMovimientoIA();
                if (!estadoJuego) {
                    return;
                } else {
                    setTimeout(() => { verificarGanador(jugadorActual = jugadorActual === 'X' ? 'O' : 'X') }, 10);
                }
            }
        }
    }

    // Modo Aleatorio

    function movimientoAleatorio() {
        let celdasVacias = arrayFichas.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
        if (celdasVacias.length === 0) {
            return;
        }
        let movimientoAleatorio = celdasVacias[Math.floor(Math.random() * celdasVacias.length)];
        arrayFichas[movimientoAleatorio] = 'O';
        document.querySelector(`[data-posicion="${movimientoAleatorio}"]`).textContent = 'O';
        setTimeout(verificarGanador(jugadorActual), 10);
    }

    // Modo IA

    function evaluarTablero(tablero) {
        const condicionesDeVictoria = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

        for (let condicion of condicionesDeVictoria) {
            const [a, b, c] = condicion;
            if (tablero[a] && tablero[a] === tablero[b] && tablero[a] === tablero[c]) {
                return tablero[a];
            }
        }

        if (!tablero.includes('')) {
            return 'Empate';
        }

        return null;
    }

    function minimax(tablero, profundidad, esMaximizador) {
        let estado = evaluarTablero(tablero);

        if (estado === 'X') return { valor: -10 };
        if (estado === 'O') return { valor: 10 };
        if (estado === 'Empate') return { valor: 0 };

        if (esMaximizador) {
            let maxEval = -Infinity;
            for (let i = 0; i < tablero.length; i++) {

                if (tablero[i] === '') {
                    tablero[i] = 'O';
                    let evaluacion = minimax(tablero, profundidad + 1, false);
                    tablero[i] = '';
                    maxEval = Math.max(maxEval, evaluacion.valor);
                }
            }
            return { valor: maxEval, profundidad };
        } else {
            let minEval = Infinity;
            for (let i = 0; i < tablero.length; i++) {
                if (tablero[i] === '') {
                    tablero[i] = 'X';
                    let evaluacion = minimax(tablero, profundidad + 1, true);
                    tablero[i] = '';
                    minEval = Math.min(minEval, evaluacion.valor);
                }
            }
            return { valor: minEval, profundidad };
        }
    }

    function realizarMovimientoIA() {
        let mejorMovimiento = encontrarMejorMovimiento(arrayFichas);
        if (mejorMovimiento !== -1) {
            arrayFichas[mejorMovimiento] = 'O';
            document.querySelector(`[data-posicion="${mejorMovimiento}"]`).textContent = 'O';
            verificarGanador('O');
        }
    }


    function encontrarMejorMovimiento(tablero) {
        let mejorValor = -Infinity;
        let movimiento = -1;
        for (let i = 0; i < tablero.length; i++) {
            if (tablero[i] === '') {
                tablero[i] = 'O';
                let valorMovimiento = minimax(tablero, 0, false).valor;
                tablero[i] = '';
                if (valorMovimiento > mejorValor) {
                    mejorValor = valorMovimiento;
                    movimiento = i;
                }
            }
        }
        return movimiento;
    }

    /* ----------------------------------- MODO 6 FICHAS --------------------------------------------- */

    function colocarOMoverFicha(index) {
        if (!empezarPartida || !estadoJuego) return;

        const celda = tablero.children[index];

        if (jugadorActual === 'X' || modoJugadoresActivo) {
            manejarMovimientoJugador(index, celda);
        }

        if (modoRandomActivo && jugadorActual === 'O' && estadoJuego) {
            setTimeout(realizarMovimientoAleatorio, 500);
        }

        if (modoIAActivo && jugadorActual === 'O' && estadoJuego) {
            realizarMovimientoIASeis();
        }
    }

    // Funcion para realizar el movimiento aleatorio
    function realizarMovimientoAleatorio() {
        let posicionesVacias = arrayFichas.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);

        if (fichasColocadas < maxFichas) {
            
            let eleccionAleatoria = posicionesVacias[Math.floor(Math.random() * posicionesVacias.length)];
            arrayFichas[eleccionAleatoria] = 'O';
            fichasColocadas++;
        } else {
            
            let posicionesOcupadasPorO = arrayFichas.map((val, idx) => val === 'O' ? idx : null).filter(val => val !== null);
            let posicionFichaO = posicionesOcupadasPorO[Math.floor(Math.random() * posicionesOcupadasPorO.length)];

            arrayFichas[posicionFichaO] = '';
            posicionesVacias = arrayFichas.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
            eleccionAleatoria = posicionesVacias[Math.floor(Math.random() * posicionesVacias.length)];
            arrayFichas[eleccionAleatoria] = 'O';
        }

        actualizarTablero();
        verificarGanador('O');
        cambiarTurno();
    }

    // Funcion para actualizar el tablero
    function actualizarTablero() {
        const celdas = document.querySelectorAll('#tablero div');
        arrayFichas.forEach((ficha, idx) => {
            celdas[idx].textContent = ficha;
        });
    }

    // Funcion que maneja los movimientos del jugador
    function manejarMovimientoJugador(index, celda) {
        if (fichasColocadas < maxFichas) {
            realizarMovimientoColocacion(index, celda);
        } else {
            realizarMovimientoSeleccion(index, celda);
        }
    }

    // Funcion que realiza la colocacion de la ficha
    function realizarMovimientoColocacion(index, celda) {
        if (arrayFichas[index] === '') {
            arrayFichas[index] = jugadorActual;
            celda.textContent = jugadorActual;
            fichasColocadas++;
            verificarGanadorCambiarTurno();
        }
    }


    // Funcion que selecciona la celda y realiza el movimiento
    function realizarMovimientoSeleccion(index, celda) {
        if (fichaSeleccionada.seleccionada) {
            if (index !== fichaSeleccionada.indice && arrayFichas[index] === '') {
                moverFichaSeleccionada(index, celda);
            }
        } else if (arrayFichas[index] === jugadorActual) {
            seleccionarFicha(index, celda);
        }
    }

    // Funcion que mueve la ficha seleccionada
    function moverFichaSeleccionada(index, celda) {
        arrayFichas[fichaSeleccionada.indice] = '';
        tablero.children[fichaSeleccionada.indice].textContent = '';
        arrayFichas[index] = jugadorActual;
        celda.textContent = jugadorActual;
        resetearFichaSeleccionada();
        verificarGanadorCambiarTurno();
    }

    // funcion que selecciona la ficha
    function seleccionarFicha(index, celda) {
        fichaSeleccionada = { seleccionada: true, indice: index, jugador: jugadorActual };
        celda.classList.add('seleccionada');
    }

    // Funcion que borra la ficha selecionada
    function resetearFichaSeleccionada() {
        if (fichaSeleccionada.seleccionada) {
            tablero.children[fichaSeleccionada.indice].classList.remove('seleccionada');
        }
        fichaSeleccionada = { seleccionada: false, indice: null, jugador: null };
    }

    // Funcion que verifica si hay que cambiar de turno
    function verificarGanadorCambiarTurno() {
        verificarGanador(jugadorActual);
        cambiarTurno();
    }

    // Funcion que cambia de turno
    function cambiarTurno() {
        jugadorActual = jugadorActual === 'X' ? 'O' : 'X';
        reiniciarTiempoTurno(jugadorActual);
        resetearFichaSeleccionada();
    }

    /**
     * MODO IA
     */

    function realizarMovimientoIASeis() {
        if (fichasColocadas < maxFichas) {
            colocarNuevaFichaIA();
        } else {
            moverFichaIA();
        }
    }

    function colocarNuevaFichaIA() {
        let mejorMovimiento = null;
        let mejorPuntaje = -Infinity;
        for (let i = 0; i < arrayFichas.length; i++) {
            if (arrayFichas[i] === '') {
                arrayFichas[i] = 'O';
                let puntaje = minimaxSeis(arrayFichas, false); 
                arrayFichas[i] = ''; 
                if (puntaje > mejorPuntaje) {
                    mejorPuntaje = puntaje;
                    mejorMovimiento = i;
                }
            }
        }
        if (mejorMovimiento !== null) {
            arrayFichas[mejorMovimiento] = 'O';
            fichasColocadas++;
            actualizarTableroSeis();
            verificarGanador('O');
            cambiarTurno();
        }
    }

    function moverFichaIA() {
        let mejorPuntaje = -Infinity;
        let mejorMovimiento = null;
        let movimientoOriginal = null;

        for (let i = 0; i < arrayFichas.length; i++) {
            if (arrayFichas[i] === 'O') {
                for (let j = 0; j < arrayFichas.length; j++) {
                    if (arrayFichas[j] === '' && esMovimientoValido(i, j)) {
                        arrayFichas[j] = 'O';
                        arrayFichas[i] = ''; 
                        let puntaje = minimaxSeis(arrayFichas, false);
                        arrayFichas[i] = 'O';
                        arrayFichas[j] = '';

                        if (puntaje > mejorPuntaje) {
                            mejorPuntaje = puntaje;
                            mejorMovimiento = j; 
                            movimientoOriginal = i;
                        }
                    }
                }
            }
        }
        if (mejorMovimiento !== null) {
            arrayFichas[movimientoOriginal] = ''; 
            arrayFichas[mejorMovimiento] = 'O';
            actualizarTableroSeis();
            verificarGanador('O');
            cambiarTurno();
        }
    }



    function minimaxSeis(tablero, esMaximizando) {
        let resultado = evaluarTablero(tablero);
        if (resultado !== null) {
            if (resultado === 'O') {
                return 10; 
            } else if (resultado === 'X') {
                return -10; 
            } else if (resultado === 'Empate') {
                return 0;
            }
        }

        if (esMaximizando) {
            let mejorPuntaje = -Infinity;
            for (let i = 0; i < tablero.length; i++) {
                if (tablero[i] === '') {
                    tablero[i] = 'O';
                    let puntaje = minimaxSeis(tablero, false);
                    tablero[i] = '';
                    mejorPuntaje = Math.max(puntaje, mejorPuntaje);
                }
            }
            return mejorPuntaje;
        } else {
            let mejorPuntaje = Infinity;
            for (let i = 0; i < tablero.length; i++) {
                if (tablero[i] === '') {
                    tablero[i] = 'X';
                    let puntaje = minimaxSeis(tablero, true);
                    tablero[i] = '';
                    mejorPuntaje = Math.min(puntaje, mejorPuntaje);
                }
            }
            return mejorPuntaje;
        }
    }

    function actualizarTableroSeis() {
        const celdas = document.querySelectorAll('#tablero div');
        celdas.forEach((celda, i) => {
            celda.textContent = arrayFichas[i];
        });
    }

    function esMovimientoValido(origen, destino) {
        if (arrayFichas[destino] !== '') return false;
        const filaOrigen = Math.floor(origen / 3);
        const colOrigen = origen % 3;
        const filaDestino = Math.floor(destino / 3);
        const colDestino = destino % 3;
        const esAdyacente = Math.abs(filaOrigen - filaDestino) <= 1 && Math.abs(colOrigen - colDestino) <= 1;

        return esAdyacente;
    }
});
