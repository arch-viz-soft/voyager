import { Prop, Component, Vue } from "vue-property-decorator";
import { DiagramPlugin, SnapConstraints, AnnotationConstraints  } from "@syncfusion/ej2-vue-diagrams";
import { Configuration } from "@/models/configuration";
import "./charts.css";

Vue.use(DiagramPlugin);

/**
 * Structure chart, used to show how architecture components are linked for a configuration
 */
@Component({
  components: {
  }
})
export default class StructureChart extends Vue {
    // ChartData object, with all info required to render chart
    @Prop(Object) public readonly data!: Configuration;

    // Height of the chart in pixels, optional
    @Prop(String) public readonly height!: string | undefined;

    public snapSettings = { constraints: SnapConstraints.None };

    get chartNodes() {
        const data = this.data.structure.components.map((c) => {
            return {
                id: c.name,
                offsetX: c.x_coordinate === 300 ? null : c.x_coordinate,
                offsetY: c.y_coordinate === 300 ? null : c.y_coordinate,
                annotations: [{content: c.name, style: { color: "white", fill: "transparent" }}],
                width: 70,
                height: 70,
                shape: { shape: "Ellipse" },
                style: { position: "relative", fill: "#357BD2", strokeColor: "#024249" },
                symbol: c.dataURI
            };
        });
        return data;
    }

    get chartConnections() {
        const data = this.data.structure.connections.map((c) => {
            return {
                id: c.label,
                annotations: [{content: c.label, constraints: AnnotationConstraints.ReadOnly}],
                sourceID: c.from,
                targetID: c.to,
                style: {position: "relative"}
            };
        });
        return data;
    }
}
