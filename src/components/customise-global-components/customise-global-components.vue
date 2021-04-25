<template>
    <div>
        <b-container class="bv-example-row">
            <b-row>
                <b-col>
                    <b-list-group>
                        <b-list-group-item button v-for="component in getComponentCategories()" :key="component" @click="setCurrentComponent(component)" :class="{'active': currentComponent == component}">
                            <div>{{component}}</div>
                        </b-list-group-item>
                    </b-list-group>
                </b-col>
                <b-col cols="8">
                    <b-row cols="3" v-if="currentComponent">
                        <b-col v-for="s in symbolPallete" :key="s.name" align-self="stretch" class="each-symbol">
                            <div class="grid-container">
                                <b-button variant="outline-light" :class="{'symbol-button': true, 'current-symbol': currentComponentSymbol == s.symbol}" @click="setNewSymbol(s)">
                                    <img :src="getImgUrl(s.symbol)" class="symbol-image"/>
                                    <span class="symbol-description">{{s.name}}</span>
                                </b-button>
                            </div>
                        </b-col>
                    </b-row>
                    <b-row cols="3" v-else>
                        Please select a component..
                    </b-row>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts" src="./customise-global-components.ts" />

<style>
.each-symbol {
    height: 150px;
}
.symbol-image {
    max-height: 75%;
    max-width: 75%;
    height: auto;
    width: auto;
}
.symbol-description  {
    font-size: 14px;
    white-space: nowrap;
    position: absolute;
    bottom: 4%;
    width: 100%;
    left: 0%;
    color: black;
}
.symbol-button {
    width: 100%;
    height: 100%;
    float: left;
    position: relative;
}
.grid-container {
    width: 100%;
    height: 100%;
}
.current-symbol {
    border: 2px solid black;
}
</style>
