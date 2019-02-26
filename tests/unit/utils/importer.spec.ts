import { expect } from "chai";

import Importer from "@/utils/importer";
import store from "@/stores/store";
import { Configuration } from "@/models/configuration";

describe("Utils: Importer", () => {
  beforeEach(() => {
    store.commit("resetConfigurations");
    store.commit("resetAttributes");
  });

  it("Imports an array of configurations with attribute values", () => {
    const data: any[] = [
      {
        config1: [{ attr1: "10" }, { attr2: "20" }],
        config2: [{ attr1: "15" }, { attr2: "25" }]
      }
    ];

    // apply action
    Importer.importFile(data, store);

    // assert result
    expect(store.state.attributes.data.length).to.equal(2);
    expect(store.state.configurations.data.length).to.equal(2);

    const config1 = store.state.configurations.data.find((c: Configuration) => c.id === "config1");
    expect(config1).to.be.an("object");
    expect(config1).to.have.property("attributes");
    expect(config1.attributes.length).to.equal(2);
    expect(config1.attributes[0].key).to.equal("attr1");
    expect(config1.attributes[0].value).to.equal(10);
  });

  it("Imports a configuration object with attribute values", () => {

    const data: any = {
      id: "config1",
      graph: [
        { TASWorkflow0: [{ ServiceBindings: "MS10" }, {  MSBindings: "MS10" }]},
        { MS10: [{ WorkflowBinding: "TASWorkflow0" }]}
      ]
    };

    // apply action
    Importer.importFile(data, store);

    // assert result
    expect(store.state.attributes.data.length).to.equal(0);
    expect(store.state.configurations.data.length).to.equal(1);

    const config1 = store.state.configurations.data.find((c: Configuration) => c.id === "config1");
    expect(config1).to.be.an("object");
    expect(config1).to.have.property("structure");
    expect(config1.structure.components).to.include("MS10");
    expect(config1.structure.components).to.include("TASWorkflow0");
  });
});
