import mysql from "mysql2/promise"
import 'dotenv/config'


let pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    port: process.env.DB_PORT
})


/**
 * Crea una fila en la tabla especificada
 * 
 * Los datos deben ir en forma de CLAVE : VALOR
 * 
 * @param {string} tabla 
 * @param {object} datos
 */
export async function crear(tabla, datos) {
  const columnas = Object.keys(datos)
    .map((col) => `\`${col}\``)
    .join(", ");
  const placeholders = Object.keys(datos).map(() => "?").join(", ");

  const valores = Object.entries(datos).map(([key, valor]) =>
    key.startsWith("json") && typeof valor === "object" && valor !== null
      ? JSON.stringify(valor)
      : valor
  );

  const query = `INSERT INTO \`${tabla}\` (${columnas}) VALUES (${placeholders})`;


  try {
    const [result] = await pool.execute(query, valores);
    return result;
  } catch (error) {
    console.error(`[ ❌ ] Error insertando en '${tabla}':`, error.sqlMessage);
    throw error;
  }
}

/**
 * Obtener filas que correspondan a la condicion
 * 
 * Todo se recibe en formato STRING
 */
export async function usar( tabla, condicion, id, condicion2 = null, id2 = null, condicion3=null, id3 =null) {
  let query = `SELECT * FROM \`${tabla}\` WHERE \`${condicion}\` = ?`
  let params = [id]

  if (id2) {
    query += ` AND \`${condicion2}\` = ?`
    params.push(id2)
  }

  if (id3) {
    query += ` AND \`${condicion3}\` = ?`
    params.push(id3)
  }

  try {

    const [rows] = await pool.execute(query, params);

    return rows.map((row) => {
      const parsed = {};
      for (const key in row) {
        const valor = row[key];
        if (key.startsWith("json") && typeof valor === "string") {
          try {
            parsed[key] = JSON.parse(valor);
          } catch {
            console.log(`NO SE PUDO PARSEAR ${key}`)
            parsed[key] = valor; // Si falla, lo deja como texto
          }
        } else {
          parsed[key] = valor;
        }
      }
      return parsed;
    });
  } catch (error) {
    console.error(`❌ Error seleccionando en '${tabla}':`, error.sqlMessage);
    throw error;
  }
}

/**
 * Consulta SQL de control total
 * @param {Array} params 
 */
export async function query(query, params) {
  try {

    const [rows] = await pool.execute(query, params);

    return rows.map((row) => {
      const parsed = {};
      for (const key in row) {
        const valor = row[key];
        if (key.startsWith("json") && typeof valor === "string") {
          try {
            parsed[key] = JSON.parse(valor);
          } catch {
            parsed[key] = valor; // Si falla, lo deja como texto
          }
        } else {
          parsed[key] = valor;
        }
      }
      return parsed;
    });
  } catch (error) {
    console.error(`❌ Error seleccionando en:`, error.sqlMessage);
    throw error;
  }
}

/**
 * Admite una condicion string para filtar la consulta total
 * @param {*} tabla 
 * @param {*} condicion 
 * @returns 
 */
export async function usarAll(tabla, condicion = "", id, condicion2 = "", id2) {
  const query = `SELECT * FROM \`${tabla}\` ${condicion ? `WHERE \`${condicion}\` = ?` : ""} ${condicion2 ? `AND \`${condicion2}\` = ?` : ""}`;
  try {
    const params = condicion2 ? [id, id2] : condicion ? [id] : [];
    const [rows] = await pool.execute(query, params);

    return rows.map((row) => {
      const parsed = {};
      for (const key in row) {
        const valor = row[key];
        if (key.startsWith("json") && typeof valor === "string") {
          try {
            parsed[key] = JSON.parse(valor);
          } catch {
            parsed[key] = valor; // Si falla, lo deja como texto
          }
        } else {
          parsed[key] = valor;
        }
      }
      return parsed;
    })
  } catch (error) {
    console.error(`❌ Error seleccionando All en '${tabla}':`, error.sqlMessage);
    throw error;
  }
}

/**
 * Actualiza una fila, pide objetos
 */
export async function actualizar(tabla, datos, condiciones) {
  const columnas = Object.keys(datos)
    .map((col) => `\`${col}\` = ?`)
    .join(", ");

  const valores = Object.entries(datos).map(([key, valor]) =>
    key.startsWith("json") && typeof valor === "object" && valor !== null
      ? JSON.stringify(valor)
      : valor
  );

  const condicionesSQL = Object.keys(condiciones)
    .map((col) => `\`${col}\` = ?`)
    .join(" AND ");

  const valoresCondiciones = Object.values(condiciones);

  const query = `UPDATE \`${tabla}\` SET ${columnas} WHERE ${condicionesSQL}`;



  try {
    const [result] = await pool.execute(query, [...valores, ...valoresCondiciones]);
    return result;
  } catch (error) {
    console.error(`❌ Error actualizando en '${tabla}':`, error.sqlMessage);
    throw error;
  }
}

/**
 * Elimina una fila, pide objeto
 */
export async function eliminar(tabla, condiciones) {
  const condicionesSQL = Object.keys(condiciones)
    .map((col) => `\`${col}\` = ?`)
    .join(" AND ");
  const valores = Object.values(condiciones);

  const query = `DELETE FROM ${tabla} WHERE ${condicionesSQL}`;

  try {
    const [result] = await pool.execute(query, valores);
    return result;
  } catch (error) {
    console.error(`❌ Error eliminando de '${tabla}':`, error.sqlMessage);
    throw error;
  }
}

