import React, {Component} from 'react';
import axios from 'axios';
import SatSetting from './SatSetting';
import SatelliteList from './SatelliteList';
import WorldMap from "./WorldMap";
import {NEARBY_SATELLITE, SAT_API_KEY, STARLINK_CATEGORY} from "../constants";

class Main extends Component {
    constructor(){
        super();
        this.state = {
            satInfo: null,
            settings: null,
            isLoadingList: false
        };
    }

    // fetch data from backend server
    showNearbySatellite = (setting) => {
        console.log(setting);
        // Step 1: get the setting
        this.setState({
            settings: setting
        })
        this.fetchSatellite(setting);
    }

    fetchSatellite = (setting) => {
        // Step 2: configure
        const { latitude, longitude, elevation, altitude } = setting;
        const url = `/api/${NEARBY_SATELLITE}/${latitude}/${longitude}/${elevation}/${altitude}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;

        // Step 3: send req
        // - shown spin and send request
        this.setState({
            isLoadingList: true
        });
        axios.get(url)
            .then(response => {
                console.log(response);
                console.log(this.state);
                // when fetching data succeed, hide spin and update satInfo
                this.setState({
                    satInfo: response.data,
                    // satInfo: 1,
                    isLoadingList: false
                });
                console.log(this.state);
            })
            .catch(error => {
                console.log('err in fetch satellite -> ', error);
                // when fetching data failed, hide spin
                this.setState({
                    isLoadingList: false
                });
            })
    }

    render() {
        // console.log(this.state);
        const { satInfo, isLoadingList } = this.state;
        return (
            <div className="main">
                <div className="left-side">
                    <SatSetting onShow={this.showNearbySatellite}/>
                    <SatelliteList satInfo={satInfo}
                                   isLoad={isLoadingList}
                    />
                </div>
                <div className="right-side">
                    <WorldMap/>
                </div>
            </div>
        );
    }
}

export default Main;