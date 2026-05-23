declare module "sql.js" {
  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number>) => Database;
  }

  interface Database {
    run(sql: string, params?: any[]): Database;
    exec(sql: string): QueryExecResult[];
    prepare(sql: string): Statement;
    close(): void;
  }

  interface Statement {
    run(params?: any[]): void;
    free(): void;
  }

  interface QueryExecResult {
    columns: string[];
    values: any[][];
  }

  export default function initSqlJs(config?: any): Promise<SqlJsStatic>;
  export { Database, SqlJsStatic, Statement, QueryExecResult };
}
