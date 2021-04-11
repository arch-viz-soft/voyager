import { Component, Vue, Prop } from "vue-property-decorator";

import _ from "lodash";

import { Configuration } from "@/models/configuration";
import { Attribute } from "@/models/attribute";

/**
 * List of configurations
 * @export
 * @class ConfigurationList
 * @extends {Vue}
 */
@Component
export default class ConfigurationList extends Vue {
  /**
   * List of configurations to display
   * Seperated into true (when pareto optimal) and false lists
   * @type {{ true: Configuration[], false: Configuration[] }}
   * @memberof ConfigurationList
   */
  @Prop(Object) public readonly list!: { true: Configuration[], false: Configuration[] };

  /**
   * List of filters to apply to configuration list, determines which attributes are visible
   * @type {Attribute}
   * @memberof ConfigurationList
   */
  @Prop(Array) public readonly filters!: Attribute[];

  /**
   * Currently selected configurations
   * @type {Configuration}
   * @memberof ConfigurationList
   */
  @Prop(Array) public selectedConfigurations!: Configuration[];

  /**
   * Event handler when user selects a configuration
   * @param {Configuration} c Selected configuration
   * @memberof ConfigurationList
   */
  public selectConfiguration(c: Configuration) {
    let appendConfig: boolean = true;
    for (let i = 0; i < this.selectedConfigurations.length; i++) {
      if (this.selectedConfigurations[i].id === c.id) {
        this.selectedConfigurations.splice(i, 1);
        appendConfig = false;
      }
    }
    if (appendConfig) {
      this.selectedConfigurations.push(c);
    }
    this.$emit("select", this.selectedConfigurations);
  }

  public checkIfSelected(c: Configuration): boolean {
    if (this.selectedConfigurations.some((config) => config.id === c.id)) {
      return true;
    }
    return false;
  }

}
