import React, {Component} from 'react';
import axios from 'axios';
import { feature } from 'topojson-client';
import {WORLD_MAP_URL} from "../constants";
import { geoKavrayskiy7 } from 'd3-geo-projection';

class WorldMap extends Component {
    componentDidMount() {
        axios.get(WORLD_MAP_URL)
            .then(response => {
                console.log(response)
                const { data } = response;
                const land = feature(data, data.objects.countries).features
                console.log(land)
            })
    }

    render() {
        return (
            <div>
                WorldMap
            </div>
        );
    }
}

export default WorldMap;