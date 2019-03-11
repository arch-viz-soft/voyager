import { Component, Vue } from "vue-property-decorator";

import _ from "lodash";
import draggable from "vuedraggable";

import { Attribute } from "@/models/attribute";
import { Configuration } from "@/models/configuration";
import { Report, Section } from "@/models/report";
import { ChartType } from "@/models/chart-data";

import { Optimality } from "@/utils/optimality";
import DataManagement from "@/utils/data-management";
import Importer from "@/utils/importer";

import RangeSlider from "@/components/RangeSlider.vue";

import LineChart from "@/components/charts/line.vue";
import RadarChart from "@/components/charts/radar.vue";
import ScatterChart from "@/components/charts/scatter.vue";
import Scatter3DChart from "@/components/charts/scatter-3d.vue";
import StructureChart from "@/components/charts/structure.vue";
import SurfaceChart from "@/components/charts/surface.vue";

interface AttributeFilter {
  attribute: Attribute;
  minValue: number;
  maxValue: number;
  isFiltered: boolean;
}

@Component({
  components: {
    LineChart,
    RadarChart,
    StructureChart,
    ScatterChart,
    SurfaceChart,
    "scatter3d-chart": Scatter3DChart,
    "range-slider": RangeSlider,
    draggable
  }
})
export default class SolutionExplorerComponent extends Vue {
  public drag: boolean = false;
  public filters: AttributeFilter[] = [];
  public chartDimensions: number = 0;
  public selectedConfiguration: Configuration | null = null;
  public newReportName: string = "";
  public paretoFront: string[] = [];
  public searchQuery: string = "";

  public files: File[] | null = null;

  public filteredConfigurations: Configuration[] = [];

  public created() {
    this.loadFilters();
  }

  public loadFilters() {
    this.filters = this.$store.getters.attributes.map((a: Attribute) => {
      return { attribute: a, minValue: a.scaleMin, maxValue: a.scaleMax, isFiltered: false };
    });
    this.sortFilters();
  }

  get list() {
    const data: Configuration[] = this.$store.getters.configurations;
    this.sortFilters();

    const filters = _.clone(this.filters);
    _.reverse(filters);

    // Filter list based on set parameters
    let result: Configuration[] = data.filter((item) => {
      let validAttributes = true;
      filters.forEach((filter) => {
        if (filter.isFiltered) {
          const val = item.attributes[filter.attribute.key];
          if (val && (val > filter.maxValue || val < filter.minValue)) { validAttributes = false; }
        }
      });
      return validAttributes;
    });

    filters.forEach((filter) => {
      if (filter.isFiltered) {
        result = _.orderBy(result,
          [((c: Configuration) => c.attributes[filter.attribute.key])],
          [(filter.attribute.isHigherBetter ? "desc" : "asc")]);
      }
    });

    this.findOptimal(result);

    // Filter by search query
    result = result.filter((item) => {
      return item.id ? item.id.toLowerCase().indexOf(this.searchQuery.toLowerCase()) > -1 : false;
    });

    this.filteredConfigurations = result;

    const res = _.groupBy(result, (value: Configuration) => this.paretoFront.indexOf(value.id) !== -1);
    return res;
  }

  get totalCount() {
    return this.$store.getters.configurations.length;
  }

  get configurations() {
    return this.$store.getters.configurations;
  }

  public sortFilters() {
    this.filters = this.filters.sort((a, b) => {
      if (!a.isFiltered && !b.isFiltered) { return a.attribute.friendlyName.localeCompare(b.attribute.friendlyName); }
      if (a.isFiltered && !b.isFiltered) { return -1; }
      if (!a.isFiltered && b.isFiltered) { return 1; }
      return 0;
    });
  }

  public onRangeChange(attr: any, event: any) {
    attr.minValue = parseFloat(event.min);
    attr.maxValue = parseFloat(event.max);
  }

  get surfaceData() {
    const filters = _.filter(this.filters, "isFiltered").map((config) => config.attribute);
    this.chartDimensions = filters.length;

    const a = this.filters[0].attribute;
    const b = this.filters[1].attribute;
    const c = this.filters[2].attribute;
    const result = Optimality.getParetoFront([a, b, c], this.filteredConfigurations);
    return {
      values: this.filteredConfigurations.map((config: Configuration) => [
        config.attributes[filters[0].key],
        config.attributes[filters[1].key],
        config.attributes[filters[2].key],
        config.id
      ]),
      attributes: [filters[0], filters[1], filters[2]],
      configs: result
    };
  }

