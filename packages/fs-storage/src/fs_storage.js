import {Loki} from "../../loki/src/loki";
import fs from "fs";

/**
 * A loki persistence adapter which persists using node fs module.
 */
export class LokiFSStorage {
  /**
   * loadDatabase() - Load data from file, will throw an error if the file does not exist
   * @param {string} dbname - the filename of the database to load
   * @returns {Promise} a Promise that resolves after the database was loaded
   */
  loadDatabase(dbname) {
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
   * saveDatabase() - save data to file, will throw an error if the file can't be saved
   * might want to expand this to avoid dataloss on partial save
   * @param {string} dbname - the filename of the database to load
   * @returns {Promise} a Promise that resolves after the database was persisted
   */
  saveDatabase(dbname, dbstring) {
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
    });
  }

  /**
   * deleteDatabase() - delete the database file, will throw an error if the
   * file can't be deleted
   * @param {string} dbname - the filename of the database to delete
   * @returns {Promise} a Promise that resolves after the database was deleted
   */
  deleteDatabase(dbname) {
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

Loki.LokiFSStorage = LokiFSStorage;

export default LokiFSStorage;
