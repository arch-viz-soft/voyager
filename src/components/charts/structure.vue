<template>
  <div>
    <b-dropdown right class="float-right chart-dd" size="sm" variant="outline-secondary">
      <b-dropdown-item @click="exportChart">Export (.png)</b-dropdown-item>
      <b-dropdown-divider />
      <report-dropdown :section-index="this.sectionIndex" @addToReport="addToReport"/>
      <b-dropdown-divider />
      <b-dropdown-item v-b-modal.modal>Customise</b-dropdown-item>
    </b-dropdown>
    <b-modal id="modal" scrollable size="lg" title="Customise Components">
      <customise-individual-components :data="data"></customise-individual-components>
    </b-modal>
    <e-chart :options="chartData" ref="chart" :init-options="{renderer: 'canvas'}" autoresize class="chart" :style="height ? 'height: ' + height + 'px' : ''" />
  </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from "vue-property-decorator";
import { Configuration } from "@/models/configuration";
import { ChartType } from "@/models/chart-data";
import { Section } from "@/models/report";
import { GetSubStructureTooltipContent } from "./tooltip";
import { BIcon, BIconArrowsAngleExpand } from "bootstrap-vue";
import ReportDropdown from "../ReportDropdown.vue";
import CustomiseIndividualComponents from "../customise-individual-components/customise-individual-components.vue";
import { ExportCanvas } from "./shared";

import "./charts.css";

/**
 * Structure chart, used to show how architecture components are linked for a configuration
 */
@Component({
  components: {
    ReportDropdown,
    CustomiseIndividualComponents,
    BIcon,
    BIconArrowsAngleExpand
  }
})
export default class StructureChart extends Vue {
  // ChartData object, with all info required to render chart
  @Prop(Object) public readonly data!: Configuration;

  // Height of the chart in pixels, optional
  @Prop(String) public readonly height!: string | undefined;

  // Index of section if chart exists within a report (optional)
  @Prop(Number) public readonly sectionIndex?: number;

  /**
   * Getter for chartData object in echarts format
   */
  get chartData() {
    const data = this.data.structure.components.map((c) => {
      return { name: c.name, x: c.x_coordinate, y: c.y_coordinate, symbol: c.dataURI, subStructure: c.subStructure };
    });

    const links = this.data.structure.connections.map((c) => {
      return { target: c.from, source: c.to, label: { formatter: c.label, show: true, fontSize: 10 } };
    });

    return {
      tooltip: {
        triggerOn: "click"
      },
      series: [
        {
          type: "graph",
          layout: "force",
          symbolSize: 50,
          animation: false,
          focusNodeAdjacency: true,
          draggable: true,
          roam: true,
          label: {
            normal: {
              show: true,
              textStyle: {
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',sans-serif"
              }
            }
          },
          edgeLabel: {
            normal: {
              position: "middle",
              textStyle: {
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',sans-serif",
                color: "black",
                fontSize: 20
              }
            }
          },
          force: {
            initLayout: "force",
            edgeLength: 0.25,
            gravity: 0.9,
            repulsion: 0.3,
            layoutAnimation: false
          },
          edgeSymbol: ["arrow"],
          edgeSymbolSize: 9,
          data,
          links,
          lineStyle: {
            normal: {
              opacity: 0.9,
              width: 2,
              curveness: 0.1
            }
          },
          tooltip: {
            show: true,
            backgroundColor: "rgba(255,255,255,0.8)",
            extraCssText: "width: 350px;overflow-y: hidden;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)",
            position: (pos: any, params: any, dom: any, rect: any, size: any) => {
              const obj: any = {top: 10};
              obj[["left"][+(pos[0] < size.viewSize[0] / 2)]] = 5;
              return obj;
            },
            borderColor: "#ddd",
            borderWidth: 1,
            textStyle: {
              color: "#000"
            },
            padding: 8,
            triggerOn: "click",
            formatter: (params: any) => {
              return GetSubStructureTooltipContent(params.data);
            }
          }
        }
      ]
    };
  }

  /**
   * Downloads the chart as a png file
   */
  public exportChart() {
    ExportCanvas(this.$refs.chart, "Structure.png");
  }

  /**
   * Add current chart to report with given ID with provided section title
   */
  public addToReport(title: string, reportId: number) {
    const section: Section = {
      title,
      type: ChartType.Structure,
      data: this.data
    };
    this.$store.commit("addReportSection", { id: reportId, section});
  }
}
</script>