  get chartData() {
    const filters = _.filter(this.filters, "isFiltered").map((a) => a.attribute);
    this.chartDimensions = filters.length;

    let data;
    switch (this.chartDimensions) {
      case 1: {
        data = {
          categories: this.filteredConfigurations.map((c: Configuration) => c.id),
          values: this.filteredConfigurations.map((c: Configuration) => c.attributes[filters[0].key]),
          attributes: [filters[0]]
        };
        break;
      }

      case 2: {
        data = {
          values: this.filteredConfigurations.map(
            (c: Configuration) => [c.attributes[filters[0].key], c.attributes[filters[1].key], c.id]),
          attributes: [filters[0], filters[1]]
        };
        break;
      }

      case 3: {
        data = {
          values: this.filteredConfigurations.map((c: Configuration) => [
              c.attributes[filters[0].key],
              c.attributes[filters[1].key],
              c.attributes[filters[2].key],
              c.id
          ]),
          attributes: [filters[0], filters[1], filters[2]]
        };
        break;
      }

      case 4: {
        data = {
          values: this.filteredConfigurations.map((c: Configuration) => [
              c.attributes[filters[0].key],
              c.attributes[filters[1].key],
              c.attributes[filters[2].key],
              c.attributes[filters[3].key],
              c.id
          ]),
          attributes: [filters[0], filters[1], filters[2], filters[3]]
        };
        break;
      }

      case 5: {
        data = {
          values: this.filteredConfigurations.map((c: Configuration) => [
              c.attributes[filters[0].key],
              c.attributes[filters[1].key],
              c.attributes[filters[2].key],
              c.attributes[filters[3].key],
              c.attributes[filters[4].key],
              c.id
          ]),
          attributes: [filters[0], filters[1], filters[2], filters[3], filters[4]]
        };
        break;
      }
    }
    return data;
  }

  public setAttributeOptimality(attribute: Attribute, isHigherBetter: boolean) {
    this.$store.commit("updateAttribute", { key: attribute.key, isHigherBetter });
  }

  public createReportOk(evt: Event) {
    // Prevent modal from closing
    evt.preventDefault();

    if (!this.newReportName) {
      alert("Please enter a report name");
    } else {
      this.createReportSubmit();
    }
  }

  public createReportSubmit() {
    const chartData: any = this.chartData;
    const sections: Section[] = [];

    if (this.chartDimensions === 1) {
      sections.push({
        title: "Bar Chart",
        type: ChartType.Bar,
        data: chartData
      });
      sections.push({
        title: "Line Chart",
        type: ChartType.Line,
        data: chartData
      });
    }

    if (this.chartDimensions === 2) {
      sections.push({
        title: "2D Scatter Chart",
        type: ChartType.Scatter2D,
        data: chartData
      });
    }

    if (this.chartDimensions === 3 || this.chartDimensions === 4) {
      sections.push({
        title: "2D Scatter Chart",
        type: ChartType.Scatter2D,
        data: chartData
      });
      sections.push({
        title: "3D Scatter Chart",
        type: ChartType.Scatter3D,
        data: chartData
      });
    }

    if (this.chartDimensions === 5) {
      sections.push({
        title: "3D Scatter Chart",
        type: ChartType.Scatter3D,
        data: chartData
      });
    }

    const report: Report = {
      id: this.$store.getters.reports.length,
      name: this.newReportName,
      configurationIds: this.filteredConfigurations.map((c: Configuration) => c.id),
      sections
    };

    this.$store.commit("addReport", report);

    this.$nextTick(() => {
      // Wrapped in $nextTick to ensure DOM is rendered before closing
      const modal: any = this.$refs.newreport;
      modal.hide();
      this.$router.push("/reports/" + report.id);
    });
  }

  public findOptimal(items: Configuration[]) {
    const attributes = _.filter(this.filters, "isFiltered").map((config) => config.attribute);
    const result = Optimality.getParetoFront(attributes, items);
    this.paretoFront = result.map((r) => r.id);
  }

  public exportData() {
    DataManagement.exportAllData(this.$store);
  }

  public resetData() {
    const result = confirm("Are you sure you wish to remove all stored data? \n\n" +
      "This will remove all configurations, attributes, and reports.");
    if (result) { DataManagement.resetAllData(this.$store); }
    this.filters = [];
    this.selectedConfiguration = null;
  }

  public importData() {
    const input: any = this.$refs.fileinput;
    input.$el.click();
  }

  public uploadFile(event: any) {
    const input = event.target;
    if (!input.files || input.files.length < 1) { return; }

    this.$message({
      content: `Importing data...`,
      type: "info"
    });

    const loadFilters = this.loadFilters;
    setTimeout(async () => {
      for (const file of input.files) {
        const reader = new FileReader();
        reader.onload = () => Importer.processInputFile(reader, file, this.$message, this.$store);
        reader.readAsText(file);
      }

      const fileInput: any = this.$refs.fileinput;
      fileInput.reset();

      setTimeout(() => loadFilters(), 100);
    }, 200);
  }
}
