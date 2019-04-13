import { Store } from "vuex";
import Papa from "papaparse";

import { Configuration } from "@/models/configuration";
import { Message } from "@/components/messages/Message";

export default class Importer {

  /**
   * Import a given file into the store
   * @param reader FileReader reference of file to import
   * @param file File object containing metadata
   * @param $store Vuex store to import data to
   */
  public static processInputFile(reader: FileReader, file: File, $store: any): Message {
    if (typeof reader.result !== "string" || reader.result.length === 0) {
      return {
        content: `Invalid file uploaded: '${file.name}'`,
        type: "danger"
      };
    }

    // Check file format, process accordingly
    if (file.name.endsWith(".json")) {
      return this.parseJson(reader.result, file, $store);
    } else if (file.name.endsWith(".csv")) {
      return this.parseCsv(reader.result, file, $store);
    } else {
      return {
        content: `Invalid file uploaded: '${file.name}'`,
        type: "danger"
      };
    }
  }

  /**
   * Parse JSON file string
   * @param data JSON string to process
   * @param file File metadata
   * @param $store Vuex store to import data into
   */
  public static parseJson(data: string, file: File, $store: any): Message {
    try {
      const inputData = JSON.parse(data);
      const result = Importer.importFile(inputData, $store);
      if (result) {
        return {
          content: `Successfully imported data from '${file.name}'`,
          type: "success"
        };
      } else {
        return {
          content: `Data within '${file.name}' is incorrectly formatted`,
          type: "danger",
          duration: 8000
        };
      }
    } catch (err) {
      return {
        content: `Unable to process '${file.name}': ${err}`,
        type: "danger",
        duration: 8000
      };
    }
  }

  /**
   * Parse CSV file string
   * @param data CSV data to process
   * @param file File metadata
   * @param $store Vuex store to import data into
   */
  public static parseCsv(data: string, file: File, $store: any): Message {
    try {
      // Use PapaParse to process csv file, with headers
      const results = Papa.parse(data, {
        header: true,
        dynamicTyping: true
      });

      // Check for errors, process accordingly
      if (results.errors.length > 0) {
        return {
          content: `Unable to process '${file.name}': ${results.errors}`,
          type: "danger",
          duration: 8000
        };
      }

      // Translate each row into a Configuration object
      const configurations: Configuration[] = [];
      let nextIndex: number = $store.getters.configurations.length;
      results.data.forEach((config: any) => {
        // Find id/Id field for configuration
        let id = "config-" + nextIndex;
        if (config.id) {
          id = config.id;
        } else if (config.Id) {
          id = config.Id;
        } else {
          nextIndex++;
        }

        // Create object
        const c = new Configuration({ id });
        c.setAttributes([config], $store);
        configurations.push(c);
      });

      // Save to store
      $store.commit("addConfigurations", configurations);

      return {
        content: `Successfully imported data from '${file.name}'`,
        type: "success"
      };

    } catch (err) {
      return {
        content: `Unable to process '${file.name}': ${err}`,
        type: "danger",
        duration: 8000
      };
    }
  }

  /**
   * JSON file importer
   * @static
   * @param {*} data JSON data to import
   * @param {Store<any>} $store Reference to vuex store
   * @returns {boolean} Was operation successful
   * @memberof Importer
   */
  public static importFile(data: any, $store: Store<any>): boolean {
    // Try to detect data format
    if (Array.isArray(data)) {
      this.processDataArray(data, $store);
    } else if (typeof data === "object" && !!data.id && !!data.graph) {
      this.processConfigurationObject(data, $store);
    } else if (typeof data === "object" && !!data.attributes && !!data.configurations) {
      this.processStoreObject(data, $store);
    } else {
      return false;
    }
    return true;
  }

  /**
   * Process a previously exported object with vuex store data
   * @private
   * @static
   * @param {object[]} inputData Data to process
   * @param {Store<any>} $store Reference to vuex store
   * @memberof Importer
   */
  public static processStoreObject(inputData: any, $store: Store<any>) {
    // Load new data
    $store.commit("addConfigurations", inputData.configurations.data);
    $store.commit("addAttributes", inputData.attributes.data);
    $store.commit("addReports", inputData.reports.data);
  }

  /**
   * Process an array of configurations with attribute values
   * @private
   * @static
   * @param {object[]} data Data to process
   * @param {Store<any>} $store Reference to vuex store
   * @memberof Importer
   */
  private static processDataArray(data: object[], $store: Store<any>) {
    const configurations: Configuration[] = [];
    data.forEach((config: any) => {
      Object.keys(config).forEach((id: string) => {
        const index = configurations.findIndex((c: Configuration) => c.id === id);
        if (index >= 0) {
          configurations[index].setAttributes(config[id], $store);
        } else {
          const c = new Configuration({ id });
          c.setAttributes(config[id], $store);
          configurations.push(c);
        }
      });
    });
    $store.commit("addConfigurations", configurations);
  }

  /**
   * Process a configuration object with structural(graph) values
   * @private
   * @static
   * @param {object[]} data Data to process
   * @param {Store<any>} $store Reference to vuex store
   * @memberof Importer
   */
  private static processConfigurationObject(data: any, $store: Store<any>) {
    const configurations: Configuration[] = [];
    const index = configurations.findIndex((c: Configuration) => c.id === data.id);
    if (index >= 0) {
      configurations[index].setGraph(data.graph);
    } else {
      const c = new Configuration({id: data.id});
      c.setGraph(data.graph);
      configurations.push(c);
    }
    $store.commit("addConfigurations", configurations);
  }
}
