import { Pool } from 'pg'
import { dbPostgres } from './database-postgres'

export interface TableSchema {
  table_name: string
  columns: ColumnDefinition[]
  constraints: ConstraintDefinition[]
  indexes: IndexDefinition[]
  row_count: number
  created_at?: Date
  updated_at?: Date
  is_system_table: boolean
}

export interface ColumnDefinition {
  column_name: string
  data_type: string
  is_nullable: boolean
  column_default?: string
  is_primary_key: boolean
  is_foreign_key: boolean
  foreign_table?: string
  foreign_column?: string
  character_maximum_length?: number
  numeric_precision?: number
  numeric_scale?: number
}

export interface ConstraintDefinition {
  constraint_name: string
  constraint_type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK'
  column_names: string[]
  foreign_table?: string
  foreign_columns?: string[]
  check_clause?: string
}

export interface IndexDefinition {
  index_name: string
  column_names: string[]
  is_unique: boolean
  index_type: string
}

export interface TableData {
  [key: string]: any
}

export interface CreateTableRequest {
  table_name: string
  columns: {
    column_name: string
    data_type: string
    is_nullable: boolean
    column_default?: string
    is_primary_key?: boolean
  }[]
  constraints?: {
    constraint_type: 'FOREIGN KEY' | 'UNIQUE' | 'CHECK'
    column_names: string[]
    foreign_table?: string
    foreign_columns?: string[]
    check_clause?: string
  }[]
  is_system_table?: boolean
}

class DatabaseSchemaManager {
  private static instance: DatabaseSchemaManager

  private constructor() {
    // Use the existing database instance
  }

  static getInstance(): DatabaseSchemaManager {
    if (!DatabaseSchemaManager.instance) {
      DatabaseSchemaManager.instance = new DatabaseSchemaManager()
    }
    return DatabaseSchemaManager.instance
  }

  async query(text: string, params?: any[]): Promise<any> {
    return await dbPostgres.query(text, params)
  }

  // Helper method to check if a table is a system table
  private async isSystemTable(tableName: string): Promise<boolean> {
    const result = await this.query(`
      SELECT d.description
      FROM pg_description d
      JOIN pg_class c ON c.oid = d.objoid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = $1
        AND n.nspname = 'public'
    `, [tableName]);

    return result.rows[0]?.description === 'system_table';
  }

  // Public method to check if a table is a system table
  public async isTableSystemTable(tableName: string): Promise<boolean> {
    return await this.isSystemTable(tableName)
  }

  // Get all tables in the database
  async getAllTables(): Promise<TableSchema[]> {
    const result = await this.query(`
      SELECT 
        t.table_name,
        COALESCE(tc.n_tup_ins - tc.n_tup_del, 0) as row_count,
        d.description AS table_comment
      FROM information_schema.tables t
      LEFT JOIN pg_stat_user_tables tc ON t.table_name = tc.relname
      LEFT JOIN pg_description d ON d.objoid = (quote_ident(t.table_schema) || '.' || quote_ident(t.table_name))::regclass::oid
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name
    `)

    const tables: TableSchema[] = []
    
    for (const row of result.rows) {
      const tableSchema = await this.getTableSchema(row.table_name)
      tables.push({
        ...tableSchema,
        row_count: parseInt(row.row_count) || 0,
        is_system_table: row.table_comment === 'system_table'
      })
    }

    return tables
  }

