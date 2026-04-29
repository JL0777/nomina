const db = require('../config/db');

// Constantes de Ley (Puedes actualizar estos valores cada año)
const SALARIO_MINIMO = 1300000; 
const AUXILIO_TRANSPORTE = 162000;

// 1. Registrar Novedades (Horas extras, bonificaciones del mes)
exports.registrarNovedad = async (req, res) => {
    const { id_empleado, mes, anio, horas_extras_diurnas, horas_extras_nocturnas, bonificaciones, otros_descuentos } = req.body;
    try {
        await db.query(
            `INSERT INTO novedades (id_empleado, mes, anio, horas_extras_diurnas, horas_extras_nocturnas, bonificaciones, otros_descuentos) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id_empleado, mes, anio, horas_extras_diurnas || 0, horas_extras_nocturnas || 0, bonificaciones || 0, otros_descuentos || 0]
        );
        res.status(201).json({ message: 'Novedades registradas para el mes' });
    } catch (error) {
        res.status(500).json({ error: 'Error registrando novedades' });
    }
};

// 2. Calcular y Generar Nómina Mensual
exports.calcularNominaMensual = async (req, res) => {
    const { mes, anio } = req.body;

    try {
        // 1. Traemos a todos los empleados activos con su salario
        const [empleados] = await db.query(`
            SELECT e.id_empleado, e.nombre, e.apellido, c.salario_base 
            FROM empleados e 
            JOIN cargos c ON e.id_cargo = c.id_cargo 
            WHERE e.estado = 'Activo'
        `);

        if (empleados.length === 0) return res.status(400).json({ error: 'No hay empleados activos' });

        // Procesamos la nómina empleado por empleado
        for (let emp of empleados) {
            
            // 2. Verificar si este empleado YA tiene nómina generada para este periodo
            const [existe] = await db.query(
                'SELECT id_nomina FROM registros_nomina WHERE id_empleado = ? AND mes = ? AND anio = ?',
                [emp.id_empleado, mes, anio]
            );

            const salario_base = parseFloat(emp.salario_base);
            
            // 3. Buscamos si tiene novedades este mes
            const [novedades] = await db.query(
                'SELECT * FROM novedades WHERE id_empleado = ? AND mes = ? AND anio = ?',
                [emp.id_empleado, mes, anio]
            );
            
            const nov = novedades[0] || { horas_extras_diurnas: 0, horas_extras_nocturnas: 0, bonificaciones: 0, otros_descuentos: 0 };

            // --- TUS CÁLCULOS INTACTOS ---
            const valor_hora = salario_base / 240; 
            const total_extras_diurnas = nov.horas_extras_diurnas * (valor_hora * 1.25);
            const total_extras_nocturnas = nov.horas_extras_nocturnas * (valor_hora * 1.75);
            const valor_horas_extras = total_extras_diurnas + total_extras_nocturnas;

            let auxilio_transporte_aplicado = 0;
            if (salario_base <= (SALARIO_MINIMO * 2)) {
                auxilio_transporte_aplicado = AUXILIO_TRANSPORTE;
            }

            const devengado_sin_transporte = salario_base + valor_horas_extras + parseFloat(nov.bonificaciones || 0);
            const descuento_salud = devengado_sin_transporte * 0.04;
            const descuento_pension = devengado_sin_transporte * 0.04;

            const total_devengado = devengado_sin_transporte + auxilio_transporte_aplicado;
            const neto_pagar = total_devengado - descuento_salud - descuento_pension - parseFloat(nov.otros_descuentos || 0);
            // -----------------------------

            // 4. LÓGICA DE GUARDADO O ACTUALIZACIÓN
            if (existe.length > 0) {
                // SI YA EXISTE: Actualizamos el registro con los nuevos cálculos de novedades
                await db.query(`
                    UPDATE registros_nomina SET 
                        salario_basico_mes = ?, 
                        auxilio_transporte = ?, 
                        valor_horas_extras = ?, 
                        total_devengado = ?, 
                        descuento_salud = ?, 
                        descuento_pension = ?, 
                        otros_deducidos = ?, 
                        neto_pagar = ?
                    WHERE id_empleado = ? AND mes = ? AND anio = ?`,
                    [salario_base, auxilio_transporte_aplicado, valor_horas_extras, total_devengado, descuento_salud, descuento_pension, nov.otros_descuentos, neto_pagar, emp.id_empleado, mes, anio]
                );
                console.log(`Nómina ACTUALIZADA para ${emp.nombre}`);
            } else {
                // SI NO EXISTE: Creamos el registro por primera vez
                await db.query(`
                    INSERT INTO registros_nomina 
                    (id_empleado, mes, anio, salario_basico_mes, auxilio_transporte, valor_horas_extras, total_devengado, descuento_salud, descuento_pension, otros_deducidos, neto_pagar) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [emp.id_empleado, mes, anio, salario_base, auxilio_transporte_aplicado, valor_horas_extras, total_devengado, descuento_salud, descuento_pension, nov.otros_descuentos, neto_pagar]
                );
                console.log(`Nómina CREADA para ${emp.nombre}`);
            }
        }

        res.json({ message: `Proceso finalizado para el mes ${mes}/${anio}. Los registros han sido actualizados con las novedades vigentes.` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error calculando la nómina mensual' });
    }
};

// 3. Obtener el historial de nómina (Modificado para traer desglose detallado)
exports.getHistorialNomina = async (req, res) => {
    try {
        const [historial] = await db.query(`
            SELECT 
                r.*, 
                e.nombre, e.apellido, e.documento,
                n.horas_extras_diurnas, n.horas_extras_nocturnas, n.bonificaciones
            FROM registros_nomina r
            JOIN empleados e ON r.id_empleado = e.id_empleado
            LEFT JOIN novedades n ON r.id_empleado = n.id_empleado 
                AND r.mes = n.mes 
                AND r.anio = n.anio
            ORDER BY r.anio DESC, r.mes DESC
        `);
        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo el historial con detalles' });
    }
};


// 4. Obtener todas las novedades con nombres de empleados
exports.getNovedades = async (req, res) => {
    try {
        const [novedades] = await db.query(`
            SELECT n.*, e.nombre, e.apellido 
            FROM novedades n
            JOIN empleados e ON n.id_empleado = e.id_empleado
            ORDER BY n.anio DESC, n.mes DESC
        `);
        res.json(novedades);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo novedades' });
    }
};

// 5. Eliminar una novedad
exports.eliminarNovedad = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM novedades WHERE id_novedad = ?', [id]);
        res.json({ message: 'Novedad eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando la novedad' });
    }
};

// 6. Actualizar una novedad existente
exports.actualizarNovedad = async (req, res) => {
    const { id } = req.params;
    const { horas_extras_diurnas, horas_extras_nocturnas, bonificaciones, otros_descuentos } = req.body;
    try {
        await db.query(
            `UPDATE novedades SET 
            horas_extras_diurnas = ?, horas_extras_nocturnas = ?, 
            bonificaciones = ?, otros_descuentos = ? 
            WHERE id_novedad = ?`,
            [horas_extras_diurnas, horas_extras_nocturnas, bonificaciones, otros_descuentos, id]
        );
        res.json({ message: 'Novedad actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error actualizando la novedad' });
    }
};