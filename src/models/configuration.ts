import _ from "lodash";

import { AttributeValues } from "./attribute";

/**
 * Represents a configuration
 * @class Configuration
 */
export class Configuration {

  /**
   * Unique identifier of configuration
   * @type {string}
   * @memberof Configuration
   */
  public id: string = "";

  /**
   * List of attribute values of this configuration
   * @type {AttributeValues}
   * @memberof Configuration
   */
  public attributes: AttributeValues = {};

  /**
   * Representation of configuration structure (i.e. network of its components)
   *
   * @type {ConfigurationStructure}
   * @memberof Configuration
   */
  public structure: ConfigurationStructure = {
    connections: [],
    components: []
  };

  /**
   * Creates an instance of Configuration.
   * @param {string} id Unique identifier for configuration
   * @memberof Configuration
   */
  constructor(config: any) {
    Object.assign(this, config);
  }

  /**
   * Load a list of attribute values into this configuration
   * @param {object[]} attributeList List of attribute values to process
   * @param {*} store Reference to vuex store to update
   * @memberof Configuration
   */
  public setAttributes(attributeList: object[], store: any) {
    const output: AttributeValues = {};

    // Loop through each attribute in incoming list
    attributeList.forEach((attribute: any) => {
      Object.keys(attribute).forEach((key: string) => {
        if (key.toLowerCase() === "id") { return; }
        output[key] = parseFloat(attribute[key]);

        // Use processAttribute mutation to update associated Attribute info (e.g. maxValue seen so far)
        store.commit("processAttributeValue", { key, value: parseFloat(attribute[key])});
      });
    });

    this.attributes = output;
  }

  /**
   * Load a single attribute value into this configuration
   * @param {string} key Key of attribute to add
   * @param {any} value Value of attribute to add
   * @param {*} store Reference to vuex store to update
   * @memberof Configuration
   */
  public addAttribute(key: string, value: any, store: any) {
    if (key.toLowerCase() === "id") { return; }
    this.attributes[key] = parseFloat(value);

    // Use processAttribute mutation to update associated Attribute info (e.g. maxValue seen so far)
    store.commit("processAttributeValue", { key, value: this.attributes[key]});
  }

  /**
   * Load graph information for configuration
   * @param {*} graphData Information about configuration structure
   * @memberof Configuration
   */
  public setGraph(graphData: any, subStructureData: any, setSubstructure: boolean): ConfigurationStructure {
    const struc: ConfigurationStructure = {
      connections: [],
      components: []
    };
    graphData.forEach((component: any) => {
      Object.keys(component).forEach((key: string) => {
        const comp: Element = {
          name: key,
          symbol: "rounded-rectangle.jpg",
          x_coordinate: 300,
          y_coordinate: 300,
          dataURI: "image://data:image/jpeg;base64,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"
        };
        if (subStructureData) {
          subStructureData.forEach((subStructure: any) => {
            Object.keys(subStructure).forEach((subStructureName: string) => {
              if (subStructureName === key) {
                comp.subStructure = this.setGraph(subStructure[subStructureName].graph, null, true);
              }
            });
          });
        }
        struc.components.push(comp);
        if (!setSubstructure) { this.structure.components.push(comp); }

        component[key].forEach((c: any) => {
          Object.keys(c).forEach((label: string) => {
            const connection: StructureConnection = {
              label,
              from: key,
              to: c[label]
            };
            struc.connections.push(connection);
            if (!setSubstructure) { this.structure.connections.push(connection); }
          });
        });
      });
    });
    return struc;
  }
}

export interface ConfigurationStructure {
  connections: StructureConnection[];
  components: Element[];
}

export interface StructureConnection {
  label: string;
  to: string;
  from: string;
}

export interface Element {
  name: string;
  x_coordinate?: number;
  y_coordinate?: number;
  symbol: string;
  dataURI: string;
  subStructure?: ConfigurationStructure;
}
