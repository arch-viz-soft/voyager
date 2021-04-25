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
    expect(config1.attributes.attr1).to.equal(10);
  });

  it("Imports a configuration object with structural properties", () => {

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
    expect(config1.structure.components[0].name).to.equal("TASWorkflow0");
    expect(config1.structure.components[0].symbol).to.equal("rounded-rectangle.jpg");
    expect(config1.structure.components[1].name).to.equal("MS10");
    expect(config1.structure.components[1].symbol).to.equal("rounded-rectangle.jpg");
    expect(config1.structure.connections.length).to.equal(3);
  });

  it("Imports a previously exported object", () => {

    const data: any = {
      configurations: {
        data: [{
          id: "config1",
          attributes: { cost: 10 },
          structure: {
            connections: [{ label: "WorkflowBinding", from: "AS10", to: "TASWorkflow0" }],
            components: ["AS10", "TASWorkflow0"]
          }
        }]
      },
      attributes: {
        data: [
          {
            key: "cost",
            maxValue: 13.6,
            minValue: 8.9,
            scaleMax: 14,
            scaleMin: 8,
            isHigherBetter: false,
            friendlyName: "Cost"
          }
        ]
      },
      reports: { data: [] }
    };

    // apply action
    Importer.importFile(data, store);

    // assert result
    expect(store.state.attributes.data.length).to.equal(1);
    expect(store.state.configurations.data.length).to.equal(1);

    const config1 = store.state.configurations.data.find((c: Configuration) => c.id === "config1");

    expect(config1).to.be.an("object");
    expect(config1).to.have.property("attributes");
    expect(config1.attributes.cost).to.equal(10);
    expect(config1).to.have.property("structure");
    expect(config1.structure.components[0].name.toString()).to.equal("AS10");
    expect(config1.structure.components[0].symbol).to.equal("rounded-rectangle.jpg");
    expect(config1.structure.components[1].name.toString()).to.equal("TASWorkflow0");
    expect(config1.structure.components[1].symbol).to.equal("rounded-rectangle.jpg");
    expect(config1.structure.connections.length).to.equal(1);
  });

  it("Imports a configuration with one hierarchical sub-structure", () => {

    const data: any = {
      configurations: {
        data: [{
          id: "config1",
          attributes: { cost: 10 },
          structure: {
            connections: [{ label: "WorkflowBinding", from: "AS10", to: "TASWorkflow0" }],
            components: ["AS10", "TASWorkflow0"]
          },
          subStructures: [
            {
              TASWorkflow0: {
                graph: [{
                    structure: {
                      connections: [{ label: "WorkflowBinding", from: "MS10", to: "DS20" }],
                      components: ["MS10", "DS20"]
                    }
                  }
                ]
              }
            }
          ]
        }]
      },
      attributes: {
        data: [
          {
            key: "cost",
            maxValue: 13.6,
            minValue: 8.9,
            scaleMax: 14,
            scaleMin: 8,
            isHigherBetter: false,
            friendlyName: "Cost"
          }
        ]
      },
      reports: { data: [] }
    };

    // apply action
    Importer.importFile(data, store);

    // assert result
    expect(store.state.attributes.data.length).to.equal(1);
    expect(store.state.configurations.data.length).to.equal(1);

    const config1 = store.state.configurations.data.find((c: Configuration) => c.id === "config1");

    expect(config1).to.be.an("object");
    expect(config1).to.have.property("attributes");
    expect(config1.attributes.cost).to.equal(10);
    expect(config1).to.have.property("structure");
    expect(config1.structure.components[0].name.toString()).to.equal("AS10");
    expect(config1.structure.components[0].symbol).to.equal("rounded-rectangle.jpg");
    expect(config1.structure.components[1].name.toString()).to.equal("TASWorkflow0");
    expect(config1.structure.components[1].symbol).to.equal("rounded-rectangle.jpg");
    expect(config1.structure.connections.length).to.equal(1);
  });
});