  // Get detailed schema for a specific table
  async getTableSchema(tableName: string): Promise<TableSchema> {
    // Get columns
    const columnsResult = await this.query(`
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable::boolean as is_nullable,
        c.column_default,
        c.character_maximum_length,
        c.numeric_precision,
        c.numeric_scale,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
        CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
        fk.foreign_table_name as foreign_table,
        fk.foreign_column_name as foreign_column
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT ku.column_name, ku.table_name
        FROM information_schema.key_column_usage ku
        JOIN information_schema.table_constraints tc ON ku.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
      ) pk ON c.column_name = pk.column_name AND c.table_name = pk.table_name
      LEFT JOIN (
        SELECT 
          ku.column_name,
          ku.table_name,
          ccu.table_name as foreign_table_name,
          ccu.column_name as foreign_column_name
        FROM information_schema.key_column_usage ku
        JOIN information_schema.table_constraints tc ON ku.constraint_name = tc.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
      ) fk ON c.column_name = fk.column_name AND c.table_name = fk.table_name
      WHERE c.table_name = $1
        AND c.table_schema = 'public'
      ORDER BY c.ordinal_position
    `, [tableName])

    const columns: ColumnDefinition[] = columnsResult.rows.map(row => ({
      column_name: row.column_name,
      data_type: row.data_type,
      is_nullable: row.is_nullable,
      column_default: row.column_default,
      is_primary_key: row.is_primary_key,
      is_foreign_key: row.is_foreign_key,
      foreign_table: row.foreign_table,
      foreign_column: row.foreign_column,
      character_maximum_length: row.character_maximum_length,
      numeric_precision: row.numeric_precision,
      numeric_scale: row.numeric_scale
    }))

    // Get constraints
    const constraintsResult = await this.query(`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        array_agg(ku.column_name) as column_names,
        ccu.table_name as foreign_table,
        array_agg(ccu.column_name) as foreign_columns,
        cc.check_clause
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
      LEFT JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = $1
        AND tc.table_schema = 'public'
      GROUP BY tc.constraint_name, tc.constraint_type, ccu.table_name, cc.check_clause
      ORDER BY tc.constraint_type, tc.constraint_name
    `, [tableName])

    const constraints: ConstraintDefinition[] = constraintsResult.rows.map(row => {
      // Clean up column names from PostgreSQL array format
      const cleanColumnNames = (names: any) => {
        if (!names) return []
        if (Array.isArray(names)) {
          return names.filter(Boolean).map(name => 
            typeof name === 'string' ? name.replace(/[{}]/g, '') : name
          ).filter(name => name && name !== 'NULL')
        }
        if (typeof names === 'string') {
          return names.replace(/[{}]/g, '').split(',').filter(name => name && name !== 'NULL')
        }
        return []
      }
      
      return {
        constraint_name: row.constraint_name,
        constraint_type: row.constraint_type,
        column_names: cleanColumnNames(row.column_names),
        foreign_table: row.foreign_table,
        foreign_columns: cleanColumnNames(row.foreign_columns),
        check_clause: row.check_clause
      }
    })

    // Get indexes
    const indexesResult = await this.query(`
      SELECT 
        i.indexname as index_name,
        array_agg(a.attname) as column_names,
        i.indexdef LIKE '%UNIQUE%' as is_unique,
        am.amname as index_type
      FROM pg_indexes i
      JOIN pg_class c ON i.indexname = c.relname
      JOIN pg_am am ON c.relam = am.oid
      JOIN pg_index idx ON c.oid = idx.indexrelid
      JOIN pg_attribute a ON idx.indrelid = a.attrelid AND a.attnum = ANY(idx.indkey)
      WHERE i.tablename = $1
        AND i.schemaname = 'public'
      GROUP BY i.indexname, i.indexdef, am.amname
      ORDER BY i.indexname
    `, [tableName])

    const indexes: IndexDefinition[] = indexesResult.rows.map(row => {
      // Clean up column names from PostgreSQL array format
      const cleanColumnNames = (names: any) => {
        if (!names) return []
        if (Array.isArray(names)) {
          return names.filter(Boolean).map(name => 
            typeof name === 'string' ? name.replace(/[{}]/g, '') : name
          ).filter(name => name && name !== 'NULL')
        }
        if (typeof names === 'string') {
          return names.replace(/[{}]/g, '').split(',').filter(name => name && name !== 'NULL')
        }
        return []
      }
      
      return {
        index_name: row.index_name,
        column_names: cleanColumnNames(row.column_names),
        is_unique: row.is_unique,
        index_type: row.index_type
      }
    })

    return {
      table_name: tableName,
      columns,
      constraints,
      indexes,
      row_count: 0, // Will be populated by getAllTables
      is_system_table: await this.isSystemTable(tableName)
    }
  }

