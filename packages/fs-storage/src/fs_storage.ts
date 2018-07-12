import { PLUGINS } from "../../common/plugin";
import { StorageAdapter } from "../../common/types";
import * as fs from "fs";

/**
 * A loki persistence adapter which persists using node fs module.
 */
export class FSStorage implements StorageAdapter {
  /**
   * Registers the fs storage as plugin.
   */
  static register(): void {
    PLUGINS["FSStorage"] = FSStorage;
  }

  /**
   * Deregisters the fs storage as plugin.
   */
  static deregister(): void {
    delete PLUGINS["FSStorage"];
  }

  /**
   * Load data from file, will throw an error if the file does not exist
   * @param {string} dbname - the filename of the database to load
   * @returns {Promise} a Promise that resolves after the database was loaded
   */
  loadDatabase(dbname: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.stat(dbname, (err, stats) => {
        if (!err && stats.isFile()) {
          fs.readFile(dbname, {
            encoding: "utf8"
          }, function readFileCallback(err, data) {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        } else {
          reject();
        }
      });
    });
  }

  /**
   * Save data to file, will throw an error if the file can't be saved
   * might want to expand this to avoid dataloss on partial save
   * @param {string} dbname - the filename of the database to load
   * @returns {Promise} a Promise that resolves after the database was persisted
   */
  saveDatabase(dbname: string, dbstring: string): Promise<void> {
    const tmpdbname = dbname + "~";
    return new Promise((resolve, reject) => {
      fs.writeFile(tmpdbname, dbstring, (err) => {
        if (err) {
          reject(err);
        } else {
          fs.rename(tmpdbname, dbname, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    }) as any as Promise<void>;
  }

  /**
   * Delete the database file, will throw an error if the
   * file can't be deleted
   * @param {string} dbname - the filename of the database to delete
   * @returns {Promise} a Promise that resolves after the database was deleted
   */
  deleteDatabase(dbname: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.unlink(dbname, function deleteDatabaseCallback(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
