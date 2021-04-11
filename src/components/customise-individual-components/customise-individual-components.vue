<template>
    <div>
        <b-container class="bv-example-row">
            <b-row>
                <b-col>
                    <b-list-group>
                        <b-list-group-item button v-for="component in data.structure.components" :key="component.name" @click="currentComponent=component">
                            {{component.name}}
                        </b-list-group-item>
                    </b-list-group>
                </b-col>
                <b-col cols="8">
                    <b-row cols="3" v-if="currentComponent.name">
                        <b-col v-for="s in symbolPallete" :key="s.name" align-self="stretch" class="each-symbol">
                            <div>
                                <b-button variant="outline-light" :class="{'current-symbol': s.symbol == currentComponent.symbol}" @click="setNewSymbol(s)">
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

<script lang="ts" src="./customise-individual-components.ts" />

<style>
.each-symbol {
    text-align: center;
}
.symbol-image {
    width: 100%;
    height: 100%;
}
.symbol-description {
    color: black;
}
.current-symbol {
    border: 2px solid black;
}
.edit-btn {
    float: right;
    background-color: white;
    border: 1px solid red;
    color: black; 
    font-size: 16px;
    cursor: pointer;
}
</style>