  // Create a new table
  async createTable(tableRequest: CreateTableRequest): Promise<boolean> {
    const { table_name, columns, constraints = [], is_system_table = false } = tableRequest

    const quoteIdent = (name: string) => `"${name.replace(/"/g, '""')}"`;

    // Validate table name
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table_name)) {
      throw new Error('Invalid table name. Must contain only letters, numbers, and underscores.')
    }

    // Build CREATE TABLE SQL
    const columnDefinitions = columns.map(col => {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col.column_name)) {
        throw new Error(`Invalid column name: ${col.column_name}`);
      }
      let definition = `${quoteIdent(col.column_name)} ${col.data_type.toUpperCase()}`
      
      if (!col.is_nullable) {
        definition += ' NOT NULL'
      }
      
      if (col.column_default) {
        // Basic validation for default value to prevent injection
        if (typeof col.column_default === 'string' && !/^[a-zA-Z0-9_ .'()-]+$/.test(col.column_default)) {
          throw new Error(`Invalid default value: ${col.column_default}`);
        }
        if (typeof col.column_default === 'string' && !col.column_default.includes('(') && !col.column_default.includes(')')) {
          const escapedDefault = col.column_default.replace(/'/g, "''");
          definition += ` DEFAULT '${escapedDefault}'`;
        } else {
          definition += ` DEFAULT ${col.column_default}`;
        }
      }
      
      if (col.is_primary_key) {
        definition += ' PRIMARY KEY'
      }
      
      return definition
    })

    // Add constraints
    const constraintDefinitions = constraints.map(constraint => {
      const quotedColumnNames = constraint.column_names.map(name => {
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
          throw new Error(`Invalid column name in constraint: ${name}`);
        }
        return quoteIdent(name);
      }).join(', ');

      switch (constraint.constraint_type) {
        case 'FOREIGN KEY':
          if (!constraint.foreign_table || !constraint.foreign_columns) {
            throw new Error('FOREIGN KEY constraint requires foreign_table and foreign_columns.');
          }
          if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(constraint.foreign_table)) {
            throw new Error(`Invalid foreign_table name in constraint: ${constraint.foreign_table}`);
          }
          const quotedForeignTable = quoteIdent(constraint.foreign_table);
          const quotedForeignColumns = constraint.foreign_columns.map(name => {
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
              throw new Error(`Invalid column name in foreign_columns: ${name}`);
            }
            return quoteIdent(name);
          }).join(', ');
          return `FOREIGN KEY (${quotedColumnNames}) REFERENCES ${quotedForeignTable}(${quotedForeignColumns})`
        case 'UNIQUE':
          return `UNIQUE (${quotedColumnNames})`
        case 'CHECK':
          if (constraint.check_clause) {
            if (!/^[a-zA-Z0-9_ '><=()ANDORNOT]+$/.test(constraint.check_clause)) {
              throw new Error('Invalid CHECK clause. Only simple checks are allowed.');
            }
            return `CHECK (${constraint.check_clause})`
          }
          return ''
        default:
          return ''
      }
    }).filter(Boolean)

    const allDefinitions = [...columnDefinitions, ...constraintDefinitions]
    
    const createTableSQL = `
      CREATE TABLE ${quoteIdent(table_name)} (
        ${allDefinitions.join(',\n        ')}
      )
    `

    try {
      await this.query(createTableSQL)
      if (is_system_table) {
        await this.query(`COMMENT ON TABLE ${quoteIdent(table_name)} IS 'system_table';`);
      }
      return true
    } catch (error) {
      console.error('Create table error:', error)
      throw error
    }
  }

  // Drop a table
  async dropTable(tableName: string): Promise<boolean> {
    // Prevent dropping system tables
    if (await this.isSystemTable(tableName)) {
      throw new Error(`Cannot delete system table: ${tableName}. System tables are protected.`)
    }
    
    try {
      await this.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`)
      return true
    } catch (error) {
      console.error('Drop table error:', error)
      throw error
    }
  }

  // Add column to existing table
  async addColumn(tableName: string, columnDef: ColumnDefinition): Promise<boolean> {
    // Prevent modifying system tables
    if (await this.isSystemTable(tableName)) {
      throw new Error(`Cannot modify system table: ${tableName}. System tables are protected.`)
    }
    
    let sql = `ALTER TABLE ${tableName} ADD COLUMN ${columnDef.column_name} ${columnDef.data_type}`
    
    if (!columnDef.is_nullable) {
      sql += ' NOT NULL'
    }
    
    if (columnDef.column_default) {
      sql += ` DEFAULT ${columnDef.column_default}`
    }

    try {
      await this.query(sql)
      return true
    } catch (error) {
      console.error('Add column error:', error)
      throw error
    }
  }

  // Drop column from table
  async dropColumn(tableName: string, columnName: string): Promise<boolean> {
    // Prevent modifying system tables
    if (await this.isSystemTable(tableName)) {
      throw new Error(`Cannot modify system table: ${tableName}. System tables are protected.`)
    }
    
    try {
      await this.query(`ALTER TABLE ${tableName} DROP COLUMN ${columnName} CASCADE`)
      return true
    } catch (error) {
      console.error('Drop column error:', error)
      throw error
    }
  }

  // Get table data with pagination
  async getTableData(tableName: string, page: number = 1, limit: number = 50): Promise<{
    data: TableData[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const offset = (page - 1) * limit

    // Get total count
    const countResult = await this.query(`SELECT COUNT(*) as total FROM ${tableName}`)
    const total = parseInt(countResult.rows[0].total)

    // Get data
    const dataResult = await this.query(`
      SELECT * FROM ${tableName}
      ORDER BY 1
      LIMIT $1 OFFSET $2
    `, [limit, offset])

    return {
      data: dataResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  // Insert row into table
  async insertRow(tableName: string, data: TableData): Promise<TableData> {
    // Prevent modifying system tables
    if (await this.isSystemTable(tableName)) {
      throw new Error(`Cannot modify system table: ${tableName}. System tables are protected.`)
    }
    
    const columns = Object.keys(data)
    const values = Object.values(data)
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ')

    const sql = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `

    const result = await this.query(sql, values)
    return result.rows[0]
  }

  // Update row in table
  async updateRow(tableName: string, id: string, data: TableData): Promise<TableData> {
    // Prevent modifying system tables
    if (await this.isSystemTable(tableName)) {
      throw new Error(`Cannot modify system table: ${tableName}. System tables are protected.`)
    }
    
    const entries = Object.entries(data)
    const setClause = entries.map(([key], index) => `${key} = $${index + 1}`).join(', ')
    const values = entries.map(([, value]) => value)

    const sql = `
      UPDATE ${tableName}
      SET ${setClause}
      WHERE id = $${values.length + 1}
      RETURNING *
    `

    const result = await this.query(sql, [...values, id])
    return result.rows[0]
  }

  // Delete row from table
  async deleteRow(tableName: string, id: string): Promise<boolean> {
    // Prevent modifying system tables
    if (await this.isSystemTable(tableName)) {
      throw new Error(`Cannot modify system table: ${tableName}. System tables are protected.`)
    }
    
    const result = await this.query(`DELETE FROM ${tableName} WHERE id = $1`, [id])
    return result.rowCount > 0
  }

  // Export table data to CSV format
  async exportTableData(tableName: string): Promise<string> {
    const result = await this.query(`SELECT * FROM ${tableName} ORDER BY 1`)
    
    if (result.rows.length === 0) {
      return ''
    }

    // Get column names
    const columns = Object.keys(result.rows[0])
    
    // Create CSV header
    const csvHeader = columns.join(',')
    
    // Create CSV rows
    const csvRows = result.rows.map(row => {
      return columns.map(col => {
        const value = row[col]
        if (value === null || value === undefined) {
          return ''
        }
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    })

    return [csvHeader, ...csvRows].join('\n')
  }
}

export const dbSchema = DatabaseSchemaManager.getInstance()