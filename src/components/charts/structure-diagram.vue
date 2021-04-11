<!--<template>
    <div class="control-section">
        <div class="control-section">
            <div class="content-wrapper">
                <ejs-diagram style='display:block' ref="diagramObject" id="diagram" :width='width' :height='height' :nodes='nodes' :connectors='connectors' :getNodeDefaults='getNodeDefaults' :getConnectorDefaults='getConnectorDefaults' :snapSettings='snapSettings'></ejs-diagram>
            </div>
        </div>
    </div>
</template>-->

<template>
    <div class="control-section">
        <div class="control-section">
            <div class="content-wrapper">
                <ejs-diagram style='display:block' ref="diagramObject" id="diagram" width='100%' :height='height' :nodes='chartNodes' :connectors='chartConnections' :snapSettings='snapSettings'></ejs-diagram>
            </div>
        </div>
    </div>
</template>

<style scoped>
.content-wrapper {
    font-size: 50px;
}
</style>


<script lang="ts" src="./structure-diagram.ts" />
